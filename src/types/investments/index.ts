import { investmentsSchema } from "@/schemas/investments";
import { z } from "zod";

// z.input descreve o que o schema aceita na entrada (strings mascaradas do form)
export type InvestmentsFormValues = z.input<typeof investmentsSchema>;

// Tipagem de saída depois do parse (numbers)
export type InvestmentsParsedValues = z.infer<typeof investmentsSchema>;

// Tipo de saída calculada, para tabela ou gráfico
export type InvestmentsSummary = {
    type: InvestmentType;
    initialValue: number;
    monthlyContribution: number;
    termMonths: number;

    // Dados específicos
    interestRate?: number;
    rateType?: RateFixedType;
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

export type InvestmentParams = {
    type: InvestmentType; 
    initialValue: number;
    monthlyContribution?: number;
    term: number; // quantidade conforme termType
    termType: 'meses' | 'anos';
    simulateDaily?: boolean; // se true, simula dia a dia
    contributionAtStart?: boolean; // aporte no início do período
    interestRate?: number; // anual (%) ou percentual do CDI (ex: 100 = 100% do CDI)
    rateType?: RateFixedType;
    currentSelic?: number; // anual %
    currentCdi?: number;
    currentIPCA?: number; // anual %
    dividendYield?: number; // anual % (dividendos)
    unitPrice?: number;
    appreciationRate?: number; // mensal decimal (ex: 0.008 = 0.8%/mês)
    adminFee?: number; // mensal percentual em decimal (ex: 0.01 = 1%/mês)
    taxOnStockGains?: number; // aplicar IR sobre ganhos de ações
    dividendTaxRate?: number; // se quiser tributar dividendos (padrão 0)
    roundResults?: boolean; // arredondar para 2 casas
};
export type InvestmentResult = {
    roundResults: boolean;
    grossYield: number;
    incomeTax: number;
    iof: number;
    netYield: number;
    finalValue: number;
    annualReturnPct: number;
    evolution: number[]; // evolução mês a mês ou dia a dia (conforme simulateDaily)
    totalDividends: number;
    totalInvested: number;
    /* metadata para UI */
    contributionAtStart?: boolean;
    rateType?: RateFixedType;
    interestRate?: number|undefined;
    usedIndexName?: string|undefined;
    usedIndexAnnual?: number|undefined;
    simulateDaily?: boolean;
    adminFee?: number;
    taxOnStockGains?: number;
    iofRateApplied?: number; // decimal (ex: 0.96)
};

export type InvestmentType = 'cdb' | 'lci' | 'lca' | 'tesouro_selic' | 'cri' | 'cra' | 'debentures' | 'debentures_incentivadas' | 'tesouro_prefixado' | 'tesouro_ipca+' | 'fii' | 'stock'

export type RateFixedType = 'pre' | 'pos';