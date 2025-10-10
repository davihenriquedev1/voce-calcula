import { z } from "zod";

const commonNumber = z.string().min(1).transform((value) => {
    const cleaned = String(value)
        .replace(/[^\d,-]/g, "") // remove R$, espaços, letras etc
        .replace(/\./g, "")      // remove separador de milhares
        .replace(",", ".");      // vírgula -> ponto para parseFloat
    return parseFloat(cleaned);
});

export const loansSchema = z.object({
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
}); 