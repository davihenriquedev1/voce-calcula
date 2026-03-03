import { calcPricePayment } from "./calc-price-payment";
import { LoansSchedule } from "../types";
import { round2 } from "@/utils/math";

export function generatePriceSchedule(P: number, r:number, n:number) {
    const payment = calcPricePayment(P, r, n);
    let balance = P;
    const schedule: Array<LoansSchedule> = [];
    for(let i =1; i <= n; i++) {
        const interest = round2(balance * r);
        const principal = round2(payment - interest);
        balance = Math.max(0, balance - principal);
        schedule.push({month: i, payment: round2(payment), principal, interest, balance});
    }

    // Ajuste do último principal para bater exatamente P
    const totalPrincipal = schedule.reduce((sum, s) => sum + s.principal, 0);
    const diff = round2(P - totalPrincipal);
    if (diff !== 0) {
        schedule[schedule.length - 1].principal += diff;
        schedule[schedule.length - 1].payment += diff;
        schedule[schedule.length - 1].balance = 0;
    }
    // Assim a soma dos principais pagos sempre bate exatamente com P e o saldo final é zero.
    return schedule;
}