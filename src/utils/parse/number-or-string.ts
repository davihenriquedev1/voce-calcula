import { z } from "zod";
import stringNumberToNumber from "./string-number-to-number";

export const numberOrString = () =>
    z.preprocess((v) => {
        if (typeof v === "string") {
            return stringNumberToNumber(v);
        } else if (typeof v === "number") {
            return Number.isFinite(v) ? v : undefined;
        }
        return undefined;
    },
        z.number({
            invalid_type_error: "Deve ser um número válido"
        })
    );