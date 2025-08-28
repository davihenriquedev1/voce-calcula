"use client";

import NavMenu from "@/components/header/NavMenu";
import Logo from "@/components/header/Logo";
import { ModeToggle } from "@/components/mode-toggle";
import { SideBar } from "../sidebar/Sidebar";
import NavMenuDrop from "./NavMenuDrop";
import { useScreen } from "@/hooks/useScreen";

const Header = () => {
    const screen = useScreen();

    return (
        <header className="">
            <div className="flex justify-between items-center p-2 bg-color-palette1/50 ">
                <div className="flex items-center">
                    <SideBar/>
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