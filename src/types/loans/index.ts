import { loansSchema } from "@/schemas/loans";
import { z } from "zod";

// z.input descreve o que o schema aceita na entrada (string)
export type LoansFormValues = z.input<typeof loansSchema>;

export type LoansSummary = { 
    type: string; 
    method: string; 
    amount: number; 
    downPayment: number; 
    extraAmortization: number,
    extraAmortizationType?: string,
    extraAmortizationMonth?: string
    monthly: number; 
    annualRate: number; 
    monthlyRate: number; 
    fixedIofPct: number,
    dailyIofPct: number,
    fixedIof: number,
    dailyIof: number,
    totalIof: number,
    totalPaidNoIof: number; 
    totalPaidWithIof: number;
    totalInterest: number;
};