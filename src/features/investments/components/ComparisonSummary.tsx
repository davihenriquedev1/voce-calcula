"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ComparisonItem, InvestmentsResult } from "@/features/investments/types";
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    Cell,
    LabelList,
    YAxis,
    XAxis,
} from "recharts";
import { formatNumber } from "@/utils/format/format-number";

type Props = {
    items: ComparisonItem[];
};

const CSS_CHART_COLORS = ["#02735E", "#10B981", "#0EA5A4", "#2563EB", "#6B7280"];

export const ComparisonSummary = ({ items }: Props) => {
    const [mounted, setMounted] = useState(false);
    const [selectedTypeEvol, setSelectedTypeEvol] = useState<string | null>(items[0]?.id ?? null);

    useEffect(() => { setMounted(true); }, []);

    const sortedComparisons = useMemo(() => {
        if (!items) return [];

        return [...items].sort(
            (a, b) => (b.result.annualReturnPct ?? 0) - (a.result.annualReturnPct ?? 0)
        );
    }, [items]);

    useEffect(() => {
        setSelectedTypeEvol(sortedComparisons[0]?.id ?? null);
    }, [sortedComparisons]);

    if (!items || items.length === 0) return null;

    const makeChartData = (list: ComparisonItem[]) =>
        list.map((item) => ({
            name: item.label,
            finalValue: Number(item.result.finalValue ?? 0),
            totalInvested: Number(item.result.totalInvested ?? 0),
            netYield: Number(item.result.netYield ?? 0),
        }));

    const fmtCurrency = (v?: number) => formatNumber(v ?? 0, "currency", "BRL");
    const fmtPercent = (v?: number) => formatNumber(v ?? 0, "percent", "", "percent", {
        inputIsPercent: true,
        minFractionDigitsPercent: 2,
        maxFractionDigitsPercent: 2,
    });

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
                <div className="flex flex-col">
                    <div
                        className="w-full h-64 md:h-80 text-stone-800"
                        style={{ minWidth: 0, minHeight: 200 }}
                    >
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={makeChartData(sortedComparisons)}
                                    layout="vertical"
                                    margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Bar dataKey="finalValue" barSize={28} radius={[2, 2, 2, 2]}>
                                        {sortedComparisons.map((it, idx) => (
                                            <Cell
                                                key={it.id}
                                                fill={CSS_CHART_COLORS[idx % CSS_CHART_COLORS.length]}
                                            />
                                        ))}

                                        <LabelList
                                            dataKey="name"
                                            position="insideLeft"
                                            offset={12}
                                            style={{ fill: "#fff", fontSize: 12, fontWeight: 500 }}
                                        />

                                        <LabelList
                                            dataKey="finalValue"
                                            position="insideRight"
                                            formatter={(value) =>
                                                typeof value === "number" ? fmtCurrency(value) : value
                                            }
                                            style={{ fill: "#FFF", fontSize: 12, fontWeight: 600 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                                Carregando gráfico...
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-x-auto">
                        <div className="mt-8 w-full">
                            <table className="w-max min-w-full table-auto text-sm divide-y whitespace-nowrap ">
                                <thead className="border border-chart bg-[#50fd0065]">
                                    <tr className="text-left border-b text-xs sm:text-sm text-foreground font-bold">
                                        <th className="p-3 text-left border-x-2 border-x-chart">Tipo</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Tipo de fixação</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Saldo Bruto</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Saldo Líquido</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Investido</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Rendimento bruto</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Rendimento Líq.</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Rentabilidade anual bruta</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Índice utilizado</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Rentabilidade anual efetiva</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Retorno total %</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">Aportes no início dos períodos</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">IR %</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">IR cobrado R$</th>
                                        <th className="p-3 text-center border-x-2 border-x-chart">IOF %</th>
                                        <th className="p-3 text-right border-x-2 border-x-chart">Taxa administrativa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedComparisons.map((it) => {
                                        const r = it.result;
                                        const irRate = (r.grossYield > 0) ? (((r.incomeTax ?? 0) / r.grossYield) * 100) : 0;
                                        const grossFinal = (r.totalInvested ?? 0) + (r.grossYield ?? 0);
                                        const netFinal = r.finalValue ?? 0;
                                        const totalNetReturnPct = (r.totalInvested ?? 0) > 0 ? (((r.finalValue ?? 0) - (r.totalInvested ?? 0)) / (r.totalInvested ?? 1)) * 100 : 0;
                                        const iofPct = typeof r.iofRateApplied === "number" ? r.iofRateApplied * 100 : 0;
                                        return (
                                            <tr key={it.id} className='transition-colors hover:bg-chart-4 border border-chart text-xs sm:text-sm'>
                                                <td className="p-2 font-medium text-left border-x-2 border-x-chart">{it.label}</td>
                                                <td className="p-2 font-semibold text-left border-x-2 border-x-chart">{r.rateType ? (r.rateType === "pre" ? "Pré (a.a.)" : "Pós (% do índice)") : "-"}</td>
                                                <td className="p-2 border-x-2 border-x-chart">{fmtCurrency(grossFinal)}</td>
                                                <td className="p-2 text-chart-1 font-bold bg-gray border-x-2 border-x-chart hover:bg-chart-4 hover:text-chart-1">{fmtCurrency(netFinal)}</td>
                                                <td className="p-2 border-x-2 border-x-chart">{fmtCurrency(r.totalInvested)}</td>
                                                <td className="p-2 border-x-2 border-x-chart">{fmtCurrency(r.grossYield)}</td>
                                                <td className="p-2 border-x-2 border-x-chart ">{fmtCurrency(r.netYield)}</td>
                                                <td className="p-2 text-right border-x-2 border-x-chart">
                                                    {(() => {
                                                        const annual = getUsedAnnual(it);
                                                        if (typeof annual === "number") {
                                                            return fmtPercent(annual);
                                                        }
                                                        return "-";
                                                    })()}
                                                </td>
                                                <td className="p-2 font-semibold border-x-2 border-x-chart">
                                                    {r.usedIndexName
                                                        ? `${r.usedIndexName} (${typeof r.usedIndexAnnual === 'number' ? formatNumber(r.usedIndexAnnual, "percent", "", "percent", { inputIsPercent: true }) : '-'} a.a.)`
                                                        : "-"}
                                                </td>
                                                <td className="p-2 text-right border-x-2 border-x-chart">{(Number.isFinite(r.annualReturnPct) ? fmtPercent(r.annualReturnPct) : '-')}</td>
                                                <td className="p-2 text-right border-x-2 border-x-chart">{fmtPercent(totalNetReturnPct)}</td>
                                                <td className="p-2 font-semibold text-center border-x-2 border-x-chart">{r.contributionAtStart ? "Sim" : "Não"}</td>
                                                <td className="p-2 text-right border-x-2 border-x-chart">{fmtPercent(irRate)}</td>
                                                <td className="p-2 border-x-2 border-x-chart">{fmtCurrency(r.incomeTax)}</td>
                                                <td className="p-2 text-right border-x-2 border-x-chart">{fmtPercent(iofPct)}</td>
                                                <td className="p-2 font-semibold text-right border-x-2 border-x-chart">{formatNumber((r.adminFeePercent ?? 0), "percent", "", "percent", { inputIsPercent: true, maxFractionDigitsPercent: 2, minFractionDigitsPercent: 2 })}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 p-2">
                        <div className="p-3 bg-gradient-to-r from-background to-chart-3 border rounded-lg shadow-sm">
                            <div className="text-xs text-foreground">Maior Saldo Final</div>
                            <div className="font-semibold">{bestInGroup(sortedComparisons, (res) => res.finalValue)?.label ?? '-'}</div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-background to-chart-3 border rounded-lg shadow-sm">
                            <div className="text-xs text-foreground">Maior Rentab. a.a.</div>
                            <div className="font-semibold">{bestInGroup(sortedComparisons, (res) => res.annualReturnPct)?.label ?? '-'}</div>
                        </div>
                        <div className="p-3 bg-gradient-to-r from-background to-chart-3 border rounded-lg shadow-sm">
                            <div className="text-xs text-foreground">Menor IR efetivo</div>
                            <div className="font-semibold">{minEffectiveIr(sortedComparisons)?.label ?? '-'}</div>
                        </div>
                    </div>
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
                                {sortedComparisons.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {sortedComparisons
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