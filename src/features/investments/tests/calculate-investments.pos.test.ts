
import { calculateInvestments } from "../utils/calculate-investments";
import { InvestmentsParams } from "../types";

test("calculateInvestments - pós (pos) usa índice (CDI) e displayAnnualInterest = index * pct/100", () => {
    const params = {
        type: "cdb",
        initialContribution: 1000,
        frequentContribution: 0,
        term: 12,
        termType: "months",
        interestRate: 100,
        rateType: "pos",
        currentCdi: 12,
        baseIndexAnnual: 12,
        contributionAtStart: false,
        adminFeePercent: 0,
    } as unknown as InvestmentsParams;

    const res = calculateInvestments(params);

    expect(res.usedIndexName).toBe("CDI");
    expect(res.usedIndexAnnual).toBeCloseTo(12, 6);

    expect(res.displayAnnualInterest).toBeCloseTo(12, 6);

    expect(res.evolution.length).toBe(12);
});