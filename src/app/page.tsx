"use client";

import { Frame } from "@/components/partials/Frame";
import { useTheme } from "next-themes";

const Home = () => {
	const {theme} = useTheme();
	return (
		<div className="flex flex-col w-full items-center justify-center">

			<section className="flex flex-col w-full py-10 justify-between md:flex-row gap-1 md:py-14 bg-bgcalcgreen bg-cover bg-right ">
				<div className="flex justify-start h-full p-4 md:flex-1">
					<div className="text-5xl font-bold sm:text-8xl md:p-5 text-secondary ">
					<p>Calcule,</p>
					<p className="text-primary">Simule,</p>
					<p className="text-foreground">Resolva.</p>
					</div>
				</div>
				<div className="h-full flex justify-end items-end md:flex-1">
					
				</div>
			</section>


			<section className="flex flex-col w-full px-4 py-10 gap-8 md:px-10 md:py-14 ">
				
				<div className="flex w-full justify-center items-center ">
					<h2 className="font-extrabold tracking-wide text-center text-2xl sm:text-4xl md:text-6xl bg-greenScribbleTextBg  bg-cover bg-center">Múltiplas Calculadoras</h2>
				</div>
				<div className="grid grid-cols-2 h-full gap-3 md:grid-cols-3 md:gap-8">
					<Frame route="/bmi" title="Calculadora de IMC" desc="Calcule seu Índice de Massa Corporal." bgColorTitle="bg-chart-5" colorTitle="text-section2" cardIcon="/images/cards/bmi-card.png" bgColor="bg-softgray"/>
					<Frame route="/scientific" title="Calculadora Cíentífica" desc="Use nossa calculadora avançada." bgColorTitle="bg-white" colorTitle="text-section2" bgColor="bg-chart-5" cardIcon="/images/cards/calc-card.png"/>
					<Frame route="/investments" title="Calculadora de Investimentos" desc="Calcule seus rendimentos." bgColorTitle="bg-chart-5"  colorTitle="text-section2" bgColor="bg-softgray" cardIcon="/images/cards/investments-card.png"/>
					<Frame route="/loans" title="Calculadora de Empréstimos" desc="Calcule o quanto você vai pagar." bgColorTitle="bg-popover"  colorTitle="text-section2" bgColor="bg-card-foreground" descColor="text-card" linkColor="text-card" cardIcon="/images/cards/emprestimo-card.png"/>
					<Frame route="/currency-conversion" title="Calculadora de Conversão de Moedas" desc="Veja a conversão de Real pra Dólar e muito mais." bgColor="bg-softgray" bgColorTitle="bg-chart-5" colorTitle="text-section2" cardIcon="/images/cards/exchange-card.png"/>
					<Frame route="/personal-finance" title="Calculadora de Finanças Pessoais" desc="Planeje suas finanças pessoais." bgColorTitle="bg-white" colorTitle="text-section2" bgColor="bg-chart-5" cardIcon="/images/cards/personal-finance-card.png" />
				</div>

			</section >

			<section className="flex flex-col w-full min-h-screen px-4 py-10 gap-8 md:px-10 md:py-14 bg-bgGreenSimbols  bg-cover ">
				<div className="flex justify-center">
					<h2 className="font-extrabold tracking-wide text-center text-2xl sm:text-4xl md:text-6xl bg-background p-1 text-shadow-sm shadow-border">Funcionalidades Extras</h2>
				</div>
				<div className="flex flex-col md:flex-row flex-1 gap-8 md:gap-10 text-white">
					<div className="flex flex-col items-center justify-center flex-1 gap-3 bg-gradient-to-r from-black to-slate-950 rounded-sm p-2">
						<h3 className="text-xl font-semibold text-center text-color-palette4">Tutorial em Vídeo</h3>
						<img src="/images/tutorials-icon-nobg.png" alt="tutorial-icon" className="h-52 w-auto rounded-lg shadow-xl"/>
						<p className="text-center text-sm m-3 text-white/80 font-semibold">Assista a um tutorial explicativo sobre como usar as funcionalidades do site.</p>
					</div>
					<div className="flex flex-col items-center justify-center flex-1 gap-3 bg-gradient-to-r from-black to-slate-950 rounded-sm p-2">
						<h3 className="text-xl font-semibold text-center text-color-palette4">Gráficos Interativos</h3>
						<img src="/images/charts-icon-nobg.png" alt="grafics-icon" className="h-52 w-auto rounded-lg shadow-xl"/>
						<p className="text-center text-sm m-3 text-white/80 font-semibold">Visualize os dados de forma clara e precisa através de gráficos interativos.</p>
					</div>
					<div className="flex flex-col items-center justify-center flex-1 gap-3 bg-gradient-to-r from-black to-slate-950 rounded-sm p-2">
						<h3 className="text-xl font-semibold text-center text-color-palette4">Download em PDF</h3>
						<img src="/images/pdf-icon-nobg.png" alt="pdf download icon" className="h-52 w-auto rounded-lg shadow-xl "/>
						<p className="text-center text-sm m-3 text-white/80 font-semibold">Baixe relatórios completos em formato PDF para análise offline.</p>
					</div>
				</div>
			</section>

		</div>
	);
}

export default Home;