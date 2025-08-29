import { ExchangeRates } from "@/types/ExchangeRates";

export const calculateExchangeRate = (
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
    console.log(valueToConvert)
    console.log(originCurrencyUSD);

    const oneOriginCurrency = destinyCurrencyUSD / originCurrencyUSD;
    const result = oneOriginCurrency * parseFloat(valueToConvert);

    console.log(result);
    return result;
};