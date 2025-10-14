import { z } from "zod";

// Função comum para tratar números vindos de input com máscara (string → float)
const commonNumber = z.string().min(1, { message: 'Preencha o campo' }).transform((value) => {
    const cleaned = String(value)
        .replace(/[^\d,-]/g, "") // remove R$, espaços, letras etc
        .replace(/\./g, "")      // remove separador de milhares
        .replace(",", ".");      // vírgula → ponto para parseFloat
    return parseFloat(cleaned);
});

export const investmentsSchema = z.object({
    // Dados gerais
    type: z.enum([
        'cdb', 'lci', 'lca', 
        'tesouro_selic', 'tesouro_prefixado', 'tesouro_ipca+', 
        'fii', 'stock'
    ]).default('cdb'), // tipo de investimento
    initialValue: commonNumber,       // valor inicial aplicado
    monthlyContribution: commonNumber.optional(), // aporte mensal opcional
    termMonths: commonNumber,         // prazo em meses

    // Dados específicos
    interestRate: commonNumber.optional(),   // taxa anual ou CDI%
    rateType: z.enum(['pre', 'pos']).optional(), // pré ou pós-fixado
    currentSelic: commonNumber.optional(),   // taxa Selic atual (Tesouro Selic)
    currentIPCA: commonNumber.optional(),    // taxa IPCA atual (Tesouro IPCA+)
    dividendYield: commonNumber.optional(),  // rendimento anual (FIIs/ações)
    unitPrice: commonNumber.optional(),      // preço unitário de FII ou ação

    // Taxas e impostos
    incomeTax: commonNumber.optional(),      // imposto de renda
    iof: commonNumber.optional(),            // IOF para resgates < 30 dias
    adminFee: commonNumber.optional(),       // taxa administrativa
}).superRefine((obj, ctx) => {
    // Validações gerais
    // Prazo mínimo de 1 mês
    if (isNaN(obj.termMonths) || obj.termMonths < 1) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['termMonths'],
            message: 'Term (months) must be ≥ 1'
        });
    }

    // Valores não podem ser negativos
    if ((obj.initialValue ?? 0) < 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['initialValue'],
            message: 'Initial value must be ≥ 0'
        });
    }
    if ((obj.monthlyContribution ?? 0) < 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['monthlyContribution'],
            message: 'Monthly contribution must be ≥ 0'
        });
    }

    // ===== Validações por tipo de investimento =====
    // Renda fixa pré/pós precisa de taxa e tipo de taxa
    if (['cdb','lci','lca','tesouro_prefixado','tesouro_ipca+'].includes(obj.type)) {
        if (obj.interestRate === undefined || obj.interestRate === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['interestRate'],
                message: 'Interest rate is required for this investment type'
            });
        }
        if (!obj.rateType) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['rateType'],
                message: 'Rate type is required for this investment type'
            });
        }
    }

    // Tesouro Selic exige currentSelic
    if (obj.type === 'tesouro_selic' && (obj.currentSelic === undefined || obj.currentSelic === null)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['currentSelic'],
            message: 'Selic atual é obrigatório para Tesouro Selic'
        });
    }

    // Tesouro IPCA+ exige currentIPCA
    if (obj.type === 'tesouro_ipca+' && (obj.currentIPCA === undefined || obj.currentIPCA === null)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['currentIPCA'],
            message: 'IPCA atual é obrigatório para Tesouro IPCA+'
        });
    }

    // FIIs e ações precisam de dividend yield e unit price
    if (['fii','stock'].includes(obj.type)) {
        if (obj.dividendYield === undefined || obj.dividendYield === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['dividendYield'],
                message: 'Dividend yield é obrigatório para FIIs or stocks'
            });
        }
        if (obj.unitPrice === undefined || obj.unitPrice === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['unitPrice'],
                message: 'Unit price é obrigatório para FIIs or stocks'
            });
        }
    }
});

/*

4️⃣ Outputs esperados (pra gráfico e tabela)

rendimentoBruto → valor total antes de impostos.

rendimentoLiquido → após IR/IOF/taxa.

valorFinal → total investido + rendimento líquido.

rentabilidadeAnual → % ao ano, útil pra comparar.

evolucaoMeses → array com valor acumulado mês a mês (pra gerar gráfico comparativo).
 */