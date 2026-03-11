import { calculateInvestments } from "../utils/calculate-investments";
import { InvestmentsParams } from "../types";

test("calculateInvestments - pré (interestRate pré-fixado) => displayAnnualInterest = interestRate e evolução = meses", () => {
    const params = {
        type: "cdb",
        initialContribution: 1000,
        frequentContribution: 0,
        term: 12,
        termType: "months",
        interestRate: 12,
        rateType: "pre",
        contributionAtStart: false,
        adminFeePercent: 0,
    } as InvestmentsParams;

    const res = calculateInvestments(params);

    expect(res.displayAnnualInterest).toBeCloseTo(12, 6);

    expect(res.evolution.length).toBe(12);

    expect(res.finalValue).toBeGreaterThan(params.initialContribution!);
});