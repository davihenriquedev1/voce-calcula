import { investmentsSchema } from "@/schemas/investments";
import { z } from "zod";

// z.input descreve o que o schema aceita na entrada (strings mascaradas do form)
export type InvestmentsFormValues = z.input<typeof investmentsSchema>;

// Tipo de saída calculada, para tabela ou gráfico
export type InvestmentsSummary = {
    type: string;
    initialValue: number;
    monthlyContribution: number;
    termMonths: number;

    // Dados específicos
    interestRate?: number;
    rateType?: "pre" | "pos";
    currentSelic?: number;
    currentIPCA?: number;
    dividendYield?: number;
    unitPrice?: number;

    // Taxas e impostos
    incomeTax?: number;
    iof?: number;
    adminFee?: number;

    // Outputs
    grossYield: number;         // rendimento bruto
    netYield: number;           // rendimento líquido
    finalValue: number;         // total investido + rendimento
    annualReturnPct: number;    // rentabilidade anual
    monthlyEvolution: number[]; // array de valores mês a mês para gráfico
};
