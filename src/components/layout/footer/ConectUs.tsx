import { SocialLink } from "../../ui/custom/SocialLink"

export const ConectUs = () => {
    return (
        <div className="flex flex-col flex-1 items-center xs:items-start">
            <h3 className="font-bold mb-4">Conecte-se a nós</h3>
            <div className="flex flex-col gap-3 justify-between items-center xs:items-start">
                <p className="tracking-wider text-xs opacity-80">vocecalcula@gmail.com</p>
                <div className="flex flex-col gap-2 items-center xs:items-start">
                        <div className="flex gap-3">
                            <SocialLink image="/images/instagram.png" name='instagram' route="https://www.instagram.com/vocecalcula"/>
                            <SocialLink image="/images/youtube.png" name='youtube' route="https://www.youtube.com/@vocecalcula"/>
                            <SocialLink image="/images/tiktok.png" name='tiktok' route="https://www.tiktok.com/@vocecalcula"/>
                        </div>
                </div>
            </div>
        </div>
    )
}