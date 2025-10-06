import { loansSchema } from "@/schemas/loans";
import { z } from "zod";

// z.input descreve o que o schema aceita na entrada (string)
export type LoansFormValues = z.input<typeof loansSchema>;

export type LoansSummary = { 
    type: string; 
    method:  MethodType; 
    amount: number; 
    downPayment: number; 
    extraAmortization: number,
    extraAmortizationType?: ExtraAmortizationType,
    extraAmortizationMonth?: string
    avgInstallments: number; 
    firstInstallment: number;
    annualRate: number; 
    monthlyRate: number; 
    fixedIofPct: number,
    dailyIofPct: number,
    fixedIof: number,
    dailyIof: number,
    totalIof: number,
    iofWasCapped: boolean;
    totalPaidNoIof: number; 
    totalPaidWithIof: number;
    totalInterest: number;
    totalInterestWithIof: number
};

export type ExtraAmortizationType = "reduzir_prazo" | "reduzir_parcela"
export type MethodType = "price" | "sac";