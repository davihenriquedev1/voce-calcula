"use client";

import { BmrPageForm } from "./components/BmrPageForm";
import { BmrResult } from "./components/BmrResult";
import { useBmrPageController } from "./controller";

export const BmrPage = () => {
    const controller = useBmrPageController();
    const {result} = controller;

    return (
        <div className="p-2 md:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">
                Calculadora de Taxa Metabólica Basal (BMR)
            </h1>

            <section className="flex flex-col md:flex-row gap-12 justify-center mt-10">
                <div className="flex flex-1 flex-col gap-8">
                    <div className="flex flex-1 justify-center ">
                        <BmrPageForm controller={controller}/>
                    </div>
                    <div className="flex flex-1 justify-center ">
                        {result !== null && (
                            <BmrResult result={result}/>
                        )}
                    </div>
                </div>
                <div className="flex-1">
                    
                </div>
            </section>
            <section className="mt-20">
                <h4 className="text-2xl font-bold mb-6">
                    O que é a Taxa Metabólica Basal?
                </h4>
                <p className="text-sm md:text-base mb-4">
                    A Taxa Metabólica Basal (BMR) representa a quantidade de calorias que
                    seu corpo precisa para manter funções vitais em repouso, como
                    respiração, circulação e funcionamento dos órgãos.
                </p>
                <p className="text-sm md:text-base">
                    Esse valor não considera atividades físicas. Para estimar o gasto
                    calórico total diário, é necessário multiplicar a BMR por um fator de
                    atividade.
                </p>
            </section>
        </div>
    );
};