"use client";

import { Form } from "@/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/partials/CustomInput";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { calculateBmr } from "@/utils/calculators/bmr";
import { useState } from "react";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { bmrSchema } from "@/schemas/bmr";
import { BmrFormValues, } from "@/types/bmr";

const Bmr = () => {
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

    return (
        <>
            <h1 className="text-3xl font-bold text-foreground mb-6">
                Calculadora de Taxa Metabólica Basal (BMR)
            </h1>

            <section className="flex flex-col md:flex-row gap-12 justify-center mt-10">
                <div className="flex flex-1 flex-col gap-8">
                    <Form {...form}>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className=" grid grid-cols-1 xs:grid-cols-2 gap-3 w-full"
                        >
                            <CustomSelect
                                name="sex"
                                form={form}
                                label="Sexo"
                                placeholder="selecione"
                                options={[
                                    { label: 'Masculino', value: "male" },
                                    { label: 'Feminino', value: 'female' }
                                ]}
                            />

                            <CustomInput
                                form={form}
                                type="text"
                                name="age"
                                label="Idade"
                                description="Digite sua idade"
                                mask={maskNumberInput(0)}
                                maxLength={3}
                            />

                            <CustomInput
                                form={form}
                                type="text"
                                name="height"
                                label="Altura (cm)"
                                description="Digite sua altura em centímetros (ex: 180)"
                                mask={maskNumberInput(0)}
                                maxLength={3}
                            />

                            <CustomInput
                                form={form}
                                type="text"
                                name="weight"
                                label="Peso (kg)"
                                description="Digite seu peso (ex: 78,3)"
                                mask={maskNumberInput(3)}
                                maxLength={6}
                            />

                            <Button
                                type="reset"
                                className="w-full font-semibold bg-secondary text-white hover:brightness-150"
                                onClick={handleReset}
                            >
                                Resetar
                            </Button>
                            <Button type="submit" className="w-full font-semibold">
                                Calcular
                            </Button>

                        </form>
                    </Form>
                    <div className="flex flex-1 justify-center ">
                        {result !== null && (
                            <div className="w-full max-w-md mx-auto rounded-2xl border bg-card p-6 shadow-sm">
                                <div className="flex flex-col items-center text-center gap-3">

                                    <span className="text-sm font-medium text-muted-foreground">
                                        Taxa Metabólica Basal
                                    </span>

                                    <div className="text-4xl font-bold tracking-tight text-foreground">
                                        {result}
                                        <span className="text-base font-medium text-muted-foreground ml-2">
                                            kcal/dia
                                        </span>
                                    </div>

                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Esse é o gasto calórico estimado do seu corpo em repouso.
                                    </p>

                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex-1">

                </div>

            </section>

            <section className="mt-20">
                <h4 className="text-2xl font-bold mb-6">
                    O que é a Taxa Metabólica Basal?
                </h4>
                <p className="text-sm md:text-base mb-4">
                    A Taxa Metabólica Basal (BMR) representa a quantidade de calorias que
                    seu corpo precisa para manter funções vitais em repouso, como
                    respiração, circulação e funcionamento dos órgãos.
                </p>
                <p className="text-sm md:text-base">
                    Esse valor não considera atividades físicas. Para estimar o gasto
                    calórico total diário, é necessário multiplicar a BMR por um fator de
                    atividade.
                </p>
            </section>
        </>
    );
};

export default Bmr;