import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { NumberFormat } from "@/types/NumberFormat";
import { Unit } from "@/types/Unit";
import { formatNumber } from "@/utils/formatters/formatNumber";
import { ChangeEvent, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";

type Props = {
    form: UseFormReturn<any>,
    name: string,
    label?: string,
    placeholder?: string,
    description?: string,
    type: string,
    mask?:(...args:any)=> string,
    formatParams?: {
        format: NumberFormat,
        currency?: string,
        unit?: Unit, 
    },
    maxLength?: number,
    linkedField?: string
}

export const CustomInput = ({maxLength, form, name, label, placeholder, description, type, mask, formatParams,linkedField}:Props) => {

    const { control, setValue, watch } = form;

    const handleMask = (e:ChangeEvent<HTMLInputElement>) => {

        if (!e.target.value || (e.target.value === '0')) {
            setValue(name, '');
            return;
        }

        if(mask) {
            const value = e.target.value;
            const maskedValue = mask(value);
            setValue(name, maskedValue);
        } else {
            setValue(name, e.target.value);
        }
    }

    const applyFormat = (value: string) => {
        if (!value || value === "0") {
            setValue(name, "");
            return;
        }

        // se for formato percent, tratamos de forma especial:
        if (formatParams?.format === "percent") {
            // limpa tudo que não seja dígito, vírgula ou hífen
            const cleaned = String(value).replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
            const num = parseFloat(cleaned);
            if (Number.isNaN(num)) {
                setValue(name, "");
                return;
            }
            // formatNumber espera fração (0.12) para 'percent', mas queremos exibir 12 -> "12,00 %"
            // então passamos num/100 para o formatter de percent, mantendo o valor do campo como string formatada.
            const formatted = formatNumber(num / 100, "percent");
            setValue(name, formatted);
            return;
        }

        // comportamento padrão (currency / decimal / unit)
        if (formatParams) {
            const { format, currency, unit } = formatParams;
            const formattedValue = formatNumber(value as any, format, currency, unit);
            setValue(name, formattedValue);
        } else {
            setValue(name, value);
        }
    };



    // se tem o campo vinculado, então executa a função que formata
    // a função formatNumber em applyFormat deve receber o valor do campo observado
    // aqui é apenas pra executar a atualização sempre que o campo observado for alterado
    if (linkedField) {
        useEffect(() => {
            const rawValue = form.getValues(name);
            applyFormat(rawValue);
        }, [watch(linkedField)]);
    }


    return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
                <FormLabel className="font-bold">{label}</FormLabel>
                <FormControl>
                    <Input
                        {...field}
                        type={type}
                        placeholder={placeholder}
                        onChange={handleMask}
                        onBlur={(e)=> applyFormat(e.target.value)}
                        onFocus={(e)=> applyFormat(e.target.value)}
                        className="w-full"
                        maxLength={maxLength}
                    />
                </FormControl>
                <FormDescription>
                    {description}
                </FormDescription>
                <FormMessage />
            </FormItem>
          )}
        />
    )
}