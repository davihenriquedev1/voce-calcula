"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    dropDownMenuLinkStyle,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";

const NavMenuDrop = () => {
    const pathname = usePathname();
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <MenuIcon/>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem className={dropDownMenuLinkStyle({active: pathname === "/",})}>
                    <Link href="/" legacyBehavior passHref>Home</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className={dropDownMenuLinkStyle({active: pathname === "/sobre",})}>
                    <Link href="/sobre" passHref>Sobre nós</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
export default NavMenuDrop;