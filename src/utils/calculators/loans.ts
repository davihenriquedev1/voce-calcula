export const toMonthlyRate = (annualPercent: number) => Math.max(0, annualPercent) / 100 / 12;

export function calcPricePayment(P:number, r:number, n:number) {
    if(r===0) return P/n;
    return (P * r) / (1 - Math.pow(1 + r, -n));
}

export function generatePriceSchedule(P: number, r:number, n:number) {
    const payment = calcPricePayment(P, r, n);
    let balance = P;
    const schedule: Array<any> = [];
    for(let i =1; i <= n; i++) {
        const interest = balance * r;
        const principal = payment - interest;
        balance = Math.max(0, balance - principal);
        schedule.push({month: i, payment: round(payment), principal: round(principal), interest: round(interest), balance: round(balance)});
    }
    return schedule;
}

export function generateSacSchedule(P: number, r: number, n: number) {
    const principal = P / n;
    let balance = P;
    const schedule: Array<any> = [];
    for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const payment = principal + interest;
        balance = Math.max(0, balance - principal);
        schedule.push({ month: i, payment: round(payment), principal: round(principal), interest: round(interest), balance: round(balance) });
    }
    return schedule;
}

export function generateConsorcioSchedule(P: number, n:number, adminPercent = 0) {
    // Modelo simplificado: parcela = (P / n) + (P * adminPercent / 100) / n
    const principal = P/n;
    const adminMonthly = (P * (adminPercent || 0) / 100) / n;
    const schedule: Array<any> = [];
    let balance = P;
    for(let i = 1; i<=n; i++) {
        const payment = principal + adminMonthly;
        balance = Math.max(0, balance - principal);
        schedule.push({month: i, payment: round(payment), principal: round(principal), balance: round(balance)});
    }
    return schedule;
}

export function round(v: number) {
    return Math.round((v + Number.EPSILON) * 100) / 100;
}