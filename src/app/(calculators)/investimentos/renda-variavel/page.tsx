"use client";
/* 

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { investmentsSchema } from "@/schemas/investments/fixed-income";
import { ComparisonItem, InvestmentParams, InvestmentResult, InvestmentsFormValues, InvestmentType } from "@/types/investments/fixed-income";
import { calculateInvestment } from "@/utils/calculators/investments/fixed-income/calculateFixedIncome";
import InvestmentsSummary from "@/components/calculators/investments/fixed-income/ComparisonSummary";
import { Form } from "@/components/ui/form";
import stringNumberToNumber from "@/utils/parsers/stringNumberToNumber";
import { ComparisonSummary } from "@/components/calculators/investments/fixed-income/ComparisonSummary";
import { calculateBucketComparisons } from "@/utils/calculators/investments/fixed-income/calculateBucketComparisons";
import { investmentOptions } from "@/constants/investments";

const investmentMeta: Record<string, {
    allowRateType?: boolean;
    defaultRateType?: 'pre' | 'pos';
    allowPosIndex?: boolean;
    forceExemptFromIR?: boolean;
}> = {
    cdb: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: true,},
    lci: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: false, forceExemptFromIR: true, },
    lca: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: false, forceExemptFromIR: true, },
    cri: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: false, forceExemptFromIR: true, },
    cra: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: false, forceExemptFromIR: true, },
    debentures: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: false, },
    debentures_incentivadas: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: false, forceExemptFromIR: true, },
    tesouro_selic: { allowRateType: false, defaultRateType: 'pos', allowPosIndex: true, },
    tesouro_prefixado: { allowRateType:false, defaultRateType: 'pre', allowPosIndex: false, },
    'tesouro_ipca+': { allowRateType: false, defaultRateType: 'pre', allowPosIndex: false, },
};

type Result = {
    main?: InvestmentResult,
    comparisons?: ComparisonItem[],
    error?: string
};

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
            currentIPCA: "4,50",
            dividendYield: "0,00",
            reinvestDividends: false,
            dividendFrequencyMonths: "1",
            transactionFee: "0,10", // 0,10% por exemplo -> você vai converter
            unitPrice: "100,00",
            appreciationRate: "0,8",
            adminFee: "0,00",
            taxOnStockGains: "20",
            dividendTaxRate: "0",
            
            roundResults: true,
            contributionAtStart: true,
            preConversionSpread: "0,8", // ou apenas 0.8
            issuerCreditSpread: "0,35" // ex: 0.35 p.p. para banco pequeno
        },
    });

    const { register, handleSubmit, watch, setValue, getValues} = form;
    const watchedType = watch("type") as InvestmentType;
    const watchedRateType = watch("rateType");

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(()=> {
        console.log("watchedType:", watchedType, "allowRateType:", investmentMeta[watchedType]?.allowRateType, "showVariable:", investmentMeta[watchedType]?.showVariableFields);
    }, [watchedType]);
    // incroniza defaults/visibilidade quando o tipo muda
    useEffect(() => {
        const meta = investmentMeta[watchedType] ?? {};

        // pegar valor atual do rateType sem depender do watch em deps
        const currentRateType = getValues("rateType");

        // Só sobrescreve rateType quando o usuário acabou de trocar o TIPO de investimento
        // — evita sobreescrever toda vez que rateType muda.
        // Para detectar "troca" simples: quando o form estiver vazio (ex.: em inicialização)
        // ou quando o currentRateType for undefined/empty (caso raro).
        if (meta.defaultRateType && (!currentRateType)) {
            setValue("rateType", meta.defaultRateType);
        }

        // Se o produto não permite pos/pre e o usuário estiver com um valor inválido
        // (por exemplo: meta.allowRateType = false mas rateType === 'pos'), forçamos só aqui.
        if (!meta.allowRateType && currentRateType && currentRateType !== meta.defaultRateType) {
            setValue("rateType", meta.defaultRateType ?? "pre");
        }

        // se produto isento de IR por regra, sugerimos zero (não forçamos se o usuário já alterou)
        const currentTaxOnStocks = getValues("taxOnStockGains");
        if (meta.forceExemptFromIR && (currentTaxOnStocks === undefined || currentTaxOnStocks === "")) {
            setValue("taxOnStockGains", "0");
        }

        // limpar campos de renda variável apenas quando trocar TIPO e produto não aceita
        if (!meta.showVariableFields) {
            setValue("unitPrice", "0,00");
            setValue("appreciationRate", "0,00");
            setValue("dividendYield", "0,00");
        }
        // NOTE: deps apenas no 'watchedType' para rodar quando o tipo muda
    }, [watchedType, setValue, getValues]);

    const onSubmit = (values: InvestmentsFormValues) => {
        setLoading(true);
        setResult(null);

        // Apenas garantir tipos corretos para a função
        const params: InvestmentParams = {
            type: values.type as InvestmentType,
            initialValue: stringNumberToNumber(values.initialValue),
            monthlyContribution: stringNumberToNumber(values.monthlyContribution) ?? 0,
            term: stringNumberToNumber(values.term),
            termType: values.termType ?? "meses",
            contributionAtStart: !!values.contributionAtStart,
            interestRate: stringNumberToNumber(values.interestRate),
            rateType: values.rateType,
            currentSelic: stringNumberToNumber(values.currentSelic),
            currentCdi: stringNumberToNumber(values.currentCdi),
            currentIPCA: stringNumberToNumber(values.currentIPCA),
            dividendYield: stringNumberToNumber(values.dividendYield),
            unitPrice: stringNumberToNumber(values.unitPrice),
            reinvestDividends: !!values.reinvestDividends,
            dividendFrequencyMonths: stringNumberToNumber(values.dividendFrequencyMonths) ?? 1,
            transactionFee: values.transactionFee ? (stringNumberToNumber(values.transactionFee) / 100) : 0,
            appreciationRate: stringNumberToNumber(values.appreciationRate) !== undefined 
                ? stringNumberToNumber(values.appreciationRate)! / 100 
                : undefined,
            adminFee: values.adminFee ? stringNumberToNumber(values.adminFee) / 100 : 0,
            taxOnStockGains: values.taxOnStockGains? stringNumberToNumber (values.taxOnStockGains) / 100 : 0.2,
            dividendTaxRate: values.dividendTaxRate ? stringNumberToNumber(values.dividendTaxRate) / 100 : 0,
            roundResults: !!values.roundResults,
            preConversionSpread: values.preConversionSpread ? stringNumberToNumber(values.preConversionSpread) : undefined,
            issuerCreditSpread: values.issuerCreditSpread ? stringNumberToNumber(values.issuerCreditSpread) : 0,
        };

        try {
            const res = calculateInvestment(params);
            const comparisons = calculateBucketComparisons(params, res);
            setResult({ main: res, comparisons });
        } catch (err) {
            setResult({ error: (err as Error).message });
        } finally {
            setLoading(false);
        }
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

            <div className="flex flex-col md:flex-row gap-6">
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
                                    formatParams={{ format: "currency", currency: "BRL" as string }}
                                    placeholder="0,00"
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="monthlyContribution"
                                    label="Aporte Mensal"
                                    mask={maskNumberInput()}
                                    formatParams={{ format: "currency", currency: "BRL" as string }}
                                    placeholder="0,00"
                                />
                                <CustomSelect 
                                    form={form} 
                                    name="termType" 
                                    label="Unidade" 
                                    options={[{ value: "meses", label: "Meses" }, { value: "anos", label: "Anos" }]} 
                                />
                                <CustomInput 
                                    form={form} 
                                    name="term" 
                                    label="Prazo" 
                                    type="text" 
                                    mask={maskNumberInput()}
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
                                    label={watchedRateType === "pos" ? "Porcentagem do CDI" : "Rendimento anual"}
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    placeholder={watchedRateType === "pos" ? "ex: 100" : "10,00"}
                                />
                                <div className="flex flex-col w-full gap-2 mt-1">    
                                    <label htmlFor="fixed" className="font-bold text-sm">Tipo de taxa</label>
                                    <div className="flex flex-row gap-4 items-center border border-border p-[7px] rounded-lg" id="fixed" >
                                        <label className="flex items-center gap-2 ">
                                            <input
                                                type="radio"
                                                value="pre"
                                                {...register("rateType")}
                                                disabled={!investmentMeta[watchedType]?.allowRateType}
                                            />
                                            Pré
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                value="pos"
                                                {...register("rateType")}
                                                disabled={!investmentMeta[watchedType]?.allowRateType || !investmentMeta[watchedType]?.allowPosIndex}
                                            />
                                            Pós
                                        </label>
                                    </div>
                                </div>
                                <CustomSelect
                                    form={form}
                                    name="preConversionSpread"
                                    label="Spread pra pós/pré *"
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
                                    name="currentIPCA"
                                    label="IPCA anual (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                />

                                <CustomInput 
                                    type="text" 
                                    form={form} name="adminFee" 
                                    label="Taxa admin (mensal %)" 
                                    mask={maskNumberInput(2)} 
                                    formatParams={percentFormat} 
                                />
                               
                              
                                <CustomInput 
                                    type="text" form={form} 
                                    name="taxOnStockGains" 
                                    label="IR sobre ganho (ações/FII)" 
                                    mask={maskNumberInput()} 
                                    formatParams={percentFormat} 
                                    placeholder="20%" 
                                    disabled={!investmentMeta[watchedType]?.showVariableFields}

                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="unitPrice"
                                    label="Preço unitário (R$)"
                                    mask={maskNumberInput()}
                                    formatParams={{ format: "currency", currency: "BRL" as string }}
                                    disabled={!investmentMeta[watchedType]?.showVariableFields}
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="appreciationRate"
                                    label="Valorização (ex: 0,8% a.m)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    disabled={!investmentMeta[watchedType]?.showVariableFields}
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="dividendYield"
                                    label="Dividend Yield (a.a. %)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    disabled={!investmentMeta[watchedType]?.showVariableFields}
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="dividendFrequencyMonths"
                                    title="em meses"
                                    label="Intervalo de dividendos"
                                    mask={maskNumberInput()}
                                    placeholder="1"
                                    disabled={!investmentMeta[watchedType]?.showVariableFields}
                                />
                                <CustomInput
                                    type="text"
                                    form={form}
                                    name="transactionFee"
                                    label="Taxa por reinvestimento (%)"
                                    mask={maskNumberInput(3)}
                                    formatParams={percentFormat}
                                    disabled={!investmentMeta[watchedType]?.showVariableFields}
                                />
                                
                                <label className="flex items-center gap-2 cursor-pointer ">
                                    <input type="checkbox" {...register("reinvestDividends")} disabled={!investmentMeta[watchedType]?.showVariableFields}/>
                                    <span className="text-xs">Reinvestir dividendos</span>
                                </label>
                            </div>
                            <div className="text-xs text-muted-foreground mt-6 flex flex-col gap-4">
                                <span>Alguns campos são desabilitados para certos produtos, se não for aplicável ao tipo selecionado.</span>
                                <span>
                                    * <br/>
                                    O spread entre pré e pós é a diferença média de rentabilidade entre títulos prefixados (taxa fixa) e pós-fixados (atrelados ao CDI).
                                    Exemplo: se o CDB pós paga 100% do CDI e o Tesouro Prefixado rende 10% ao ano, esse “spread” mostra quanto o pré costuma pagar a mais (ou a menos) que o pós, refletindo expectativa de juros futuros.
                                </span>
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

                        {!loading && result && result.main && <InvestmentsSummary result={result.main} />}
                    </div>
                </div>
            </div>
            {result !== null &&
                 <div className="flex-1 flex flex-col mt-10">
                    <div className="flex justify-center h-full bg-chart-2 p-2 rounded-t border border-border">
                        <h3 className="text-lg text-white font-semibold">Comparação dos investimentos</h3>
                    </div>
                    <div className="bg-contrastgray rounded-b shadow border border-border">
                        {!loading && result && result.comparisons && <ComparisonSummary items={result.comparisons} />}
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


*/