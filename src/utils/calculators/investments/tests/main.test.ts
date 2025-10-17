// calculateInvestment.test.ts

import { calculateInvestment } from "..";

// Ajuste o path abaixo se seu módulo estiver em outra pasta
describe('calculateInvestment — testes essenciais', () => {
    test('A) CDB pré (12 meses) — finalValue ≈ 1000 * (1+0.12/12)^12', () => {
        const res = calculateInvestment({
            type: 'cdb',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 12, // 12% a.a.
            rateType: 'pre',
            simulateDaily: false,
            roundResults: false
        });

        // valor esperado aproximado
        const grossExpected = 1000 * Math.pow(1 + 0.12 / 12, 12);
        const expected = grossExpected - (grossExpected - 1000) * 0.20; // IR 20% para 12 meses
        expect(res.finalValue).toBeCloseTo(expected, 2);
        expect(res.grossYield).toBeCloseTo(grossExpected - 1000, 2);
        // evolução deve ter 12 entradas (mensal)
        expect(res.evolution.length).toBe(12);
    });

    test('B) FII 6 meses — appreciation + dividendos (totalDividends > 0, finalValue > totalInvested)', () => {
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
            unitPrice: 100,              // ✅ preço inicial da cota
            simulateDaily: false,
            roundResults: false
        });
        expect(res.totalDividends).toBeGreaterThan(0);
        expect(res.finalValue).toBeGreaterThan(totalInvested);
        expect(res.evolution.length).toBe(months);
    });

    test('C) Simulação diária vs mensal (paridade para curto prazo — diferença < 0.2%)', () => {
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

        const resMonthly = calculateInvestment({ ...params, simulateDaily: false });
        const resDaily = calculateInvestment({ ...params, simulateDaily: true });

        // diferença relativa
        const relDiff = Math.abs(resDaily.finalValue - resMonthly.finalValue) / (resMonthly.finalValue || 1);
        expect(relDiff).toBeLessThan(0.002); // < 0.2%
    });

    test('D) IOF < 30 dias — CDB 15 dias deve gerar IOF > 0', () => {
        // Usamos term = 0.5 meses => ~15 dias
        const res = calculateInvestment({
            type: 'cdb',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 0.5,
            termType: 'meses',
            interestRate: 12,
            rateType: 'pre',
            simulateDaily: true,
            roundResults: false
        });

        expect(res.iof).toBeGreaterThanOrEqual(0);
        // Se houver ganho positivo, esperamos iof > 0 (sanity)
        if (res.grossYield > 0) {
            expect(res.iof).toBeGreaterThan(0);
        }
        // evolução deve ter ~15 entradas (aprox. days)
        expect(res.evolution.length).toBeGreaterThanOrEqual(14);
        expect(res.evolution.length).toBeLessThanOrEqual(16);
    });

    test('E) Edge cases — term = 0, initialValue = 0, apenas aportes ou adminFee alto: função não deve lançar e retorna números finitos', () => {
        const safeCall = () =>
            calculateInvestment({
                type: 'cdb',
                initialValue: 0,
                monthlyContribution: 100,
                term: 0,
                termType: 'meses',
                interestRate: 5,
                rateType: 'pre',
                simulateDaily: false,
                adminFee: 0.5, // 50% mensal (alto)
                roundResults: false
            });

        // não deve lançar
        expect(safeCall).not.toThrow();

        const res = safeCall();

        // todos os campos principais são números finitos
        expect(Number.isFinite(res.finalValue)).toBe(true);
        expect(Number.isFinite(res.grossYield)).toBe(true);
        expect(Number.isFinite(res.incomeTax)).toBe(true);
        expect(Number.isFinite(res.iof)).toBe(true);
        expect(Array.isArray(res.evolution)).toBe(true);
    });
});
