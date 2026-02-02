import { ComparisonItem, FixedIncomeParams, FixedIncomeRateType, FixedIncomeType } from "@/types/investments/fixed-income";
import { calculateFixedIncome } from "./calculateFixedIncome";
import { getInvestmentLabel } from "@/constants/investments/fixed-income";
import { annualPctToMonthlyDecimal } from "@/helpers/finance/annualPctToMonthlyDecimal";

const investmentMeta: Record<FixedIncomeType, {
  allowRateType?: boolean;
  defaultRateType?: FixedIncomeRateType;
  allowPosIndex?: boolean; // aceita variação pós (CDI/SELIC)
  forceExemptFromIR?: boolean;
}> = {
    cdb: { allowRateType: true,  defaultRateType: 'pre', allowPosIndex: true },
    lci: { allowRateType: true,  defaultRateType: 'pre', allowPosIndex: true,  forceExemptFromIR: true },
    lca: { allowRateType: true,  defaultRateType: 'pre', allowPosIndex: true,  forceExemptFromIR: true },
    cri: { allowRateType: true,  defaultRateType: 'pre', allowPosIndex: true,  forceExemptFromIR: true },
    cra: { allowRateType: true,  defaultRateType: 'pre', allowPosIndex: true,  forceExemptFromIR: true },
    debentures: { allowRateType: true,  defaultRateType: 'pre', allowPosIndex: true },
    debentures_incentivadas: { allowRateType: true, defaultRateType: 'pre', allowPosIndex: true, forceExemptFromIR: true },
    tesouro_selic: { allowRateType: false, defaultRateType: 'pos', allowPosIndex: true },
    tesouro_prefixado: { allowRateType: false, defaultRateType: 'pre', allowPosIndex: false },
    'tesouro_ipca+': { allowRateType: false, defaultRateType: 'pre', allowPosIndex: false },
    fund_di: { allowRateType: true, defaultRateType: 'pos', allowPosIndex: true },
};

// TYPES list: pega todos os tipos que você suporta (garante fund_di também)
const toCompareDefaults: FixedIncomeType[] = [
    ...Object.keys(investmentMeta) as FixedIncomeType[],
]

type InterestRateResult = { interestRate?: number; rateType?: FixedIncomeRateType };

/**
 * ORQUESTRADORA: recebe params (sem type e rateType) e gera ComparisonItem[] comparando
 * automaticamente todos os tipos/variantes relevantes.
 */
