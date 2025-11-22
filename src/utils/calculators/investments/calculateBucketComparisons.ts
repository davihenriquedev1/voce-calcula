import { ComparisonItem, InvestmentParams, InvestmentResult, InvestmentType, RateFixedType } from "@/types/investments";
import { calculateInvestment } from "./calculateInvestment";
import { getInvestmentLabel, getBucketTypes, VARIABLE_INVESTMENT_TYPES } from "@/constants/investments";
import { annualPctToMonthlyDecimal } from "@/helpers/finance/annualPctToMonthlyDecimal";

/**
 * calculateBucketComparisons(params, selectedResult?)
 * - params: parâmetros enviados pelo form (já convertidos para number)
 * - selectedResult (opcional): resultado já calculado para o investimento "main" — se fornecido,
 *   será reutilizado e não recalculado.
 */

export const calculateBucketComparisons = (params: InvestmentParams, selectedResult?: InvestmentResult) => {
    const currentType = params.type as InvestmentType;
    const bucket = getBucketTypes(currentType);

    const results: ComparisonItem[] = [];
    const pushedIds = new Set<string>();

    const safePush = (id: string, label: string, type: InvestmentType, pParams: InvestmentParams, isSelected?: boolean) => {
        if (pushedIds.has(id)) return;
        try {
            if(isSelected && selectedResult) {
                results.push({id, label, type, result: selectedResult, isSelected: true});
                pushedIds.add(id);
                return;
            }
            const cloneParams = typeof structuredClone === 'function' ? structuredClone(pParams) : JSON.parse(JSON.stringify(pParams));
            const r = calculateInvestment(cloneParams);
            
            if (r) {
                results.push({id, label, type, result: r, isSelected: !!isSelected});
                pushedIds.add(id);
            }
        } catch (err) {
            // mais contexto para facilitar debugging
            console.warn("calculateBucketComparisons: failed for", id, { err, params: pParams });
        }
    };

    // Retorna interestRate (número) e rateType ('pre'|'pos'|'auto')
    // interestRate: para 'pre' = taxa anual em % (ex: 13.65), para 'pos' = percentual do índice (ex: 100)
    const computeInterestRateForType = (baseParams: InvestmentParams, type: InvestmentType, variant?: "pre" | "pos") => {
        const base = typeof baseParams.interestRate === "number" ? baseParams.interestRate : undefined;
        const selic = typeof baseParams.currentSelic === "number" ? baseParams.currentSelic : undefined;
        const ipca = typeof baseParams.currentIPCA === "number" ? baseParams.currentIPCA : undefined;
        const cdi = typeof baseParams.currentCdi === "number" ? baseParams.currentCdi : undefined;

        const baseIsPre = baseParams.rateType === "pre";
        const baseIsPos = baseParams.rateType === "pos";

        // índice preferencial (CDI > SELIC)
        const indexAnnual = typeof cdi === "number" ? cdi : (typeof selic === "number" ? selic : undefined);

        // helpers de retorno
        const asPos = (pct?: number) => ({ interestRate: typeof pct === "number" ? pct : undefined, rateType: typeof pct === "number" ? "pos" as const : undefined });
        const asPre = (annual?: number) => ({ interestRate: typeof annual === "number" ? annual : undefined, rateType: typeof annual === "number" ? "pre" as const : undefined });


        // conversão mais correta: transforma índice anual nominal -> taxa mensal efetiva -> anual efetiva
        //  depois aplica o pct do índice.
        const posToPre = (pct?: number) => {
            if (typeof pct !== "number" || typeof indexAnnual !== "number") return undefined;
            // indexAnnual is a percent (ex: 13.65). Convert to monthly decimal via helper:
            const indexMonthlyDecimal = annualPctToMonthlyDecimal(indexAnnual); // ex: 0.0107
            const indexEffectiveAnnualDecimal = Math.pow(1 + indexMonthlyDecimal, 12) - 1; // decimal
            const preAnnualPercent = indexEffectiveAnnualDecimal * (pct / 100) * 100; // back to percent
            return preAnnualPercent; // percent (ex: 13.65)
        };

        // leitura/configuração do spread (vindo do front ou defaults)
        const spreadCfg = baseParams.preConversionSpread;
        const defaultSpread = { curto: 0.5, medio: 0.8, longo: 1.2 }; // p.p.

        const getBaseSpread = (y: number) => {
            if (typeof spreadCfg === "number") return spreadCfg;
            const cfg = (typeof spreadCfg === "object" && spreadCfg !== null) ? spreadCfg : defaultSpread;
            if (y <= 1) return (cfg.curto ?? defaultSpread.curto);
            if (y <= 3) return (cfg.medio ?? defaultSpread.medio);
            return (cfg.longo ?? defaultSpread.longo);
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
        const rawTermType = baseParams.termType ?? "meses";
        const years = (() => {
            if (typeof rawTerm !== "number" || Number.isNaN(rawTerm)) return 1;
            return rawTermType === "anos" ? rawTerm : rawTerm / 12;
        })();

        // CDB: permitir Pré vs Pós com conversão pos->pre usando posToPre + spread por prazo/liquidez/issuer
        if (type === "cdb") {
            if (variant === "pos") {
                // se usuário passou pos usa; se não mas existe índice, assume 100% do índice
                return asPos((typeof base === "number" && baseIsPos) ? base : (typeof indexAnnual === "number" ? 100 : undefined));
            }

            // variant === 'pre'
            if (baseIsPre && typeof base === "number") return asPre(base);

            if (baseIsPos && typeof base === "number") {
                const preFromPos = posToPre(base);
                const spread = totalSpreadForYears(years);
                return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread) : undefined);
            }

            // fallback: se índice existe, converte 100% do índice para pré e aplica spread
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
                // se usuário passou pré, usa; se passou pos -> converte (mas sem heurística grande, só convert)
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (baseIsPos && typeof base === "number") {
                    const preFromPos = posToPre(base);
                    // pra Tesouro Prefixado, não queremos subtrair grandes spreads automaticamente.
                    // Aplicamos apenas uma liquidez mínima se o emissor for de risco (issuerAdj).
                    const spread = Math.max(0, issuerAdj * 0.5); // leve ajuste
                    return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread) : undefined);
                }
                return asPre(undefined);

            case "tesouro_ipca+":
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (typeof ipca === "number") return asPre(ipca);
                return asPre(undefined);

            case "debentures":
                // preferir pré informado; se veio pos converte e aplica heurística -2 p.p. sobre pre equivalente
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
                    // incentivadas tendem a não sofrer IR: mantemos conversão simples e aplicamos apenas liquidez/issuer
                    return asPre(typeof preFromPos === "number" ? Math.max(0, preFromPos - spread) : undefined);
                }
                if (typeof base === "number") return asPre(base);
                return asPre(undefined);

            default:
                // lci/lca/cri/cra
                // - se base veio como PRE => retornar PRE com base
                // - se base veio como POS => retornar POS com base (não convertemos)
                // - se não veio base e temos índice, retornar POS 100 (comparação padrão)
                if (baseIsPre && typeof base === "number") return asPre(base);
                if (baseIsPos && typeof base === "number") return asPos(base);
                if (typeof indexAnnual === "number") return asPos(100); // assume pos 100% do índice
                return asPre(undefined);
        }
    };

    // Adiciona o investimento selecionado (Summary principal)
    const selectedId = `${currentType}${params.rateType ? `_${params.rateType}` : ""}`;

    // helper simples para formatar %
    const fmtPct = (v?: number) => (typeof v === "number" ? `${(Math.round(v*100)/100).toFixed(2)}%` : "-");

    // label do selecionado (mostra taxa conforme rateType)
    const selectedLabel = (() => {
        if (params.rateType === "pre") return `${getInvestmentLabel(currentType)} (Pré — ${fmtPct(params.interestRate)})`;
        if (params.rateType === "pos") {
            // mostra % do índice e a conversão aproximada quando possível
            const idx = typeof params.currentCdi === "number" ? params.currentCdi : params.currentSelic;
            const conv = (typeof idx === "number" && typeof params.interestRate === "number")
            ? `${fmtPct(params.interestRate)} do índice (~${fmtPct((idx * (params.interestRate/100)) )})`
            : `${fmtPct(params.interestRate)} do índice`;
            return `${getInvestmentLabel(currentType)} (Pós — ${conv})`;
        }
        return getInvestmentLabel(currentType);
    })();

    if (!VARIABLE_INVESTMENT_TYPES.includes(currentType)) {
        safePush(selectedId, selectedLabel, currentType, params, true);
    }

    // forçar bucket quando selecionado FII ou STOCK
    const toCompare = bucket.slice().filter((t) => !VARIABLE_INVESTMENT_TYPES.includes(t));

    for (const type of toCompare) {
        // evitar repetir exatamente o mesmo variante já adicionado como selecionado
        const variantForThis = type === "cdb" ? undefined : (params.rateType as RateFixedType);
        if (type === currentType && variantForThis === params.rateType) {
            // já temos esse item (foi empurrado como selected), pular.
            continue;
        }
        const computed = computeInterestRateForType(params, type, /*variant*/ type === "cdb" ? undefined : (params.rateType as RateFixedType));

        if (type === "cdb") {
            // CDB Pré
            const cdbPreParams = { ...params, type: "cdb", rateType: "pre" } as InvestmentParams;
            const cdbPreComputed = computeInterestRateForType(params, "cdb", "pre");
            cdbPreParams.interestRate = typeof cdbPreComputed.interestRate === "number"
                ? cdbPreComputed.interestRate
                : (typeof params.interestRate === "number" ? params.interestRate : undefined);
            cdbPreParams.rateType = cdbPreComputed.rateType ?? "pre";
            safePush("cdb_pre", "CDB (Pré)", "cdb", cdbPreParams);

            // CDB Pós (CDI)
            const cdbPosParams = { ...params, type: "cdb", rateType: "pos" } as InvestmentParams;
            const cdbPosComputed = computeInterestRateForType(params, "cdb", "pos");
           cdbPosParams.interestRate = typeof cdbPosComputed.interestRate === "number"
                ? cdbPosComputed.interestRate
                : (typeof params.interestRate === "number" ? params.interestRate : undefined);
            cdbPosParams.rateType = cdbPosComputed.rateType ?? "pos";
            safePush("cdb_pos", "CDB (Pós - % CDI)", "cdb", cdbPosParams);
            continue;
        }

        // para outros tipos, criamos uma variação por tipo com uma taxa ajustada (heurística)
        const p = { ...params, type: type } as InvestmentParams;
        p.interestRate = computed.interestRate;
        p.rateType = computed.rateType;


        // se for tesouro_prefixado e não tiver rateType, garante pré
        if (type === "tesouro_prefixado") p.rateType = p.rateType ?? "pre";

           // evitar incluir o mesmo tipo/variante do selecionado
        if (type === currentType && p.rateType === params.rateType) continue;

        // para debêntures incentivadas, garante que não haja imposto no label (o cálculo deve refletir isso)
        safePush(`${type}`, getInvestmentLabel(type), type, p);
    }

    // Se o bucket estiver vazio (tipo desconhecido), adicionar um fallback com alguns tipos úteis
    if (results.length === 0) {
        const fallbackTypes: InvestmentType[] = ["cdb", "lci", "tesouro_selic", "tesouro_prefixado"];
        for (const t of fallbackTypes) {
            const p = { ...params, type: t } as InvestmentParams;
            const comp = computeInterestRateForType(params, t);
            p.interestRate = comp.interestRate;
            p.rateType = comp.rateType;
            safePush(`fallback_${t}`, getInvestmentLabel(t), t, p);
        }
    }

    return results;
};
