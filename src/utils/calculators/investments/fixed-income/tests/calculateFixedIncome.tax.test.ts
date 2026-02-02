import { FixedIncomeParams } from "@/types/investments/fixed-income";
import { calculateFixedIncome } from "../calculateFixedIncome";

const annualToMonthly = (annualPct: number) =>
	Math.pow(1 + annualPct / 100, 1 / 12) - 1;

const baseFixedIncomeParams: FixedIncomeParams = {
	type: "cdb",

	// Aportes
	initialContribution: 0,
	frequentContribution: 0,
	contributionFrequency: "monthly",
	contributionAtStart: true,

	// Prazo
	term: 12,
	termType: "months",

	// Juros
	rateType: "pre",
	interestRate: 10,
	compoundingFrequency: "monthly",

	// Índices (opcionais)
	currentSelic: undefined,
	currentCdi: undefined,
	currentIpca: undefined,
	currentFundDi: undefined,

	// Taxas
	includeIOF: true,
	adminFeePercent: 0,

	// IR
	incomeTaxTable: [
		{ maxDays: 180, rate: 0.225 },
		{ maxDays: 360, rate: 0.20 },
		{ maxDays: 720, rate: 0.175 },
		{ maxDays: Infinity, rate: 0.15 },
	],
};

describe("calculateFixedIncome — impostos e isenções", () => {

	test("IOF < 30 dias — CDB 15 dias gera IOF conforme tabela (~50%)", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "cdb",
			initialContribution: 1000,
			frequentContribution: 0,
			term: 0.5,
			termType: "months",
			interestRate: 12,
			rateType: "pre"
		});

		expect(res.iofRateApplied).toBeCloseTo(0.5, 6);
		if (res.grossYield > 0) {
			expect(res.iof).toBeCloseTo(res.grossYield * 0.5, 2);
		}
		expect(res.evolution.length).toBe(1);
	});

	test("LCI 12 meses — isento de IR e IOF", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "lci",
			initialContribution: 1500,
			frequentContribution: 0,
			term: 12,
			termType: "months",
			interestRate: 8,
			rateType: "pre"
		});

		const monthly = annualToMonthly(8);
		const expected = 1500 * Math.pow(1 + monthly, 12);

		expect(res.finalValue).toBeCloseTo(expected, 2);
		expect(res.incomeTax).toBe(0);
		expect(res.iof).toBe(0);
	});

	test("CRI / CRA são isentos de IR", () => {
		for (const type of ["cri", "cra"] as const) {
			const res = calculateFixedIncome({
				...baseFixedIncomeParams,
				type,
				initialContribution: 1000,
				frequentContribution: 0,
				term: 12,
				termType: "months",
				interestRate: 8,
				rateType: "pre"
			});
			expect(res.incomeTax).toBe(0);
		}
	});

	test("Debêntures (não incentivadas) pagam IR regressivo", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "debentures",
			initialContribution: 1000,
			frequentContribution: 0,
			term: 12,
			termType: "months",
			interestRate: 10,
			rateType: "pre"
		});

		const days = Math.round(365);
		const irRate = days <= 360 ? 0.2 : 0.175;

		expect(res.incomeTax).toBeCloseTo(res.grossYield * irRate, 2);
	});

	test("Debêntures incentivadas são isentas de IR", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "debentures_incentivadas",
			initialContribution: 1000,
			frequentContribution: 0,
			term: 24,
			termType: "months",
			interestRate: 8,
			rateType: "pre"
		});

		expect(res.incomeTax).toBe(0);
	});

});
