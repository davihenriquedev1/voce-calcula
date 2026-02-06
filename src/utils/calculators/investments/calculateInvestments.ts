import { annualPctToMonthlyDecimal } from "@/helpers/finance/annualPctToMonthlyDecimal";
import { round2 } from "@/utils/math";
import { InvestmentsParams, InvestmentsResult, InvestmentsType } from "@/types/investments";

export const calculateInvestments = ({type, initialContribution, frequentContribution = 0, term, termType, interestRate, rateType, currentSelic, currentCdi, currentIpca, adminFeePercent = 0, contributionAtStart}: InvestmentsParams): InvestmentsResult => {

    const investTerm = typeof term === "number" ? term : 0;

    const months = investTerm === 0 ? 0 
        : termType === "months" 
            ? investTerm 
            : investTerm * 12;

    const days = Math.max(0, Math.round(months * (365 / 12)));   

    if (months === 0) {
        const tv = round2(initialContribution ? initialContribution : 0);
        return {
            grossYield: 0,
            incomeTax: 0,
            iof: 0,
            netYield: 0,
            finalValue: tv,
            annualReturnPct: 0,
            evolution: [tv],
            totalInvested: tv,
            // metadata (mantém consistência com retorno normal)
            contributionAtStart: !!contributionAtStart,
            rateType,
            interestRate,
            usedIndexName: undefined,
            usedIndexAnnual: undefined,
            adminFeePercent,
            iofRateApplied: 0
        };
    }

    let monthlyInc = 0;

    // Tipos que podem ter taxa pré-fixada
    if (['cdb', 'lci', 'lca', 'tesouro_prefixado', 'debentures', 'debentures_incentivadas', 'cri', 'cra'].includes(type) && rateType === 'pre' && interestRate !== undefined) {
        monthlyInc = annualPctToMonthlyDecimal(interestRate); // interestRate em %
    }

    // Tipos que podem ser pós-fixados ao índice (CDI/SELIC)
    if (['cdb', 'lci', 'lca', 'debentures', 'debentures_incentivadas', 'cri', 'cra'].includes(type) && rateType === 'pos' && interestRate !== undefined && (currentCdi !== undefined || currentSelic !== undefined)) {
        const indexAnnual = typeof currentCdi === 'number' ? currentCdi : (currentSelic as number);
        const indexMonthly = annualPctToMonthlyDecimal(indexAnnual); // indexAnnual em %
        monthlyInc = indexMonthly * (interestRate / 100); // interestRate em % (ex: 100 => 1.0 * indexMonthly)
    }

    if (type === 'tesouro_selic' && currentSelic !== undefined) {
        monthlyInc = annualPctToMonthlyDecimal(currentSelic);
    } 

    if (type === 'tesouro_ipca+' && interestRate !== undefined && currentIpca !== undefined) {
        const annualReal = interestRate / 100;
        const annualInflation = currentIpca / 100;
        const combinedAnnual = (1 + annualInflation) * (1 + annualReal) - 1;
        monthlyInc = annualPctToMonthlyDecimal(combinedAnnual);
    }

    const periodCount = Math.max(1, Math.ceil(months));    
    
    const contributionPerPeriod = frequentContribution;

    // normalizar adminFee para evitar comportamentos estranhos
    const safeAdminFee = Math.max(0, Math.min(adminFeePercent || 0, 0.99));
    const adminFeePerPeriod = safeAdminFee / 12;

    // guarda defensiva
    if (rateType === 'pos' && monthlyInc === 0) {
        throw new Error("Taxa pós-fixada sem índice válido (CDI/SELIC).");
    }

    // taxa de juros por período
    const periodInterest = monthlyInc;
    
    let balance = initialContribution ? initialContribution : 0;

    const evolution: number[] = [];

    // Cada iteração representa atualização do saldo e aplicação de juros, dividendos, adminFee, etc.
    for (let i = 1; i <= periodCount; i++) {
        // Renda fixa: aplicar juros compostos + aporte mensal
    
        if (contributionAtStart && contributionPerPeriod > 0) {
            balance += contributionPerPeriod; // aporte no início
        }

        balance *= (1 + periodInterest); // aplica juros compostos

        if (!contributionAtStart && contributionPerPeriod > 0) {
            balance += contributionPerPeriod; // aporte no fim
        }
       
        // deduz taxa de administração sobre o saldo final do período.
        if (adminFeePerPeriod) {
            balance -= balance * adminFeePerPeriod;
        }

        // Armazenar saldo mês a mês em monthlyEvolution
        evolution.push(balance);
    }

    // soma o capital inicial + todos os aportes mensais (não considera juros/dividendos)
    const totalInvested = (initialContribution || 0) + (contributionPerPeriod || 0) * periodCount;

    // lucro bruto: quanto o investimento rendeu antes de impostos (saldo final - capital investido)
    const grossYield = balance - totalInvested;

    // IR regressivo (CDB, Tesouro Prefixado/IPCA+)
    let incomeTax = 0;
    let iof = 0;

    // tipos isentos por definição
    const isExempt = ["lci", "lca", "cri", "cra", "debentures_incentivadas"].includes(type);

    // IR regressivo padrão (CDB, Tesouro prefixado, Tesouro IPCA+, Debêntures normais)
     if (!isExempt && (type === 'cdb' || type === 'tesouro_selic' || type === 'tesouro_prefixado' || type === 'tesouro_ipca+' || type === 'debentures')) {
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.2;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;
        incomeTax = grossYield > 0 ? grossYield * irRate : 0;
    }

    // IOF tabela oficial regressiva (percentual do rendimento)
    const iofTablePercent = [
        96, 93, 90, 86, 83, 80, 76, 73, 70, 66,
        63, 60, 56, 53, 50, 46, 43, 40, 36, 33,
        30, 26, 23, 20, 16, 13, 10, 6, 3, 0
    ];

    let iofRateApplied = 0;
    if ((type === 'cdb') && days < 30) {
        const d = Math.max(1, Math.min(30, Math.floor(days))); // 1..30
        const pct = iofTablePercent[d - 1] ?? 0;
        iofRateApplied = pct / 100;
        iof = grossYield > 0 ? grossYield * iofRateApplied : 0;
    }

    // LCI/LCA isentos
    if (type === 'lci' || type === 'lca') {
        incomeTax = 0;
        iof = 0;
        iofRateApplied = 0;
    }

    // Subtrai todos os impostos do lucro bruto. lucro líquido
    const netYield = grossYield - incomeTax - iof;

    // saldo final do investimento (capital investido + lucro líquido)
    const finalValue = totalInvested + netYield;

    // converte prazo para anos 
    const years = Math.max(1 / 365, months / 12);
    const annualReturnPct = totalInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0;

    const maybeRound = (v: number) => round2(v);

    let usedIndexName: string | undefined;
    let usedIndexAnnual: number | undefined;

    const preferCdi = typeof currentCdi === "number";
    const preferSelic = !preferCdi && typeof currentSelic === "number";

    // para pós-fixados que dependem de um índice (CDI/SELIC), mapear o índice usado
    if (rateType === "pos") {
        // tipos típicos que usam CDI/SELIC como referência
        const posIndexTypes: InvestmentsType[] = ["cdb", "lci", "lca", "cri", "cra", "debentures", "debentures_incentivadas"];
        if (posIndexTypes.includes(type)) {
            if (preferCdi) {
                usedIndexName = "CDI";
                usedIndexAnnual = currentCdi;
            } else if (preferSelic) {
                usedIndexName = "SELIC";
                usedIndexAnnual = currentSelic;
            }
        }
    }

    // casos específicos (tesouro)
    if (type === "tesouro_selic") {
        usedIndexName = "SELIC";
        usedIndexAnnual = currentSelic;
    } else if (type === "tesouro_ipca+") {
        usedIndexName = "IPCA";
        usedIndexAnnual = currentIpca;
    }

    let displayAnnualInterest: number | undefined;
    if (rateType === "pos" && typeof interestRate === "number" && typeof usedIndexAnnual === "number") {
        displayAnnualInterest = usedIndexAnnual * (interestRate / 100);
    } else if (type === "tesouro_ipca+" && typeof interestRate === "number" && typeof currentIpca === "number") {
        displayAnnualInterest = interestRate + currentIpca;
    } else if (rateType === "pre" && typeof interestRate === "number") {
        displayAnnualInterest = interestRate;
    }
     else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        displayAnnualInterest = undefined;
    }

    return {
        grossYield: maybeRound(grossYield),
        incomeTax: maybeRound(incomeTax),
        iof: maybeRound(iof),
        netYield: maybeRound(netYield),
        finalValue: maybeRound(finalValue),
        annualReturnPct: maybeRound(annualReturnPct),
        evolution: evolution.map(v => maybeRound(v)),
        totalInvested: maybeRound(totalInvested),
        contributionAtStart,
        rateType,
        interestRate,
        usedIndexName,
        usedIndexAnnual,
        adminFeePercent,
        iofRateApplied,    
        displayAnnualInterest: displayAnnualInterest === undefined ? undefined : maybeRound(displayAnnualInterest),
    };
};
