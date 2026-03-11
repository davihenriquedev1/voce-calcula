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
            initialContribution: "R$ 1.000,00",
            frequentContribution: "R$ 1.000,00",
            term: "12",
            termType: "months",
            contributionAtStart: true,
            interestRate: "10,00%",
            preConversionSpread: "0,8",
            issuerCreditSpread: "0,35",
            currentSelic: "15,00%",
            currentCdi: "14,90%",
            currentIpca: "4,50%",
            rateAddToIpca: "8,00%",
            cdiPercentCdb: "100,00%",
            cdiPercentLci: "95,00%",
            cdiPercentLca: "92,00%",
            cdiPercentCri: "105,00%",
            cdiPercentCra: "105,00%",
            cdiPercentDebentures: "110,00%",
            cdiPercentDebIncent: "108,00%",
            cdiPercentFundDi: "98,00%",
            adminFeePercent: "0,00%",
            transactionFeePercent:"0,00%",
            iofPercent: "3,00%",
            includeIOF: true,
        }

    });

    const { register, handleSubmit, formState: { errors } } = form;

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => { if (errors && Object.keys(errors).length) console.warn('Form errors (live):', errors); }, [errors]);

    const onSubmit = (values: InvestmentsFormValues) => {
        setLoading(true);
        setResult(null);

        try {
            const parsed = investmentsSchema.parse(values);
            const comparisons = orchestComparisons(parsed);
            setResult({ results: comparisons });
        } catch (err) {
            setResult({ error: (err as Error).message });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        form.reset();
        setResult(null);
    }

    const percentFormat = { format: "percent" as const, options: { inputIsPercent: true as const, maxFracDgts: 2, minFracDgts: 2 } };

    return { form, handleSubmit, onSubmit, handleReset, percentFormat, result, loading, register }
}

export type InvestmentsPageController = ReturnType <typeof  useInvestmentsPageController>;