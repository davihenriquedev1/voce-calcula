import { z } from "zod";
import { investmentsSchema } from "./schema";
import { INVESTMENTS_RATE_TYPES, INVESTMENTS_TYPES } from "./constants/types";

export type InvestmentsFormValues = z.input<typeof investmentsSchema>;

export type InvestmentsParsedValues = z.infer<typeof investmentsSchema>;

export type InvestmentsParams = InvestmentsParsedValues & {
    type: InvestmentsType;
    rateType: InvestmentsRateType;
    baseIndexAnnual: number;
    baseIndexName: string;
    preConversionSpread?: number | { curto?: number; medio?: number; longo?: number };
    issuerCreditSpread?: number;
};

export type InvestmentsResult = {
    grossYield: number;
    incomeTax: number;
    iof: number;
    netYield: number;
    finalValue: number;
    annualReturnPct: number;
    evolution: number[];
    totalTransactionFees?: number;
    totalInvested: number;

    contributionAtStart?: boolean;
    rateType?: InvestmentsRateType;
    interestRate?: number | undefined;
    usedIndexName?: string | undefined;
    usedIndexAnnual?: number | undefined;
    adminFeePercent?: number;
    iofRateApplied?: number; // decimal (ex: 0.96)
    displayAnnualInterest?: number;
};

export type ComparisonItem = {
    id: string;
    label: string;
    type: InvestmentsType;
    result: InvestmentsResult;
    isSelected?: boolean;
};

export type InvestmentsSummary = {
    type: InvestmentsType;
    initialContribution: number;
    frequentContribution: number;
    termMonths: number;
    interestRate?: number;
    rateType?: InvestmentsRateType;
    currentSelic?: number;
    currentIpca?: number;
    currentCdi?: number;
    currentFundDi?: number;
    
    incomeTax?: number;
    iof?: number;
    adminFeePercent?: number;

    grossYield: number;
    netYield: number;
    finalValue: number;
    annualReturnPct: number;
    monthlyEvolution: number[];
};

export type InvestmentsType = (typeof INVESTMENTS_TYPES)[number];
export type InvestmentsRateType = (typeof INVESTMENTS_RATE_TYPES)[number];
