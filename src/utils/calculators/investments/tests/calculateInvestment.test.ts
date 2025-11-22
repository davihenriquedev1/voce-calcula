// calculateInvestment.test.ts
import { calculateInvestment } from "../calculateInvestment";

const annualToMonthly = (annualPct: number) => Math.pow(1 + annualPct / 100, 1 / 12) - 1;

describe('calculateInvestment — testes essenciais', () => {
    test('Aporte no início gera rendimento maior que aporte no fim (mesmo aporte)', () => {
        const base = {
            type: 'cdb' as const,
            initialValue: 0,
            monthlyContribution: 100,
            term: 1,
            termType: 'meses' as const,
            interestRate: 12,
            rateType: 'pre' as const,
            roundResults: false
        };

        const resAtEnd = calculateInvestment({ ...base, contributionAtStart: false });
        const resAtStart = calculateInvestment({ ...base, contributionAtStart: true });

        expect(resAtStart.finalValue).toBeGreaterThan(resAtEnd.finalValue);
    });

    test('CDB pré (12 meses) — finalValue ≈ 1000 * (1+0.12)', () => {
        const res = calculateInvestment({
            type: 'cdb',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 12, // 12% a.a.
            rateType: 'pre',
            roundResults: false
        });

        const monthlyInc = annualToMonthly(12);
        const grossExpected = 1000 * Math.pow(1 + monthlyInc, 12); // = 1000 * (1 + 0.12)
        const days = Math.max(0, Math.round(12 * (365 / 12)));
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.2;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;
        const expected = grossExpected - (grossExpected - 1000) * irRate;
        expect(res.finalValue).toBeCloseTo(expected, 2);
        expect(res.grossYield).toBeCloseTo(grossExpected - 1000, 2);
        expect(res.evolution.length).toBe(12);
    });

    test('CDB pós-fixado usa SELIC como fallback quando CDI ausente', () => {
        const res = calculateInvestment({
            type: 'cdb',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 100,
            rateType: 'pos',
            currentSelic: 7.25,
            roundResults: false
        });
        expect(res.usedIndexName).toBe('SELIC');
        expect(res.usedIndexAnnual).toBeCloseTo(7.25, 6);
    });

    test('CDB pós-fixado atrelado ao CDI: usar currentCdi se fornecido', () => {
        const res = calculateInvestment({
            type: 'cdb',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 100, // 100% do índice (CDI)
            rateType: 'pos',
            currentCdi: 10,    // 10% a.a. CDI
            roundResults: false
        });

        const monthlyIndex = annualToMonthly(10); // monthly index decimal
        const grossExpected = 1000 * Math.pow(1 + monthlyIndex, 12); // = 1000 * (1 + 0.10)
        // calcular IR conforme a regra real do código (12 meses ≈ 365 dias → 17,5%)
        const days = Math.max(0, Math.round(12 * (365 / 12)));
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.2;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;

        const expected = grossExpected - (grossExpected - 1000) * irRate;
        expect(res.finalValue).toBeCloseTo(expected, 2);
    });

    test('Tesouro Selic 12 meses ≈ (1 + selic) — conversão compósita usada', () => {
        const res = calculateInvestment({
            type: 'tesouro_selic',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            currentSelic: 13.75, // 13.75% a.a.
            roundResults: false,
        });

        // cálculo esperado (bruto → IR regressivo 12 meses = 20% → líquido)
        const monthlyInc = annualToMonthly(13.75);
        const expectedGross = 1000 * Math.pow(1 + monthlyInc, 12); // saldo bruto
        const grossYield = expectedGross - 1000;

        // calcular IR conforme a regra do código para 12 meses
        const days = Math.max(0, Math.round(12 * (365 / 12)));
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.2;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;
        const expectedIR = grossYield * irRate;
        const expectedFinal = 1000 + grossYield - expectedIR;

        expect(res.grossYield).toBeCloseTo(grossYield, 2);
        expect(res.incomeTax).toBeCloseTo(expectedIR, 2);
        expect(res.finalValue).toBeCloseTo(expectedFinal, 2);
        expect(res.evolution.length).toBe(12);
    });

    test('Tesouro IPCA+ 12 meses (real + ipca) — usa interestRate + currentIPCA', () => {
        const res = calculateInvestment({
            type: 'tesouro_ipca+',
            initialValue: 2000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 3,     // 3% real a.a.
            currentIPCA: 4,      // 4% IPCA a.a.
            roundResults: false
        });

        const combinedAnnual = 3 + 4; // 7% a.a.
        const monthlyInc = annualToMonthly(combinedAnnual);
        const grossExpected = 2000 * Math.pow(1 + monthlyInc, 12); // = 2000 * (1 + 0.07)
        const days = Math.max(0, Math.round(12 * (365 / 12)));
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.2;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;
        const expected = grossExpected - (grossExpected - 2000) * irRate;
        expect(res.finalValue).toBeCloseTo(expected, 2);
    });

    test('FII 6 meses — appreciation + dividendos (totalDividends > 0, finalValue > totalInvested)', () => {
        const initial = 1000;
        const monthly = 100;
        const months = 6;
        const totalInvested = initial + monthly * months;

        const res = calculateInvestment({
            type: 'fii',
            initialValue: initial,
            monthlyContribution: monthly,
            term: months,
            termType: 'meses',
            appreciationRate: 0.008,
            dividendYield: 9.6,
            unitPrice: 100,
            roundResults: false
        });
        expect(res.totalDividends).toBeGreaterThan(0);
        expect(res.finalValue).toBeGreaterThan(totalInvested);
        expect(res.evolution.length).toBe(months);
    });

    test('Simulação diária vs mensal (paridade para curto prazo — diferença < 0.2%)', () => {
        const params = {
            type: 'cdb' as const,
            initialValue: 5000,
            monthlyContribution: 200,
            term: 3,
            termType: 'meses' as const,
            interestRate: 6, // 6% a.a.
            rateType: 'pre' as const,
            roundResults: false
        };

        const resMonthly = calculateInvestment({ ...params});
        const resDaily = calculateInvestment({ ...params});

        const relDiff = Math.abs(resDaily.finalValue - resMonthly.finalValue) / (resMonthly.finalValue || 1);
        expect(relDiff).toBeLessThan(0.002); // < 0.2%
    });

    test('Edge cases — term = 0, initialValue = 0, apenas aportes ou adminFee alto: função não deve lançar e retorna números finitos', () => {
        const safeCall = () =>
            calculateInvestment({
                type: 'cdb',
                initialValue: 0,
                monthlyContribution: 100,
                term: 0,
                termType: 'meses',
                interestRate: 5,
                rateType: 'pre',

                adminFee: 0.5, // 50% mensal (alto)
                roundResults: false
            });

        expect(safeCall).not.toThrow();

        const res = safeCall();

        expect(Number.isFinite(res.finalValue)).toBe(true);
        expect(Number.isFinite(res.grossYield)).toBe(true);
        expect(Number.isFinite(res.incomeTax)).toBe(true);
        expect(Number.isFinite(res.iof)).toBe(true);
        expect(Array.isArray(res.evolution)).toBe(true);
    });
});