export const orchestFixedComparisons = (params: Omit<FixedIncomeParams, "type" | "rateType">) => {

    const results: ComparisonItem[] = [];
    const pushedIds = new Set<string>();

    const safePush = (id: string, label: string, type: FixedIncomeType, pParams: FixedIncomeParams) => {
        if (pushedIds.has(id)) return;
        try {
            
            const cloneParams = typeof structuredClone === 'function' ? structuredClone(pParams) : JSON.parse(JSON.stringify(pParams));
            const r = calculateFixedIncome(cloneParams);
            
            if (r) {
                results.push({id, label, type, result: r});
                pushedIds.add(id);
            }
            console.log(results)
        } catch (err) {
            console.warn("calculateBucketComparisons: failed for", id, { err, params: pParams });
        }
    };

    // Retorna interestRate (número) e rateType ('pre'|'pos'|'auto')
    // interestRate: para 'pre' = taxa anual em % (ex: 13.65), para 'pos' = percentual do índice (ex: 100)
    const computeInterestRateForType = (baseParams: Partial<FixedIncomeParams>, type: FixedIncomeType, variant?: "pre" | "pos"):InterestRateResult => {
        const base = typeof baseParams.interestRate === "number" ? baseParams.interestRate : undefined;
        const selic = typeof baseParams.currentSelic === "number" ? baseParams.currentSelic : undefined;
        const ipca = typeof baseParams.currentIpca === "number" ? baseParams.currentIpca : undefined;
        const cdi = typeof baseParams.currentCdi === "number" ? baseParams.currentCdi : undefined;

        const baseIsPre = baseParams.rateType === "pre";
        const baseIsPos = baseParams.rateType === "pos";

        const indexAnnual = typeof cdi === "number" ? cdi : (typeof selic === "number" ? selic : undefined);

        const asPos = (pct?: number) => ({ interestRate: typeof pct === "number" ? pct : undefined, rateType: typeof pct === "number" ? "pos" as const : undefined });

        const asPre = (annual?: number) => ({ interestRate: typeof annual === "number" ? annual : undefined, rateType: typeof annual === "number" ? "pre" as const : undefined });

        const posToPre = (pct?: number) => {
            if (typeof pct !== "number" || typeof indexAnnual !== "number") return undefined;
            const indexMonthlyDecimal = annualPctToMonthlyDecimal(indexAnnual); // ex: 0.0107
            const indexEffectiveAnnualDecimal = Math.pow(1 + indexMonthlyDecimal, 12) - 1; // decimal
            const preAnnualPercent = indexEffectiveAnnualDecimal * (pct / 100) * 100;
            return preAnnualPercent; // (ex: 13.65)
        };

        // leitura/configuração do spread (vindo do front ou defaults)
        const spreadCfg = baseParams.preConversionSpread;
        const defaultSpread = { curto: 0.5, medio: 0.8, longo: 1.2 }; // p.p.

        const getBaseSpread = (y: number) => {
            if (typeof spreadCfg === "number") return spreadCfg;
            const cfg = (typeof spreadCfg === "object" && spreadCfg !== null) ? spreadCfg : defaultSpread;
            const curto = Number(cfg.curto ?? defaultSpread.curto);
            const medio = Number(cfg.medio ?? defaultSpread.medio);
            const longo = Number(cfg.longo ?? defaultSpread.longo);
            if (y <= 1) return curto;
            if (y <= 3) return medio;
            return longo;
        };

        // liquidez simples: pequeno premium crescente com prazo (em p.p.)
        const liquidityPremium = (y: number) => {
            if (y <= 1) return 0.1;
            if (y <= 3) return 0.25;
            if (y <= 7) return 0.4;
            return 0.6;
        };

        // issuer adjustment (vindo do front; ex: banco menor -> 0.5 p.p.)
        const issuerAdj = typeof baseParams.issuerCreditSpread === "number" ? baseParams.issuerCreditSpread : 0;

        // helper final que retorna spread total (pontos percentuais) dado years
        const totalSpreadForYears = (y: number) => {
            const base = getBaseSpread(y);
            const liq = liquidityPremium(y);
            return Math.max(0, base + liq + issuerAdj);
        };

        // extrair prazo (em anos) do baseParams se disponível (fallback = 1 ano)
        const rawTerm = typeof baseParams.term === "number" ? baseParams.term : (typeof baseParams.term === "string" ? Number(baseParams.term) : undefined);
        const rawTermType = baseParams.termType ?? "months";
        const years = (() => {
            if (typeof rawTerm !== "number" || Number.isNaN(rawTerm)) return 1;
            return rawTermType === "years" ? rawTerm : rawTerm / 12;
        })();

        // CDB: permitir Pré vs Pós com conversão pos->pre usando posToPre + spread por prazo/liquidez/issuer
        if (type === "cdb") {
            if (variant === "pos") {
                return asPos((typeof base === "number" && baseIsPos) ? base : (typeof indexAnnual === "number" ? 100 : undefined));
            }

            if (baseIsPre && typeof base === "number") return asPre(base);

            if (baseIsPos && typeof base === "number") {
                const preFromPos = posToPre(base);
                const spread = totalSpreadForYears(years);
                return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread) : undefined);
            }

            if (typeof indexAnnual === "number") {
                const preFromPos = posToPre(100);
                const spread = totalSpreadForYears(years);
                return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread) : undefined);
            }
            
            return asPre(undefined);
        }

        // outros tipos
        switch (type) {
            case "tesouro_selic":
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (typeof selic === "number") return asPre(selic);
                return asPre(undefined);

            case "tesouro_prefixado":
               
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (baseIsPos && typeof base === "number") {
                    const preFromPos = posToPre(base);
                  
                    const spread = Math.max(0, issuerAdj * 0.5); // leve ajuste

                    return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread) : undefined);
                }
                return asPre(undefined);

            case "tesouro_ipca+":
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (typeof ipca === "number") return asPre(ipca);
                return asPre(undefined);

            case "debentures":
                if (baseIsPre && typeof base === "number") return asPre(Math.max(0, base - 2));
                if (baseIsPos && typeof base === "number") {
                    const preFromPos = posToPre(base);
                    const spread = totalSpreadForYears(years);
                    return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread - 2) : undefined);
                }
                if (typeof base === "number") return asPre(base);
                return asPre(undefined);

            case "debentures_incentivadas":
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (baseIsPos && typeof base === "number") {
                    const preFromPos = posToPre(base);
                    const spread = totalSpreadForYears(years);
                    return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread) : undefined);
                }
                if (typeof base === "number") return asPre(base);
                return asPre(undefined);

            default:
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (baseIsPos && typeof base === "number") return asPos(base);
                if (typeof indexAnnual === "number") return asPos(100); // assume pos 100% do índice
                return asPre(undefined);
        }
    };

    for (const type of toCompareDefaults) {
        const meta = investmentMeta[type as string] ?? {};
        const baseClone: FixedIncomeParams = { ...(params as FixedIncomeParams), type } as FixedIncomeParams;

        // tentar gerar variante PRÉ (se faz sentido / computeInterestRate retornar pre)
        const preComputed = computeInterestRateForType(params, type, "pre");
        const preParams = { ...baseClone, rateType: "pre", interestRate: preComputed.interestRate ?? params.interestRate } as FixedIncomeParams;

        if (preComputed.rateType === "pre" && typeof preParams.interestRate === "number") {
            const id = `${type}_pre`;
            const label = `${getInvestmentLabel(type)} (Pré)`;
            safePush(id, label, type, preParams);
        }

        // gerar variante PÓS se o produto permitir pós ou se índice estiver disponível
        const indexAvailable = typeof params.currentCdi === "number" || typeof params.currentSelic === "number";
        const allowsPos = Boolean(meta.allowPosIndex) || indexAvailable;

        if (allowsPos) {
            const posComputed = computeInterestRateForType(params, type, "pos");
            // se computeInterestRate retornou algo válido para pos (interestRate ou rateType)
            if ((posComputed.rateType === "pos") && typeof posComputed.interestRate === "number") {
                const posParams = { ...baseClone, rateType: "pos", interestRate: posComputed.interestRate ?? params.interestRate } as FixedIncomeParams;
                const id = `${type}_pos`;
                const label = `${getInvestmentLabel(type)} (Pós)`;
                safePush(id, label, type, posParams);
            }
        }
    }

    // Se o bucket estiver vazio (tipo desconhecido), adicionar um fallback com alguns tipos úteis
    if (results.length === 0) {
        const fallbackTypes: FixedIncomeType[] = ["cdb", "lci", "tesouro_selic", "tesouro_prefixado"];
        for (const t of fallbackTypes) {
        const comp = computeInterestRateForType(params, t);
        const p = { ...params, type: t, rateType: comp.rateType, interestRate: comp.interestRate } as FixedIncomeParams;
        safePush(`fallback_${t}`, getInvestmentLabel(t), t, p);
        }
    }
    return results;
};
    