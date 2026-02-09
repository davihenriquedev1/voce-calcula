const Page = () => {
    return (
        <div className="flex justify-center px-6 py-16">
            <div className="w-full max-w-3xl space-y-6">
                <h1 className="text-4xl font-bold text-foreground">
                    Sobre o site
                </h1>

                <p className="text-muted-foreground text-lg">
                    Este site foi criado com o objetivo de tornar cálculos do dia a dia
                    mais simples, rápidos e acessíveis.
                </p>

                <p className="text-muted-foreground">
                    A proposta é oferecer calculadoras claras e fáceis de usar, que
                    ajudem no entendimento de valores, simulações e cenários, sem
                    complicação e sem excesso de informação.
                </p>

                <p className="text-muted-foreground">
                    Os resultados apresentados servem como apoio para planejamento,
                    estudo e comparação, e não substituem análises profissionais ou
                    decisões definitivas.
                </p>

                <p className="text-muted-foreground">
                    O site está em constante evolução, com melhorias contínuas e novas
                    calculadoras sendo adicionadas conforme a necessidade dos usuários.
                </p>
            </div>
        </div>
    );
};

export default Page;
