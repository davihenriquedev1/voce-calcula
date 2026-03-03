"use client";

import { Form } from "@/components/ui/form";
import { CustomInput } from "@/components/ui/custom/CustomInput";
import { maskNumberInput } from "@/utils/mask/mask-number-input";
import { CustomSelect } from "@/components/ui/custom/CustomSelect";
import { Button } from "@/components/ui/button";
import { InvestmentsPageController } from "../controller";

export const InvestmentsPageForm = ({controller}: {controller: InvestmentsPageController}) => {
    const {form, percentFormat, handleSubmit, onSubmit, register, loading, handleReset } = controller;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="">
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
                        label="Spread pra pós/pré *"
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
                        label="DI / Fundo-DI atual (%)"
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

                    <CustomInput
                        type="text"
                        form={form}
                        name="iofPercent"
                        label="IOF"
                        mask={maskNumberInput(2)}
                        formatParams={percentFormat}
                        placeholder="3"
                    />

                    <label className="flex items-center gap-2 mt-2">
                        <input type="checkbox" {...register("includeIOF")} />
                        <span className="text-xs">Incluir IOF</span>
                    </label>

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
                        {loading ? "Calculando..." : "Calcular"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
