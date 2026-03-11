"use client";

import { Form } from "@/components/ui/form";
import { CustomInput } from "@/components/ui/custom/CustomInput";
import { maskNumberInput } from "@/utils/mask/mask-number-input";
import { CustomSelect } from "@/components/ui/custom/CustomSelect";
import { Button } from "@/components/ui/button";
import { InvestmentsPageController } from "../controller";

export const InvestmentsPageForm = ({ controller }: { controller: InvestmentsPageController }) => {
    const { form, percentFormat, handleSubmit, onSubmit, register, loading, handleReset } = controller;

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 ">
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
                        label="Aporte Mensal"
                        mask={maskNumberInput()}
                        formatParams={{ format: "currency", currency: "BRL" as string }}
                        placeholder="0,00"
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
                        title="O spread representa a diferença média entre taxas prefixadas e pós-fixadas no mercado. Escolha um cenário para simular."
                        options={[
                            { value: "0,5", label: "0,5 pp — Conservador" },
                            { value: "0,8", label: "0,8 pp — Mercado médio" },
                            { value: "1,2", label: "1,2 pp — Prêmio elevado" },
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
                        name="currentIpca"
                        label="IPCA anual (%)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="rateAddToIpca"
                        title="IPCA + x% ao ano"
                        label="Taxa adicionada ao IPCA"
                        mask={maskNumberInput(2)}
                        formatParams={percentFormat}
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentCdb"
                        label="% do CDI (CDB)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentLci"
                        label="% do CDI (LCI)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentLca"
                        label="% do CDI (LCA)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentCri"
                        label="% do CDI (CRI)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentCra"
                        label="% do CDI (CRA)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentDebentures"
                        label="% do CDI (Debêntures)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentDebIncent"
                        label="% do CDI (Debênt. Incentiv.)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />

                    <CustomInput
                        type="text"
                        form={form}
                        name="cdiPercentFundDi"
                        label="% do CDI (Fundo DI)"
                        mask={maskNumberInput(3)}
                        formatParams={percentFormat}
                        placeholder="100"
                    />
                    <CustomInput
                        type="text"
                        form={form}
                        name="adminFeePercent"
                        label="Taxa admin anual"
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
