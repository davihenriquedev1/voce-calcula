import { ExtraAmortizationType, LoansSchedule, MethodType } from "../types";
import { amortByTermReduction } from "./amort-by-term-reduction";
import { amortByInstallmentReduction } from "./amort-by-installment-reduction";
import { round2 } from "@/utils/math";

export function applyExtraAmortization (value: number, type: ExtraAmortizationType, monthIndex: number, baseSchedule: LoansSchedule[], method: MethodType, r: number, financed: number, n: number) {
     // validação básica
    if (!Array.isArray(baseSchedule) || baseSchedule.length === 0) return baseSchedule;
    if (monthIndex == null) return baseSchedule;
    if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > baseSchedule.length) return baseSchedule;
    
    const newSchedule: LoansSchedule[] = [];

    // 1) copia os meses até m-1 (inalterados)
    for(let i=1; i < monthIndex; i++) {
        newSchedule.push({...baseSchedule[i-1]});
    }

    // 2) aplica a amortização extra no mês m (após o pagamento daquele mês)
    const entryM = baseSchedule[monthIndex-1];
    const postBalance = Number(entryM.balance ?? 0); // saldo após a parcela m no schedule base
    const applyExtra = Math.min(value, postBalance);
    const newBalanceAfterExtra = round2(Math.max(0, postBalance - applyExtra));

    // a parcela do mês m aumenta pelo valor amortizado extra (pagamento adicional);
    const newEntryM = { 
        month: monthIndex, 
        payment: round2(Number(entryM.payment ?? 0) + applyExtra), 
        principal: round2(Number(entryM.principal ?? 0) + applyExtra), 
        interest: round2(Number(entryM.interest ?? 0)), 
        balance: newBalanceAfterExtra 
    };
    newSchedule.push(newEntryM);

    // 3) rebuild a partir do novo saldo
    const balance = newBalanceAfterExtra;
    const monthCounter = monthIndex + 1;
    const fixedPayment = round2(Number(baseSchedule[0]?.payment ?? 0)); // parcela original PRICE

    if(type === "reduzir_prazo") {
        // Mantém o valor da parcela (PRICE) ou a amortização constante (SAC) e encurta o prazo
        amortByTermReduction (newSchedule, balance, r, monthCounter, method, fixedPayment, financed, n);
    } else {
        // reduzir_parcela -> mantém o prazo original (restante) e recalcula parcelas
        const remainingPeriods = n - monthIndex;
         if (remainingPeriods > 0) {
            amortByInstallmentReduction(newSchedule, method, remainingPeriods, balance, r, monthIndex);
        }
    }

    // reindexa months (opcional) para garantir sequência correta 1..Nfinal
    const reindexed = newSchedule.map((row, idx) => ({ ...row, month: idx + 1 }));
    return reindexed;
}
