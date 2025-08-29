"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { object, z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";
import { useEffect, useState } from "react";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import currencies from 'currency-codes';
import { extraCurrencies } from "@/data/extraCurrencies";   
import { calculateExchangeRate } from "@/utils/calculators/calculateExchangeRate";
import { ExchangeRates } from "@/types/ExchangeRates";
import { formatNumber } from "@/utils/formatters/formatNumber";

type Props = {
    initialData?: any;
};

const formSchema = z.object({
    value: z.string().min(1, 'preencha o valor').transform((value) => {
        let cleaned = value.replace(/[^0-9,]/g, "");
        let stringFloat = cleaned.replace(',', '.');
        return parseFloat(stringFloat).toFixed(2);
    }),
    originCurrency: z.string({ required_error: 'selecione a moeda' }),
    destinyCurrency: z.string({ required_error: 'selecione a moeda' })
});

type FormValues = z.infer<typeof formSchema>;

const CurrencyConversion = ({ initialData }: Props) => {
    const [result, setResult] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const { data, error, isLoading, isFetching } = useExchangeRates();

    const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

    useEffect(() => {
        if (data) {
            const o = Object.keys(data).map(code => {
            const iso = currencies.code(code); // pega info ISO
            const name = iso?.currency || extraCurrencies[code] || "Unknown Currency";
            return {
                value: code,
                label: `${code} | ${name}`
            };
            });
            setOptions(o);
        } else if (error) {
            console.error(error);
            setErrorMessage(error.message || "Erro desconhecido");
        }
    }, [data, error]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { value: '' }
    });

    const { handleSubmit, watch } = form;

    function onSubmit(values: FormValues) {
        const res = calculateExchangeRate(values.originCurrency, values.destinyCurrency, values.value, data as ExchangeRates)
        setResult(res);
    }
    
    const handleReset = () => {
        form.reset({ value: '', originCurrency: '', destinyCurrency: '' });
        setResult(0);
    };

    return (
       
        <div className="p-8">
            <h3 className="text-3xl font-bold text-color-palette6/70 dark:text-color-palette3 mb-8">Conversor de Moedas</h3>
            <div className="flex flex-col md:flex-row gap-12 justify-center mt-10">
                <div className="flex flex-col items-center justify-center flex-1 md:max-w-[400px]">
                    {errorMessage && <div className="text-sm to-color-palette5 ">{errorMessage} :(</div>}
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className=  "gap-6 flex flex-col w-full  justify-center xs:grid xs:grid-cols-2">
                            <CustomSelect form={form} name="originCurrency" options={options} placeholder="selecione" label="Moeda de Origem" />
                            <CustomSelect form={form} name="destinyCurrency" options={options} placeholder="selecione" label="Moeda Destino" />
                            <CustomInput form={form} type="text" name="value" description="Digite o valor a ser convertido" mask={maskNumberInput(undefined, "currency", watch('originCurrency'), undefined)} formatParams={{format:"currency", currency: watch('originCurrency'), unit: undefined}} linkedField="originCurrency"/>
                            <div className="flex flex-col">
                                <span className="bg-gray-200 h-10 p-3 mt-2 text-color-palette1 font-bold text-xl flex items-center rounded-md">{formatNumber(result, "currency", watch('destinyCurrency'), undefined)}</span>
                            </div>
                            <Button type="submit" className="w-full">Converter</Button>
                            <Button type="reset" className="w-full bg-color-palette5 hover:bg-color-palette5 hover:brightness-150" onClick={handleReset}>Resetar</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
        
    );
};

export default CurrencyConversion;
