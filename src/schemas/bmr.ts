import { z } from "zod";
import { numberOrString } from "@/utils/parsers/numberOrString";

export const bmrSchema = z
    .object({
        sex: z.enum(["male", "female"], {
            required_error: "Selecione o sexo",
        }),

        age: numberOrString(),
        height: numberOrString(),
        weight: numberOrString(),
    })
    .superRefine((data, ctx) => {
        if (!data.age || data.age <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["age"],
                message: "Idade deve ser maior que 0",
            });
        }

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
