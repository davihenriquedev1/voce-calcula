import { calculateTIR } from "./calculate-tir";

export function calculateCET(
  financed: number,
  schedule: { payment: number }[]
): number {
    const cashFlows = [-financed, ...schedule.map(s => s.payment)];
    const tirMensal = calculateTIR(cashFlows);
    const cetAnual = Math.pow(1 + tirMensal, 12) - 1;
    return cetAnual * 100;
}