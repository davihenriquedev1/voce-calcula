import { numberOrString } from "@/utils/parsers/numberOrString";
import { z } from "zod";

// Item da tabela de IR
const incomeTaxBracket = z.object({
    maxDays: z.preprocess(
        (v) => (v === "" || v === undefined ? null : Number(v)),
        z.number().nullable()
    ),
    rate: numberOrString(),
});

export const investmentsSchema = z
    .object({

        // aporte inicial
        initialContribution: numberOrString(),

        // aporte regular
        frequentContribution: numberOrString(),

        // frequência dos aportes
        contributionFrequency: z.enum(["monthly", "annually", "one-time", "weekly"]).optional().default("monthly"),

        // aporte sempre no início do período?
        contributionAtStart: z.boolean().optional().default(true),

        // prazo
        term: numberOrString().or(z.number()).refine(v => Number.isFinite(v as number), { message: "Prazo deve ser um número" }),
        termType: z.enum(["months", "years"]).default("months"),

        // taxas / índices (em porcentagem; ex: 10 -> 10%)
        interestRate: numberOrString(),

        // frequências que os juros são aplicados sobre o saldo.
        compoundingFrequency: z.enum(["daily", "monthly", "annually"]).optional().default("monthly"),

        // referências de mercado
        currentSelic: numberOrString(),
        currentCdi: numberOrString(),
        currentIpca: numberOrString(),
        currentFundDi: numberOrString(),

        cdiPercent: numberOrString(),

        // fundos DI
        fundDiPercent: numberOrString(),

        // fees (em percentuais)
        transactionFeePercent: numberOrString(),
        adminFeePercent: numberOrString(),

        // incluir IOF
        includeIOF: z.boolean().optional().default(true),
        iofPercent: numberOrString(),

        // tabela de IR
        incomeTaxTable: z
            .array(incomeTaxBracket)
            .optional()
            .default([
                { maxDays: 180, rate: 22.5 },
                { maxDays: 360, rate: 20 },
                { maxDays: 720, rate: 17.5 },
                { maxDays: null, rate: 15 },
            ]),

        // controle de spread para conversão Pós->Pré (opcional)
        // aceita número (ex: "0,8") ou objeto { curto, medio, longo } (strings ou numbers)
        preConversionSpread: z.union([
            numberOrString(),
            z.object({
                curto: numberOrString(),
                medio: numberOrString(),
                longo: numberOrString(),
            })
        ]),

        // ajuste por risco do emissor
        issuerCreditSpread: numberOrString(),
    })
    .superRefine((obj, ctx) => {
        // converte/normaliza pra usar nas validações
        const termRaw = obj.term as unknown;
        const termNum = typeof termRaw === "number" ? termRaw : Number(termRaw);
        const months = obj.termType === "years" ? Math.round((termNum ?? 0) * 12) : Math.round(termNum ?? 0);

        if (!Number.isFinite(termNum) || termNum <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["term"],
                message: "Prazo deve ser um número maior que 0",
            });
        } else if (months < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["term"],
                message: "Prazo mínimo: 1 mês",
            });
        }

        const initialContribution = typeof obj.initialContribution === "number" ? obj.initialContribution : Number(obj.initialContribution);
        if (!Number.isFinite(initialContribution) || initialContribution < 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["initialContribution"],
                message: "Valor inicial deve ser maior ou igual a 0",
            });
        }

        if (obj.frequentContribution !== undefined && (typeof obj.frequentContribution !== "number" || obj.frequentContribution < 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["frequentContribution"],
                message: "Aplicação mensal deve ser maior ou igual a 0",
            });
        }

        // adminFeePercent e transactionFeePercent limites razoáveis (0..100)
        const admin = obj.adminFeePercent as number | undefined;
        if (admin !== undefined && (!Number.isFinite(admin) || admin < 0 || admin > 100)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["adminFeePercent"],
                message: "adminFeePercent deve estar entre 0 e 100",
            });
        }

        const trx = obj.transactionFeePercent as number | undefined;
        if (trx !== undefined && (!Number.isFinite(trx) || trx < 0 || trx > 100)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["transactionFeePercent"],
                message: "transactionFeePercent deve estar entre 0 e 100",
            });
        }

        if (!Number.isFinite(Number(obj.currentSelic ?? NaN))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentSelic"],
                message: "Selic atual é obrigatória para calcular Tesouro Selic",
            });
        }

        if (!Number.isFinite(Number(obj.currentCdi ?? NaN))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentCdi"],
                message: "Cdi atual é obrigatório para calcular investimentos baseados nele",
            });
        }

        if (!Number.isFinite(Number(obj.currentFundDi ?? NaN))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentFundDi"],
                message: "Di atual é obrigatório para calcular investimentos baseados nele",
            });
        }


        if (!Number.isFinite(Number(obj.currentIpca ?? NaN))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentIpca"],
                message: "IPCA atual (currentIpca) é obrigatório para calcular Tesouro IPCA+",
            });
        }

        if (obj.interestRate !== undefined && !Number.isFinite(Number(obj.interestRate))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['interestRate'],
                message: 'interestRate deve ser um número'
            });
        }

        // validação de preConversionSpread (aceita número ou objeto com curto/medio/longo)
        if (obj.preConversionSpread !== undefined && obj.preConversionSpread !== null) {
            const pcs = obj.preConversionSpread;
            if (typeof pcs === "number") {
                if (!Number.isFinite(pcs) || pcs < 0 || pcs > 10) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["preConversionSpread"],
                        message: "preConversionSpread deve ser um número entre 0 e 10 p.p.",
                    });
                }
            } else if (typeof pcs === "object") {
                const curto = Number(pcs.curto ?? NaN);
                const medio = Number(pcs.medio ?? NaN);
                const longo = Number(pcs.longo ?? NaN);
                if (![curto, medio, longo].every(v => Number.isFinite(v) && v >= 0 && v <= 10)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["preConversionSpread"],
                        message: "Valores de curto/medio/longo devem ser números entre 0 e 10 p.p.",
                    });
                }
            } else {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["preConversionSpread"],
                    message: "preConversionSpread inválido",
                });
            }
        }

        // validação issuerCreditSpread
        if (obj.issuerCreditSpread !== undefined) {
            const v = Number(obj.issuerCreditSpread);
            if (!Number.isFinite(v) || v < 0 || v > 100) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ["issuerCreditSpread"],
                    message: "issuerCreditSpread deve estar entre 0 e 100",
                });
            }
        }

        // validação da incomeTaxTable
        if (obj.incomeTaxTable) {
            let previousMaxDays = 0;

            for (let i = 0; i < obj.incomeTaxTable.length; i++) {
                const it = obj.incomeTaxTable[i];

                // rate obrigatório
                if (!Number.isFinite(it.rate)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["incomeTaxTable", String(i), "rate"],
                        message: "Taxa de IR inválida",
                    });
                    return;
                }

                // última faixa pode ser ilimitada
                if (it.maxDays === null) {
                    if (i !== obj.incomeTaxTable.length - 1) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            path: ["incomeTaxTable", String(i), "maxDays"],
                            message: "Somente a última faixa pode ser ilimitada",
                        });
                    }
                    return;
                }

                // maxDays deve ser crescente
                if (it.maxDays <= previousMaxDays) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ["incomeTaxTable", String(i), "maxDays"],
                        message: "Faixa de dias inválida",
                    });
                    return;
                }

                previousMaxDays = it.maxDays;
            }
        }


    });
