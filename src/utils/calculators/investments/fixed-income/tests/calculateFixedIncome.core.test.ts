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
		{ maxDays: 180, rate: 22.5 },
		{ maxDays: 360, rate: 20 },
		{ maxDays: 720, rate: 17.5 },
		{ maxDays: Infinity, rate: 15 },
	],
};

describe("calculateFixedIncome — núcleo", () => {

	test("Aporte no início rende mais que no fim", () => {
		const base = {
			...baseFixedIncomeParams,
			type: "cdb" as const,
			initialContribution: 0,
			frequentContribution: 100,
			term: 1,
			termType: "months" as const,
			interestRate: 12,
			rateType: "pre" as const
		};

		const end = calculateFixedIncome({ ...base, contributionAtStart: false });
		const start = calculateFixedIncome({ ...base, contributionAtStart: true });

		expect(start.finalValue).toBeGreaterThan(end.finalValue);
	});

	test("CDB pré 12 meses — IR aplicado corretamente", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "cdb",
			initialContribution: 1000,
			frequentContribution: 0,
			term: 12,
			termType: "months",
			interestRate: 12,
			rateType: "pre"
		});

		const monthly = annualToMonthly(12);
		const gross = 1000 * Math.pow(1 + monthly, 12);
		const irRate = 0.175;

		expect(res.incomeTax).toBeCloseTo((gross - 1000) * irRate, 2);
		expect(res.evolution.length).toBe(12);
	});

	test("CDB pós usa CDI quando disponível", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "cdb",
			initialContribution: 1000,
			frequentContribution: 0,
			term: 12,
			termType: "months",
			interestRate: 100,
			rateType: "pos",
			currentCdi: 10
		});

		expect(res.usedIndexName).toBe("CDI");
		expect(res.usedIndexAnnual).toBe(10);
	});

	test("CDB pós usa SELIC como fallback", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "cdb",
			initialContribution: 1000,
			frequentContribution: 0,
			term: 12,
			termType: "months",
			interestRate: 100,
			rateType: "pos",
			currentSelic: 9.5
		});

		expect(res.usedIndexName).toBe("SELIC");
	});

	test("Tesouro Selic 12 meses", () => {
		const res = calculateFixedIncome({	
			...baseFixedIncomeParams,
			type: "tesouro_selic",
			initialContribution: 1000,
			frequentContribution: 0,
			term: 12,
			termType: "months",
			currentSelic: 13.75
		});

		expect(res.usedIndexName).toBe("SELIC");
		expect(res.evolution.length).toBe(12);
	});

	test("Tesouro IPCA+ soma IPCA + taxa real", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "tesouro_ipca+",
			initialContribution: 2000,
			frequentContribution: 0,
			term: 12,
			termType: "months",
			interestRate: 3,
			currentIpca: 4
		});

		expect(res.usedIndexName).toBe("IPCA");
		expect(res.displayAnnualInterest).toBeCloseTo(7, 2);
	});

	test("Edge case — term = 0 não quebra", () => {
		const res = calculateFixedIncome({
			...baseFixedIncomeParams,
			type: "cdb",
			initialContribution: 0,
			frequentContribution: 100,
			term: 0,
			termType: "months",
			interestRate: 5,
			rateType: "pre",
			adminFeePercent: 0.5
		});

		expect(Number.isFinite(res.finalValue)).toBe(true);
		expect(res.evolution.length).toBe(1);
	});

});
