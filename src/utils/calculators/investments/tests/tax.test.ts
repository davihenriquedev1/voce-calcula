import { calculateInvestment } from "..";

const annualToMonthly = (annualPct: number) => Math.pow(1 + annualPct / 100, 1 / 12) - 1;

describe('calculateInvestment — taxOnStockGains (IR sobre ganho de capital) e impostos', () => {
    test('Aplica imposto sobre ganho de capital', () => {
        const res = calculateInvestment({
            type: 'stock',
            initialValue: 1000,
            monthlyContribution: 100,
            term: 6,
            termType: 'meses',
            appreciationRate: 0.02, // 2%/mês
            dividendYield: 0,
            simulateDaily: false,
            taxOnStockGains: 0.2,
            roundResults: false
        });

        const capitalGain = res.grossYield - res.totalDividends;
        const expectedTax = capitalGain > 0 ? capitalGain * 0.2 : 0;

        expect(res.totalDividends).toBe(0);
        expect(capitalGain).toBeGreaterThan(0);
        expect(res.incomeTax).toBeCloseTo(expectedTax, 2);
    });

    test('Não aplica imposto sobre ganho de capital quando taxOnStockGains = 0', () => {
        const res = calculateInvestment({
            type: 'stock',
            initialValue: 1000,
            monthlyContribution: 100,
            term: 6,
            termType: 'meses',
            appreciationRate: 0.02,
            dividendYield: 0,
            simulateDaily: false,
            taxOnStockGains: 0,
            roundResults: false
        });

        expect(res.incomeTax).toBe(0);
    });

    test('Se ganho de capital for negativo, imposto deve ser zero (não tributa perda)', () => {
        const res = calculateInvestment({
            type: 'stock',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 1,
            termType: 'meses',
            appreciationRate: 0,
            dividendYield: 0,
            adminFee: 0.5,
            simulateDaily: false,
            taxOnStockGains: 0.2,
            roundResults: false
        });

        const capitalGain = res.grossYield - res.totalDividends;
        expect(capitalGain).toBeLessThanOrEqual(0);
        expect(res.incomeTax).toBe(0);
    });

    test('IOF < 30 dias — CDB 15 dias deve gerar IOF > 0', () => {
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
        if (res.grossYield > 0) {
            expect(res.iof).toBeGreaterThan(0);
        }
        expect(res.evolution.length).toBeGreaterThanOrEqual(14);
        expect(res.evolution.length).toBeLessThanOrEqual(16);
    });

    test('IOF aplicado para 15 dias deve corresponder à tabela (50%)', () => {
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

        expect(res.iofRateApplied).toBeCloseTo(0.5, 6);
        if (res.grossYield > 0) {
            expect(res.iof).toBeCloseTo(res.grossYield * 0.5, 6);
        }
    });

    test('LCI/LCA 12 meses — rendimento ≈ pré e incomeTax === 0 (isenção)', () => {
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

        const monthlyInc = annualToMonthly(8);
        const expected = 1500 * Math.pow(1 + monthlyInc, 12);
        expect(res.finalValue).toBeCloseTo(expected, 2);
        expect(res.incomeTax).toBe(0);
    });

    test('CRI/CRA são isentos → incomeTax === 0', () => {
        const resCri = calculateInvestment({
            type: 'cri',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 8,
            rateType: 'pre',
            simulateDaily: false,
            roundResults: false
        });
        expect(resCri.incomeTax).toBe(0);

        const resCra = calculateInvestment({
            type: 'cra',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 8,
            rateType: 'pre',
            simulateDaily: false,
            roundResults: false
        });
        expect(resCra.incomeTax).toBe(0);
    });

    test('Debêntures (não incentivadas) são tributadas — incomeTax > 0', () => {
        const res = calculateInvestment({
            type: 'debentures',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses',
            interestRate: 10,
            rateType: 'pre',
            simulateDaily: false,
            roundResults: false
        });
        expect(res.incomeTax).toBeGreaterThan(0);
        expect(res.incomeTax).toBeCloseTo((res.grossYield) * 0.20, 2);
    });

    test('Debêntures incentivadas são isentas (incomeTax === 0)', () => {
        const res = calculateInvestment({
            type: 'debentures_incentivadas',
            initialValue: 1000,
            monthlyContribution: 0,
            term: 24,
            termType: 'meses',
            interestRate: 8,
            rateType: 'pre',
            simulateDaily: false,
            roundResults: false
        });
        expect(res.incomeTax).toBe(0);
    });

    test('dividendTaxRate reduz totalDividends (dividendos líquidos)', () => {
        const base = {
            type: 'fii' as const,
            initialValue: 1000,
            monthlyContribution: 0,
            term: 12,
            termType: 'meses' as const,
            appreciationRate: 0,
            dividendYield: 12, // 12% a.a.
            unitPrice: 100,
            simulateDaily: false,
            roundResults: false
        };

        const noTax = calculateInvestment({ ...base, dividendTaxRate: 0 });
        const taxed = calculateInvestment({ ...base, dividendTaxRate: 0.15 }); // 15% sobre dividendos

        expect(taxed.totalDividends).toBeLessThan(noTax.totalDividends);
    });
});
