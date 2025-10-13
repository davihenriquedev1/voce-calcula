import { calculateTIR } from "../tir";

// Calcula o CET anual com base no valor financiado e na tabela de pagamentos
export function calculateCET(
  financed: number, // valor inicial do financiamento
  schedule: { payment: number }[] // array com cada parcela do financiamento
): number {
    const cashFlows = [-financed, ...schedule.map(s => s.payment)]; // fluxo de caixa: saída inicial + entradas das parcelas
    const tirMensal = calculateTIR(cashFlows); // calcula a TIR mensal do fluxo
    const cetAnual = Math.pow(1 + tirMensal, 12) - 1; // converte a TIR mensal em CET anual (capitalização composta)
    return cetAnual * 100; // retorna CET em percentual
}