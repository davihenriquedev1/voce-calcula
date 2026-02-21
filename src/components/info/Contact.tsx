"use client";

import { CustomInput } from "@/components/partials/CustomInput";
import { SocialLink } from "@/components/partials/SocialLink";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    message: z.string()
});

const Contact = () => {
    const form = useForm({
        resolver: zodResolver(formSchema),
    });
    
    const {register, handleSubmit } = form;

    const onSubmit = () => {
        
    }
    return (
        <div className="px-2 md:px-8 flex flex-col md:flex-row min-h-screen gap-4">
            <div className=" flex-1 flex items-center relative">
                <div className="absolute inset-0 bg-chart-5 opacity-30" />
                <div className="flex flex-col relative z-10 md:ml-20">
                    <h1 className="text-3xl font-bold text-foreground opacity-100 z-20">Contate-nos</h1>
                    <p className="mt-2 text-muted-foreground font-bold text-sm max-w-md">
                        Tem uma dúvida, ideia ou proposta? Fale com a gente pelos canais abaixo ou envie uma mensagem direto para nosso e-mail pelo formulário.
                    </p>
                    <div className="flex gap-3 mt-3">
                        <SocialLink image="/images/facebook.png" name='facebook' route="/" />
                        <SocialLink image="/images/x.png" name='x' route="/" />
                        <SocialLink image="/images/instagram.png" name='instagram' route="/" />
                        <SocialLink image="/images/youtube.png" name='youtube' route="/" />
                        <SocialLink image="/images/tiktok.png" name='tiktok' route="/" />
                    </div>
                </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <Form {...form}>
                    <form action="" onSubmit={handleSubmit(onSubmit)} className="flex flex-col w-full">
                        <h1 className="text-2xl font-bold text-foreground mb-2 mt-3">Escreva-nos uma mensagem</h1>
                        <CustomInput name="name" type="text" form={form} placeholder="digite seu nome" className="rounded-none" />
                        <CustomInput name="email" type="email" form={form} placeholder="digite seu email" className="rounded-none " />
                        <textarea {...register("message")} name="message" title="message" className="h-48 w-full mt-2 p-2 focus:outline-offset-2 focus:outline outline-chart-5 border border-chart-4 resize-none" placeholder="digite sua messagem"></textarea>
                        <div className="flex justify-end mt-4">
                            <Button className="rounded-none">Enviar</Button>
                        </div>

                    </form>
                </Form>
            </div>
        </div>
    )
}

export default Contact