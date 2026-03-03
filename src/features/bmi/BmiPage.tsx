"use client";

import { BmiCategoriesGrid } from "./components/BmiCategoriesGrid";
import { BmiPageForm } from "./components/BmiPageForm";
import { BmiResult } from "./components/BmiResult";
import { bmiCategories } from "./constants/categories";
import { useBmiPageController } from "./controller";

export const BmiPage = () => {
    const controller = useBmiPageController();
    const { category, result } = controller;

    return (
        <div className="p-2 md:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Calculadora de IMC</h1>
            <section className="flex flex-col md:flex-row gap-12 justify-center mt-10">
                <div className="flex justify-center flex-1">
                    <BmiPageForm controller={controller} />
                </div>
                <div className="flex flex-1 justify-center">
                    {result === null &&
                        <BmiCategoriesGrid categories={bmiCategories}/>
                    }
                    {result !== null && category !== undefined &&
                       <BmiResult category={category} result={result}/>
                    }
                </div>
            </section>
            <section className="flex flex-col md:flex-row gap-12 justify-center mt-20">
                <div className="tracking-wider">
                    <h4 className="text-2xl font-bold text-foreground 3 mb-8">Mas calma, isso não quer dizer que você está <strong className="text-primary">&#34;gordo(a)&#34;</strong> ou <strong className="text-primary">&#34;magro(a)&#34;</strong></h4>
                    <p className="text-sm md:text-base mb-4">
                        O <strong className="text-primary">IMC (Índice de Massa Corporal)</strong> é uma fórmula simples que relaciona peso e altura: IMC = peso ÷ altura². Ele foi criado como uma forma rápida de avaliar se o peso de uma pessoa está dentro de um intervalo considerado “saudável”. Apesar de ser útil para estudos populacionais, não é um parâmetro confiável para saber se alguém está “gordo” ou em boa forma física, porque <strong className="text-primary">não diferencia massa muscular, gordura ou água corporal</strong>.
                    </p>
                    <p className="text-sm md:text-base">
                        Por exemplo, atletas muito musculosos podem ter um IMC alto e ainda assim serem extremamente saudáveis, enquanto pessoas com pouca musculatura e mais gordura podem ter um IMC considerado normal e ainda assim apresentar riscos à saúde. Além disso, o IMC não leva em conta <strong className="text-primary">distribuição de gordura, idade ou sexo</strong>, fatores que influenciam diretamente a saúde. Ou seja, ele serve apenas como uma referência geral, não substituindo avaliações mais precisas como percentual de gordura, circunferência abdominal ou exames médicos.
                    </p>
                </div>
            </section>
        </div>
    )
}
