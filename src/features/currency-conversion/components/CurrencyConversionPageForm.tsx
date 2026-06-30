"use client";

import { Form } from '@/components/ui/form';
import { CurrencyConversionController } from '../controller';
import { CustomSelect } from '@/components/ui/custom/CustomSelect';
import { CustomInput } from '@/components/ui/custom/CustomInput';
import { maskNumberInput } from '@/utils/mask/mask-number-input';
import { formatNumber } from '@/utils/format/format-number';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export const CurrencyConversionPageForm = ({controller}: {controller: CurrencyConversionController}) => {
    const {form, onSubmit, handleSubmit, handleReset, watch, options, result, handleSwap} = controller;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className=" w-full grid grid-cols-2 gap-2">
                <div className='col-span-2 w-full flex justify-end'>
                    <Image title='inverter' alt="inverter" src="/images/swap-arrows-x.png" onClick={handleSwap}  width={18} height={18} />
                </div>
                <CustomSelect form={form} name="originCurrency" options={options} placeholder="selecione" label="Moeda de Origem" />
              
                <CustomSelect form={form} name="destinyCurrency" options={options} placeholder="selecione" label="Moeda Destino" />
            
                <CustomInput form={form} type="text" name="value" description="Digite o valor a ser convertido" mask={maskNumberInput()} formatParams={{ format: "currency", currency: watch('originCurrency'), unit: undefined }} linkedField="originCurrency" />
                <div className="flex flex-col truncate">
                    <span className="bg-chart-5 h-10 p-3 mt-2 text-foreground font-bold text-xl flex items-center rounded-md">{formatNumber(result, "currency", watch('destinyCurrency'), undefined)}</span>
                </div>
                <Button type="reset" className="w-full font-semibold bg-secondary text-white hover:brightness-150" onClick={handleReset}>Resetar</Button>
                <Button type="submit" className="w-full font-semibold">Converter</Button>
            </form>
        </Form>
    )
}
