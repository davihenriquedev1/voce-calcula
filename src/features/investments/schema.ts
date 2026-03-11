import { numberOrString } from "@/utils/parse/number-or-string";
import { z } from "zod";

export const investmentsSchema = z
    .object({
        initialContribution: numberOrString().optional(),
        frequentContribution: numberOrString().optional(),
        contributionAtStart: z.boolean().optional().default(true),
        term: numberOrString(),
        termType: z.enum(["months", "years"]).default("months"),
        interestRate: numberOrString(),
        currentSelic: numberOrString(),
        currentCdi: numberOrString(),
        currentIpca: numberOrString(),
        rateAddToIpca: numberOrString(),
        cdiPercentCdb: numberOrString(),
        cdiPercentLci: numberOrString(),
        cdiPercentLca: numberOrString(),
        cdiPercentCri: numberOrString(),
        cdiPercentCra: numberOrString(),
        cdiPercentDebentures: numberOrString(),
        cdiPercentDebIncent: numberOrString(),
        cdiPercentFundDi: numberOrString(),
        transactionFeePercent: numberOrString(),
        adminFeePercent: numberOrString(),
        includeIOF: z.boolean().optional().default(true),
        iofPercent: numberOrString(),
        preConversionSpread: z.union([
            numberOrString(),
            z.object({
                curto: numberOrString(),
                medio: numberOrString(),
                longo: numberOrString(),
            })
        ]),
        issuerCreditSpread: numberOrString(),
    })
    .superRefine((obj, ctx) => {

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

        if (!Number.isFinite(Number(obj.currentIpca ?? NaN))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["currentIpca"],
                message: "IPCA atual (currentIpca) é obrigatório para calcular Tesouro IPCA+",
            });
        }

        if (!Number.isFinite(Number(obj.rateAddToIpca ?? NaN))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["rateAddToIpca"],
                message: "Taxa anual adicionada ao IPCA é obrigatória para calcular Tesouro IPCA+",
            });
        }

        if (obj.interestRate !== undefined && !Number.isFinite(Number(obj.interestRate))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['interestRate'],
                message: 'interestRate deve ser um número'
            });
        }

        const cdiFields = ["cdiPercentCdb", "cdiPercentLci", "cdiPercentLca", "cdiPercentCri","cdiPercentCra", "cdiPercentDebentures", "cdiPercentDebIncent", "cdiPercentFundDi"] as const;
        cdiFields.forEach((field) => {
            const value = obj[field];

            if (value !== undefined && !Number.isFinite(Number(value))) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [field],
                    message: `${field} deve ser um número válido`,
                });
            }
        });

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


    });
