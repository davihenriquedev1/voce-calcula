"use client"

import { NavLink } from "@/components/partials/NavLink";

export const UsefulLinks = () => {
    return (
        <div className="flex flex-col flex-1 md:text-end">
            <h3 className="font-bold mb-4 text-center xs:text-start md:text-end">Links úteis</h3>
            <nav>
                <ul className="flex xs:flex-col gap-2 text-center xs:text-start md:items-end opacity-70">
                    <NavLink route="/sobre" text="Sobre"/>
                    <NavLink route="/contato" text="Contate-nos"/>
                    <NavLink route="/faq" text="FAQ"/>
                    <NavLink route="/politica-de-privacidade" text="Termos e privacidade"/>
                </ul>
            </nav>
        </div>
    )
}