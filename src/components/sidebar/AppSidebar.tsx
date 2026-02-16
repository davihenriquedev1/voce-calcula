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
import Image from "next/image";

// Menu items.
const items = [
    { title: "Conversor de Moedas", url: "/conversor-de-moedas", icon: "/images/icons/exchange-rate-button-icon.png" },
    { title: "Empréstimo/Financiamento", url: "/emprestimos", icon: "/images/icons/emprestimo-button-icon.png" },
    { title: "Investimentos", url: "/investimentos", icon: "/images/icons/investments-button-icon.png" },
    { title: "Taxa Metabólica Basal", url: "/taxa-basal", icon: "/images/icons/bmr-button-icon.png" },
    { title: "Índice de Massa Corpórea", url: "/imc", icon: "/images/icons/bmi-button-icon.png" },
    { title: "Calculadora Científica", url: "/calculadora-cientifica", icon: "/images/icons/calc-button-icon.png" },
]

export function AppSidebar() {
	const route = usePathname();
    const { setOpenMobile } = useSidebar();

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
											<Image width={24} height={24} src={item.icon} alt={item.title} className="w-6" />
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