import { Frame } from "@/components/partials/Frame";

const Home = () => {
	return (
		<main className="flex flex-col w-full items-center justify-center">

			<section className="flex flex-col w-full py-10 justify-between bg-gray-500/5 md:flex-row gap-1  md:py-14">
				<div className="flex justify-start h-full p-4 md:flex-1 ">
					<div className="text-5xl text-color-palette2 font-bold text-shadow-bottom-left shadow-black/50 sm:text-8xl md:p-5">
						<p>Calcule,</p>
						<p>Simule,</p>
						<p>Resolva.</p>
					</div>
				</div>
				<div className="h-full flex justify-end items-end md:flex-1 ">
					<img src="/images/doll-and-calculator.png" alt="" className="w-[70%] md:w-[90%]"/>
				</div>
			</section>

			<section className="flex flex-col w-full px-4 py-10 gap-8 md:px-10 md:py-14 bg-gradient-to-t from-color-palette1/5 to-gray-500/5">
				
				<div className="flex w-full justify-center items-center ">
					<h2 className="font-extrabold tracking-wide text-center text-4xl md:text-6xl text-color-palette2 text-shadow-bottom-left shadow-black/50">Múltiplas Calculadoras</h2>
				</div>
				<div className="grid grid-cols-2 h-full gap-3 md:grid-cols-3 md:gap-8">
					<Frame route="/bmi" title="Calculadora de IMC" desc="Calcule seu Índice de Massa Corporal."/>
					<Frame route="/scientific" title="Calculadora Cíentífica" desc="Use nossa calculadora avançada."/>
					<Frame route="/investments" title="Calculadora de Investimentos" desc="Calcule seus rendimentos."/>
					<Frame route="/loans" title="Calculadora de Empréstimos" desc="Calcule o quanto você vai pagar."/>
					<Frame route="/currency-conversion" title="Calculadora de Conversão de Moedas" desc="Veja a conversão de Real pra Dólar e muito mais."/>
					<Frame route="/personal-finance" title="Calculadora de Finanças Pessoais" desc="Planeje suas finanças pessoais."/>
				</div>

			</section >

			<section className="flex flex-col w-full px-4 py-10 gap-8 md:px-10 md:py-14 bg-gradient-to-b from-color-palette1/5 to-color-palette1/50">
				<div className="flex justify-center">
					<h2 className="font-extrabold tracking-wide md:text-center text-4xl md:text-6xl text-color-palette4">Funcionalidades Extras</h2>
				</div>
				<div className="flex flex-col md:flex-row flex-1 gap-8 md:gap-10 ">
					<div className="flex flex-col items-center justify-end flex-1 gap-3 ">
						<img src="/images/video-tutorial.png" alt="tutorial-icon" className="h-52 w-auto rounded-lg shadow-xl bg-gradient-to-r from-slate-50/30 to-slate-50/5"/>
						<h3 className="text-xl font-semibold text-center text-color-palette4">Tutorial em Vídeo</h3>
						<p className="text-center text-sm text-foreground mt-2">Assista a um tutorial explicativo sobre como usar as funcionalidades do site.</p>
					</div>
					<div className="flex flex-col items-center justify-center flex-1 gap-3">
						<img src="/images/gráficos.png" alt="grafics-icon" className="h-52 w-auto rounded-lg shadow-xl bg-gradient-to-r from-slate-50/30 to-slate-50/5"/>
						<h3 className="text-xl font-semibold text-center text-color-palette4">Gráficos Interativos</h3>
						<p className="text-center text-sm text-foreground mt-2">Visualize os dados de forma clara e precisa através de gráficos interativos.</p>
					</div>
					<div className="flex flex-col items-center justify-start flex-1 gap-3">
						<img src="/images/pdf.png" alt="pdf download icon" className="h-52 w-auto rounded-lg shadow-xl bg-gradient-to-r from-slate-50/30 to-slate-50/5"/>
						<h3 className="text-xl font-semibold text-center text-color-palette4">Download em PDF</h3>
						<p className="text-center text-sm text-foreground mt-2">Baixe relatórios completos em formato PDF para análise offline.</p>
					</div>
				</div>
			</section>

		</main>
	);
}

export default Home;