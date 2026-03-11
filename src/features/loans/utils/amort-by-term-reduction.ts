import { round2 } from "@/utils/math";
import { LoansSchedule, MethodType } from "../types";

export const amortByTermReduction = (newSchedule: LoansSchedule[], balance: number, r: number, monthCounter: number, method: MethodType, fixedPayment: number, financed: number, n: number, ) => {
    let safety = 0;
    while(balance > 0.005 && safety++ < 10000) {
        const interest = round2(balance * r);
        let principal: number;
        if(method === "price") {
            principal = round2(fixedPayment - interest);
            if (principal <= 0) {
                principal = Math.min(balance, round2(balance));
            }
            if (principal > balance) principal = balance;
        } else {
            const principalConst = round2(financed / n);
            principal = round2(Math.min(principalConst, balance));
        }
        const payment = round2(interest + principal);
        balance = round2(Math.max(0, balance - principal));
        newSchedule.push({ month: monthCounter, payment, principal, interest, balance });
        monthCounter++;
    }
};