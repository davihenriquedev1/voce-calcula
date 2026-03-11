
import { orchestComparisons } from "../utils/orchest-comparisons";
import { InvestmentsParams } from "../types";

test("orchestComparisons gera cdb_pos usando cdiPercentCdb e displayAnnualInterest", () => {
    const baseParams = {
        initialContribution: 1000,
        frequentContribution: 0,
        term: 12,
        termType: "months",
        currentCdi: 13.65,
        cdiPercentCdb: 110,
        contributionAtStart: false,
        adminFeePercent: 0,
    } as unknown as Omit<InvestmentsParams, "type" | "rateType">;

    const results = orchestComparisons(baseParams);

    const cdbPos = results.find(r => r.id === "cdb_pos");
    expect(cdbPos).toBeDefined();

    const expected = 13.65 * 1.10;
    expect(cdbPos!.result.displayAnnualInterest).toBeCloseTo(expected, 6);

    expect(cdbPos!.type).toBe("cdb");
    expect(cdbPos!.result).toBeDefined();
});