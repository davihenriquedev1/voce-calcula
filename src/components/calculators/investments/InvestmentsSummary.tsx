import React from "react";
import { formatNumber } from "@/utils/formatters/formatNumber";

type Props = {
    result: any;
};

export default function InvestmentsSummary({ result }: Props) {
    if (!result) return null;
    if (result.error) return <div className="text-red-600">Erro: {result.error}</div>;

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm">Valor final estimado</div>
                    <div className="text-2xl font-bold">{formatNumber(result.finalValue, "currency", "brl",)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm">Rentabilidade líquida anual</div>
                    <div className="text-2xl font-bold">{formatNumber(result.annualReturnPct, "percent", "", "percent", {inputIsPercent: true, maxFractionDigitsPercent: 4, minFractionDigitsPercent: 2})}</div>
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
                    <div className="font-semibold">{formatNumber(result.iof, "currency")}</div>
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
                                        <td className="p-2">{formatNumber(v, "currency")}</td>
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
