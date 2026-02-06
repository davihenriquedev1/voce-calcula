export type MetaExchangeRates = {
    base: string;
    timestamp: number;
    rates: {
        [key: string]: number;
    }
}

export type ExchangeRates = MetaExchangeRates["rates"];