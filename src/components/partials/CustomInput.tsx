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
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/formatters/formatNumber";
import { ChangeEvent, useEffect } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";

type Props = {
    form: UseFormReturn<any>,
    name: string,
    label?: string,
    description?: string,
    mask?: (...args: any) => string,
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
    linkedField?: string
} & Omit<React.ComponentProps<typeof Input>, "form" | "name" |"onChange" | "onBlur" | "onFocus" >;

export const CustomInput = ({ form, name, label, description, mask, formatParams, linkedField, ...inputProps }: Props) => {

    const { control, watch } = form;

    const handleMask = (e: ChangeEvent<HTMLInputElement>, field: ControllerRenderProps<any, string>) => {

        const raw = e.target.value;

        if (raw === '' || raw === null || raw === undefined) {
            field.onChange("");
            return;
        }

        if (mask) {
            const maskedValue = mask(raw);
            field.onChange(maskedValue)
        } else {
           field.onChange(raw)
        }
    }

    const applyFormat = ((value: string, field: ControllerRenderProps<any, string>) => {
        if (!value || value === "") {
            field.onChange("");
            return;
        }

        // se for formato percent, tratamos de forma especial:
        if (formatParams?.format === "percent") {
            // limpa tudo que não seja dígito, vírgula ou hífen
            const cleaned = cleanNumberString(String(value)); // "12,00" -> "12.00"
            const num = parseFloat(cleaned);
            if (Number.isNaN(num)) {
                field.onChange("");
                return;
            }
            // formatNumber espera fração (0.12) para 'percent', mas queremos exibir 12 -> "12,00 %"
            const formatted = formatNumber(num, "percent", undefined, undefined, {
                inputIsPercent: true,
                // opcional: se campo for taxa diária você pode querer minFractionDigitsPercent:4
                minFractionDigitsPercent: formatParams.options?.minFracDgts,
                maxFractionDigitsPercent: formatParams.options?.maxFracDgts
            })
            field.onChange(formatted);
            return;
        }

        // comportamento padrão (currency / decimal / unit)
        if (formatParams) {
            const { format, currency, unit } = formatParams;
            const formattedValue = formatNumber(value as any, format, currency, unit);
            field.onChange(formattedValue);
        } else {
            field.onChange(value);
        }
    });

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const linkedValue = linkedField ? watch(linkedField) : undefined;

                useEffect(() => {
                    if (!linkedField) return;
                    const rawValue = form.getValues(name);
                    applyFormat(rawValue, field);
                }, [linkedValue]);

                return (
                    <FormItem>
                        <FormLabel className="font-bold">{label}</FormLabel>
                        <FormControl>
                            <Input
                                {...inputProps}
                                {...field}
                                onChange={(e)=> {
                                    handleMask(e, field);
                                }}
                                onBlur={(e) => {
                                    applyFormat(e.target.value, field)
                                    field.onBlur();
                                }}
                                onFocus={(e) => {
                                    const raw = unformatForEdit(e.target.value);
                                    field.onChange(raw);
                                }}
                                className={cn(
                                    "w-full",
                                    inputProps.className
                                )}
                            />
                        </FormControl>
                        <FormDescription>
                            {description}
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )
            }}
        />
    )
}
export const cleanNumberString = (s?: string) => {
    if (!s) return "";
    let v = String(s).replace(/[^\d,.\-]/g, ""); // remove tudo exceto dígitos, vírgula, ponto e hífen
    if (v.includes(",")) { // se tem vírgula, tratar como BR: remove pontos (milhar) e transforma vírgula em ponto
        v = v.replace(/\./g, "").replace(",", ".");
    } else { // sem vírgula, assume ponto decimal, remove vírgulas residuais
        v = v.replace(/,/g, "");
    }
    return v;
};

const unformatForEdit = (value?: string) => {
    if (!value) return ""; // Retorna string sem símbolo pra edição. Ex: "R$ 1.234,56" -> "1234,56"
    const cleaned = String(value).replace(/[^\d,.-]/g, ""); // tenta preservar vírgula como separador 
    // se tem ponto e vírgula, converte pra vírgula thousands -> preferir vírgula
    // aqui só retorna uma versão legível; mascara vai tratar depois
    if (cleaned.includes(",")) {
        return cleaned.replace(/\./g, "");
    }
    return cleaned;
};
