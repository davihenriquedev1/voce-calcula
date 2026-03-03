import { z } from "zod";
import { currencyConversionSchema } from "./schema";

export type MetaExchangeRates = {
    base: string;
    timestamp: number;
    rates: {
        [key: string]: number;
    }
}

export type ExchangeRates = MetaExchangeRates["rates"];

export type CurrencyConversionFormValues = z.infer<typeof currencyConversionSchema>;