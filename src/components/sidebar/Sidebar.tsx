"use client";

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
            <SheetTrigger className="pr-3 border-r border-white/40">    
                <img src="/images/calc-icon.png" alt="calculators menu"  className="w-[46px] brightness-150 dark:invert"/>
            </SheetTrigger>
            <SheetContent className="w-[170px] sm:w-[300px]" side={"left"}>
                <SheetHeader>
                    <SheetTitle>Calculators</SheetTitle>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    )
}
