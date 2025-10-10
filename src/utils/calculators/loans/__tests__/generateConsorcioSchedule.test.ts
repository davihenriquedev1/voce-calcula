import { generateConsorcioSchedule } from "..";

describe("generateConsorcioSchedule", ()=> {
    test("deve gerar parcelas fixas e saldo final 0, com e sem tax administrativa", ()=> {
        const P = 12000;
        const n = 12;

        // Sem taxa administrativa
        const scheduleSemTaxa = generateConsorcioSchedule(P, n, 0);
        const totalSemTaxa = scheduleSemTaxa.reduce((s, p) => s + p.payment, 0);

        expect(scheduleSemTaxa.length).toBe(n);
        expect(totalSemTaxa).toBeCloseTo(P, 2);
        expect(scheduleSemTaxa[n-1].balance).toBeCloseTo(0, 2);

        // Com taxa administrativa de 10%
        const adminPercent = 10;
        const scheduleComTaxa = generateConsorcioSchedule(P, n, adminPercent);

        const totalComTaxa = scheduleComTaxa.reduce((s, p) => s + p.payment, 0);

        const esperado = P + (P * adminPercent) / 100;
        expect(totalComTaxa).toBeCloseTo(esperado, 2);
        expect(scheduleComTaxa[n - 1].balance).toBeCloseTo(0, 2);
    });
});