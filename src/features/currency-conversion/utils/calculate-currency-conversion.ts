import { ExchangeRates } from "../types";

export const calculateCurrencyConversion = (
  originCurrency: string,
  destinyCurrency: string,
  valueToConvert: string,
  exchangeRates: ExchangeRates
) => {
    const originCurrencyUSD = exchangeRates[originCurrency.toUpperCase()];
    const destinyCurrencyUSD = exchangeRates[destinyCurrency.toUpperCase()];

    if (originCurrencyUSD === undefined || destinyCurrencyUSD === undefined) {
        console.error("Moeda não encontrada:", originCurrency, destinyCurrency);
        return 0;
    }
  
    const oneOriginCurrency = destinyCurrencyUSD / originCurrencyUSD;
    const result = oneOriginCurrency * parseFloat(valueToConvert);

    return result;
};