import { useEffect, useState } from 'react';
import { useExchangeRates } from './hooks/useExchangeRates';
import { extraCurrencies } from './constants/extraCurrencies';
import { Option } from '@/components/ui/custom/CustomSelect';
import { formatDate } from '@/utils/format/format-date';
import { useForm } from 'react-hook-form';
import { currencyConversionSchema } from './schema';
import { calculateCurrencyConversion } from './utils/calculate-currency-conversion';
import { CurrencyConversionFormValues, ExchangeRates } from './types';
import { zodResolver } from '@hookform/resolvers/zod';
import currencyCodes from "currency-codes";

const displayNames = new Intl.DisplayNames(['pt-BR'], {
  type: 'currency'
});

export const useCurrencyConversionPageController = () => {
    const [result, setResult] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const { data, error } = useExchangeRates();

    const [options, setOptions] = useState<Option[]>([]);
    const [lastUpdate, setLastUpdate] = useState('');

    useEffect(() => {

        if (data) {
            const o = Object.keys(data.rates).map(code => {
                const name = extraCurrencies[code] || displayNames.of(code) || currencyCodes.code(code)?.currency || "Unknown Currency";
                return {
                    value: code,
                    label: `${code} | ${name}`
                };
            });
            setOptions(o);
            const date = new Date(data.timestamp * 1000);
            const last = `${formatDate(date)} - ${date.getHours()}:${date.getMinutes().toLocaleString().length == 2 ? date.getMinutes() : date.getMinutes() + '0'}`;
            setLastUpdate(last);
        } else if (error) {
            console.error(error);
            setErrorMessage(error.message || "Erro desconhecido");
        }
    }, [data, error]);

    const form = useForm<CurrencyConversionFormValues>({
        resolver: zodResolver(currencyConversionSchema),
        defaultValues: { value: '' }
    });

    const { handleSubmit, watch } = form;

    function onSubmit(values: CurrencyConversionFormValues) {
        if (data) {
            const res = calculateCurrencyConversion(values.originCurrency, values.destinyCurrency, values.value, data.rates as ExchangeRates)
            setResult(res);
        }
    }

    const handleReset = () => {
        form.reset();
        setResult(0);
    };

    return { form, errorMessage, handleReset, handleSubmit, onSubmit, watch, result, options, lastUpdate }
}

export type CurrencyConversionController = ReturnType<typeof useCurrencyConversionPageController>;