import { z } from "zod";

export const scientificSchema = z.object({
    expression: z.array(
        z.object({
            type: z.enum(["normal", "sup", "sub", "scientific"]),
            value: z.string().min(1)
            })
    ).min(1, "Preencha algum valor")
});

