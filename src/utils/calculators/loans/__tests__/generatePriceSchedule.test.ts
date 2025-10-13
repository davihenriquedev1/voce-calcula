
import { round2 } from "@/helpers/math";
import { generatePriceSchedule, toMonthlyRate } from "..";

describe("generatePriceSchedule", () => {
    test("deve gerar n parcelas com soma dos principais = P, último saldo = 0 e pagamento constante", ()=> {
        const P = 10000;
        const annualRate = 12;
        const n = 12;

        const r = toMonthlyRate(annualRate);
        const schedule = generatePriceSchedule(P, r, n);

        // ✅ Deve gerar n parcelas
        expect(schedule.length).toBe(n);

        // ✅ Somatório dos principais pagos = valor financiado
        const totalPrincipal = schedule.reduce((sum, s) => sum + s.principal, 0);
        expect(round2(totalPrincipal)).toBeCloseTo(P, 2);

        // ✅ Último saldo = 0
        expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 2);

        // ✅ Pagamento constante (exceto possivelmente última parcela por arredondamento)
        const payments = schedule.map(s => s.payment);
        const firstPayment = payments[0];
        payments.forEach((p, idx) => {
            if (idx < payments.length - 1) {
                expect(p).toBeCloseTo(firstPayment, 2);
            }
        });
    });
});