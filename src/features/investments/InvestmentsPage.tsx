"use client";

import { useInvestmentsPageController } from "./controller";
import { ComparisonSummary }from "./components/ComparisonSummary";
import { InvestmentsPageForm } from "./components/InvestmentsPageForm";


export const InvestmentsPage = () => {

    const controller = useInvestmentsPageController();
    const { loading, result, } = controller;

    return (
        <div className="p-2 md:p-8">
            <h1 className="text-3xl font-bold mb-6">Simulador de Investimentos</h1>

            <div className="flex flex-col gap-6">
                <div className="flex-1">
                    <InvestmentsPageForm controller={controller} />
                </div>
                <div className="flex-1">
                    <div className="bg-contrastgray p-4 rounded shadow border border-border">
                        <h3 className="text-xl font-semibold mb-3">Comparação dos Investimentos</h3>

                        {loading && <div>Carregando...</div>}

                        {!loading && !result && <div className="text-sm text-muted-foreground">Preencha o formulário e clique em Calcular para ver o resultado.</div>}

                        {!loading && result && result.results && <ComparisonSummary items={result.results} />}
                    </div>
                </div>
            </div>
        </div>
    );
}
