import { z } from "zod";
import stringNumberToNumber from "./stringNumberToNumber";

// Helper: aceita string mascarada ou number e transforma em number
export const numberOrString = () =>
    z.preprocess((v) => {
        let n = 0;
        if (typeof v === "string") {
            n = stringNumberToNumber(v);
        } else if (typeof v === "number") {
            n = v;
        }
        return n;
    },
        z.number().refine(n => typeof n === "number" && Number.isFinite(n), {
            message: "Deve ser um número válido",
        }
        )).optional();