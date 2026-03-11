"use client";

import LoansSummary from "./components/LoansSummary";
import AmortizationTable from "./components/AmortizationTable";
import { useLoansPageController } from "./controller";
import { amortizationTypeOptions, creditOptions } from "./constants/options";
import { LoansPageForm } from "./components/LoansPageForm";

export const LoansPage = () => {
	const controller = useLoansPageController();
	const { summary, schedule  } = controller;

	return (
		<div className="p-2 md:p-8">
			<h1 className="text-3xl font-bold mb-6 break-words ">
				Simulador de Empréstimo / Financiamento / Consórcio
			</h1>

			<section className="flex flex-col gap-8 w-full">
				<div className="max-w-full">
					<LoansPageForm controller={controller}/>
				</div>
				<div className="w-full">
					<div className="bg-contrastgray p-4 rounded border">
						<h3 className="text-xl font-bold mb-2">Resumo</h3>
						{!summary && <div className="text-sm">Faça uma simulação para ver o resultado.</div>}

						{summary && <LoansSummary summary={summary} creditOptions={creditOptions} amortizationTypeOptions={amortizationTypeOptions} />}

						{schedule.length > 0 && <AmortizationTable schedule={schedule} />}
						
					</div>
				</div>
			</section>

			<section className="mt-10 text-sm text-muted-foreground">
				<p>
					Observação: modelo simplificado. Para financiamentos reais considere seguros, tarifas e regime de cobrança específicos da
					instituição. Consórcio aqui é simulado de forma simplificada (parcela = quota + taxa administrativa rateada).
				</p>
			</section>
		</div>
	);
};
