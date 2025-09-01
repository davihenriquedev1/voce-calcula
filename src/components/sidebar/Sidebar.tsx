"use client";

import CalcIcon from '@/svgs/calc-icon.svg';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export const SideBar = () => {
    return (
        <Sheet>
            <SheetTrigger className="pr-1 border-r border-white/40">    
                <CalcIcon className="w-10 fill-primary"/>
            </SheetTrigger>
            <SheetContent className="w-[170px] sm:w-[300px]" side={"left"}>
                <SheetHeader>
                    <SheetTitle>Calculators</SheetTitle>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )   
}
