// rounding e normalização
export const round2 = (v: number) => Math.round((Number(v) + Number.EPSILON) * 100) / 100;

