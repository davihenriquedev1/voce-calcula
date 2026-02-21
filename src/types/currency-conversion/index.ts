import { currencyConversionSchema } from "@/schemas/currency-conversion";
import { z } from "zod";

export type CurrencyConversionFormValues = z.infer<typeof currencyConversionSchema>;
