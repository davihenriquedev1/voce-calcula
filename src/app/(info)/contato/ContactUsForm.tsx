"use client";

import { Button } from '@/components/ui/button'
import { CustomInput } from '@/components/ui/custom/CustomInput'
import { useContactUsController } from './useContactUsController'
import { Form } from '@/components/ui/form';

export const ContactUsForm = () => {
    const {form, handleSubmit, onSubmit, register} = useContactUsController();

    return (
        <Form {...form}>
            <form action="" onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full">
                <h1 className="text-2xl font-bold text-foreground mb-2 mt-3">Escreva-nos uma mensagem</h1>
                <CustomInput name="name" type="text" form={form} placeholder="digite seu nome" className="rounded-none"/>
                <CustomInput name="email" type="email" form={form} placeholder="digite seu email" className="rounded-none "/>
                <textarea {...register("message")} name="message" title="message" className="h-48 w-full mt-2 p-2 focus:outline-offset-2 focus:outline outline-chart-5 border border-chart-4 resize-none" placeholder="digite sua messagem"></textarea>
                <div className="flex justify-end mt-4">
                    <Button className="rounded-none">Enviar</Button>
                </div>
                
            </form>
        </Form> 
    )
}