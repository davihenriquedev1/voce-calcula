import { SocialLink } from "@/components/ui/custom/SocialLink";
import {ContactUsForm } from "./ContactUsForm";

export default function Page () {

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
                        <SocialLink image="/images/facebook.png" name='facebook' route="/"/>
                        <SocialLink image="/images/x.png" name='x' route="/"/>
                        <SocialLink image="/images/instagram.png" name='instagram' route="/"/>
                        <SocialLink image="/images/youtube.png" name='youtube' route="/"/>
                        <SocialLink image="/images/tiktok.png" name='tiktok' route="/"/>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex justify-center items-center">
                <ContactUsForm/>
            </div>
        </div>
    )
}