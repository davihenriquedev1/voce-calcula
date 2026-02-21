import { z } from "zod";

export const bmiSchema = z.object({
    height: z.string().min(1, 'preencha a altura').transform((value) => {
        let clean = value.replace(/\./g, ''); // remove pontos de milhar
        clean = clean.replace(',', '.');      // transforma vírgula em ponto
        return parseFloat(parseFloat(clean).toFixed(2));
    }),
    weight: z.string().min(1, 'preencha o peso').transform((value) => {
        let clean = value.replace(/\./g, '');
        clean = clean.replace(',', '.');
        return parseFloat(parseFloat(clean).toFixed(2));
    }),
});