type InvestmentParams = {
    type: 'cdb' | 'lci' | 'lca' | 'tesouro_selic' | 'tesouro_prefixado' | 'tesouro_ipca+' | 'fii' | 'stock';
    initialValue: number;
    monthlyContribution?: number;
    termMonths: number;
    interestRate?: number;     // anual ou CDI
    rateType?: 'pre' | 'pos';
    currentSelic?: number;
    currentIPCA?: number;
    dividendYield?: number;
    unitPrice?: number;
    adminFee?: number;
};

export const calculateInvestment = ({
    type,
    initialValue,
    monthlyContribution = 0,
    termMonths,
    adminFee = 0,
    currentIPCA,
    currentSelic,
    dividendYield,
    interestRate,
    rateType,
    unitPrice
}: InvestmentParams) => {

    // ===== Inicializar variáveis =====
    let grossYield = 0; // (rendimento bruto)
    let incomeTax = 0; 
    let iof = 0;
    let netYield = 0; // (rendimento líquido)
    const monthlyEvolution: number[] = []; // array com evolução mês a mês, pra gráfico

    // ===== Loop mês a mês =====
    // Aqui vamos calcular evolução mês a mês aplicando juros compostos
    // e aportes mensais, armazenando em monthlyEvolution

    // ===== Cálculo de grossYield =====
    // Renda fixa pré-fixada (CDB, LCI, LCA, Tesouro Prefixado)
    // FV = initialValue * (1 + rate/100)^(termMonths/12) + aportes mensais compostos

    // Tesouro Selic
    // Rendimento = SELIC anualizada

    // Tesouro IPCA+
    // Rendimento = IPCA + taxa prefixada anual

    // FIIs e ações
    // grossYield = initialValue * (1 + dividendYield/100)^(termMonths/12)
    // opcional: somar valorização do unitPrice

    // ===== Cálculo de impostos =====
    // IR regressivo para renda fixa e Tesouro
    // IOF para resgates < 30 dias em renda fixa

    // ===== Cálculo do rendimento líquido =====
    // netYield = grossYield - IR - IOF - adminFee

    // ===== Cálculo final e rentabilidade anual =====
    // finalValue = total investido + netYield (rendimento líquido)
    // annualReturnPct = ((finalValue / totalInvested)^(12/termMonths) - 1) * 100

    // ===== Retorno =====
    return {
        grossYield,
        incomeTax,
        iof,
        netYield,
        finalValue: initialValue + monthlyContribution * termMonths + grossYield, // placeholder
        annualReturnPct: 0, // placeholder
        monthlyEvolution
    };
};
