import { round2 } from "@/helpers/math";

type InvestmentParams = {
    type: 'cdb' | 'lci' | 'lca' | 'tesouro_selic' | 'tesouro_prefixado' | 'tesouro_ipca+' | 'fii' | 'stock';
    initialValue: number;
    monthlyContribution?: number;
    term: number; // quantidade conforme termType
    termType: 'meses' | 'anos';
    simulateDaily?: boolean; // se true, simula dia a dia
    interestRate?: number; // anual (%) ou percentual do CDI (ex: 100 = 100% do CDI)
    rateType?: 'pre' | 'pos';
    currentSelic?: number; // anual %
    currentCdi?: number;
    currentIPCA?: number; // anual %
    dividendYield?: number; // anual % (dividendos)
    unitPrice?: number;
    appreciationRate?: number; // mensal decimal (ex: 0.008 = 0.8%/mês)
    adminFee?: number; // mensal percentual em decimal (ex: 0.01 = 1%/mês)
    taxOnStockGains?: boolean; // aplicar IR sobre ganhos de ações
    stockTaxRate?: number; // ex: 0.2 => 20% imposto sobre ganho (padrão 20%)
    dividendTaxRate?: number; // se quiser tributar dividendos (padrão 0)
    roundResults?: boolean; // arredondar para 2 casas
};
export type InvestmentResult = {
    grossYield: number;
    incomeTax: number;
    iof: number;
    netYield: number;
    finalValue: number;
    annualReturnPct: number;
    evolution: number[]; // evolução mês a mês ou dia a dia (conforme simulateDaily)
    totalDividends: number;
    totalInvested: number;
};

