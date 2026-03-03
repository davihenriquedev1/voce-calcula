import { z } from "zod";

const commonNumber = z.string().min(0, {message: 'Preencha o campo'}).transform((value) => {
    const cleaned = String(value)
        .replace(/[^\d,-]/g, "") // remove R$, espaços, letras etc
        .replace(/\./g, "")      // remove separador de milhares
        .replace(",", ".");      // vírgula -> ponto para parseFloat
    return parseFloat(cleaned);
});

export const loansSchema = z
    .object({
        type: z.enum(["emprestimo", "financiamento", "consorcio"]).default("emprestimo"),
        amount: commonNumber,
        termMonths: commonNumber,
        downPayment: commonNumber.optional().transform(v => v ?? 0),
        extraAmortization: commonNumber.optional().transform(v => v ?? 0),
        extraAmortizationMonth: z.string().optional(), // armazenará "YYYY-MM" ou "2025-10"
        extraAmortizationType: z.enum(["reduzir_prazo", "reduzir_parcela"]).optional(),
        method: z.enum(["price", "sac"]).default("price"), // apenas para financiamento e emprestimo
        annualRate: commonNumber,
        adminPercent: commonNumber.optional(), //para consórcio
        fixedIofPct: commonNumber,
        dailyIofPct: commonNumber,
        iofCeiling: commonNumber,

        // novos campos opcionais
        startDate: z.string().optional(), // data de início do contrato
        insurancePercent: commonNumber.optional(), // seguro opcional
    })
    .superRefine((obj, ctx)=> {
        // Prazo deve ser inteiro e ≥ 1
        if(isNaN(obj.termMonths) || obj.termMonths < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["termMonths"],
                message: "Prazo em meses deve ser ≥1 "
            })
        }
        // Entrada não pode ser maior que o valor
        if((obj.downPayment ?? 0) > (obj.amount ?? 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["downPayment"],
                message: "Entrada não pode ser maior que o valor total"
            })
        }
        // se tem valor na amortização extra, tem que configurar o tipo e o mês
        if((obj.extraAmortization ?? 0) > 0) {
            if(!obj.extraAmortizationMonth) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["extraAmortizationMonth"],
                    message: "Informe o mês da amortização extra"
                })
            }
            if(!obj.extraAmortizationType) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["extraAmortizationType"],
                    message: "Selecione o tipo da amortização extra"
                })
            }
        }

         // Consórcio exige taxa administrativa
        if (obj.type === "consorcio" && (obj.adminPercent === undefined || obj.adminPercent === null)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["adminPercent"],
                message: "Consórcio exige taxa administrativa.",
            });
        }

         if (obj.type === "financiamento" && (obj.insurancePercent === undefined || obj.insurancePercent === null)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["insurancePercent"],
                message: "Preencha a taxa do seguro",
            });
        }
    });