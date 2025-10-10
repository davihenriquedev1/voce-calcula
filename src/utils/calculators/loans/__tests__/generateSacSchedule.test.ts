import { round2 } from "@/utils/helpers/math";
import { generateSacSchedule, toMonthlyRate } from "..";

describe("generateSacSchedule", ()=> {
    test("deve gerar n parcelas com amortização constante e pagamentos decrescentes", ()=> {
        const P = 12000;
        const annualRate = 12;
        const n = 12;

        const r = toMonthlyRate(annualRate);
        const schedule = generateSacSchedule(P, r, n);

        // ✅ Deve gerar n parcelas
        expect(schedule.length).toBe(n);

        // ✅ Amortização constante
        const principalValues = schedule.map(s => round2(s.principal));
        const firstPrincipal = principalValues[0];
        principalValues.forEach(p => {
            expect(p).toBeCloseTo(firstPrincipal, 2);
        });

        // ✅ Saldo final = 0
        const lastBalance = schedule[schedule.length - 1].balance;
        expect(round2(lastBalance)).toBeCloseTo(0, 2);

        // ✅ Pagamentos decrescentes
        const payments = schedule.map(s => round2(s.payment));
        for(let i = 1; i < payments.length; i++) {
            expect(payments[i]).toBeLessThanOrEqual(payments[i - 1]);
        }
        
        // ✅ Somatório das amortizações = valor financiado
        const totalPrincipal = schedule.reduce((sum, s) => sum + s.principal, 0);
        expect (round2(totalPrincipal)).toBeCloseTo(P, 2);
    });
});