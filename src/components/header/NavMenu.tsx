"use client";

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuLinkStyle
} from "@/components/ui/navigation-menu"
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavMenu = () => {
    const pathname = usePathname();
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem >
                    <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink
                            className={navigationMenuLinkStyle({
                            active: pathname === "/",
                            })}
                        > 
                            Home
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/about" legacyBehavior passHref>
                        <NavigationMenuLink
                            className={navigationMenuLinkStyle({
                            active: pathname === "/about",
                            })}
                        >                        
                            Sobre nós
                        </NavigationMenuLink>
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

export default NavMenu;