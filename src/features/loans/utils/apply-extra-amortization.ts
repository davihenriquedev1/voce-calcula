import { ExtraAmortizationType, LoansSchedule, MethodType } from "../types";
import { amortByTermReduction } from "./amort-by-term-reduction";
import { amortByInstallmentReduction } from "./amort-by-installment-reduction";
import { round2 } from "@/utils/math";

export function applyExtraAmortization (value: number, type: ExtraAmortizationType, monthIndex: number, baseSchedule: LoansSchedule[], method: MethodType, r: number, financed: number, n: number) {
    if (!Array.isArray(baseSchedule) || baseSchedule.length === 0) return baseSchedule;
    if (monthIndex == null) return baseSchedule;
    if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > baseSchedule.length) return baseSchedule;
    
    const newSchedule: LoansSchedule[] = [];

    for(let i=1; i < monthIndex; i++) {
        newSchedule.push({...baseSchedule[i-1]});
    }

    const entryM = baseSchedule[monthIndex-1];
    const postBalance = Number(entryM.balance ?? 0);
    const applyExtra = Math.min(value, postBalance);
    const newBalanceAfterExtra = round2(Math.max(0, postBalance - applyExtra));

    const newEntryM = { 
        month: monthIndex, 
        payment: round2(Number(entryM.payment ?? 0) + applyExtra), 
        principal: round2(Number(entryM.principal ?? 0) + applyExtra), 
        interest: round2(Number(entryM.interest ?? 0)), 
        balance: newBalanceAfterExtra 
    };
    newSchedule.push(newEntryM);

    const balance = newBalanceAfterExtra;
    const monthCounter = monthIndex + 1;
    const fixedPayment = round2(Number(baseSchedule[0]?.payment ?? 0)); 

    if(type === "reduzir_prazo") {
        amortByTermReduction (newSchedule, balance, r, monthCounter, method, fixedPayment, financed, n);
    } else {
        const remainingPeriods = n - monthIndex;
         if (remainingPeriods > 0) {
            amortByInstallmentReduction(newSchedule, method, remainingPeriods, balance, r, monthIndex);
        }
    }

    const reindexed = newSchedule.map((row, idx) => ({ ...row, month: idx + 1 }));
    return reindexed;
}
