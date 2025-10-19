import { z } from "zod";

/**
 * Transforma strings mascaradas (ex: "R$ 1.234,56" ou "12,34") em number.
 * Mantém mensagens de erro amigáveis.
 */
const commonNumber = z
    .string()
    .min(1, { message: "Preencha o campo" })
    .transform((value) => {
        const cleaned = String(value)
            .replace(/[^\d,-]/g, "") // remove R$, espaços, letras etc
            .replace(/\./g, "") // remove separador de milhares
            .replace(",", "."); // vírgula -> ponto
        const n = parseFloat(cleaned);
        return Number.isFinite(n) ? n : NaN;
    });

export const investmentsSchema = z
    .object({
        type: z
            .enum([
                "cdb",
                "lci",
                "lca",
                "tesouro_selic",
                "tesouro_prefixado",
                "tesouro_ipca+",
                "fii",
                "stock",
            ])
            .default("cdb"),

        // valores principais (vêm como string mascarada do UI)
        initialValue: commonNumber,
        monthlyContribution: commonNumber.optional(),

        // prazo (term + termType conforme sua função)
        term: commonNumber, // número (meses ou anos, dependendo de termType)
        termType: z.enum(["meses", "anos"]).default("meses"),

        // taxas / índices
        interestRate: commonNumber.optional(), // taxa anual ou % do CDI
        rateType: z.enum(["pre", "pos"]).optional(),
        currentSelic: commonNumber.optional(),
        currentCdi: commonNumber.optional(),
        currentIPCA: commonNumber.optional(),

        // renda variável
        dividendYield: commonNumber.optional(),
        unitPrice: commonNumber.optional(),
        appreciationRate: commonNumber.optional(),

        // taxas / flags
        adminFee: commonNumber.optional(),
        simulateDaily: z.boolean().optional(),
        taxOnStockGains: commonNumber.optional(),
        dividendTaxRate: commonNumber.optional(),
        roundResults: z.boolean().optional(),
    })
    .superRefine((obj, ctx) => {
        // ===== term validation (convertendo para meses) =====
        const rawTerm = Number(obj.term ?? NaN);
        if (!Number.isFinite(rawTerm)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["term"],
                message: "Prazo deve ser um número",
            });
            return;
        }

        // term pode vir em anos; convertemos para meses para validar >= 1 mês
        const months = obj.termType === "anos" ? Math.round(rawTerm * 12) : Math.round(rawTerm);
        if (months < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["term"],
                message: "Prazo deve ser pelo menos 1 mês",
            });
        }

        // Valores não podem ser negativos
        if ((obj.initialValue ?? 0) < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["initialValue"],
                message: "Valor inicial deve ser maior ou igual a 0",
            });
        }
        if ((obj.monthlyContribution ?? 0) < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["monthlyContribution"],
                message: "Aplicação mensal deve ser maior ou igual a 0",
            });
        }
        if (obj.adminFee !== undefined && obj.adminFee !== null && obj.adminFee < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["adminFee"],
                message: "Taxa administrativa deve ser maior ou igual a 0"
            });
        }

        // ===== Validações por tipo de investimento =====
        // Renda fixa pré/pós precisa de taxa e tipo de taxa
        if (["cdb", "lci", "lca", "tesouro_prefixado", "tesouro_ipca+"].includes(obj.type)) {
            if (obj.interestRate === undefined || obj.interestRate === null || Number.isNaN(Number(obj.interestRate))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["interestRate"],
                    message: "Taxa de juros é obrigatório para esse tipo de investimento"
                });
            }
            if (!obj.rateType) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["rateType"],
                    message: "Tipo da taxa ('pre' ou 'pos') é obrigatória para esse tipo de investimento",
                });
            }
        }

        // Tesouro Selic exige currentSelic
        if (obj.type === "tesouro_selic" && (obj.currentSelic === undefined || obj.currentSelic === null || Number.isNaN(Number(obj.currentSelic)))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentSelic"],
                message: "Selic atual é obrigatória para calcular investimento no Tesouro Selic",
            });
        }

        // Tesouro IPCA+ exige currentIPCA
        if (obj.type === "tesouro_ipca+" && (obj.currentIPCA === undefined || obj.currentIPCA === null || Number.isNaN(Number(obj.currentIPCA)))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentIPCA"],
                message: "IPCA atual é obrigatório para calcular investimento no Tesouro IPCA+",
            });
        }

        // FIIs e ações precisam de dividend yield e unit price (segundo sua regra)
        if (["fii", "stock"].includes(obj.type)) {
            if (obj.dividendYield === undefined || obj.dividendYield === null || Number.isNaN(Number(obj.dividendYield))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["dividendYield"],
                    message: "Dividend yield é obrigatório para simulação de investimento em FII/ações",
                });
            }
            if (obj.unitPrice === undefined || obj.unitPrice === null || Number.isNaN(Number(obj.unitPrice))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["unitPrice"],
                    message: "Preço unitário é obrigatório para FII/ações",
                });
            }
        }

        // Para CDB pós-fixado, é bom exigir currentCdi ou currentSelic (fallback)
        if (obj.type === "cdb" && obj.rateType === "pos") {
            if ((obj.currentCdi === undefined || obj.currentCdi === null || Number.isNaN(Number(obj.currentCdi))) &&
                (obj.currentSelic === undefined || obj.currentSelic === null || Number.isNaN(Number(obj.currentSelic)))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["currentCdi"],
                    message: "Para CDB pós-fixado deve preencher CDI ou Selic atual",
                });
            }
        }

        // stockTaxRate / dividendTaxRate se fornecidos devem estar entre 0 e 1 (se sua UI usa 0.2 para 20%) — ajuste conforme UX
        if (obj.taxOnStockGains !== undefined && (obj.taxOnStockGains < 0 || obj.taxOnStockGains > 100)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["taxOnStockGains"],
                message: "tax On Stock Gains deve ser entre 0 e 100%",
            });
        }
        if (obj.dividendTaxRate !== undefined && (obj.dividendTaxRate < 0 || obj.dividendTaxRate > 1)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["dividendTaxRate"],
                message: "dividendTaxRate deve ser entre 0 e 100%",
            });
        }
    });
