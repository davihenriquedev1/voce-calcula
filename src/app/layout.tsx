import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { MainProvider } from "@/components/MainProvider";

export const metadata: Metadata = {
	title: {
		template: '%s | Vários Cálculos',
		default: 'Vários Cálculos'
	},
	description: "Um site com diversas calculadoras úteis, incluindo calculadora IMC, de investimentos e científica. Acesse agora e facilite seus cálculos!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
		<body
			className="antialiased bg-background text-foreground"
		>
			<MainProvider>
				<Header/>
				<div className="min-h-[100vh]">
					{children}
				</div>
				<Footer/>
			</MainProvider>
		</body>
		</html>
	);
}