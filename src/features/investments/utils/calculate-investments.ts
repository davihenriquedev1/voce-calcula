import { annualPctToMonthlyDecimal } from "./annual-pct-to-monthly-decimal";
import { InvestmentsParams, InvestmentsResult, InvestmentsType } from "../types";
import { round2 } from "@/utils/math";

export const calculateInvestments = ({ type, initialContribution, frequentContribution = 0, term, termType, interestRate, rateType, currentSelic, currentCdi, currentIpca, rateAddToIpca, adminFeePercent = 0, contributionAtStart, baseIndexAnnual }: InvestmentsParams): InvestmentsResult => {

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

    if (rateType === "pre" && typeof interestRate === "number") {
        monthlyInc = annualPctToMonthlyDecimal(interestRate);
    } 
    else if (rateType === "pos" && typeof interestRate === "number" && (typeof baseIndexAnnual === "number")) {
        const effectiveAnnual = baseIndexAnnual * (interestRate / 100);
        monthlyInc = annualPctToMonthlyDecimal(effectiveAnnual);
    } 
    else if (rateType === "ipca" && typeof interestRate === "number" && typeof baseIndexAnnual === "number") {
        const ipcaPercent = interestRate / 100;
        const ipcaAnnualPct = baseIndexAnnual * ipcaPercent;
        const realSpread = typeof rateAddToIpca === "number" ? rateAddToIpca : 0;
        const combinedAnnualPct = ((1 + ipcaAnnualPct / 100) * (1 + realSpread / 100) - 1) * 100;
        monthlyInc = annualPctToMonthlyDecimal(combinedAnnualPct);
    } 
    else {
        monthlyInc = 0;
    }

    const periodCount = Math.max(1, Math.ceil(months));
    const contributionPerPeriod = frequentContribution;

    const adminFeeAnnual = Math.max(0, Math.min(adminFeePercent || 0, 100));
    const adminFeePerPeriod = adminFeeAnnual / 100 / 12;

    if (rateType === 'pos' && monthlyInc === 0 && days > 0) {
        throw new Error("Percentual do índice não informado.");
    }


    const periodInterest = monthlyInc;

    let balance = initialContribution ? initialContribution : 0;

    const evolution: number[] = [];

    for (let i = 1; i <= periodCount; i++) {

        if (contributionAtStart && contributionPerPeriod > 0) {
            balance += contributionPerPeriod;
        }

        balance *= (1 + periodInterest);
        if (!contributionAtStart && contributionPerPeriod > 0) {
            balance += contributionPerPeriod;
        }

        if (adminFeePerPeriod) {
            balance -= balance * adminFeePerPeriod;
        }

        evolution.push(balance);
    }

    const totalInvested = (initialContribution || 0) + (contributionPerPeriod || 0) * periodCount;

    const grossYield = balance - totalInvested;

    let incomeTax = 0;
    let iof = 0;

    const isExempt = ["lci", "lca", "cri", "cra", "debentures_incentivadas"].includes(type);

    if (!isExempt && (type === 'cdb' || type === 'tesouro_selic' || type === 'tesouro_prefixado' || type === 'tesouro_ipca+' || type === 'debentures' || type === 'fund_di')) {
        let irRate = 0;
        if (days <= 180) irRate = 0.225;
        else if (days <= 360) irRate = 0.2;
        else if (days <= 720) irRate = 0.175;
        else irRate = 0.15;
        incomeTax = grossYield > 0 ? grossYield * irRate : 0;
    }

    const iofTablePercent = [
        96, 93, 90, 86, 83, 80, 76, 73, 70, 66,
        63, 60, 56, 53, 50, 46, 43, 40, 36, 33,
        30, 26, 23, 20, 16, 13, 10, 6, 3, 0
    ];

    let iofRateApplied = 0;
    if ((type === 'cdb') && days < 30) {
        const d = Math.max(1, Math.min(30, Math.floor(days)));
        const pct = iofTablePercent[d - 1] ?? 0;
        iofRateApplied = pct / 100;
        iof = grossYield > 0 ? grossYield * iofRateApplied : 0;
    }

    if (type === 'lci' || type === 'lca') {
        incomeTax = 0;
        iof = 0;
        iofRateApplied = 0;
    }

    const netYield = grossYield - incomeTax - iof;

    const finalValue = totalInvested + netYield;

    const years = Math.max(1 / 365, months / 12);
    const annualReturnPct = totalInvested > 0 ? (Math.pow(finalValue / totalInvested, 1 / years) - 1) * 100 : 0;

    const maybeRound = (v: number) => round2(v);

    let usedIndexName: string | undefined;
    let usedIndexAnnual: number | undefined;

    const preferCdi = typeof currentCdi === "number";
    const preferSelic = !preferCdi && typeof currentSelic === "number";

    if (rateType === "pos") {
        const posIndexTypes: InvestmentsType[] = ["cdb", "lci", "lca", "cri", "cra", "debentures", "debentures_incentivadas", "fund_di"];
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
    } 
    else if (type === "tesouro_ipca+" && typeof rateAddToIpca === "number" && typeof currentIpca === "number" &&     typeof interestRate === "number") {
        const ipcaPct = currentIpca * (interestRate / 100);
        displayAnnualInterest = ((1 + ipcaPct / 100) * (1 + rateAddToIpca / 100) - 1) * 100; 
    } 
    else if (rateType === "pre" && typeof interestRate === "number") {
        displayAnnualInterest = interestRate;
    }
    else {
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
