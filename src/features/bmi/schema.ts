import { z } from "zod";
import { numberOrString } from "@/utils/parse/number-or-string";

export const bmiSchema = z
    .object({
        height: numberOrString(),
        weight: numberOrString(),
    })
    .superRefine((data, ctx) => {
        if (!data.height || data.height <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["height"],
                message: "Altura deve ser maior que 0",
            });
        }

        if (!data.weight || data.weight <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["weight"],
                message: "Peso deve ser maior que 0",
            });
        }
    });