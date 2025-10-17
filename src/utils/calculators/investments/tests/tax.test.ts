// calculateInvestment.tax.test.ts

import { calculateInvestment } from "..";

describe('calculateInvestment — taxOnStockGains (IR sobre ganho de capital)', () => {
    test('K) Aplica imposto sobre ganho de capital (20%) quando taxOnStockGains = true', () => {
        const res = calculateInvestment({
            type: 'stock',
            initialValue: 1000,
            monthlyContribution: 100,
            term: 6,
            termType: 'meses',
            appreciationRate: 0.02, // 2%/mês para garantir ganho de capital
            dividendYield: 0,       // sem dividendos pra isolar ganho de capital
            simulateDaily: false,
            taxOnStockGains: true,
            stockTaxRate: 0.2,
            roundResults: false
        });

        const capitalGain = res.grossYield - res.totalDividends;
        const expectedTax = capitalGain > 0 ? capitalGain * 0.2 : 0;

        expect(res.totalDividends).toBe(0); // sanity: nenhum dividendo aqui
        expect(capitalGain).toBeGreaterThan(0);
        expect(res.incomeTax).toBeCloseTo(expectedTax, 2);
    });

    test('L) Não aplica imposto sobre ganho de capital quando taxOnStockGains = false', () => {
        const res = calculateInvestment({
            type: 'stock',
            initialValue: 1000,
            monthlyContribution: 100,
            term: 6,
            termType: 'meses',
            appreciationRate: 0.02,
            dividendYield: 0,
            simulateDaily: false,
            taxOnStockGains: false,
            roundResults: false
        });

        // Como taxOnStockGains = false, incomeTax referente a ganho de capital deve ser zero
        expect(res.incomeTax).toBe(0);
    });

    test('M) Se ganho de capital for negativo, imposto deve ser zero (não tributa perda)', () => {
        const res = calculateInvestment({
            type: 'stock',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 1,
            termType: 'meses',
            appreciationRate: 0,   // sem valorização
            dividendYield: 0,
            adminFee: 0.5,         // taxa alta para forçar perda
            simulateDaily: false,
            taxOnStockGains: true,
            stockTaxRate: 0.2,
            roundResults: false
        });

        const capitalGain = res.grossYield - res.totalDividends;
        expect(capitalGain).toBeLessThanOrEqual(0);
        expect(res.incomeTax).toBe(0);
    });
});
