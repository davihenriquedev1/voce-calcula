import { annualPctToMonthlyDecimal } from "@/helpers/finance/annualPctToMonthlyDecimal";
import { round2 } from "@/utils/math";
import { InvestmentParams, InvestmentResult } from "@/types/investments";

export const calculateInvestment = ({type, initialValue, monthlyContribution = 0, term, termType, simulateDaily = false, interestRate, rateType, currentSelic, currentCdi, currentIPCA, dividendYield, unitPrice, appreciationRate, adminFee = 0, taxOnStockGains = 0.2, dividendTaxRate = 0, roundResults = true, contributionAtStart
}: InvestmentParams): InvestmentResult => {
    // === Definir termMonths e termDays internos ===
    let months = termType === "meses" ? term : term * 12; // se veio em mes mantém, se veio em anos transforma em meses
    let days = Math.round(months * 30);

    // substituir o early return atual por este
    if (months === 0 && !simulateDaily) {
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
            simulateDaily,
            adminFee,
            taxOnStockGains,
            iofRateApplied: 0
        };
    }

    // === Determinar taxa de rendimento mensal de acordo com o tipo de investimento ===
    let monthlyInc = 0; // decimal (ex: 0.01 = 1%/mês)

    if (type !== 'fii' && type !== 'stock') {
        // Tipos que podem ter taxa pré-fixada
        if (['cdb', 'lci', 'lca', 'tesouro_prefixado', 'debentures', 'debentures_incentivadas', 'cri', 'cra'].includes(type) && rateType === 'pre' && interestRate !== undefined) {
            monthlyInc = annualPctToMonthlyDecimal(interestRate); // interestRate em %
        }
        // Tipos que podem ser pós-fixados ao índice (CDI/SELIC)
        else if (['cdb', 'lci', 'lca', 'debentures', 'cri', 'cra'].includes(type) && rateType === 'pos' && interestRate !== undefined && (currentCdi !== undefined || currentSelic !== undefined)) {
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
    // se simulação diária: converter taxas para diária:
    // converter monthlyInc para dailyInc: dailyInc = (1 + monthlyInc)^(1/30) - 1
    const useDaily = simulateDaily;
    const periodCount = useDaily ? days : months; // iterações
    const contributionPerPeriod = useDaily ? monthlyContribution / 30 : monthlyContribution;

    // normalizar adminFee: garantir 0 <= adminFee < 1 para evitar comportamentos estranhos
    // garante que a taxa não seja maior que 99% nem menor que 0
    const safeAdminFee = Math.max(0, Math.min(adminFee || 0, 0.99));
    // ajuste da taxa administrativa por período
    const adminFeePerPeriod = (() => {
        if (!safeAdminFee) return 0;
        if (!useDaily) return safeAdminFee; // se não for diária, a taxa já está mensal, retorna igual.
        // converter adminFee mensal para taxa diária: dailyFee = 1 - (1 - adminFee)^(1/30)
        return 1 - Math.pow(1 - safeAdminFee, 1 / 30);
    })();

    // Ajuste da taxa de juros por período
    const periodInterest = (() => {
        if (!useDaily) return monthlyInc;
        // converte monthlyInc para dailyInc (mesmo que monthlyInc possa ser zero)
        return Math.pow(1 + monthlyInc, 1 / 30) - 1;
    })();// garantindo que, depois de 30 dias, o saldo acumulado seja equivalente à taxa mensal.

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

    let totalDividends = 0; // acumula os dividendos recebidos ao longo do tempo.
    const evolution: number[] = []; // array que vai armazenar o saldo ao final de cada período
    const localAppreciationRate = (typeof appreciationRate === 'number') ? appreciationRate : (type === 'fii' ? 0.008 : 0); // taxa de valorização do ativo. Se não fornecida, assume 0.8%/mês para FII, 0 para outros.

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
            // Calcula a valorização da cota/ação por período;
            // appreciationRate é fornecido como taxa mensal (decimal). Se estivermos em daily mode, converte:
            const apprPerPeriod = (() => {
                if (!localAppreciationRate) return 0;
                if (!useDaily) return localAppreciationRate;
                return Math.pow(1 + localAppreciationRate, 1 / 30) - 1;
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

            // dividendos: dividendYield é anual %, converter para período (mensal ou diário)
            if (dividendYield) {
                const divPerPeriod = !useDaily ? dividendYield / 12 / 100 : dividendYield / 365 / 100;
                // calcula dividendos brutos sobre o saldo atual.
                const periodDivGross = balance * divPerPeriod; 
                // aplicar imposto sobre dividendos se solicitado
                const dividendTax = periodDivGross * (dividendTaxRate || 0);
                //Adiciona dividendos líquidos ao saldo e acumula em totalDividends
                const netDividend = periodDivGross - dividendTax;
                balance += netDividend;
                totalDividends += netDividend;
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
    const totalInvested = initialValue + monthlyContribution * months;
    // lucro bruto: quanto o investimento rendeu antes de impostos (saldo final - capital investido).
    const grossYield = balance - totalInvested;

    // IR regressivo (CDB, Tesouro Prefixado/IPCA+)
    let incomeTax = 0;
    let iof = 0;

    // tipos isentos por definição
    const isExempt = ["lci", "lca", "cri", "cra", "debentures_incentivadas"].includes(type);

    // IR regressivo padrão (CDB, Tesouro prefixado, Tesouro IPCA+, Debêntures normais)
    if (!isExempt && (type === 'cdb' || type === 'tesouro_prefixado' || type === 'tesouro_ipca+' || type === 'debentures')) {
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
        const d = Math.max(1, Math.min(30, days)); // 1..30
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
    if ((type === 'stock' || type === 'fii') && typeof taxOnStockGains === 'number' && taxOnStockGains > 0) {
        const capitalGain = grossYield - totalDividends; // ganhos de valorização
        if (capitalGain > 0) {
            incomeTax += capitalGain * (taxOnStockGains || 0); // Aplica imposto, geralmente 20%, sobre o ganho de capital (excluindo dividendos que já foram separados)
        }
    }

    // === Calcular rendimento líquido ===
    // Subtrai todos os impostos do lucro bruto → lucro líquido.
    const netYield = grossYield - incomeTax - iof;

    // === Calcular valor final e rentabilidade anual ===
    // saldo final do investimento (capital investido + lucro líquido).
    const finalValue = totalInvested + netYield;
    // converte prazo para anos 
    const years = Math.max(1 / 365, days / 365);
    // rentabilidade anualizada, usando fórmula de juros compostos
    const annualReturnPct = totalInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0;

    // === Retornar resultados ===
    const maybeRound = (v: number) => roundResults ? round2(v) : v;

    // metadata para UI: qual índice foi usado (quando aplicável)
    let usedIndexName: string | undefined;
    let usedIndexAnnual: number | undefined;
    if ((type === 'cdb' || type === 'lci' || type === 'lca') && rateType === 'pos') {
        usedIndexName = typeof currentCdi === 'number' ? 'CDI' : 'SELIC';
        usedIndexAnnual = typeof currentCdi === 'number' ? currentCdi : currentSelic;
    } else if (type === 'tesouro_selic') {
        usedIndexName = 'SELIC';
        usedIndexAnnual = currentSelic;
    } else if (type === 'tesouro_ipca+') {
        usedIndexName = 'IPCA';
        usedIndexAnnual = currentIPCA;
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
        totalDividends: maybeRound(totalDividends),
        totalInvested: maybeRound(totalInvested),
        contributionAtStart,
        rateType,
        interestRate,
        usedIndexName,
        usedIndexAnnual,
        simulateDaily,
        adminFee,
        taxOnStockGains,
        iofRateApplied
    };
};
