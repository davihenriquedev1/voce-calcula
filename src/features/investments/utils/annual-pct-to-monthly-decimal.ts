// Helper: converte taxa anual (%) para taxa mensal decimal usando composição
export const annualPctToMonthlyDecimal = (annualPct: number) => {
    // annualPct é em %, ex: 13.65 -> 13.65
    return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
};