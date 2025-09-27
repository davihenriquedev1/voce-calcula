"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

// Menu items.
const items = [
    { title: "Calculadora Científica", url: "/scientific", icon: "/images/icons/calc-button-icon.png" },
    { title: "Conversor de Moedas", url: "/currency-conversion", icon: "/images/icons/exchange-rate-button-icon.png" },
    { title: "Empréstimo/Financiamento", url: "/loans", icon: "/images/icons/emprestimo-button-icon.png" },
    { title: "Finanças pessoais", url: "/personal-finance", icon: "/images/icons/personal-finances-button-icon.png" },
    { title: "Índice de Massa Corpórea", url: "/bmi", icon: "/images/icons/bmi-button-icon.png" },
    { title: "Investimentos", url: "/investments", icon: "/images/icons/investments-button-icon.png" }
]

export function AppSidebar() {
	const route = usePathname();
    const { openMobile, setOpenMobile } = useSidebar();

    return (
        <Sidebar className="relative">
            <Button className="font-bold bg-sidebar text-primary absolute left-full rounded-none rounded-br-sm border-r border-b" onClick={() => setOpenMobile(false)}>x</Button>
            <SidebarContent >
                <SidebarGroup>
                    <SidebarGroupLabel className="text-base md:text-2xl text-secondary rounded-none font-bold tracking-wide ">Calculadoras</SidebarGroupLabel>
					<div className="border-b border-b-gray-500/60 my-4"></div>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-3">
                        {items.map((item) => (
                           <SidebarMenuItem key={item.title} className="p-1 ">
								<SidebarMenuButton asChild data-active={route === item.url}>
									<Link href={item.url} className="flex items-center gap-2" onClick={() => setOpenMobile(false)}>
										<div className="p-1 rounded-full bg-sidebar-ring ">
											<img src={item.icon} alt={item.title} className="w-6" />
										</div>
										<span className="tracking-wide font-semibold">
											{item.title}
										</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
                        ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}