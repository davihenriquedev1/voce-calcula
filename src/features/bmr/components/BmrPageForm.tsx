"use client";

import { Form } from '@/components/ui/form';
import React from 'react';
import { BmrPageController } from '../controller';
import { CustomSelect } from '@/components/ui/custom/CustomSelect';
import { CustomInput } from '@/components/ui/custom/CustomInput';
import { maskNumberInput } from '@/utils/mask/mask-number-input';
import { Button } from '@/components/ui/button';

export const BmrPageForm = ({controller}: {controller: BmrPageController}) => {
    const {handleReset, handleSubmit, onSubmit, form,} = controller;
    
    return (
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
    )
}
