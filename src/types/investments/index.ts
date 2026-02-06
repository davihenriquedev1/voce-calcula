import { z } from "zod";
import { investmentsSchema } from "@/schemas/investments";
import { INVESTMENTS_RATE_TYPES, INVESTMENTS_TYPES } from "@/constants/investments";

// z.input descreve o que o schema aceita na entrada (strings mascaradas do form)
export type InvestmentsFormValues = z.input<typeof investmentsSchema>;

// Tipagem de saída depois do parse (numbers)
export type InvestmentsParsedValues = z.infer<typeof investmentsSchema>;

export type InvestmentsParams = InvestmentsParsedValues & {
    type: InvestmentsType;
    rateType: InvestmentsRateType;
    preConversionSpread?: number | { curto?: number; medio?: number; longo?: number };
    issuerCreditSpread?: number;
};

export type IncomeTaxBracket = {
    maxDays: number;
    rate: number;
};

export type InvestmentsResult = {
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

export type InvestmentsType = (typeof INVESTMENTS_TYPES)[number];
export type InvestmentsRateType = (typeof INVESTMENTS_RATE_TYPES)[number];
