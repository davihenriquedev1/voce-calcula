"use client";

import { CurrencyConversionPageForm } from "./components/CurrencyConversionPageForm";
import { useCurrencyConversionPageController } from "./controller";

export const CurrencyConversionPage = () => {
	const controller = useCurrencyConversionPageController();
	const {lastUpdate, errorMessage} = controller;

	return (
		<div className="p-2 md:p-8">
			<h1 className="text-3xl font-bold text-foreground mb-8">Conversor de Moedas</h1>
			<div className="italic">Última atualização: {lastUpdate ? lastUpdate : '...buscando'}</div>
			<div className="flex flex-col md:flex-row gap-12 justify-center mt-10">
				<div className="flex flex-col items-center justify-center flex-1">
					{errorMessage && <div className="text-sm text-destructive ">{errorMessage} :(</div>}
					<CurrencyConversionPageForm controller={controller}/>
				</div>	
				<div className="flex-1">

				</div>
			</div>
		</div>

	);
};