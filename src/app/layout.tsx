import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { MainProvider } from "@/components/MainProvider";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import { LoadingBounce } from "@/components/partials/Loading";

export const metadata: Metadata = {
	title: {
		template: '%s | Você calcula',
		default: 'Você calcula'
	},
	description: "Um site com diversas calculadoras úteis, incluindo calculadora IMC, de investimentos e científica. Acesse agora e facilite seus cálculos!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body className="antialiased bg-background text-foreground">
			<MainProvider>
			{/* Aqui o Provider envolve o layout inteiro */}
				<SidebarProvider >
					<div className="flex min-h-screen w-full">
					{/* Sidebar */}
					<AppSidebar />

					{/* Conteúdo principal */}
					<div className="flex flex-col flex-1">
						<Header />
						<main className="flex-1">
							<Suspense fallback={<LoadingBounce/>}>
								{children}
							</Suspense>
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
