"use client";

import { Form } from "@/components/ui/form";
import { CustomInput } from "@/components/ui/custom/CustomInput";
import { maskNumberInput } from "@/utils/mask/mask-number-input";
import { Button } from "@/components/ui/button";
import { BmiPageController } from "../controller";

export const BmiPageForm = ({ controller }: {controller: BmiPageController}) => {
    const { form, handleSubmit, onSubmit, handleReset } = controller;
    
    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex flex-col items-center justify-center gap-4" >
                <div className="w-full flex flex-col sm:flex-row gap-2">
                    <CustomInput form={form} type="text" name="height" label="Altura" description="Digite sua altura (ex: 1,80)" mask={maskNumberInput(1)} formatParams={{format: "unit", unit:"meter"}} maxLength={4}/>
                    <CustomInput form={form} type="text" name="weight" label="Peso" description="Digite seu peso em Kg (78,3)" mask={maskNumberInput(3)}  maxLength={6} formatParams={{format: "unit", unit: "kilogram"}}/>
                </div>
                <div className="w-full flex justify-end gap-2">
                    <Button type="reset" className="font-semibold bg-secondary text-white hover:brightness-150" onClick={() => handleReset()}>Resetar</Button>
                    <Button type="submit" className="font-semibold">Calcular</Button>
                </div>
            </form>
        </Form>
    )
}
