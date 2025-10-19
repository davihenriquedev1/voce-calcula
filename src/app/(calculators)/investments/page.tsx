"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { investmentsSchema } from "@/schemas/investments";
import { InvestmentsFormValues } from "@/types/investments"; // asegure que corresponde ao schema
import { calculateInvestment } from "@/utils/calculators/investments";
import { z } from "zod";
import InvestmentsSummary from "@/components/calculators/investments/InvestmentsSummary";
import { Form } from "@/components/ui/form";

const investmentOptions = [
    { label: "CDB", value: "cdb" },
    { label: "LCI", value: "lci" },
    { label: "LCA", value: "lca" },
    { label: "Tesouro Selic", value: "tesouro_selic" },
    { label: "Tesouro Prefixado", value: "tesouro_prefixado" },
    { label: "Tesouro IPCA+", value: "tesouro_ipca+" },
    { label: "FII", value: "fii" },
    { label: "Ações", value: "stock" },
];

export default function InvestmentCalculatorPage() {
    const form = useForm<InvestmentsFormValues>({
        resolver: zodResolver(investmentsSchema),
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            type: "cdb",
            initialValue: "1.000,00",
            monthlyContribution: "0,00",
            term: "12",
            termType: "meses",
            interestRate: "10,00",
            rateType: "pre",
            currentSelic: "13,75",
            currentCdi: "13,65",
            currentIPCA: "3,50",
            dividendYield: "0,00",
            unitPrice: "100,00",
            appreciationRate: "0,8",
            adminFee: "0,00",
            simulateDaily: false,
            taxOnStockGains: "20",
            dividendTaxRate: "0",
            roundResults: true,
        },
    });

    const { handleSubmit, watch, setValue, formState: {errors, isValid} } = form;
    const watchedType = watch("type");
    const watchedRateType = watch("rateType");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const onSubmit = (values: InvestmentsFormValues) => {
        console.log("SUBMIT", values);
        setLoading(true);
        setResult(null);
        // utilitário para converter strings mascaradas (ex: "1.234,56") para Number
        const parseMaskedNumber = (val: any) => {
            if (val === undefined || val === null) return 0;
            const s = String(val);
            const cleaned = s.replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
            const n = parseFloat(cleaned);
            console.log(n)
            return Number.isFinite(n) ? n : 0;
        };

        // Apenas garantir tipos corretos para a função
        const params: any = {
            type: values.type,
            initialValue: parseMaskedNumber(values.initialValue),
            monthlyContribution: parseMaskedNumber(values.monthlyContribution ?? "0"),
            term: Number(values.term),
            termType: values.termType ?? "meses",
            simulateDaily: !!values.simulateDaily,
            interestRate: values.interestRate ? parseMaskedNumber(values.interestRate) : undefined,
            rateType: values.rateType,
            currentSelic: values.currentSelic ? parseMaskedNumber(values.currentSelic) : undefined,
            currentCdi: (values as any).currentCdi ? parseMaskedNumber((values as any).currentCdi) : undefined,
            currentIPCA: values.currentIPCA ? parseMaskedNumber(values.currentIPCA) : undefined,
            dividendYield: values.dividendYield ? parseMaskedNumber(values.dividendYield) : undefined,
            unitPrice: values.unitPrice ? parseMaskedNumber(values.unitPrice) : undefined,
            appreciationRate: values.appreciationRate ? parseMaskedNumber(values.appreciationRate) / 100 : undefined,
            adminFee: values.adminFee ? parseMaskedNumber(values.adminFee) / 100 : 0,
            taxOnStockGains: values.taxOnStockGains ? parseMaskedNumber(values.taxOnStockGains) / 100 : 0.2,
            dividendTaxRate: values.dividendTaxRate ? parseMaskedNumber(values.dividendTaxRate) / 100 : 0,
            roundResults: !!values.roundResults,
        };

        // pequena latência para UX (simular cálculo)
        setTimeout(() => {
            try {
                const res = calculateInvestment(params);
                setResult(res);
            } catch (err) {
                setResult({ error: (err as Error).message });
            } finally {
                setLoading(false);
            }
    }, 250);
    };

    const handleReset = ()=> {
        setValue("initialValue", "1.000,00");
        setValue("monthlyContribution", "0,00");
        setValue("term", "12");
        setValue("termType", "meses");
        setValue("type", "cdb");
        setValue("rateType", "pre");
        setResult(null);
    }

    // máscaras e formatParams padrão
    const percentFormat = { format: "percent" as const, options: { inputIsPercent: true as const, maxFracDgts: 2, minFracDgts: 2} };

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-4">Simulador de Investimentos</h2>

            <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 p-4 rounded shadow">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="">
                            <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-2 ">
                                <CustomSelect form={form} name="type" label="Tipo" placeholder="Selecione" options={investmentOptions} />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="initialValue"
                                    label="Valor Inicial"
                                    mask={maskNumberInput()}
                                    formatParams={{ format: "currency", currency: "BRL" as any }}
                                    placeholder="0,00"
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="monthlyContribution"
                                    label="Aporte Mensal"
                                    mask={maskNumberInput()}
                                    formatParams={{ format: "currency", currency: "BRL" as any }}
                                    placeholder="0,00"
                                />
                                <CustomSelect form={form} name="termType" label="Unidade" options={[{ value: "meses", label: "Meses" }, { value: "anos", label: "Anos" }]} />
                                <CustomInput form={form} name="term" label="Prazo" type="number" mask={maskNumberInput()}/>
                                {(watchedType === "cdb" || watchedType === "tesouro_prefixado" || watchedType === "tesouro_ipca+") && (
                                    <>
                                        <CustomInput
                                            type="text"
                                            form={form}
                                            name="interestRate"
                                            label="Taxa (a.a.)"
                                            mask={maskNumberInput(3)}
                                            formatParams={percentFormat}
                                            placeholder="10,00"
                                        />
                                        <div className="flex flex-col w-full gap-2">
                                            <label htmlFor="fixed" className="font-bold">Fixado</label>
                                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center border border-border p-[7.3px] rounded-lg" id="fixed">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={watchedRateType === "pre"}
                                                        onChange={() => setValue("rateType", "pre")}
                                                    />
                                                    Pré
                                                </label>
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        checked={watchedRateType === "pos"}
                                                        onChange={() => setValue("rateType", "pos")}
                                                    />
                                                    Pós (CDI)
                                                </label>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {(watchedType !== undefined && (watchedType === "cdb" || watchedType.includes("tesouro"))) && (
                                    <>
                                        <CustomInput type="text" form={form} name="currentSelic" label="SELIC atual (%)" mask={maskNumberInput(3)} formatParams={percentFormat} />
                                        <CustomInput type="text" form={form} name="currentCdi" label="CDI atual (%)" mask={maskNumberInput(3)} formatParams={percentFormat} />
                                    </>
                                )}
                                {watchedType === "tesouro_ipca+" && (
                                    <CustomInput type="text" form={form} name="currentIPCA" label="IPCA atual (%)" mask={maskNumberInput(3)} formatParams={percentFormat} />
                                )}
                                <CustomInput  type="text" form={form} name="adminFee" label="Taxa administrativa" mask={maskNumberInput(2)} formatParams={percentFormat} title="(mensal %)"/>

                                {(watchedType === "fii" || watchedType === "stock") && (
                                    <>
                                        <CustomInput type="text" form={form} name="unitPrice" label="Preço unitário (R$)" mask={maskNumberInput()} formatParams={{ format: "currency", currency: "BRL" as any }} />
                                        <CustomInput type="text" form={form} name="appreciationRate" label="Valorização (ex: 0,8% a.m)" mask={maskNumberInput(3)} formatParams={percentFormat}/>
                                        <CustomInput type="text" form={form} name="dividendYield" label="Dividend Yield (a.a. %)" mask={maskNumberInput(3)} formatParams={percentFormat} />

                                    </>
                                )}
                            </div>
                            {(watchedType === "fii" || watchedType === "stock") && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 items-end">
                                    <CustomInput type="text" form={form} name="taxOnStockGains" label="IR sobre ganho de capital" mask={maskNumberInput()} formatParams={percentFormat} placeholder="20%"/>
                                    <div className="mt-2 p-2">
                                        <label className="flex items-center gap-2">
                                            <input type="checkbox" onChange={(e) => setValue("simulateDaily", e.target.checked)} />
                                            Simular diariamente (mais preciso)
                                        </label>
                                    </div>
                                </div>
                            )}
                            <div className="flex w-full justify-end gap-2 mt-4">
                                    <Button type="submit" className="font-semibold" disabled={loading}>
                                    {loading ? "Calculando..." : "Calcular"}
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-secondary text-white font-bold"
                                    onClick={handleReset}
                                >
                                    Resetar
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
                <div className="flex-1">
                    <div className="bg-gray p-4 rounded shadow border border-border">
                        <h3 className="text-xl font-semibold mb-3">Resumo</h3>

                        {loading && <div>Carregando...</div>}

                        {!loading && !result && <div className="text-sm text-muted-foreground">Preencha o formulário e clique em Calcular para ver o resultado.</div>}

                        {!loading && result && <InvestmentsSummary result={result} />}
                    </div>
                </div>
            </div>

            <section className="mt-6 text-sm text-muted-foreground">
                <p>
                    Observação: estimativas simplificadas (meses de 30 dias)
                </p>
            </section>
        </div>
    );
}
