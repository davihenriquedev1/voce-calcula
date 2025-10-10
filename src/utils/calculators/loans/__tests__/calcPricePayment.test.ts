import { calcPricePayment, toMonthlyRate } from "..";

describe("calcPricePayment", ()=> {
    test("deve calcular o valor correto da parcela Price", ()=> {
        const amount = 10000; // valor financiado
        const annualRate = 12;// juros anuais (%)
        const termMonths = 12;

        const monthlyRate = toMonthlyRate(annualRate);
        const result = calcPricePayment(amount, monthlyRate, termMonths);

        // Fórmula esperada: PMT = P * i / (1 - (1 + i)^-n)
        const i = 0.12 / 12;
        const expected = amount * (i / (1 - Math.pow(1 + i, -termMonths)));

        expect(result).toBeCloseTo(expected, 2);
    });

    test("deve retornar 0 se taxa anual for 0", ()=> {
        const result = calcPricePayment(10000, 0, 12);
        expect(result).toBeCloseTo(10000 / 12, 2);
    });

    test("deve lidar com prazos longos sem erro numérico", ()=> {
        const result = calcPricePayment(50000, 8, 360); // 30 anos
        expect(result).toBeGreaterThan(0);
    });
});