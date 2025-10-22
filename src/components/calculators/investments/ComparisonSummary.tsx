import React from "react";
import { InvestmentResult, InvestmentType } from "@/types/investments";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Item = {
    id: string;
    label: string;
    type: InvestmentType;
    result: InvestmentResult;
};

type Props = {
    items: Item[]; // items a comparar
};

const FIXED_TYPES: InvestmentType[] = [
    "cdb",
    "lci",
    "lca",
    "cri",
    "cra",
    "debentures",
    "debentures_incentivadas",
    "tesouro_selic",
    "tesouro_prefixado",
    "tesouro_ipca+",
];

const VARIABLE_TYPES: InvestmentType[] = ["fii", "stock"];
/**
* ComparisonSummary
* - Recebe um array de itens: { id, label, type, result }
* - Se todos os tipos forem de renda fixa, compara entre renda fixa.
* - Se todos forem renda variável (fii/stock), compara entre renda variável.
* - Se mistura tipos, mostra uma nota e agrupa comparação por bucket.
*/
export const ComparisonSummary = ({ items }: Props) => {

    if (!items || items.length === 0)
        return <div className="text-center text-muted-foreground text-sm p-4">Nenhum investimento para comparar.</div>;
    const fixed = items.filter((i) => FIXED_TYPES.includes(i.type));
    const variable = items.filter((i) => VARIABLE_TYPES.includes(i.type));
    const other = items.filter((i) => !FIXED_TYPES.includes(i.type) && !VARIABLE_TYPES.includes(i.type));

    const buckets: { key: string; items: Item[] }[] = [];
    if (fixed.length) buckets.push({ key: "Renda Fixa", items: fixed });
    if (variable.length) buckets.push({ key: "Renda Variável", items: variable });
    if (other.length) buckets.push({ key: "Outros", items: other });

    // para montar dados pro chart (por bucket escolhemos comparar finalValue e totalInvested e netYield)
    const makeChartData = (list: Item[]) =>
        list.map((item) => ({
            name: item.label,
            finalValue: Number(item.result.finalValue ?? 0),
            totalInvested: Number(item.result.totalInvested ?? 0),
            netYield: Number(item.result.netYield ?? 0),
        }));

    // para destacar melhor (maior finalValue) dentro do grupo
    const bestInGroup = (list: Item[], metric: (r: InvestmentResult) => number) => {
        let best: Item | null = null;
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

    const CSS_CHART_COLORS = [
        "var(--chart-1, #2563eb)",
        "var(--chart-2, #16a34a)",
        "var(--chart-3, #f59e0b)",
        "var(--chart-4, #ef4444)",
        "var(--chart-5, #6b7280)",
    ];
    
    const fmtCurrency = (v?: number) => formatNumber(v ?? 0, "currency", "BRL");
    const fmtPercent = (v?: number) => formatNumber(v ?? 0, "percent", "", "percent", {
        inputIsPercent: true,
        minFractionDigitsPercent: 2,
        maxFractionDigitsPercent: 2,
    });

    return (
        <div className="space-y-4">
            {buckets.map((bucket, bIdx) => (
                
                <Card key={bucket.key} className="p-4 rounded shadow bg-card">
                    <CardHeader className="flex items-center justify-between mb-3">
                        <CardTitle className="flex items-center justify-between">
                            <span className="font-semibold">{bucket.key} — {bucket.items.length} itens</span>
                            {buckets.length > 1 && (
                                <span className="text-xs text-muted-foreground">(agrupado por tipo)</span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Chart */}
                        <div className="w-full ">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={makeChartData(bucket.items)} layout="vertical" margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                                    <XAxis type="number" tickFormatter={(v) => fmtCurrency(v)} />
                                    <YAxis dataKey="name" type="category" />
                                    <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                                    <Tooltip
                                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                                        contentStyle={{ fontSize: "0.8rem" }}
                                        formatter={(value: number) => fmtCurrency(value)}
                                    />
                                    <Bar dataKey="finalValue" name="Saldo Final" fill={CSS_CHART_COLORS[0]} barSize={14}>
                                        {bucket.items.map((it, idx) => (
                                            <Cell key={it.id} fill={CSS_CHART_COLORS[idx % CSS_CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                    <Bar dataKey="totalInvested" name="Total Investido" fill={CSS_CHART_COLORS[1]} barSize={8} />
                                    <Bar dataKey="netYield" name="Rendimento Líquido" fill={CSS_CHART_COLORS[2]} barSize={6} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Table summary */}
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full table-auto text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="p-2">Estratégia</th>
                                        <th className="p-2">Investido</th>
                                        <th className="p-2">Saldo Final</th>
                                        <th className="p-2">Rendimento Líq.</th>
                                        <th className="p-2">Rentab. a.a.</th>
                                        <th className="p-2">IR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bucket.items.map((it, idx) => {
                                        const r = it.result;
                                        const isBest = bestInGroup(bucket.items, (res) => res.finalValue)?.id === it.id;
                                        const irRate = r.grossYield ? (r.incomeTax ?? 0) / r.grossYield : 0;

                                        return (
                                            <tr key={it.id} className={`border-b ${isBest ? 'bg-muted/50 font-semibold' : ''}`}>
                                                <td className="p-2 font-medium">{it.label}</td>
                                                <td className="p-2">{fmtCurrency(r.totalInvested)}</td>
                                                <td className="p-2">{fmtCurrency(r.finalValue)}</td>
                                                <td className="p-2">{fmtCurrency(r.netYield)}</td>
                                                <td className="p-2">{(Number.isFinite(r.annualReturnPct) ? fmtPercent(r.annualReturnPct) : '-')}</td>
                                                <td className="p-2">{fmtPercent(irRate)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Quick highlights */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-xs">Maior Saldo Final</div>
                                <div className="font-semibold">{bestInGroup(bucket.items, (res) => res.finalValue)?.label ?? '-'}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-xs">Maior Rentab. a.a.</div>
                                <div className="font-semibold">{bestInGroup(bucket.items, (res) => res.annualReturnPct)?.label ?? '-'}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded">
                                <div className="text-xs">Menor IR efetivo</div>
                                <div className="font-semibold">{bestInGroup(bucket.items, (res) => -((res.incomeTax ?? 0)))?.label ?? '-'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

}