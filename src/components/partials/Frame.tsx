import Link from "next/link"
import { Button } from "../ui/button"

type Props = {
    route:string,
    title?:string,
    desc?:string,
    bg?:string
}

export const Frame = ({route, title, desc, bg}:Props) => {

    return (
        <div className={`flex flex-1 flex-col p-4 gap-3 justify-between shadow-lg shadow-black/40 rounded-lg hover:scale-105 transition-all ease-in-out duration-700 ${bg ? 'bg-cover bg-center':'bg-gradient-to-r from-slate-50/40 to-slate-200/40'} lg:flex-row`} style={bg ? {background: `url(${bg})`} : {}}>
            <div className="flex flex-col">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="text-sm mb-4 text-secondary-foreground">{desc}</p>
            </div>
            <Button type="button" className="bg-color-palette2 text-white px-4 py-2 rounded font-bold hover:brightness-105 transition-all">
                <Link href={route?route:'/'}>Acessar</Link>
            </Button>
		</div>
    )
}