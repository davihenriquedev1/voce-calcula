// calculateInvestment.extra.test.ts
import { calculateInvestment } from "..";

describe('calculateInvestment — testes adicionais (Tesouro, LCI/LCA, CDB pós-CDI)', () => {
    test('F) Tesouro Selic 12 meses ≈ (1 + selic/12)^12', () => {
        const res = calculateInvestment({
            type: 'tesouro_selic',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            currentSelic: 13.75, // 13.75% a.a.
            simulateDaily: false,
            roundResults: false
        });

        const expected = 1000 * Math.pow(1 + 0.1375 / 12, 12);
        expect(res.finalValue).toBeCloseTo(expected, 2);
        expect(res.evolution.length).toBe(12);
    });

    test('G) Tesouro IPCA+ 12 meses (real + ipca) — usa interestRate + currentIPCA', () => {
        const res = calculateInvestment({
            type: 'tesouro_ipca+',
            initialValue: 2000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 3,     // 3% real a.a.
            currentIPCA: 4,      // 4% IPCA a.a.
            simulateDaily: false,
            roundResults: false
        });

        // taxa nominal anual = 3 + 4 = 7% => mensal = 7%/12
        const grossExpected = 2000 * Math.pow(1 + 0.07 / 12, 12);
        const expected = grossExpected - (grossExpected - 2000) * 0.20; // IR 20% para 12 meses
        expect(res.finalValue).toBeCloseTo(expected, 2);
    });

    test('H) LCI/LCA 12 meses — rendimento ≈ pré e incomeTax === 0 (isenção)', () => {
        const res = calculateInvestment({
            type: 'lci',
            initialValue: 1500,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 8, // 8% a.a. pré
            rateType: 'pre',
            simulateDaily: false,
            roundResults: false
        });

        const expected = 1500 * Math.pow(1 + 0.08 / 12, 12);
        expect(res.finalValue).toBeCloseTo(expected, 2);
        expect(res.incomeTax).toBe(0); // isento
    });

    test('I) CDB pós-fixado atrelado ao CDI: usar currentCdi se fornecido', () => {
        const res = calculateInvestment({
            type: 'cdb',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 100, // 100% do índice (CDI)
            rateType: 'pos',
            currentCdi: 10,    // 10% a.a. CDI
            simulateDaily: false,
            roundResults: false
        });

        // monthlyInc = (100/100) * (10/100) / 12 = 0.1 / 12
        const grossExpected = 1000 * Math.pow(1 + 0.10 / 12, 12);
        const expected = grossExpected - (grossExpected - 1000) * 0.20; // IR 20% para 12 meses
        expect(res.finalValue).toBeCloseTo(expected, 2);
    });

    test('J) CDB pós-fixado: se currentCdi não fornecido, usar currentSelic como fallback', () => {
        const res = calculateInvestment({
            type: 'cdb',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 100, // 100% do índice
            rateType: 'pos',
            currentSelic: 9,   // 9% a.a. SELIC usado como fallback
            simulateDaily: false,
            roundResults: false
        });

        // valor bruto esperado (antes de IR)
        const grossExpected = 1000 * Math.pow(1 + 0.09 / 12, 12); // ≈ 1093.8069
        const grossGain = grossExpected - 1000;
        const expectedTax = grossGain * 0.20; // IR regressivo 20% para 12 meses
        const expectedNet = grossExpected - expectedTax; // ≈ 1075.0455

        // checar que a função devolve o líquido (finalValue) e também expor grossYield e incomeTax
        expect(res.finalValue).toBeCloseTo(expectedNet, 2);
        expect(res.grossYield).toBeCloseTo(grossGain, 2);
        expect(res.incomeTax).toBeCloseTo(expectedTax, 2);
    });
});
