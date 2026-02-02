import { Button } from "@/components/ui/button";

export default function Page() {
    return (
        <div className=" w-full h-full flex justify-center items-center">
            <div className="rounded-md shadow-zinc-700 p-6 flex flex-col gap-3 justify-center items-center w-50 bg-softgray bg-opacity-30">
                <a href='/investimentos/renda-fixa'>
                    <Button className="font-semibold">Renda Fixa ⇢ </Button>
                </a>
                <a href='/investimentos/renda-variavel'>
                    <Button className="font-semibold">Renda Variável ⇢ </Button>
                </a>
            </div>
        </div>
    )
}