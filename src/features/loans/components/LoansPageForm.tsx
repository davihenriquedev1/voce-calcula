"use client";
import { CustomSelect } from '@/components/ui/custom/CustomSelect';
import { Form } from '@/components/ui/form'
import React from 'react'
import { amortizationTypeOptions, creditOptions } from '../constants/options';
import { CustomInput } from '@/components/ui/custom/CustomInput';
import { maskNumberInput } from '@/utils/mask/mask-number-input';
import { Button } from '@/components/ui/button';
import { LoansPageController } from '../controller';

export const LoansPageForm = ({ controller }: { controller: LoansPageController }) => {
    const { form, onSubmit, handleSubmit, handleReset, watched, setValue, isValid } = controller;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2 w-full">
                    <CustomSelect
                        form={form}
                        name="type"
                        label="Operação de crédito"
                        placeholder="Selecione o tipo"
                        options={creditOptions}
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="amount"
                        label="Valor (R$)"
                        placeholder="10000"
                        mask={maskNumberInput()}
                        formatParams={{ format: "currency", currency: "brl" }}
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="termMonths"
                        label="Prazo (meses)"
                        mask={maskNumberInput()}
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="downPayment"
                        label="Entrada"
                        placeholder="0"
                        mask={maskNumberInput()}
                        formatParams={{ format: "currency", currency: "brl" }}
                    />
                    <CustomInput
                        type="date"
                        form={form}
                        name="startDate"
                        label="Data de Pagamento"
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="insurancePercent"
                        label="Seguro (%)"
                        mask={maskNumberInput()}
                        formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-2 w-full">
                    <CustomInput
                        type="text"
                        form={form}
                        name="annualRate"
                        label="Juros anuais (%)"
                        mask={maskNumberInput()}
                        formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="extraAmortization"
                        label="Amortização Extra"
                        placeholder="0"
                        mask={maskNumberInput()}
                        formatParams={{ format: "currency", currency: "brl" }}
                    />
                    <CustomInput
                        type="month"
                        form={form}
                        name="extraAmortizationMonth"
                        label="Mês Amortização Extra"
                    />
                    <CustomSelect
                        form={form}
                        name="extraAmortizationType"
                        label="Tipo Amortização Extra"
                        placeholder="Selecione o tipo"
                        options={amortizationTypeOptions}
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="iofCeiling"
                        label="Teto do IOF (%)"
                        mask={maskNumberInput()}
                        formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="fixedIofPct"
                        label="Alíquota fixa IOF (%)"
                        mask={maskNumberInput()}
                        formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="dailyIofPct"
                        label="Alíquota diária IOF (%)"
                        mask={maskNumberInput()}
                        formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
                    />
                </div>


                <div className="flex flex-col justify-between items-start gap-4 xs:flex-row xs:items-end ">
                    {watched.type !== "consorcio" && (
                        <div className="w-full">
                            <label className="block font-bold mb-1">Método</label>
                            <div className="flex flex-col xs:flex-row gap-2 w-full">
                                <Button
                                    type="button"
                                    onClick={() => setValue("method", "price")}
                                    className={`${watched.method === "price" ? "bg-chart-5 border text-secondary-foreground text-white" : "bg-softgray text-gray border border-gray scale-105"} font-bold`}
                                >
                                    PRICE
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setValue("method", "sac")}
                                    className={`${watched.method === "sac" ? "bg-chart-5 border text-secondary-foreground text-white" : "bg-softgray text-gray border border-gray scale-105"} font-bold`}
                                >
                                    SAC
                                </Button>
                            </div>
                        </div>
                    )}
                    {watched.type === "consorcio" && (
                        <CustomInput
                            type="text"
                            form={form}
                            name="adminPercent"
                            label="Taxa administrativa (%)"
                            placeholder="2"
                            mask={maskNumberInput()}
                            formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
                        />
                    )}
                    <div className="flex flex-col xs:flex-row gap-2 mt-4 w-full xs:justify-end">
                        <Button type="button" onClick={handleReset} className="bg-secondary text-white font-bold">
                            Resetar
                        </Button>
                        <Button type="submit" className="font-semibold" disabled={!isValid}>
                            Simular
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
