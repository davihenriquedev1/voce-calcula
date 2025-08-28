"use client";

import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";

import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { bmiCategories } from "@/data/bmiData";
import { useEffect, useState } from "react";
import { calculateBmi } from "@/utils/calculators/calculateBmi";
import { BmiCategory } from "@/types/BmiCategory";

const formSchema = z.object({
    height: z.string().min(1, 'preencha a altura').transform((value) => {
        let clean = value.replace(/\./g, ''); // remove pontos de milhar
        clean = clean.replace(',', '.');      // transforma vírgula em ponto
        return parseFloat(parseFloat(clean).toFixed(2));
    }),
    weight: z.string().min(1, 'preencha o peso').transform((value) => {
        let clean = value.replace(/\./g, '');
        clean = clean.replace(',', '.');
        return parseFloat(parseFloat(clean).toFixed(2));
    }),
});

type FormValues = z.infer<typeof formSchema>

const Page = () => {
    const [result, setResult] = useState(0);
    const [category, setCategory] = useState<undefined | BmiCategory>(undefined);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { height: 0, weight: 0 }
    });

    const { handleSubmit } = form;

    function onSubmit(values: FormValues) {
        console.log(values)
        const height = values.height;
        const weight = values.weight;
        const bmi = calculateBmi(height, weight);
        setResult(bmi);
        form.reset({ height: 0, weight: 0 });
    }

    useEffect(() => {
        const currentCategory: BmiCategory | undefined = bmiCategories.find((cat) => result >= cat.min && result <= cat.max);
        setCategory(currentCategory);
    }, [result]);

    const handleReset = () => {
        setResult(0);
        setCategory(undefined);
    }

    return (
        <div className="p-8">
            <h3 className="text-3xl font-bold text-color-palette6/70 dark:text-color-palette3 mb-8">Calculadora de IMC</h3>
            <div className="flex flex-col md:flex-row gap-12 justify-center mt-10">

                <div className="flex justify-center flex-1 md:max-w-[200px]">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col items-center justify-center max-w-[200px]" >
                            <CustomInput form={form} type="text" name="height" label="Altura" description="Digite sua altura (ex: 1,80)" mask={maskNumberInput(1, "unit", "", "meter")} maxLength={4}/>
                            <CustomInput form={form} type="text" name="weight" label="Peso" description="Digite seu peso em Kg (78,3)" mask={maskNumberInput(3, "unit", "", "kilogram")}  maxLength={6}/>
                            <Button type="submit" className="w-full">Calcular</Button>
                            <Button type="reset" className="w-full bg-color-palette5 hover:bg-color-palette5 hover:brightness-150" onClick={() => handleReset()}>Resetar</Button>
                        </form>
                    </Form>
                </div>
                <div className="flex flex-1 justify-center md:max-w-[600px]">
                    {result === 0 &&
                        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-[600px]">
                            {bmiCategories.map((item, key) => (
                                <div className="flex flex-col gap-1 text-white p-5 justify-center items-center text-center rounded-md" style={{ backgroundColor: `${item.color}` }} key={key}>
                                    <div className="text-4xl">{item.emoji}</div>
                                    <div className="text-sm">IMC {item.rangeText}</div>
                                    <div className="font-bold">{item.category}</div>
                                </div>
                            ))}
                        </div>
                    }
                    {result !== 0 && category !== undefined &&
                        <div className="w-full flex flex-col gap-2 text-white p-5 justify-center items-center text-center rounded-md" style={{ backgroundColor: `${category.color}` }}>
                            <div className="text-8xl">{category.emoji}</div>
                            <div className="font-bold text-2xl">Seu IMC é {result}</div>
                            <div className="text-sm opacity-80">IMC {category.rangeText}</div>
                            <div className="font-bold">{category.category}</div>
                        </div>
                    }
                </div>

            </div>
        </div>
    )
}
export default Page;