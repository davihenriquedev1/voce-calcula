import { z } from "zod";
import { fixedIncomeSchema } from "@/schemas/investments/fixed-income";
import { FIXED_INCOME_RATE_TYPES, FIXED_INCOME_TYPES } from "@/constants/investments/fixed-income";

// z.input descreve o que o schema aceita na entrada (strings mascaradas do form)
export type FixedIncomeFormValues = z.input<typeof fixedIncomeSchema>;

// Tipagem de saída depois do parse (numbers)
export type FixedIncomeParsedValues = z.infer<typeof fixedIncomeSchema>;

export type FixedIncomeParams = FixedIncomeParsedValues & {
    type: FixedIncomeType;
    rateType: FixedIncomeRateType;
    preConversionSpread?: number | { curto?: number; medio?: number; longo?: number };
    issuerCreditSpread?: number;
};

export type IncomeTaxBracket = {
    maxDays: number;
    rate: number;
};

export type FixedIncomeResult = {
    grossYield: number;
    incomeTax: number;
    iof: number;
    netYield: number;
    finalValue: number;
    annualReturnPct: number;
    evolution: number[]; // evolução mês a mês ou dia a dia (conforme simulateDaily)
    totalTransactionFees?: number;
    totalInvested: number;

    contributionAtStart?: boolean;
    rateType?: FixedIncomeRateType;
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
    type: FixedIncomeType;
    result: FixedIncomeResult;
    isSelected?: boolean;
};

export type FixedIncomeSummary = {
    type: FixedIncomeType;
    initialContribution: number;
    frequentContribution: number;
    termMonths: number;
    interestRate?: number;
    rateType?: FixedIncomeRateType;
    currentSelic?: number;
    currentIpca?: number;
    currentCdi?: number;
    currentFundDi?: number;

    // Taxas e impostos
    incomeTax?: number;
    iof?: number;
    adminFeePercent?: number;

    // Outputs
    grossYield: number;         // rendimento bruto
    netYield: number;           // rendimento líquido
    finalValue: number;         // total investido + rendimento
    annualReturnPct: number;    // rentabilidade anual
    monthlyEvolution: number[]; // array de valores mês a mês para gráfico
};

export type FixedIncomeType = (typeof FIXED_INCOME_TYPES)[number];
export type FixedIncomeRateType = (typeof FIXED_INCOME_RATE_TYPES)[number];
