import { applyExtraAmortization, generatePriceSchedule, generateSacSchedule, toMonthlyRate } from "..";

describe("applyExtraAmortization", ()=> {

   
    test("reduzir_prazo (Price) deve diminuir número de parcelas mantendo pagamento fixo", () => {
        const P = 10000;
        const n = 24;
        const r = toMonthlyRate(12);
        const base = generatePriceSchedule(P, r, n);
        const amortizado = applyExtraAmortization(2000, "reduzir_prazo", 6, base, "price", r, P, n);

        expect(amortizado.length).toBeLessThanOrEqual(n);
        const payments = amortizado.map(s => s.payment);
        const firstPayment = payments[0];
        // mantém valor fixo (com pequenas variações por arredondamento)
        expect(payments[1]).toBeCloseTo(firstPayment, 2);
        // saldo final 0
        expect(amortizado[amortizado.length - 1].balance).toBeCloseTo(0, 2);
    });

    test("reduzir_parcela (Price) deve manter prazo e reduzir valor das parcelas", () => {
        const P = 10000;
        const n = 24;
        const r = toMonthlyRate(12);
        const base = generatePriceSchedule(P, r, n);
        const amortizado = applyExtraAmortization(2000, "reduzir_parcela", 6, base, "price", r, P, n);

        // mantém mesmo número de parcelas
        expect(amortizado.length).toBe(n);
        // parcela deve ser menor que original
        expect(amortizado[7].payment).toBeLessThan(base[6].payment);
    });

    test("reduzir_prazo (SAC) deve quitar antes mantendo amortização constante", () => {
        const P = 12000;
        const n = 12;
        const r = toMonthlyRate(12);
        const base = generateSacSchedule(P, r, n);
        const amortizado = applyExtraAmortization(3000, "reduzir_prazo", 4, base, "sac", r, P, n);

        expect(amortizado.length).toBeLessThanOrEqual(n);
        // amortização constante nas primeiras parcelas
        const principals = amortizado.slice(0, 3).map(s => s.principal);
        expect(principals[1]).toBeCloseTo(principals[0], 2);
        expect(amortizado[amortizado.length - 1].balance).toBeCloseTo(0, 2);
    });

    test("amortização maior que saldo deve quitar o saldo e parar", () => {
        const P = 1000;
        const n = 6;
        const r = toMonthlyRate(12);
        const base = generatePriceSchedule(P, r, n);
        const amortizado = applyExtraAmortization(999999, "reduzir_prazo", 3, base, "price", r, P, n);

        // saldo final 0 e não cria parcelas extras
        expect(amortizado[amortizado.length - 1].balance).toBeCloseTo(0, 2);
    });

    test("mês inválido não altera o schedule", () => {
        const P = 5000;
        const n = 10;
        const r = toMonthlyRate(12);
        const base = generatePriceSchedule(P, r, n);
        const amortizado = applyExtraAmortization(500, "reduzir_prazo", 99, base, "price", r, P, n);

        expect(amortizado).toEqual(base);
    });
})