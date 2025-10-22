import React from "react";
import { formatNumber } from "@/utils/formatters/formatNumber";
import { round2 } from "@/utils/math";
import { InvestmentResult } from "@/types/investments";

type Props = {
    result: InvestmentResult;
};

export default function InvestmentsSummary({ result }: Props) {
    if (!result) return null;

    console.log(result.usedIndexAnnual)
    const totalNetReturnPct = result.totalInvested > 0 ? ((result.finalValue - result.totalInvested) / result.totalInvested) * 100 : 0;
    const effectiveIrPct = result.grossYield > 0 ? (result.incomeTax / result.grossYield) * 100 : 0;
    const iofPct = typeof result.iofRateApplied === "number" ? result.iofRateApplied * 100 : 0;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm">Valor final estimado</div>
                    <div className="text-2xl font-bold">{formatNumber(result.finalValue, "currency", "brl")}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm">Rentabilidade líquida anual</div>
                    <div className="text-2xl font-bold">{formatNumber(result.annualReturnPct, "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 4, minFractionDigitsPercent: 2 })}</div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="p-2 border rounded">
                    <div className="text-xs">Rendimento bruto</div>
                    <div className="font-semibold">{formatNumber(result.grossYield, "currency", "brl")}</div>
                </div>
                <div className="p-2 border rounded">
                    <div className="text-xs">Imposto de Renda</div>
                    <div className="font-semibold">{formatNumber(result.incomeTax, "currency", "brl")}</div>
                </div>
                <div className="p-2 border rounded">
                    <div className="text-xs">IOF</div>
                    <div className="font-semibold">{formatNumber(result.iof, "currency", "brl")}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-2 border rounded">
                    <div className="text-xs">Rentabilidade líquida total</div>
                    <div className="font-semibold">{formatNumber(round2(totalNetReturnPct), "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 4, minFractionDigitsPercent: 2 })}</div>
                </div>
                <div className="p-2 border rounded">
                    <div className="text-xs">IR efetivo sobre rendimento</div>
                    <div className="font-semibold">{formatNumber(round2(effectiveIrPct), "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 4, minFractionDigitsPercent: 2 })}</div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-2 border rounded">
                    <div className="text-xs">Aporte no início do período</div>
                    <div className="font-semibold">{result.contributionAtStart ? "Sim" : "Não"}</div>
                </div>
                <div className="p-2 border rounded">
                    <div className="text-xs">Simulação diária</div>
                    <div className="font-semibold">{result.simulateDaily ? "Sim" : "Não"}</div>
                </div>

                <div className="p-2 border rounded">
                    <div className="text-xs">Tipo de taxa</div>
                    <div className="font-semibold">{result.rateType ? (result.rateType === "pre" ? "Pré-fixada (a.a.)" : "Pós-fixada (% do índice)") : "-"}</div>
                </div>

                <div className="p-2 border rounded">
                    <div className="text-xs">Taxa / % do índice</div>
                    <div className="font-semibold">
                        {typeof result.interestRate === "number" ? (
                        // interestRate is stored as "percent number" (ex: 10 = 10%). Tell formatNumber that inputIsPercent is true.
                        result.rateType === "pos"
                            ? `${formatNumber(result.interestRate, "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 2, minFractionDigitsPercent: 2 })} do índice`
                            : formatNumber(result.interestRate, "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 2, minFractionDigitsPercent: 2 })
                        ) : '-'}
                    </div>
                </div>
                <div className="p-2 border rounded">
                    <div className="text-xs">Índice utilizado</div>
                    <div className="font-semibold">
                        {result.usedIndexName
                        ? `${result.usedIndexName} (${typeof result.usedIndexAnnual === 'number' ? formatNumber(result.usedIndexAnnual, "percent", "", "percent", {inputIsPercent: true}) : '-'} a.a.)`
                        : "-"}
                    </div>
                </div>
                <div className="p-2 border rounded">
                    <div className="text-xs">Taxa administrativa (mensal)</div>
                    <div className="font-semibold">{formatNumber((result.adminFee ?? 0) * 100, "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 2, minFractionDigitsPercent: 2 })}</div>
                </div>

                <div className="p-2 border rounded">
                    <div className="text-xs">IR sobre ganho de capital (ações/FII)</div>
                    <div className="font-semibold">{formatNumber((result.taxOnStockGains ?? 0) * 100, "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 2, minFractionDigitsPercent: 2 })}</div>
                </div>

                <div className="p-2 border rounded">
                    <div className="text-xs">IOF (tabela) aplicado</div>
                    <div className="font-semibold">{iofPct ? `${formatNumber(iofPct, "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 2, minFractionDigitsPercent: 2 })} sobre rendimento` : "0%"}</div>
                </div>

            </div>

            <div className="mt-4">
                <h4 className="font-semibold mb-2">Dividendos</h4>
                <div>Total de dividendos recebidos: <strong>{formatNumber(result.totalDividends, "currency", "brl")}</strong></div>
                <div className="text-sm">Total investido: <strong>{formatNumber(result.totalInvested, "currency", "brl")}</strong></div>
            </div>

            <div className="mt-6">
                <h4 className="font-semibold mb-2">Evolução em {result.evolution.length} meses</h4>
                <div className="max-h-60 overflow-hidden border border-border h-full">
                    <div className="overflow-y-auto max-h-52">
                        <table className="w-full table-auto text-sm bg-section1 text-white">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="p-2">Período</th>
                                    <th className="p-2">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.evolution.map((v: number, idx: number) => (
                                    <tr key={idx} className="border-b">
                                        <td className="p-2">{idx + 1}</td>
                                        <td className="p-2">{formatNumber(v, "currency", "brl")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
