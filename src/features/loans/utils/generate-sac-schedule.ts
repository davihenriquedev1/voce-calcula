import { round2 } from "@/utils/math";
import { LoansSchedule } from "../types";

export function generateSacSchedule(P: number, r: number, n: number) {
    const principal = P / n;
    let balance = P;
    const schedule: Array<LoansSchedule> = [];
    for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const payment = principal + interest;
        balance = Math.max(0, balance - principal);
        schedule.push({ month: i, payment: round2(payment), principal: round2(principal), interest: round2(interest), balance: round2(balance) });
    }
    return schedule;
}