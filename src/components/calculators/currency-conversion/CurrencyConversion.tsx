"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";
import { useEffect, useState } from "react";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { useExchangeRates } from "@/hooks/useExchangeRates";
import currencies from 'currency-codes';
import { extraCurrencies } from "@/data/currency-conversion/extraCurrencies";
import { calculateExchangeRate } from "@/utils/calculators/exchange-rate";
import { ExchangeRates } from "@/types/exchange-rates";
import { formatNumber } from "@/utils/formatters/formatNumber";
import { Option } from "@/types/Option";
import { formatDate } from "@/utils/formatters/formatDate";

const formSchema = z.object({
	value: z.string().min(1, 'preencha o valor').transform((value) => {
		const cleaned = value.replace(/[^0-9,]/g, "");
		const stringFloat = cleaned.replace(',', '.');
		return parseFloat(stringFloat).toFixed(2);
	}),
	originCurrency: z.string({ required_error: 'selecione a moeda' }),
	destinyCurrency: z.string({ required_error: 'selecione a moeda' })
});

type FormValues = z.infer<typeof formSchema>;

const CurrencyConversion = () => {
	const [result, setResult] = useState(0);
	const [errorMessage, setErrorMessage] = useState('');
	const { data, error } = useExchangeRates();

	const [options, setOptions] = useState<Option[]>([]);
	const [lastUpdate, setLastUpdate] = useState('');

	useEffect(() => {
		if (data) {
			const o = Object.keys(data.rates).map(code => {
				const iso = currencies.code(code); // pega info ISO
				const name = iso?.currency || extraCurrencies[code] || "Unknown Currency";
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

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { value: '' }
	});

	const { handleSubmit, watch } = form;

	function onSubmit(values: FormValues) {
		if(data) {
			const res = calculateExchangeRate(values.originCurrency, values.destinyCurrency, values.value, data.rates as ExchangeRates)
			setResult(res);
		} 
	}

	const handleReset = () => {
		form.reset({ value: '' });
		setResult(0);
	};

	return (

		<div className="p-2 md:p-8">
			<h1 className="text-3xl font-bold text-foreground mb-8">Conversor de Moedas</h1>
			<div className="italic">Última atualização: {lastUpdate}</div>
			<div className="flex flex-col md:flex-row gap-12 justify-center mt-10">
				<div className="flex flex-col items-center justify-center flex-1">
					{errorMessage && <div className="text-sm text-destructive ">{errorMessage} :(</div>}
					<Form {...form}>
						<form onSubmit={handleSubmit(onSubmit)} className="gap-6 flex flex-col w-full  justify-center xs:grid xs:grid-cols-2">
							<CustomSelect form={form} name="originCurrency" options={options} placeholder="selecione" label="Moeda de Origem" />
							<CustomSelect form={form} name="destinyCurrency" options={options} placeholder="selecione" label="Moeda Destino" />
							<CustomInput form={form} type="text" name="value" description="Digite o valor a ser convertido" mask={maskNumberInput()} formatParams={{ format: "currency", currency: watch('originCurrency'), unit: undefined }} linkedField="originCurrency" />
							<div className="flex flex-col">
								<span className="bg-chart-5 h-10 p-3 mt-2 text-foreground font-bold text-xl flex items-center rounded-md">{formatNumber(result, "currency", watch('destinyCurrency'), undefined)}</span>
							</div>
							<Button type="submit" className="w-full font-semibold">Converter</Button>
							<Button type="reset" className="w-full font-semibold bg-secondary text-white hover:brightness-150" onClick={handleReset}>Resetar</Button>
						</form>
					</Form>
				</div>
				<div className="flex-1">

				</div>
			</div>
		</div>

	);
};

export default CurrencyConversion;
