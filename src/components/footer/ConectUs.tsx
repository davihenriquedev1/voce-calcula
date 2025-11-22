import { SocialLink } from "@/components/partials/SocialLink";

export const ConectUs = () => {
    return (
        <div className="flex flex-col flex-1 items-center xs:items-start">
            <h3 className="font-bold mb-4">Conecte-se a nós</h3>
            <div className="flex flex-col gap-3 justify-between items-center xs:items-start">
                <p className="tracking-wider text-xs opacity-80">contato@vocecalcula.com.br</p>
                <div className="flex flex-col gap-2 items-center xs:items-start">
                    <div className="flex gap-3">
                        <SocialLink image="/images/facebook.png" name='facebook' route="/"/>
                        <SocialLink image="/images/x.png" name='x' route="/"/>
                        <SocialLink image="/images/instagram.png" name='instagram' route="/"/>
                        <SocialLink image="/images/youtube.png" name='youtube' route="/"/>
                        <SocialLink image="/images/tiktok.png" name='tiktok' route="/"/>
                    </div>
                </div>
            </div>
        </div>
    )
}