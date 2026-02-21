"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { investmentsSchema } from "@/schemas/investments";
import { ComparisonItem, InvestmentsFormValues } from "@/types/investments";
import ComparisonSummary from "@/components/calculators/investments/ComparisonSummary";
import { Form } from "@/components/ui/form";
import { orchestComparisons } from "@/utils/calculators/investments/orchestComparisons";

type Result = {
    results?: ComparisonItem[],
    error?: string
};

const Investments = () => {
    // a tipagem z.input<typeof schema> descreve o tipo de entrada do schema
    const form = useForm<InvestmentsFormValues>({ // tipa os values do form que no caso sempre serão strings
        resolver: zodResolver(investmentsSchema), // aplica as validações do schema nos values antes de chamar o handler
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            initialContribution: 1000,
            frequentContribution: 0,
            contributionAtStart: true,
            term: 12,
            termType: "months",
            interestRate: 10,
            currentSelic: 13.75,
            currentCdi: 13.65,
            currentIpca: 4.5,
            currentFundDi: 13.65,            // adiciona
            cdiPercent: 100,                 // adiciona (porcentagem do índice)
            fundDiPercent: 100,              // adiciona
            transactionFeePercent: 0,
            adminFeePercent: 0.0,
            preConversionSpread: 0.8,
            issuerCreditSpread: 0.35,
            compoundingFrequency: "monthly",
            contributionFrequency: "monthly",
            includeIOF: true,
            iofPercent: 3,
            incomeTaxTable: [
                { maxDays: 180, rate: 22.5 },
                { maxDays: 360, rate: 20 },
                { maxDays: 720, rate: 17.5 },
                { maxDays: Infinity, rate: 15 }
            ],
        }

    });

    const { register, handleSubmit, setValue, formState: { errors } } = form;

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => { if (errors && Object.keys(errors).length) console.warn('Form errors (live):', errors); }, [errors]);

    const onSubmit = (values: InvestmentsFormValues) => {
        setLoading(true);
        setResult(null);

        try {
            const parsed = investmentsSchema.parse(values);

            const params = {
                initialContribution: parsed.initialContribution,
                frequentContribution: parsed.frequentContribution ?? 0,
                term: parsed.term,
                termType: parsed.termType,
                contributionAtStart: parsed.contributionAtStart,
                interestRate: parsed.interestRate,
                currentSelic: parsed.currentSelic,
                currentCdi: parsed.currentCdi,
                currentIpca: parsed.currentIpca,
                currentFundDi: parsed.currentFundDi,
                cdiPercent: parsed.cdiPercent,
                fundDiPercent: parsed.fundDiPercent,
                transactionFeePercent: parsed.transactionFeePercent,
                adminFeePercent: parsed.adminFeePercent,
                preConversionSpread: parsed.preConversionSpread,
                issuerCreditSpread: parsed.issuerCreditSpread,
                compoundingFrequency: parsed.compoundingFrequency,
                contributionFrequency: parsed.contributionFrequency,
                includeIOF: parsed.includeIOF,
                iofPercent: parsed.iofPercent,
                incomeTaxTable: parsed.incomeTaxTable,
            };

            const comparisons = orchestComparisons(params);
            setResult({ results: comparisons });
        } catch (err) {
            setResult({ error: (err as Error).message });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setValue("initialContribution", "1.000,00");
        setValue("frequentContribution", "0,00");
        setValue("term", "12");
        setValue("termType", "months");
        setResult(null);
    }

    // máscaras e formatParams padrão
    const percentFormat = { format: "percent" as const, options: { inputIsPercent: true as const, maxFracDgts: 2, minFracDgts: 2 } };
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Simulador de Investimentos</h1>

            <div className="flex flex-col gap-6">
                <div className="flex-1">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit, (errors) => { console.warn("Form validation errors:", errors); setResult({ error: "Erro de validação: ver console (campo obrigatório ausente ou inválido)." }); setLoading(false); })} className="">
                            <div className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-3 gap-2 ">
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="initialContribution"
                                    label="Aporte Inicial"
                                    mask={maskNumberInput()}
                                    formatParams={{ format: "currency", currency: "BRL" as string }}
                                    placeholder="0,00"
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="frequentContribution"
                                    label="Aporte Regular"
                                    mask={maskNumberInput()}
                                    formatParams={{ format: "currency", currency: "BRL" as string }}
                                    placeholder="0,00"
                                />
                                <CustomSelect
                                    form={form}
                                    name="contributionFrequency"
                                    label="Frequência dos aportes"
                                    defaultValue="monthly"
                                    options={[
                                        { value: "monthly", label: "Mensal" },
                                        { value: "annually", label: "Anual" },
                                        { value: "one-time", label: "Único" },
                                        { value: "weekly", label: "Semanal" },
                                    ]}
                                />
                                <CustomSelect
                                    form={form}
                                    name="compoundingFrequency"
                                    label="Periodicidade dos juros"
                                    defaultValue="monthly"
                                    options={[
                                        { value: "daily", label: "Diária" },
                                        { value: "monthly", label: "Mensal" },
                                        { value: "annually", label: "Anual" },
                                    ]}
                                />
                                <CustomInput
                                    form={form}
                                    name="term"
                                    label="Prazo"
                                    type="text"
                                    mask={maskNumberInput()}
                                />
                                <CustomSelect
                                    form={form}
                                    name="termType"
                                    label="Unidade do prazo"
                                    defaultValue="months"
                                    options={[{ value: "months", label: "Meses" }, { value: "years", label: "Anos" }]}
                                />
                                <div className="mt-2 p-2 flex items-center ">
                                    <label className="flex items-center gap-2 cursor-pointer ">
                                        <input type="checkbox" {...register("contributionAtStart")} />
                                        <span className="text-xs">Aporte no início do período</span>
                                    </label>
                                </div>

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="interestRate"
                                    label="Taxa de rendimento"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    placeholder="10"
                                />

                                <CustomSelect
                                    form={form}
                                    name="preConversionSpread"
                                    label="Spread pós/pré *"
                                    defaultValue="0,5"
                                    options={[
                                        { value: "0,5", label: "Curto (0,5 p.p.)" },
                                        { value: "0,8", label: "Médio (0,8 p.p.)" },
                                        { value: "1,2", label: "Longo (1,2 p.p.)" },
                                    ]}
                                />

                                <CustomInput
                                    form={form}
                                    name="issuerCreditSpread"
                                    label="Ajuste por risco"
                                    type="text"
                                    mask={maskNumberInput()}
                                />
                                {/* --- Índices (SELIC, CDI, IPCA)  */}
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="currentSelic"
                                    label="SELIC atual (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="currentCdi"
                                    label="CDI atual (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                />

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="currentFundDi"
                                    label="Fundo-DI atual (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    placeholder="13.65"
                                />

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="currentIpca"
                                    label="IPCA anual (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                />

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="cdiPercent"
                                    label="Porcentagem do CDI (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    placeholder="100"
                                />

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="fundDiPercent"
                                    label="Porcentagem do Fundo DI (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    placeholder="100"
                                />

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="adminFeePercent"
                                    label="Taxa admin (mensal %)"
                                    mask={maskNumberInput(2)}
                                    formatParams={percentFormat}
                                />

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="transactionFeePercent"
                                    label="Taxa de Transação (%)"
                                    mask={maskNumberInput(2)}
                                    formatParams={percentFormat}
                                    placeholder="0,10"
                                />

                                <label className="flex items-center gap-2 mt-2">
                                    <input type="checkbox" {...register("includeIOF")} />
                                    <span className="text-xs">Incluir IOF</span>
                                </label>

                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="iofPercent"
                                    label="IOF"
                                    mask={maskNumberInput(2)}
                                    formatParams={percentFormat}
                                    placeholder="3"
                                />

                            </div>
                            <div className="text-xs text-muted-foreground mt-6 flex flex-col gap-4">

                                <span>
                                    <sup>*</sup> O spread entre pré e pós é a diferença média de rentabilidade entre títulos prefixados (taxa fixa) e pós-fixados (atrelados ao CDI).
                                    Exemplo: se o CDB pós paga 100% do CDI e o Tesouro Prefixado rende 10% ao ano, esse “spread” mostra quanto o pré costuma pagar a mais (ou a menos) que o pós, refletindo expectativa de juros futuros.
                                </span>
                            </div>
                            <div className="flex w-full justify-end gap-2 mt-4">

                                <Button
                                    type="button"
                                    className="bg-secondary text-white font-bold"
                                    onClick={handleReset}
                                >
                                    Resetar
                                </Button>
                                <Button type="submit" className="font-semibold" disabled={loading}>
                                    {loading ? "Simulando..." : "Simular"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
                <div className="flex-1">
                    <div className="bg-contrastgray p-4 rounded shadow border border-border">
                        <h3 className="text-xl font-semibold mb-3">Comparação dos Investimentos</h3>

                        {loading && <div>Carregando...</div>}

                        {!loading && !result && <div className="text-sm text-muted-foreground">Preencha o formulário e clique em Calcular para ver o resultado.</div>}

                        {!loading && result && result.results && <ComparisonSummary items={result.results} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Investments