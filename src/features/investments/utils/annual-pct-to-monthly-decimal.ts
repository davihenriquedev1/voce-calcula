export const annualPctToMonthlyDecimal = (annualPct: number) => {
    return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
};