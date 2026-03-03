import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { BmrFormValues } from './types';
import { bmrSchema } from './schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { calculateBmr } from './utils/calculate-bmr';

export const useBmrPageController = () => {
    const [result, setResult] = useState<number | null>(null);

    const form = useForm<BmrFormValues>({
        resolver: zodResolver(bmrSchema),
        defaultValues: {
            sex: "male",
            age: 0,
            height: 0,
            weight: 0,
        },
    });

    const { handleSubmit } = form;

    const onSubmit: SubmitHandler<BmrFormValues> = (data) => {
        const parsed = bmrSchema.parse(data);

        const result = calculateBmr({
            sex: parsed.sex,
            age: parsed.age!,
            height: parsed.height!,
            weight: parsed.weight!,
        });

        setResult(result);
    }

    const handleReset = () => {
        setResult(null);
        form.reset({
            sex: "male",
            age: 0,
            height: 0,
            weight: 0,
        });
    };

    return {handleReset, onSubmit, handleSubmit, result, form}
}

export type BmrPageController = ReturnType<typeof useBmrPageController>;