"use client";

import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { investmentsSchema } from "@/schemas/investments";
import { InvestmentsFormValues, InvestmentsParsedValues } from "@/types/investments"; // asegure que corresponde ao schema
import { calculateInvestment } from "@/utils/calculators/investments";
import { z } from "zod";
import InvestmentsSummary from "@/components/calculators/investments/InvestmentsSummary";
import { Form } from "@/components/ui/form";
import stringNumberToNumber from "@/utils/parsers/stringNumberToNumber";
import { ComparisonSummary } from "@/components/calculators/investments/ComparisonSummary";

const investmentOptions = [
    { label: "CDB", value: "cdb" },
    { label: "LCI", value: "lci" },
    { label: "LCA", value: "lca" },
    { label: "CRI", value: "cri" },
    { label: "CRA", value: "cra" },
    { label: "Debêntures", value: "debentures" },
    { label: "Debêntures Incentivadas (isentas)", value: "debentures_incentivadas" },
    { label: "Tesouro Selic", value: "tesouro_selic" },
    { label: "Tesouro Prefixado", value: "tesouro_prefixado" },
    { label: "Tesouro IPCA+", value: "tesouro_ipca+" },
    { label: "FII", value: "fii" },
    { label: "Ações", value: "stock" },
];

export default function InvestmentCalculatorPage() {
    // a tipagem z.input<typeof schema> descreve o tipo de entrada do schema
    const form = useForm<InvestmentsFormValues>({ // tipa os values do form que no caso sempre serão strings
        resolver: zodResolver(investmentsSchema), // aplica as validações do schema nos values antes de chamar o handler
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
            contributionAtStart: false,
        },
    });

    const { register, handleSubmit, watch, setValue, formState } = form;
    const watchedType = watch("type");
    const watchedRateType = watch("rateType");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    const onSubmit = (values: InvestmentsFormValues) => {
        setLoading(true);
        setResult(null);

        // Apenas garantir tipos corretos para a função
        const params: any = {
            type: values.type,
            initialValue: stringNumberToNumber(values.initialValue),
            monthlyContribution: stringNumberToNumber(values.monthlyContribution) ?? 0,
            term: stringNumberToNumber(values.term),
            termType: values.termType ?? "meses",
            simulateDaily: !!values.simulateDaily,
            contributionAtStart: !!values.contributionAtStart,
            interestRate: stringNumberToNumber(values.interestRate),
            rateType: values.rateType,
            currentSelic: stringNumberToNumber(values.currentSelic),
            currentCdi: stringNumberToNumber(values.currentCdi),
            currentIPCA: stringNumberToNumber(values.currentIPCA),
            dividendYield: stringNumberToNumber(values.dividendYield),
            unitPrice: stringNumberToNumber(values.unitPrice),
            appreciationRate: stringNumberToNumber(values.appreciationRate) !== undefined 
                ? stringNumberToNumber(values.appreciationRate)! / 100 
                : undefined,
            adminFee: values.adminFee ? stringNumberToNumber(values.adminFee) / 100 : 0,
            taxOnStockGains: values.taxOnStockGains? stringNumberToNumber (values.taxOnStockGains) / 100 : 0.2,
            dividendTaxRate: values.dividendTaxRate ? stringNumberToNumber(values.dividendTaxRate) / 100 : 0,
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
                                <CustomInput form={form} name="term" label="Prazo" type="text" mask={maskNumberInput()}/>
                                <div className="mt-2 p-2 flex items-center ">
                                    <label className="flex items-center gap-2 cursor-pointer ">
                                        <input type="checkbox" {...register("contributionAtStart")} />
                                        <span className="text-xs">Aporte no início do período</span>
                                    </label>
                                </div>

                                {(watchedType === "cdb" || watchedType === "tesouro_prefixado" || watchedType === "lci" || watchedType === "lca" || watchedType === "tesouro_ipca+") && (
                                    <>
                                        <CustomInput
                                            type="text"
                                            form={form}
                                            name="interestRate"
                                            label={watchedRateType === "pos" ? "Rendimento (% do CDI)" : "Taxa de Rendimento (a.a)"}
                                            mask={maskNumberInput(3)}
                                            formatParams={percentFormat}
                                            placeholder={watchedRateType === "pos" ? "ex: 100" : "10,00"}
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
                                {(watchedType !== undefined && (watchedType === "cdb" || watchedType.includes("tesouro") || watchedType === "lci" || watchedType === "lca")) && (
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
                                 {(watchedType === "fii" || watchedType === "stock" || watchedType === "cdb" || watchedType === "debentures" || watchedType?.includes("tesouro"))
                                && (
                                    <CustomInput type="text" form={form} name="taxOnStockGains" label="IR sobre ganho de capital" mask={maskNumberInput()} formatParams={percentFormat} placeholder="20%"/>
                                )}
                            
                            </div>
                            <div className="mt-2 p-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" {...register("simulateDaily")} />
                                    Simular diariamente (mais preciso)
                                </label>
                            </div>
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
                    <div className="bg-contrastgray p-4 rounded shadow border border-border">
                        <h3 className="text-xl font-semibold mb-3">Resumo</h3>

                        {loading && <div>Carregando...</div>}

                        {!loading && !result && <div className="text-sm text-muted-foreground">Preencha o formulário e clique em Calcular para ver o resultado.</div>}

                        {!loading && result && <InvestmentsSummary result={result} />}
                    </div>
                </div>
            </div>
            {result !== null &&
                 <div className="flex-1 flex flex-col mt-10">
                    <div className="flex justify-center h-full bg-chart-2 p-2 rounded-t border border-border">
                        <h3 className="text-lg text-white font-semibold">Comparação dos investimentos</h3>
                    </div>
                    <div className="bg-contrastgray p-4 rounded-b shadow border border-border">
                        {//!loading && result && <ComparisonSummary items={invToCompare} />
                        }
                    </div>
                </div>  
            }
            <div className="mt-6 text-sm text-muted-foreground">
                <p>
                    Observação: estimativas simplificadas e alguns valores foram arredondados. Além disso, renda variável considera valores e crescimento hipotético, utilizando uma média de crescimento dos ativos. Não dá pra prever o futuro, né? rsrs (ao menos ainda)
                </p>
            </div>
        </div>
    );
}