export const calculateInvestment = ({type, initialValue, monthlyContribution = 0, term, termType, simulateDaily = false, interestRate, rateType, currentSelic, currentCdi, currentIPCA, dividendYield, unitPrice, appreciationRate, adminFee = 0, taxOnStockGains = false, stockTaxRate = 0.2, dividendTaxRate = 0, roundResults = true
}: InvestmentParams): InvestmentResult => {
    // === Definir termMonths e termDays internos ===
    let months = termType === "meses" ? term : term * 12; // se veio em mes mantém, se veio em anos transforma em meses
    let days = Math.round(months * 30);

    if (months === 0 && !simulateDaily) {
        const tv = round2(initialValue);
        return { grossYield: 0, incomeTax: 0, iof: 0, netYield: 0, finalValue: tv, annualReturnPct: 0, evolution: [tv], totalDividends: 0, totalInvested: tv };
    }

    // === Determinar taxa de rendimento mensal de acordo com o tipo de investimento ===
    let monthlyInc = 0; // decimal (ex: 0.01 = 1%/mês)
    if (type !== 'fii' && type !== 'stock') {
        if ((type === 'cdb' || type === 'lci' || type === 'lca' || type === 'tesouro_prefixado') && rateType === 'pre' && interestRate !== undefined) {
            // taxa pré-fixada tradicional
            monthlyInc = (interestRate / 100) / 12;

        } else if (type === 'cdb' && rateType === 'pos' && interestRate !== undefined && (currentCdi !== undefined || currentSelic !== undefined)) {
            const indexRate = (typeof currentCdi === 'number') ? currentCdi : (currentSelic as number);
            monthlyInc = ((interestRate / 100) * (indexRate / 100)) / 12;
        } else if (type === 'tesouro_selic' && currentSelic !== undefined) {
            monthlyInc = currentSelic / 12 / 100;

        } else if (type === 'tesouro_ipca+' && interestRate !== undefined && currentIPCA !== undefined) {
            monthlyInc = (interestRate + currentIPCA) / 12 / 100;
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

    let balance = initialValue; // saldo atual do investimento. Começa com o valor inicial.
    const startPrice = (typeof unitPrice === 'number' && unitPrice > 0) ? unitPrice : 1;
    let units = startPrice ? initialValue / startPrice : 0; // número de cotas/ações compradas inicialmente. Para renda fixa, será 0.
    let currentPrice = startPrice; // preço da unidade (para FII ou ações). Para renda fixa, 0
    let totalDividends = 0; // acumula os dividendos recebidos ao longo do tempo.
    const evolution: number[] = []; // array que vai armazenar o saldo ao final de cada período
    const localAppreciationRate = (typeof appreciationRate === 'number') ? appreciationRate : (type === 'fii' ? 0.008 : 0); // taxa de valorização do ativo. Se não fornecida, assume 0.8%/mês para FII, 0 para outros.

    // Cada iteração representa atualização do saldo e aplicação de juros, dividendos, adminFee, etc.
    for (let i = 1; i <= periodCount; i++) {
        // Renda fixa: aplicar juros compostos + aporte mensal
        if (type !== 'fii' && type !== 'stock') {
            balance *= (1 + periodInterest); // aplica juros compostos
            balance += contributionPerPeriod; // adiciona aporte periódico
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
            currentPrice *= 1 + apprPerPeriod; // Atualiza currentPrice.

            // Calcula quantas cotas novas podem ser compradas com o aporte.
            if (contributionPerPeriod > 0) {
                units += contributionPerPeriod / currentPrice;        
            }

            balance = units * currentPrice; // atualiza o saldo atual do investimento.

            // dividendos: dividendYield é anual %, converter para período (mensal ou diário)
            if (dividendYield) {
                const divPerPeriod = (() => {
                    if (!useDaily) {
                        return dividendYield / 12 / 100; // mensal decimal
                    } else {
                        return dividendYield / 365 / 100; // diário aproximado
                    }
                })();
                // calcula dividendos brutos sobre o saldo atual.
                const monthlyDiv = balance * divPerPeriod; 
                // aplicar imposto sobre dividendos se solicitado
                const dividendTax = monthlyDiv * (dividendTaxRate || 0);
                //Adiciona dividendos líquidos ao saldo e acumula em totalDividends
                const netDividend = monthlyDiv - dividendTax;
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

    // soma o capital inicial + todos os aportes mensais (não considera juros/dividendos).
    const totalInvested = initialValue + monthlyContribution * months;
    // lucro bruto: quanto o investimento rendeu antes de impostos (saldo final - capital investido).
    const grossYield = balance - totalInvested;

    // === impostos ===
    let incomeTax = 0;
    let iof = 0;
    // IR regressivo (CDB, Tesouro Prefixado/IPCA+)
    if (type === 'cdb' || type === 'tesouro_prefixado' || type === 'tesouro_ipca+') {
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.2;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;
        // Só aplica IR se houver lucro positivo (grossYield > 0).
        incomeTax = grossYield > 0 ? grossYield * irRate : 0;
    }
    // IOF baseado em dias
    if ((type === 'cdb' || type.includes('tesouro')) && days < 30) {
        // Exemplo simplificado: 0 a 30 dias decresce linearmente de 96% a 0%
        iof = grossYield > 0 ? grossYield * Math.max(0, ((30 - days) / 30) * 0.96) : 0;
    }
    // LCI/LCA isentos
    if (type === 'lci' || type === 'lca') {
        incomeTax = 0;
        iof = 0;
    }
    // IR sobre ganho de ações (opcional)
    if ((type === 'stock' || type === 'fii') && taxOnStockGains) {
        const capitalGain = grossYield - totalDividends; // ganhos de valorização
        if (capitalGain > 0) {
            incomeTax += capitalGain * (stockTaxRate || 0); // Aplica imposto (stockTaxRate), geralmente 20%, sobre o ganho de capital (excluindo dividendos que já foram separados)
        }
    }

    // === Calcular rendimento líquido ===
    // Subtrai todos os impostos do lucro bruto → lucro líquido.
    const netYield = grossYield - incomeTax - iof;

    // === Calcular valor final e rentabilidade anual ===
    // saldo final do investimento (capital investido + lucro líquido).
    const finalValue = totalInvested + netYield;
    // converte prazo para anos (mínimo 1 dia → 1/365 anos).
    const years = Math.max(1 / 365, days / 365);
    // calcula rentabilidade anualizada, usando fórmula de juros compostos
    const annualReturnPct = totalInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0;

    // === Retornar resultados ===
    return {    
        grossYield: round2(grossYield),
        incomeTax: round2(incomeTax),
        iof: round2(iof),
        netYield: round2(netYield),
        finalValue: round2(finalValue),
        annualReturnPct: round2(annualReturnPct),
        evolution: evolution.map(round2),
        totalDividends: round2(totalDividends),
        totalInvested: round2(totalInvested)
    };
};
