import { round2 } from "@/utils/math";
import { LoansSchedule, MethodType } from "../types";
import { calcPricePayment } from "./calc-price-payment";

export const amortByInstallmentReduction = (newSchedule: LoansSchedule[], method: MethodType, remainingPeriods: number, balance: number, r: number, mi: number,) => {
    if (method === "price") {
        const newPayment = calcPricePayment(balance, r, remainingPeriods);
        for (let j = 1; j <= remainingPeriods; j++) {
            const monthIdx = mi + j;
            const interest = round2(balance * r);
            let principal = round2(newPayment - interest);
            if (principal > balance) principal = balance;
            const payment = round2(interest + principal);
            balance = round2(Math.max(0, balance - principal));
            newSchedule.push({ month: monthIdx, payment, principal, interest, balance });
            if (balance <= 0.005) break;
        }
    } else {
        // SAC: distribui o saldo restante em amortizações iguais para os meses restantes
        const newPrincipalPerMonth = round2(balance / remainingPeriods);
        for (let j = 1; j <= remainingPeriods; j++) {
            const monthIdx = mi + j;
            const interest = round2(balance * r);
            // no último mês, principal pode ser o que restou
            let principal = j === remainingPeriods ? round2(balance) : newPrincipalPerMonth;
            if (principal > balance) principal = balance;
            principal = round2(principal);
            const payment = round2(principal + interest);
            balance = round2(Math.max(0, balance - principal));
            newSchedule.push({ month: monthIdx, payment, principal, interest, balance });
            if (balance <= 0.005) break;
        }
    }
}