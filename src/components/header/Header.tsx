"use client";

import NavMenu from "@/components/header/NavMenu";
import Logo from "@/components/header/Logo";
import { ModeToggle } from "@/components/mode-toggle";
import NavMenuDrop from "./NavMenuDrop";
import { useScreen } from "@/hooks/useScreen";
import { AppSidebarTrigger } from "../sidebar/AppSidebarTrigger";

const Header = () => {
    const screen = useScreen();

    return (
        <header className="bg-transparent">
            <div className="flex justify-between items-center p-2 md:px-8">
                <div className="flex items-center">
                    <AppSidebarTrigger/>
                    <Logo/>
                </div>
                <div className="flex gap-3 items-center">
                    {screen >= 480 &&
                        <NavMenu/>
                    }
                    {screen < 480 &&
                        <NavMenuDrop/>
                    }
                    <ModeToggle/>
                </div>
            </div>
        </header>
    )
}

export default Header;