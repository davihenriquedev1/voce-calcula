"use client";

import { Form } from '@/components/ui/form';
import { CurrencyConversionController } from '../controller';
import { CustomSelect } from '@/components/ui/custom/CustomSelect';
import { CustomInput } from '@/components/ui/custom/CustomInput';
import { maskNumberInput } from '@/utils/mask/mask-number-input';
import { formatNumber } from '@/utils/format/format-number';
import { Button } from '@/components/ui/button';

export const CurrencyConversionPageForm = ({controller}: {controller: CurrencyConversionController}) => {
    const {form, onSubmit, handleSubmit, handleReset, watch, options, result} = controller;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full justify-center xs:grid xs:grid-cols-2 gap-2">
                <CustomSelect form={form} name="originCurrency" options={options} placeholder="selecione" label="Moeda de Origem" />
                <CustomSelect form={form} name="destinyCurrency" options={options} placeholder="selecione" label="Moeda Destino" />
                <CustomInput form={form} type="text" name="value" description="Digite o valor a ser convertido" mask={maskNumberInput()} formatParams={{ format: "currency", currency: watch('originCurrency'), unit: undefined }} linkedField="originCurrency" />
                <div className="flex flex-col">
                    <span className="bg-chart-5 h-10 p-3 mt-2 text-foreground font-bold text-xl flex items-center rounded-md">{formatNumber(result, "currency", watch('destinyCurrency'), undefined)}</span>
                </div>
                <Button type="reset" className="w-full font-semibold bg-secondary text-white hover:brightness-150" onClick={handleReset}>Resetar</Button>
                <Button type="submit" className="w-full font-semibold">Converter</Button>
            </form>
        </Form>
    )
}
