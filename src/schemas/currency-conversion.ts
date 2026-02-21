import { z } from "zod";

export const currencyConversionSchema = z.object({
    value: z.string().min(1, 'preencha o valor').transform((value) => {
        const cleaned = value.replace(/[^0-9,]/g, "");
        const stringFloat = cleaned.replace(',', '.');
        return parseFloat(stringFloat).toFixed(2);
    }),
    originCurrency: z.string({ required_error: 'selecione a moeda' }),
    destinyCurrency: z.string({ required_error: 'selecione a moeda' })
});