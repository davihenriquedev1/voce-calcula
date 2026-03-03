import { round2 } from "@/utils/math";
import { LoansSchedule } from "../types";

export function generateConsorcioSchedule(P: number, n:number, adminPercent = 0) {
    // Modelo simplificado: parcela = (P / n) + (P * adminPercent / 100) / n
    const principal = P/n;
    const adminMonthly = (P * (adminPercent || 0) / 100) / n;
    const schedule: Array<LoansSchedule> = [];
    let balance = P;
    for(let i = 1; i<=n; i++) {
        const payment = principal + adminMonthly;
        balance = Math.max(0, balance - principal);
        schedule.push({month: i, payment: round2(payment), principal: round2(principal), balance: round2(balance)});
    }
    return schedule;
}