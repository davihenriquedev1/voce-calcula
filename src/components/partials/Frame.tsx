
import Link from "next/link"
import { Button } from "../ui/button"

type Props = {
    route:string,
    bg?:string,
    bgColor?: string,
    title?:string,
    colorTitle?: string
    bgColorTitle?: string,
    desc?:string,
    descColor?: string,
    linkColor?: string,
    cardIcon?: string
    cardIconTheme?: string | undefined
}

export const Frame = ({route, title, desc, bg, bgColor, colorTitle, bgColorTitle, cardIcon, descColor, linkColor, cardIconTheme}:Props) => {

    return (
        <div className={`flex flex-1 flex-col p-4 gap-3 justify-between shadow-lg shadow-black/40 rounded-lg hover:scale-105 transition-all ease-in-out duration-700 ${bgColor ? bgColor: 'bg-gradient-to-r from-slate-50/40 to-slate-200/40'} ${bg ? 'bg-cover bg-center':''} lg:flex-row`} style={bg ? {background: `url(${bg})`} : {}}>
            <div className="flex flex-col justify-between">
                <div className="flex-col">
                    <h2 className={`text-md font-semibold mb-2 p-1 rounded-sm ${colorTitle ? colorTitle : 'text-foreground'} ${bgColorTitle ? bgColorTitle : 'bg-slate-300'}`}>{title}</h2>
                    <p className={`text-sm mb-2 p-1 ${descColor ? descColor : 'text-card-foreground'}`}>{desc}</p>
                </div>
                <Button type="button" className="px-0 w-fit bg-transparent justify-start py-2 rounded font-bold hover:brightness-105 transition-all">
                    <img src="/images/icons/icon-go-to-page.png" className="w-8"alt="" />
                    <Link href={route?route:'/'} className={`${linkColor ? linkColor : 'text-foreground'}`} >
                       Acessar
                    </Link>
                </Button>
            </div>
            <div className="flex h-full justify-end items-center">
                <img src={cardIcon} alt="" className={`w-24 md:w-36 ${cardIconTheme === 'light' || cardIconTheme === 'system' ? 'invert' : ''}`}/>
            </div>
            
		</div>  
    )
}