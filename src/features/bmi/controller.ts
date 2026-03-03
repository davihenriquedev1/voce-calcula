import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { bmiSchema } from "./schema";
import { useState } from "react";
import { BmiFormValues } from "./types";
import { calculateBmi } from "./utils/calculate-bmi";
import { bmiCategories } from "./constants/categories";

export const useBmiPageController = () => {
    const [result, setResult] = useState<number | null>(null);

    const form = useForm<BmiFormValues>({
        resolver: zodResolver(bmiSchema),
        defaultValues: { height: 0, weight: 0 }
    });

    const { handleSubmit } = form;

    const onSubmit = (values: BmiFormValues) => {
        if (!values.height || !values.weight) return;
        const bmi = calculateBmi(values.height, values.weight);
        setResult(bmi);
    }

    const category =
        result !== null
            ? bmiCategories.find(
                (cat) => result >= cat.min && result <= cat.max
            )
            : undefined;

    const handleReset = () => {
        setResult(0);
        form.reset({ height: 0, weight: 0 });
    }

    return { form, result, handleReset, handleSubmit, onSubmit, category }
}   

export type BmiPageController = ReturnType<typeof useBmiPageController>;