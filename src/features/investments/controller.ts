import { useEffect, useState } from 'react';
import { orchestComparisons } from './utils/orchest-comparisons';
import { useForm } from 'react-hook-form';
import { ComparisonItem, InvestmentsFormValues } from './types';
import { investmentsSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';

type Result = {
    results?: ComparisonItem[],
    error?: string
};

export const useInvestmentsPageController = () => {
    const form = useForm<InvestmentsFormValues>({
        resolver: zodResolver(investmentsSchema),
        mode: "onTouched",
        criteriaMode: "all",
        defaultValues: {
            initialContribution: 1000,
            frequentContribution: 0,
            contributionAtStart: true,
            term: 12,
            termType: "months",
            interestRate: 10,
            currentSelic: 13.75,
            currentCdi: 13.65,
            currentIpca: 4.5,
            currentFundDi: 13.65,
            cdiPercent: 100,
            fundDiPercent: 100,
            transactionFeePercent: 0,
            adminFeePercent: 0.0,
            preConversionSpread: 0.8,
            issuerCreditSpread: 0.35,
            compoundingFrequency: "monthly",
            contributionFrequency: "monthly",
            includeIOF: true,
            iofPercent: 3,
            incomeTaxTable: [
                { maxDays: 180, rate: 22.5 },
                { maxDays: 360, rate: 20 },
                { maxDays: 720, rate: 17.5 },
                { maxDays: Infinity, rate: 15 }
            ],
        }

    });

    const { register, handleSubmit, setValue, formState: { errors } } = form;

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => { if (errors && Object.keys(errors).length) console.warn('Form errors (live):', errors); }, [errors]);

    const onSubmit = (values: InvestmentsFormValues) => {
        setLoading(true);
        setResult(null);

        try {
            const parsed = investmentsSchema.parse(values);

            const params = {
                initialContribution: parsed.initialContribution,
                frequentContribution: parsed.frequentContribution ?? 0,
                term: parsed.term,
                termType: parsed.termType,
                contributionAtStart: parsed.contributionAtStart,
                interestRate: parsed.interestRate,
                currentSelic: parsed.currentSelic,
                currentCdi: parsed.currentCdi,
                currentIpca: parsed.currentIpca,
                currentFundDi: parsed.currentFundDi,
                cdiPercent: parsed.cdiPercent,
                fundDiPercent: parsed.fundDiPercent,
                transactionFeePercent: parsed.transactionFeePercent,
                adminFeePercent: parsed.adminFeePercent,
                preConversionSpread: parsed.preConversionSpread,
                issuerCreditSpread: parsed.issuerCreditSpread,
                compoundingFrequency: parsed.compoundingFrequency,
                contributionFrequency: parsed.contributionFrequency,
                includeIOF: parsed.includeIOF,
                iofPercent: parsed.iofPercent,
                incomeTaxTable: parsed.incomeTaxTable,
            };

            const comparisons = orchestComparisons(params);
            setResult({ results: comparisons });
        } catch (err) {
            setResult({ error: (err as Error).message });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setValue("initialContribution", "1.000,00");
        setValue("frequentContribution", "0,00");
        setValue("term", "12");
        setValue("termType", "months");
        setResult(null);
    }

    const percentFormat = { format: "percent" as const, options: { inputIsPercent: true as const, maxFracDgts: 2, minFracDgts: 2 } };

    return { form, handleSubmit, onSubmit, handleReset, percentFormat, result, loading, register }
}

export type InvestmentsPageController = ReturnType <typeof  useInvestmentsPageController>;