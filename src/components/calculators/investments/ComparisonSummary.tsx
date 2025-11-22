import React, { useState, useEffect } from "react";
import { ComparisonItem, InvestmentResult } from "@/types/investments";
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
import { formatNumber } from "@/utils/formatters/formatNumber";
import { Card, CardContent } from "@/components/ui/card";
import { FIXED_INVESTMENT_TYPES } from "@/constants/investments";

type Props = {
    items: ComparisonItem[]; // items a comparar
};

export const ComparisonSummary = ({ items }: Props) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    if (!items || items.length === 0) return <div className="text-center text-muted-foreground text-sm p-4">Nenhum investimento para comparar.</div>;
    const fixed = items.filter((i) => FIXED_INVESTMENT_TYPES.includes(i.type));

    const buckets: { key: string; items: ComparisonItem[] }[] = [];
    if (fixed.length) buckets.push({ key: "Renda Fixa", items: fixed });

    // para montar dados pro chart (por bucket escolhemos comparar finalValue e totalInvested e netYield)
    const makeChartData = (list: ComparisonItem[]) =>
        list.map((item) => ({
            name: item.label,
            finalValue: Number(item.result.finalValue ?? 0),
            totalInvested: Number(item.result.totalInvested ?? 0),
            netYield: Number(item.result.netYield ?? 0),
        }));

    // para destacar melhor (maior finalValue) dentro do grupo
    const bestInGroup = (list: ComparisonItem[], metric: (r: InvestmentResult) => number) => {
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

    const CSS_CHART_COLORS = ["#02735E", "#10B981", "#0EA5A4", "#2563EB", "#6B7280"];

    const fmtCurrency = (v?: number) => formatNumber(v ?? 0, "currency", "BRL");
    const fmtPercent = (v?: number) => formatNumber(v ?? 0, "percent", "", "percent", {
        inputIsPercent: true,
        minFractionDigitsPercent: 2,
        maxFractionDigitsPercent: 2,
    });

    // adicione este helper perto do topo do componente (logo abaixo de fmtPercent/ fmtCurrency)
    // substituir o getUsedAnnual existente por este
    const getUsedAnnual = (item: ComparisonItem): number | undefined => {
        const r = item.result;

        // se o cálculo já nos passou a taxa anual pronta, use-a
        if (typeof r.displayAnnualInterest === "number") return r.displayAnnualInterest;

        // caso pós e tivermos o índice usado (ex: currentCdi/currentSelic salvo em usedIndexAnnual)
        if (r.rateType === "pos" && typeof r.interestRate === "number") {
            if (typeof r.usedIndexAnnual === "number") {
                return r.usedIndexAnnual * (r.interestRate / 100);
            }
            //sem índice disponível: não temos como converter para % a.a. corretamente
            return undefined;
        }
 
        return (typeof r.interestRate === "number") ? r.interestRate : undefined;
    };

    return (
        <div className="space-y-4">
            {buckets.map((bucket) => (
                
                <Card key={bucket.key} className=" rounded-none rounded-b shadow bg-transparent">

                    <CardContent >
                        {/* Layout: chart + table (grid responsivo) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Chart (pai com altura fixa para o ResponsiveContainer) */}
                            <div
                                className="w-full h-64 md:h-80 text-stone-800"
                                style={{ minWidth: 0, minHeight: 200 }} // evita colapso em layouts flex/hidden
                            >
                                {mounted ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={makeChartData(bucket.items)}
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
                                            <Bar dataKey="finalValue" name="Saldo Final" barSize={18}>
                                            {bucket.items.map((it, idx) => (
                                                <Cell key={it.id} fill={CSS_CHART_COLORS[idx % CSS_CHART_COLORS.length]} />
                                            ))}
                                            </Bar>
                                            <Bar dataKey="totalInvested" name="Total Investido" barSize={10} />
                                            <Bar dataKey="netYield" name="Rendimento Líq." barSize={6} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    // placeholder simples enquanto mede o container
                                    <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                                        Carregando gráfico...
                                    </div>
                                )}
                            </div>
                            {/* Table summary */}
                            <div className="mt-4 w-full overflow-auto max-h-80">
                                <table className="w-full table-auto text-sm divide-y">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">Estratégia</th>
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">Investido</th>
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">Saldo Bruto</th>
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">Saldo Líquido</th>
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">Rendimento Líq.</th>
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">Rentab. Efetiva</th>
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">Taxa usada (a.a.)</th>
                                            <th className="p-3 text-left text-xs text-muted-foreground font-medium">IR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bucket.items.map((it) => {
                                            const r = it.result;
                                            const isBest = bestInGroup(bucket.items, (res) => res.finalValue)?.id === it.id;
                                            const irRate = (r.grossYield > 0) ? (((r.incomeTax ?? 0) / r.grossYield) * 100) : 0;

                                            // Saldo bruto = total investido + rendimento bruto (antes de IR/IOF)
                                            const grossFinal = (r.totalInvested ?? 0) + (r.grossYield ?? 0);
                                            // Saldo líquido = finalValue (já considera impostos)
                                            const netFinal = r.finalValue ?? 0;

                                            return (
                                                <tr key={it.id} className={`transition-colors hover:bg-chart-4 ${isBest ? 'bg-gray text-chart-1 font-semibold' : ''}`}>
                                                    <td className="p-2 font-medium">{it.label}</td>
                                                    <td className="p-2">{fmtCurrency(r.totalInvested)}</td>
                                                    <td className="p-2">{fmtCurrency(grossFinal)}</td>
                                                    <td className="p-2">{fmtCurrency(netFinal)}</td>
                                                    <td className="p-2">{fmtCurrency(r.netYield)}</td>
                                                    <td className="p-2">{(Number.isFinite(r.annualReturnPct) ? fmtPercent(r.annualReturnPct) : '-')}</td>
                                                    <td className="p-2">
                                                        {(() => {
                                                            // tenta primeiro pegar número já convertido
                                                            const annual = getUsedAnnual(it);
                                                            if (typeof annual === "number") {
                                                            return fmtPercent(annual);
                                                            }
                                                            // se não tiver taxa anual, mostrar "% do índice" como info (sem confundir com % a.a.)
                                                            const r = it.result;
                                                            if (r.rateType === "pos" && typeof r.interestRate === "number") {
                                                                return `${r.interestRate.toFixed(2)}% do índice`;
                                                            }
                                                            return "-";
                                                        })()}
                                                        </td>
                                                    <td className="p-2">{fmtPercent(irRate)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody> 
                                </table>
                            </div>
                        </div>
                       
                        {/* Quick highlights */}
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 bg-gradient-to-r from-background to-ring border rounded-lg shadow-sm">
                                <div className="text-xs text-muted-foreground">Maior Saldo Final</div>
                                <div className="font-semibold">{bestInGroup(bucket.items, (res) => res.finalValue)?.label ?? '-'}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-background to-ring border rounded-lg shadow-sm">
                                <div className="text-xs text-muted-foreground">Maior Rentab. a.a.</div>
                                <div className="font-semibold">{bestInGroup(bucket.items, (res) => res.annualReturnPct)?.label ?? '-'}</div>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-background to-ring border rounded-lg shadow-sm">
                                <div className="text-xs text-muted-foreground">Menor IR efetivo</div>
                                <div className="font-semibold">{minEffectiveIr(bucket.items)?.label ?? '-'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

}