import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { loansSchema } from './schema';
import { LoansFormValues, LoansSchedule, LoansSummary } from './types';
import { round2 } from "@/utils/math";
import { normalizeSchedule } from './utils/normalize-schedule';
import { calculateCET } from './utils/calculate-cet';
import { generateConsorcioSchedule } from './utils/generate-consorcio-schedule';
import { generatePriceSchedule } from './utils/generate-price-schedule';
import { generateSacSchedule } from './utils/generate-sac-schedule';
import { applyExtraAmortization } from './utils/apply-extra-amortization';
import { toMonthlyRate } from './utils/to-monthly-rate';
import { parseMonthIndex } from '@/utils/date';

export const useLoansPageController = () => {
    const form = useForm<LoansFormValues>({
        resolver: zodResolver(loansSchema),
        defaultValues: { type: "emprestimo", amount: "10000", termMonths: "12", downPayment: "0", method: "price", adminPercent: "0", annualRate: "10", fixedIofPct: "0,38", dailyIofPct: "0,0082", extraAmortization: "0", iofCeiling: "3,5", },
        mode: "onTouched",
        criteriaMode: "all",
    });

    const { handleSubmit, setValue, watch, formState: { isValid } } = form;

    const watched = watch();

    const [schedule, setSchedule] = useState<unknown[]>([]); // array com cada parcela da tabela de amortização.
    const [summary, setSummary] = useState<LoansSummary | null>(null); // resumo

    // Se o usuário escolher consorcio, força method = "price".
    useEffect(() => {
        if (watched.type === "consorcio") {
            setValue("method", "price");
        }
        if (watched.type === "financiamento") {
            setValue("method", "sac");
        }
    }, [watched.type, setValue]);

    const onSubmit = (values: LoansFormValues) => {
        setSchedule([]);
        setSummary(null);
        const amount = Number(values.amount);
        const method = values.method!;
        const startDate = values.startDate ? values.startDate : '';
        const insurancePercent = values.insurancePercent ? Number(values.insurancePercent) : 0;
        const type = values.type!;
        const n = Math.max(1, Math.round(Number(values.termMonths))); // (months) garantido ≥ 1
        const down = values.downPayment ? Number(values.downPayment) : 0;
        let financed = round2(Math.max(0, amount - down)); // valor - entrada.
        const insuranceValue = financed * (insurancePercent / 100);
        financed = financed + insuranceValue;
        const extraAmortization = Number(values.extraAmortization);
        const extraAmortizationType = values.extraAmortizationType;
        const extraAmortizationMonth = values.extraAmortizationMonth;
        const extraAmortizationMonthIndex = parseMonthIndex(extraAmortizationMonth);
        const annualRate = Number(values.annualRate)!;
        const r = toMonthlyRate(Number(values.annualRate)); // taxa mensal derivada da taxa anual

        // IOF
        const iofCeiling = Number(values.iofCeiling);
        const fixedIofPct = Number(values.fixedIofPct);
        const dailyIofPct = Number(values.dailyIofPct);
        const fixedIof = financed * (fixedIofPct / 100);
        const days = n * 30; // usar 30 dias por mês (simplificação)
        const dailyIof = financed * (dailyIofPct / 100) * Math.min(days, 365);// limita o IOF a no máximo 1 ano de dias, que é o teto real usado pelo Banco Central.
        let totalIof = fixedIof + dailyIof;
        const iofCapped = financed * (iofCeiling / 100); // teto do IOF%
        let iofWasCapped = false;
        if (totalIof > iofCapped) {
            totalIof = iofCapped;
            iofWasCapped = true;
        };

        const finalize = (rawSchedule: LoansSchedule[]) => {
            const sNorm = normalizeSchedule(rawSchedule);
            const totalPaidNoIof = round2(sNorm.reduce((acc, cur) => acc + (Number(cur.payment) || 0), 0));
            const totalInterest = round2(totalPaidNoIof - financed); // juros sobre o que foi financiado
            const totalPaidWithIof = round2(totalPaidNoIof + totalIof);
            const totalInterestWithIof = round2(totalInterest + totalIof);
            const avgInstallments = round2(totalPaidNoIof / n); // média das parcelas
            const firstInstallment = sNorm[0]?.payment ?? avgInstallments; // parcela inicial estimada (primeira linha do schedule)
            const cet = calculateCET(financed, rawSchedule); // baseSchedule para Price/SAC, s para consórcio

            setSchedule(sNorm);
            setSummary({
                method, annualRate, monthlyRate: r, amount, downPayment: down, type, firstInstallment, avgInstallments, extraAmortization, extraAmortizationType, extraAmortizationMonth, fixedIofPct, dailyIofPct, fixedIof, dailyIof, totalIof, totalPaidNoIof, totalPaidWithIof, totalInterest, totalInterestWithIof, iofWasCapped
                , startDate, insurancePercent, insuranceValue, cet, iofCeiling
            });
        };

        if (values.type === "consorcio") {
            const admin = values.adminPercent ? Number(values.adminPercent) : 0;
            const s = generateConsorcioSchedule(financed, n, admin);
            finalize(s);
            return;
        }

        // PRICE ou SAC: primeiro gera schedule base
        let baseSchedule =
            values.method === "price"
                ? generatePriceSchedule(financed, r, n)
                : generateSacSchedule(financed, r, n);

        // Amortização extra
        if (extraAmortization > 0 && extraAmortizationType && extraAmortizationMonthIndex) {
            baseSchedule = applyExtraAmortization(extraAmortization, extraAmortizationType, extraAmortizationMonthIndex, baseSchedule, method, r, financed, n);
        }

        // finalizar para PRICE/SAC.
        finalize(baseSchedule);
        return;
    };

    const handleReset = () => {
        form.reset();
        setSchedule([]);
        setSummary(null);
    };

    return { form, handleReset, handleSubmit, onSubmit, summary, schedule, isValid, watched, setValue }
}


export type LoansPageController = ReturnType<typeof useLoansPageController>;