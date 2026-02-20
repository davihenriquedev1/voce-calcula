import { ExtraAmortizationType, MethodType, Schedule } from "@/types/loans";
import { round2} from "@/utils/math";

export const toMonthlyRate = (annualPercent: number) => Math.max(0, annualPercent) / 100 / 12;

export function calcPricePayment(P:number, r:number, n:number) {
    if(r===0) return P/n;
    return (P * r) / (1 - Math.pow(1 + r, -n));
}

export function generatePriceSchedule(P: number, r:number, n:number) {
    const payment = calcPricePayment(P, r, n);
    let balance = P;
    const schedule: Schedule[] = [];
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

export function generateSacSchedule(P: number, r: number, n: number) {
    const principal = P / n;
    let balance = P;
    const schedule: Schedule[] = [];
    for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const payment = principal + interest;
        balance = Math.max(0, balance - principal);
        schedule.push({ month: i, payment: round2(payment), principal: round2(principal), interest: round2(interest), balance: round2(balance) });
    }
    return schedule;
}

export function generateConsorcioSchedule(P: number, n:number, adminPercent = 0) {
    // Modelo simplificado: parcela = (P / n) + (P * adminPercent / 100) / n
    const principal = P/n;
    const adminMonthly = (P * (adminPercent || 0) / 100) / n;
    const schedule: Schedule[] = [];
    let balance = P;
    for(let i = 1; i<=n; i++) {
        const payment = principal + adminMonthly;
        balance = Math.max(0, balance - principal);
        schedule.push({month: i, payment: round2(payment), principal: round2(principal), balance: round2(balance)});
    }
    return schedule;
}

export function applyExtraAmortization (value: number, type: ExtraAmortizationType, monthIndex: number, baseSchedule:  Schedule[], method: MethodType, r: number, financed: number, n: number) {
     // validação básica
    if (!Array.isArray(baseSchedule) || baseSchedule.length === 0) return baseSchedule;
    if (monthIndex == null) return baseSchedule;
    if (isNaN(monthIndex) || monthIndex < 1 || monthIndex > baseSchedule.length) return baseSchedule;
    
    const newSchedule = [];

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

const amortByTermReduction = (newSchedule:  Schedule[], balance: number, r: number, monthCounter: number, method: MethodType, fixedPayment: number, financed: number, n: number, ) => {
    let safety = 0;
    while(balance > 0.005 && safety++ < 10000) {
        const interest = round2(balance * r);
        let principal: number;
        if(method === "price") {
            principal = round2(fixedPayment - interest);
            // último pagamento pode ser menor que a parcela fixa
            if (principal <= 0) {
                // caso raro: juros >= parcela fixa, evita loop infinito
                principal = Math.min(balance, round2(balance)); // quita com o que restar
            }
            if (principal > balance) principal = balance;
        } else {
            // SAC: amortização constante = P / n (usa o principal original como referência)
            const principalConst = round2(financed / n);
            principal = round2(Math.min(principalConst, balance));
        }
        const payment = round2(interest + principal);
        balance = round2(Math.max(0, balance - principal));
        newSchedule.push({ month: monthCounter, payment, principal, interest, balance });
        monthCounter++;
    }
};

const amortByInstallmentReduction = (newSchedule: Schedule[], method: MethodType, remainingPeriods: number, balance: number, r: number, mi: number,) => {
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