import React, { useState, useEffect } from "react";
import { formatNumber } from "@/utils/formatters/formatNumber";
import { ComparisonItem,InvestmentsResult } from "@/types/investments";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

type Props = {
    items: ComparisonItem[];
};

export default function ComparisonSummary({ items }: Props) {
    const [mounted, setMounted] = useState(false);
    const [selectedTypeEvol, setSelectedTypeEvol] = useState<string | null>(items[0]?.id ?? null);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        setSelectedTypeEvol(items[0]?.id ?? null);    
    }, [items]);
        
    if (!items || items.length === 0) return null;

    // para montar dados pro chart (por bucket escolhemos comparar finalValue e totalInvested e netYield)
    const makeChartData = (list: ComparisonItem[]) =>
        list.map((item) => ({
            name: item.label,
            finalValue: Number(item.result.finalValue ?? 0),
            totalInvested: Number(item.result.totalInvested ?? 0),
            netYield: Number(item.result.netYield ?? 0),
        }));

    const CSS_CHART_COLORS = ["#02735E", "#10B981", "#0EA5A4", "#2563EB", "#6B7280"];

    const fmtCurrency = (v?: number) => formatNumber(v ?? 0, "currency", "BRL");
    const fmtPercent = (v?: number) => formatNumber(v ?? 0, "percent", "", "percent", {
        inputIsPercent: true,
        minFractionDigitsPercent: 2,
        maxFractionDigitsPercent: 2,
    });

    // para destacar melhor (maior finalValue) dentro do grupo
    const bestInGroup = (list: ComparisonItem[], metric: (r: InvestmentsResult) => number) => {
        let best: ComparisonItem | null = null;
        let bestVal = -Infinity;
        for (const item of list) {
            const v = metric(item.result);
            if (Number.isFinite(v) && v > bestVal) {
                bestVal = v;
                best = item;
            }
        }
        return best;
    }

    const minEffectiveIr = (list: ComparisonItem[]) => {
        let best = null;
        let bestVal = Infinity;
        for (const v of list) {
            const g = v.result.grossYield ?? 0;
            const tax = v.result.incomeTax ?? 0;
            const ratio = g > 0 ? (tax / g) : Infinity;
            if (ratio < bestVal) {
                bestVal = ratio; best = v;
            }
        }
        return best;
    }

    const getUsedAnnual = (item: ComparisonItem): number | undefined => {
        const r = item.result;

        if (typeof r.displayAnnualInterest === "number") return r.displayAnnualInterest;

        if (r.rateType === "pos" && typeof r.interestRate === "number") {
            if (typeof r.usedIndexAnnual === "number") {
                return r.usedIndexAnnual * (r.interestRate / 100);
            }
            return undefined;
        }

        return (typeof r.interestRate === "number") ? r.interestRate : undefined;
    };

    const handleSelectEvolution = (value: string) => {
        setSelectedTypeEvol(value);
    };

    return (

        <div className="space-y-3">
           
            <div className=" rounded-none rounded-b shadow bg-transparent space-y-3">
                <div className="flex-col">
                    {/* Chart (pai com altura fixa para o ResponsiveContainer) */}
                    <div
                        className="w-full h-64 md:h-80 text-stone-800"
                        style={{ minWidth: 0, minHeight: 200 }}
                    >
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={makeChartData(items)}
                                    layout="vertical"
                                    margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
                                >
                                    <XAxis type="number" tickFormatter={(v) => fmtCurrency(v)} />
                                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                                    <Legend verticalAlign="top" wrapperStyle={{ fontSize: "0.8rem", paddingBottom: 8 }} />
                                    <Tooltip
                                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                        contentStyle={{ fontSize: "0.85rem" }}
                                        formatter={(value: number) => fmtCurrency(value)}
                                    />
                                    <Bar dataKey="finalValue" name="Saldo Final" barSize={20}>
                                        {items.map((it, idx) => (
                                            <Cell key={it.id} fill={CSS_CHART_COLORS[idx % CSS_CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                                Carregando gráfico...
                            </div>
                        )}
                    </div>
                    {/* Layout: chart + table (grid responsivo) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-x-auto">
                        {/* Table summary */}
                        <div className="mt-8 w-full">
                            <table className="w-max min-w-full table-auto text-sm divide-y whitespace-nowrap ">
                                <thead className="border-t border-t-chart/40">
                                    <tr className="text-left border-b">
                                        <th className="p-3 text-left text-xs text-muted-foreground font-medium">Tipo</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Tipo de fixação</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Aportes no início dos períodos</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Índice utilizado</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Investido</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Saldo Bruto</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Saldo Líquido</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Rendimento bruto</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Rendimento Líq.</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Rentab. Efetiva</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Retorno total %</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">Taxa usada (a.a.)</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">IR %</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">IR cobrado R$</th>
                                        <th className="p-3 text-center text-xs text-muted-foreground font-medium">IOF %</th>
                                        <th className="p-3 text-right text-xs text-muted-foreground font-medium">Taxa administrativa (mensal)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it) => {
                                        const r = it.result;
                                        const isBest = bestInGroup(items, (res) => res.finalValue)?.id === it.id;
                                        const irRate = (r.grossYield > 0) ? (((r.incomeTax ?? 0) / r.grossYield) * 100) : 0;
                                        // Saldo bruto = total investido + rendimento bruto (antes de IR/IOF)
                                        const grossFinal = (r.totalInvested ?? 0) + (r.grossYield ?? 0);
                                        // Saldo líquido = finalValue (já considera impostos)
                                        const netFinal = r.finalValue ?? 0;
                                        const totalNetReturnPct = (r.totalInvested ?? 0) > 0 ? (( (r.finalValue ?? 0) - (r.totalInvested ?? 0) ) / (r.totalInvested ?? 1)) * 100 : 0;
                                        const iofPct = typeof r.iofRateApplied === "number" ? r.iofRateApplied * 100 : 0;
                                        return (
                                            <tr key={it.id} className={`transition-colors hover:bg-chart-4 ${isBest ? 'bg-gray text-chart-1 font-semibold text-sm' : ''}`}>
                                                <td className="p-2 font-medium text-left">{it.label}</td>
                                                <td className="font-semibold text-center">{r.rateType ? (r.rateType === "pre" ? "Pré (a.a.)" : "Pós (% do índice)") : "-"}</td>
                                                <td className="font-semibold text-center">{r.contributionAtStart ? "Sim" : "Não"}</td>
                                                <td className="font-semibold text-right">
                                                    {r.usedIndexName
                                                        ? `${r.usedIndexName} (${typeof r.usedIndexAnnual === 'number' ? formatNumber(r.usedIndexAnnual, "percent", "", "percent", { inputIsPercent: true }) : '-'} a.a.)`
                                                        : "-"}
                                                </td>
                                                <td className="p-2 text-right">{fmtCurrency(r.totalInvested)}</td>
                                                <td className="p-2 text-right">{fmtCurrency(grossFinal)}</td>
                                                <td className="p-2 text-right">{fmtCurrency(netFinal)}</td>
                                                <td className="p-2 text-right">{fmtCurrency(r.grossYield)}</td>
                                                <td className="p-2 text-right">{fmtCurrency(r.netYield)}</td>
                                                <td className="p-2 text-right">{(Number.isFinite(r.annualReturnPct) ? fmtPercent(r.annualReturnPct) : '-')}</td>
                                                <td className="p-2 text-right">{fmtPercent(totalNetReturnPct)}</td>
                                                <td className="p-2 text-right">
                                                    {(() => {
                                                        const annual = getUsedAnnual(it);
                                                        if (typeof annual === "number") {
                                                            return fmtPercent(annual);
                                                        }
                                                        const r = it.result;
                                                        if (r.rateType === "pos" && typeof r.interestRate === "number") {
                                                            return `${r.interestRate.toFixed(2)}% do índice`;
                                                        }
                                                        return "-";
                                                    })()}
                                                </td>
                                                <td className="p-2 text-right">{fmtPercent(irRate)}</td>
                                                <td className="p-2 text-right">{fmtCurrency(r.incomeTax)}</td>
                                                <td className="p-2 text-right">{fmtPercent(iofPct)}</td>
                                                <td className="p-2 font-semibold text-right">{formatNumber((r.adminFeePercent ?? 0) * 100, "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 2, minFractionDigitsPercent: 2 })}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/* Quick highlights */}
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 p-2">
                        <div className="p-3 bg-gradient-to-r from-background to-ring border rounded-lg shadow-sm">
                            <div className="text-xs text-muted-foreground">Maior Saldo Final</div>
                            <div className="font-semibold">{bestInGroup(items, (res) => res.finalValue)?.label ?? '-'}</div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-background to-ring border rounded-lg shadow-sm">
                            <div className="text-xs text-muted-foreground">Maior Rentab. a.a.</div>
                            <div className="font-semibold">{bestInGroup(items, (res) => res.annualReturnPct)?.label ?? '-'}</div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-background to-ring border rounded-lg shadow-sm">
                            <div className="text-xs text-muted-foreground">Menor IR efetivo</div>
                            <div className="font-semibold">{minEffectiveIr(items)?.label ?? '-'}</div>
                        </div>
                    </div>
                    {/* Evolution */}
                    <div className="flex flex-col p-2 mt-3">
                        <div className="w-full mb-3 ">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                Evolução do montante bruto. Escolha o investimento.
                            </h4>
                            <select
                                title="selecione o tipo"
                                className="w-full p-2 border rounded"
                                value={selectedTypeEvol ?? ""}
                                onChange={(e) => handleSelectEvolution(e.target.value)}
                            >
                                {items.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {items
                            .filter(item => item.id === selectedTypeEvol)
                            .map(item => (
                                <div key={item.id} className="mt-2">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        Intervalo: {item.result.evolution.length} meses
                                        <span className="text-xs text-muted-foreground cursor-help" title="A evolução mostrada é o saldo bruto (antes de impostos). O 'Valor final estimado' no resumo já considera impostos (IR/IOF).">
                                            ℹ️
                                        </span>
                                    </h4>
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
                                                    {item.result.evolution.map((v: number, idx: number) => (
                                                        <tr key={idx} className="border-b">
                                                            <td className="p-2">{idx + 1}</td>
                                                            <td className="p-2 text-white">{formatNumber(v, "currency", "BRL")}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}