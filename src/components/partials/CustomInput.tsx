/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
    disabled?: boolean
    type: string,
    title?: string,
    mask?:(...args:any)=> string,
    formatParams?: {
        format: NumberFormat,
        currency?: string,
        unit?: Unit, 
        options?: {
            inputIsPercent: boolean;
            maxFracDgts?: number;
            minFracDgts?: number;
        }
    },
    maxLength?: number,
    linkedField?: string
}

export const CustomInput = ({maxLength, form, name, label, placeholder, description, type, mask, formatParams,linkedField, title, disabled}:Props) => {

    const { control, setValue, watch } = form;

    const handleMask = (e:ChangeEvent<HTMLInputElement>) => {

        const raw = e.target.value;

        if (raw === '' || raw === null || raw === undefined) {
            setValue(name, '');
            return;
        }
        
        if(mask) {
            const maskedValue = mask(raw);
            setValue(name, maskedValue);
        } else {
            setValue(name, raw);
        }
    }

    const applyFormat = ((value: string) => {
        if (!value || value === "") {
            return;
        }

        // se for formato percent, tratamos de forma especial:
        if (formatParams?.format === "percent") {
            // limpa tudo que não seja dígito, vírgula ou hífen
            const cleaned = cleanNumberString(String(value)); // "12,00" -> "12.00"
            const num = parseFloat(cleaned);
            if (Number.isNaN(num)) {
                setValue(name, "");
                return;
            }
            // formatNumber espera fração (0.12) para 'percent', mas queremos exibir 12 -> "12,00 %"
            const formatted = formatNumber(num, "percent", undefined, undefined, {
                inputIsPercent: true,
                // opcional: se campo for taxa diária você pode querer minFractionDigitsPercent:4
                minFractionDigitsPercent: formatParams.options?.minFracDgts,
                maxFractionDigitsPercent: formatParams.options?.maxFracDgts
            })
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
    });



    // se tem o campo vinculado, então executa a função que formata
    // a função formatNumber em applyFormat deve receber o valor do campo observado
    // aqui é apenas pra executar a atualização sempre que o campo observado for alterado
    if (linkedField) {
        useEffect(() => {
            const rawValue = form.getValues(name);
            applyFormat(rawValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [applyFormat, form,name, watch(linkedField)]);
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
                        onFocus={(e) => {
                            // show raw unformatted value for editing
                            const raw = unformatForEdit(e.target.value);
                            setValue(name, raw);
                        }}
                        className="w-full"
                        disabled={disabled}
                        maxLength={maxLength}
                        title={title}
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
export const cleanNumberString = (s?: string) => {
    if (!s) return ""; 
    let v = String(s).replace(/[^\d,.\-]/g, ""); // remove tudo exceto dígitos, vírgula, ponto e hífen
    if (v.includes(",")) { // se tem vírgula, tratar como BR: remove pontos (milhar) e transforma vírgula em ponto
        v = v.replace(/\./g, "").replace(",", ".");
    } else { // sem vírgula, assume ponto decimal (en-US style) — remove vírgulas residuais
        v = v.replace(/,/g, "");
    }
    return v;
};

const unformatForEdit = (value?: string) => {
    if (!value) return ""; // Retorna string sem símbolo pra edição. Ex: "R$ 1.234,56" -> "1234,56"
    const cleaned = String(value).replace(/[^\d,.-]/g, ""); // tenta preservar vírgula como separador (pt-BR) para UX consistente
    // se tem ponto e vírgula, converte pra vírgula thousands -> preferir vírgula
    // aqui só retornamos uma versão legível; mascara vai tratar depois
    if (cleaned.includes(",")) {
        // manter vírgula
        return cleaned.replace(/\./g, "");
    }
    return cleaned;
};
