"use client";

import React, { useState } from "react";

const faqs = [
    {
        q: "Os cálculos são confiáveis?",
        a: "As calculadoras utilizam fórmulas matemáticas e financeiras padronizadas. Os resultados são estimativas e não substituem a análise de um profissional.",
    },
    {
        q: "Preciso pagar para usar as calculadoras?",
        a: "Não. Todas as calculadoras do site são gratuitas.",
    },
    {
        q: "Meus dados ficam salvos?",
        a: "Não. Nenhuma informação inserida é armazenada. Os cálculos são feitos apenas no seu navegador.",
    },
    {
        q: "Os valores são atualizados automaticamente?",
        a: "Depende da calculadora. Algumas utilizam dados atualizados, outras funcionam apenas com os valores informados.",
    },
    {
        q: "Posso usar os resultados para decisões reais?",
        a: "Os resultados ajudam no planejamento e simulação, mas não substituem uma análise profissional.",
    },
];

const Faq = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="w-full max-w-3xl">
            <h1 className="text-3xl font-bold text-foreground mb-2">
                Perguntas frequentes
            </h1>

            <p className="text-muted-foreground mb-8">
                Clique em uma pergunta para ver a resposta.
            </p>

            <div className="space-y-3">
                {faqs.map((item, index) => {
                    const isOpen = openIndex === index;

                    return (
                        <div
                            key={index}
                            className="rounded-lg border bg-background"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setOpenIndex(isOpen ? null : index)
                                }
                                className="flex w-full items-center justify-between p-4 text-left"
                            >
                                <span className="font-medium text-foreground">
                                    {item.q}
                                </span>
                                <span className="text-xl">
                                    {isOpen ? "−" : "+"}
                                </span>
                            </button>

                            <div
                                className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    }`}
                            >
                                <div className="overflow-hidden px-4 pb-4 text-sm text-muted-foreground">
                                    {item.a}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default Faq