import { annualPctToMonthlyDecimal } from "@/helpers/finance/annualPctToMonthlyDecimal";
import { round2 } from "@/utils/math";
import { InvestmentParams, InvestmentResult, InvestmentType } from "@/types/investments";

export const calculateInvestment = ({type, initialValue, monthlyContribution = 0, term, termType, interestRate, rateType, currentSelic, currentCdi, currentIPCA, dividendYield, unitPrice, appreciationRate, adminFee = 0, taxOnStockGains = 0.2, dividendTaxRate = 0, roundResults = true, contributionAtStart, reinvestDividends = false, dividendFrequencyMonths, transactionFee
}: InvestmentParams): InvestmentResult => {
    let totalTransactionFees = 0;

    // === Definir termMonths e termDays internos ===
    const months = termType === "meses" ? term : term * 12; // se veio em mes mantém, se veio em anos transforma em meses
    // months é o número de meses (inteiro ou decimal conforme entrada)
    const monthsDecimal = months;

    // dias baseados em média real (365/12 ≈ 30.4167) — evita que 12 meses vire 360 dias
    const days = Math.max(0, Math.round(monthsDecimal * (365 / 12)));

    // substituir o early return atual por este
    if (months === 0) {
        const tv = round2(initialValue);
        return {
            roundResults,
            grossYield: 0,
            incomeTax: 0,
            iof: 0,
            netYield: 0,
            finalValue: tv,
            annualReturnPct: 0,
            evolution: [tv],
            totalDividends: 0,
            totalInvested: tv,
            // metadata (mantém consistência com retorno normal)
            contributionAtStart: !!contributionAtStart,
            rateType,
            interestRate,
            usedIndexName: undefined,
            usedIndexAnnual: undefined,
            adminFee,
            taxOnStockGains,
            iofRateApplied: 0
        };
    }

    let appliedTaxOnStockGains = taxOnStockGains;
    if (type !== 'stock' && type !== 'fii') appliedTaxOnStockGains = 0;

    // === Determinar taxa de rendimento mensal de acordo com o tipo de investimento ===
    let monthlyInc = 0; // decimal (ex: 0.01 = 1%/mês)

    if (type !== 'fii' && type !== 'stock') {
        // Tipos que podem ter taxa pré-fixada
        if (['cdb', 'lci', 'lca', 'tesouro_prefixado', 'debentures', 'debentures_incentivadas', 'cri', 'cra'].includes(type) && rateType === 'pre' && interestRate !== undefined) {
            monthlyInc = annualPctToMonthlyDecimal(interestRate); // interestRate em %
        }
        // Tipos que podem ser pós-fixados ao índice (CDI/SELIC)
        else if (['cdb', 'lci', 'lca', 'debentures', 'debentures_incentivadas', 'cri', 'cra'].includes(type) && rateType === 'pos' && interestRate !== undefined && (currentCdi !== undefined || currentSelic !== undefined)) {
            const indexAnnual = typeof currentCdi === 'number' ? currentCdi : (currentSelic as number);
            const indexMonthly = annualPctToMonthlyDecimal(indexAnnual); // indexAnnual em %
            monthlyInc = indexMonthly * (interestRate / 100); // interestRate em % (ex: 100 => 1.0 * indexMonthly)
        }
        else if (type === 'tesouro_selic' && currentSelic !== undefined) {
            monthlyInc = annualPctToMonthlyDecimal(currentSelic);
        } 
        else if (type === 'tesouro_ipca+' && interestRate !== undefined && currentIPCA !== undefined) {
            const combinedAnnual = interestRate + currentIPCA; // soma em %
            monthlyInc = annualPctToMonthlyDecimal(combinedAnnual);
        }
    }   

    // === Simular evolução mês a mês ===
    // número de iterações mensais: usar ceil para garantir que frações gerem pelo menos 1 período
    const periodCount = Math.max(0, Math.ceil(monthsDecimal));    
    
    const contributionPerPeriod = monthlyContribution;

    // normalizar adminFee: garantir 0 <= adminFee < 1 para evitar comportamentos estranhos
    const safeAdminFee = Math.max(0, Math.min(adminFee || 0, 0.99));
    const adminFeePerPeriod = safeAdminFee; // já é mensal

    // Ajuste da taxa de juros por período
    const periodInterest = monthlyInc;

    const startPrice = (typeof unitPrice === 'number' && unitPrice > 0) ? unitPrice : 1;
    // Inicializar units com o aporte inicial comprando cotas ao preço inicial (para renda variável)
    let units = 0; // será usado/atualizado para renda variável
    let currentPrice = startPrice; // preço da unidade (para FII ou ações)

    // saldo inicial: para renda fixa inicia com initialValue, para variável converte initialValue em units
    if (type === 'fii' || type === 'stock') {
        // compra cotas com o valor inicial ao preço de startPrice
        if (initialValue && initialValue > 0) {
            units = initialValue / startPrice;
        }
    }
    let balance = (type === 'fii' || type === 'stock') ? units * currentPrice : initialValue;

    let totalDividends = 0;
    const evolution: number[] = [];
    
    const localAppreciationRate = (typeof appreciationRate === 'number') ? appreciationRate : (type === 'fii' ? 0.008 : 0);
    const payoutMonths = typeof dividendFrequencyMonths === "number" ? dividendFrequencyMonths : 1;
    const trxFee = typeof transactionFee === "number" ? transactionFee : 0;

    // Cada iteração representa atualização do saldo e aplicação de juros, dividendos, adminFee, etc.
    for (let i = 1; i <= periodCount; i++) {
        // Renda fixa: aplicar juros compostos + aporte mensal
        if (type !== 'fii' && type !== 'stock') {
            if (contributionAtStart && contributionPerPeriod > 0) {
                balance += contributionPerPeriod; // aporte no início
            }

            balance *= (1 + periodInterest); // aplica juros compostos

            if (!contributionAtStart && contributionPerPeriod > 0) {
                balance += contributionPerPeriod; // aporte no fim
            }
        } 
        // Renda variável (FII ou ações)
        else {
            // appreciationRate é fornecido como taxa mensal (decimal)
            const apprPerPeriod = (() => {
                if (!localAppreciationRate) return 0;
                return localAppreciationRate;
            })();

             // if contribution at start: buy with currentPrice BEFORE appreciation this period
            if (contributionAtStart && contributionPerPeriod > 0) {
                units += contributionPerPeriod / currentPrice;
            }
            
            currentPrice *= 1 + apprPerPeriod; // Atualiza currentPrice.

            if (!contributionAtStart && contributionPerPeriod > 0) {
                // compra cotas ao preço atualizado (fim do período)
                units += contributionPerPeriod / currentPrice;
            }

            balance = units * currentPrice; // atualiza o saldo atual do investimento.

            const payoutThisPeriod = dividendYield && (i % payoutMonths === 0);

            if (dividendYield && payoutThisPeriod) {
                // amount per payout = balance * (annualYield) * (payoutMonths/12)
                const periodDivGross = units * currentPrice * (dividendYield / 100) * (payoutMonths / 12);
                const dividendTax = periodDivGross * (dividendTaxRate || 0);
                const netDividend = periodDivGross - dividendTax;
                totalDividends += netDividend;

                if (reinvestDividends) {
                    const feeAmount = netDividend * trxFee;
                    totalTransactionFees += feeAmount;
                    const amountToReinvest = netDividend - feeAmount;
                    const boughtUnits = currentPrice > 0 ? (amountToReinvest / currentPrice) : 0;
                    units += boughtUnits;
                    balance = units * currentPrice;
                }
            }
        
        }
       
        // deduz taxa de administração sobre o saldo final do período.
        if (adminFeePerPeriod) {
            balance -= balance * adminFeePerPeriod;
        }

        // Armazenar saldo mês a mês em monthlyEvolution
        evolution.push(balance);
    }

    // === totais e impostos ===
    // soma o capital inicial + todos os aportes mensais (não considera juros/dividendos).
    const totalInvested = (initialValue || 0) + (contributionPerPeriod || 0) * periodCount;
    // lucro bruto: quanto o investimento rendeu antes de impostos (saldo final - capital investido).
    const grossYield = balance - totalInvested;

    const capitalGain = grossYield - totalDividends;


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
    if ((type === 'cdb' || type.includes('tesouro')) && days < 30) {
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

    // IR sobre ganho de ações (opcional)
    if ((type === 'stock' || type === 'fii') && typeof appliedTaxOnStockGains === 'number' && appliedTaxOnStockGains > 0) {
        const stockCapitalGain = grossYield - totalDividends;
        if (stockCapitalGain > 0) {
            incomeTax += stockCapitalGain * (appliedTaxOnStockGains || 0);
        }
    }

    // === Calcular rendimento líquido ===
    // Subtrai todos os impostos do lucro bruto → lucro líquido.
    const netYield = grossYield - incomeTax - iof;

    // === Calcular valor final e rentabilidade anual ===
    // saldo final do investimento (capital investido + lucro líquido).
    const finalValue = totalInvested + netYield;
    // converte prazo para anos 
    const years = Math.max(1 / 365, months / 12);    // rentabilidade anualizada, usando fórmula de juros compostos
    const annualReturnPct = totalInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0;

    // === Retornar resultados ===
    const maybeRound = (v: number) => roundResults ? round2(v) : v;

    // agora cobrimos mais tipos que podem vir como "pos" (% do índice).
    let usedIndexName: string | undefined;
    let usedIndexAnnual: number | undefined;

    const preferCdi = typeof currentCdi === "number";
    const preferSelic = !preferCdi && typeof currentSelic === "number";

    // para pós-fixados que dependem de um índice (CDI/SELIC), mapear o índice usado
    if (rateType === "pos") {
        // tipos típicos que usam CDI/SELIC como referência
        const posIndexTypes: InvestmentType[] = ["cdb", "lci", "lca", "cri", "cra", "debentures", "debentures_incentivadas"];
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
        usedIndexAnnual = currentIPCA;
    }

    let displayAnnualInterest: number | undefined;
    if (rateType === "pos" && typeof interestRate === "number" && typeof usedIndexAnnual === "number") {
        displayAnnualInterest = usedIndexAnnual * (interestRate / 100);
    } else if (rateType === "pre" && typeof interestRate === "number") {
        displayAnnualInterest = interestRate;
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        displayAnnualInterest = undefined;
    }

    return {
        roundResults,
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
        adminFee,
        taxOnStockGains: appliedTaxOnStockGains,
        iofRateApplied,    
        displayAnnualInterest: displayAnnualInterest === undefined ? undefined : maybeRound(displayAnnualInterest),
        totalDividends: maybeRound(totalDividends),
        totalTransactionFees: maybeRound(totalTransactionFees),
        capitalGain: maybeRound(capitalGain),
    };
};
