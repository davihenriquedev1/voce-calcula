"use client";

import NavMenuDrop from "./NavMenuDrop";
import { AppSidebarTrigger } from "../sidebar/AppSidebarTrigger";
import Logo from "./Logo";
import NavMenu from "./NavMenu";
import { ModeToggle } from "./ModeToggle";
import { useScreen } from "@/hooks/use-screen";

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