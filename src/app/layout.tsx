import type { Metadata } from "next";
import "./globals.css";
import { MainProvider } from "@/providers/MainProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/AppSidebar";
import Header from "@/components/layout/header/Header";
import { Footer } from "@/components/layout/footer/Footer";
import PageTransition from "@/components/layout/PageTransition";

export const metadata: Metadata = {
	title: {
		template: '%s | Você Calcula',
		default: 'Você Calcula'
	},
	description: "Um site com diversas calculadoras úteis, incluindo calculadora IMC, de investimentos e científica. Acesse agora e facilite seus cálculos!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body className="antialiased bg-background text-foreground">
			<MainProvider>
				<SidebarProvider >
					<div className="flex w-full">
						{/* Sidebar */}
						<AppSidebar />

						{/* Conteúdo principal */}
						<div className="flex flex-col flex-1">
							<Header />
							<main className="flex-1 animate-in fade-in duration-300">
								<PageTransition>
									{children}
								</PageTransition>
							</main>
							<Footer />
						</div>
					</div>
				</SidebarProvider>
			</MainProvider>
		</body>
		</html>
	);
}
