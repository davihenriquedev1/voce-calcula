import stringNumberToNumber from "@/utils/parsers/stringNumberToNumber";
import { z } from "zod";

/**
 * Transforma strings mascaradas (ex: "R$ 1.234,56" ou "12,34") em number.
 * Mantém mensagens de erro amigáveis.
 */
const stringNumber = z.string().min(1, { message: "Preencha o campo" })

export const investmentsSchema = z
    .object({
        type: z
            .enum([
                "cdb",
                "lci",
                "lca",
                "cri",
                "cra",
                "debentures",
                "debentures_incentivadas",
                "tesouro_selic",
                "tesouro_prefixado",
                "tesouro_ipca+",
                "fii",
                "stock",
            ])
            .default("cdb"),

        // valores principais (vêm como string mascarada do UI)
        initialValue: stringNumber,
        monthlyContribution: stringNumber.optional(),

        // prazo
        term: stringNumber,
        termType: z.enum(["meses", "anos"]).default("meses"),
        contributionAtStart: z.boolean().optional().default(false),

        // taxas / índices
        interestRate: stringNumber.optional(), // taxa anual ou % do CDI
        rateType: z.enum(["pre", "pos"]).optional(),
        currentSelic: stringNumber.optional(),
        currentCdi: stringNumber.optional(),
        currentIPCA: stringNumber.optional(),

        // renda variável
        dividendYield: stringNumber.optional(),
        unitPrice: stringNumber.optional(),
        appreciationRate: stringNumber.optional(),

        // taxas / flags
        adminFee: stringNumber.optional(),
        simulateDaily: z.boolean().optional(),
        taxOnStockGains: stringNumber.optional(),
        dividendTaxRate: stringNumber.optional(),
        roundResults: z.boolean().optional(),
    })
    .superRefine((obj, ctx) => {

        const p = {
            term: stringNumberToNumber(obj.term),
            initialValue: stringNumberToNumber(obj.initialValue),
            monthlyContribution: stringNumberToNumber(obj.monthlyContribution),
            adminFee: stringNumberToNumber(obj.adminFee),
            interestRate: stringNumberToNumber(obj.interestRate),
            currentSelic: stringNumberToNumber(obj.currentSelic),
            currentCdi: stringNumberToNumber(obj.currentCdi),
            currentIPCA: stringNumberToNumber(obj.currentIPCA),
            dividendYield: stringNumberToNumber(obj.dividendYield),
            unitPrice: stringNumberToNumber(obj.unitPrice),
            appreciationRate: stringNumberToNumber(obj.appreciationRate),
            taxOnStockGains: stringNumberToNumber(obj.taxOnStockGains),
            dividendTaxRate: stringNumberToNumber(obj.dividendTaxRate),
        };

        // ===== term validation (convertendo para meses) =====
        if (!Number.isFinite(p.term ?? NaN)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["term"],
                message: "Prazo deve ser um número",
            });
            return;
        }

        const months = obj.termType === "anos" ? Math.round(p.term! * 12) : Math.round(p.term!);
        if (months < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["term"],
                message: "Prazo deve ser pelo menos 1 mês",
            });
        }

        // Valores não podem ser negativos
        // valores >= 0
        if (!Number.isFinite(p.initialValue ?? NaN) || (p.initialValue ?? 0) < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["initialValue"],
                message: "Valor inicial deve ser maior ou igual a 0",
            });
        }

        if (p.monthlyContribution !== undefined && (!Number.isFinite(p.monthlyContribution) || p.monthlyContribution < 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["monthlyContribution"],
                message: "Aplicação mensal deve ser maior ou igual a 0",
            });
        }

        if (p.adminFee !== undefined && (!Number.isFinite(p.adminFee) || p.adminFee < 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["adminFee"],
                message: "Taxa administrativa deve ser maior ou igual a 0",
            });
        }

        // ===== Validações por tipo de investimento =====
        // Renda fixa pré/pós precisa de taxa e tipo de taxa
        const needsInterest = ["cdb", "lci", "lca", "tesouro_prefixado", "tesouro_ipca+", "cri", "cra", "debentures"].includes(obj.type);
        if (needsInterest) {
            if (!Number.isFinite(p.interestRate ?? NaN)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["interestRate"],
                    message: "Taxa de juros é obrigatório para esse tipo de investimento",
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

        if (obj.type === "tesouro_selic" && !Number.isFinite(p.currentSelic ?? NaN)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentSelic"],
                message: "Selic atual é obrigatória para calcular investimento no Tesouro Selic",
            });
        }
        if (obj.type === "tesouro_ipca+" && !Number.isFinite(p.currentIPCA ?? NaN)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentIPCA"],
                message: "IPCA atual é obrigatório para calcular investimento no Tesouro IPCA+",
            });
        }

        if (["fii", "stock"].includes(obj.type)) {
            if (!Number.isFinite(p.dividendYield ?? NaN)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["dividendYield"],
                    message: "Dividend yield é obrigatório para simulação de investimento em FII/ações",
                });
            }
            if (!Number.isFinite(p.unitPrice ?? NaN)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["unitPrice"],
                    message: "Preço unitário é obrigatório para FII/ações",
                });
            }
        }

        if (obj.type === "cdb" && obj.rateType === "pos") {
            const okCdi = Number.isFinite(p.currentCdi ?? NaN);
            const okSelic = Number.isFinite(p.currentSelic ?? NaN);
            if (!okCdi && !okSelic) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["currentCdi"],
                    message: "Para CDB pós-fixado deve preencher CDI ou Selic atual",
                });
            }
        }

        if (p.taxOnStockGains !== undefined && (!Number.isFinite(p.taxOnStockGains) || p.taxOnStockGains < 0 || p.taxOnStockGains > 100)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["taxOnStockGains"],
                message: "tax On Stock Gains deve ser entre 0 e 100%",
            });
        }
        if (p.dividendTaxRate !== undefined && (!Number.isFinite(p.dividendTaxRate) || p.dividendTaxRate < 0 || p.dividendTaxRate > 100)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["dividendTaxRate"],
                message: "dividendTaxRate deve ser entre 0 e 100%",
            });
        }
    });