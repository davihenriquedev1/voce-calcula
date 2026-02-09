const Page = () => {
    return (
        <div className="flex justify-center px-6 py-12">
            <div className="w-full max-w-4xl space-y-10">
                <h1 className="text-4xl font-bold text-foreground">
                    Política de Privacidade e Termos de Uso
                </h1>
                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Política de Privacidade
                    </h2>

                    <p className="text-muted-foreground">
                        Este site de calculadoras respeita a sua privacidade. Nenhuma
                        informação inserida nas calculadoras é armazenada, compartilhada ou
                        utilizada para qualquer outro fim além do próprio cálculo.
                    </p>

                    <p className="text-muted-foreground">
                        Os dados informados são processados apenas no seu navegador e não
                        ficam salvos em servidores ou bancos de dados.
                    </p>

                    <p className="text-muted-foreground">
                        Podemos coletar informações técnicas de forma automática, como tipo
                        de navegador e dispositivo, apenas para fins estatísticos e de
                        melhoria da experiência do usuário.
                    </p>
                </section>
                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Termos de Uso
                    </h2>

                    <p className="text-muted-foreground">
                        Ao utilizar este site, você concorda que os resultados fornecidos
                        pelas calculadoras são apenas estimativas e não substituem análises
                        profissionais, financeiras, contábeis ou técnicas.
                    </p>

                    <p className="text-muted-foreground">
                        O uso das calculadoras é gratuito e destinado exclusivamente para
                        fins informativos, educacionais e de simulação.
                    </p>

                    <p className="text-muted-foreground">
                        Não nos responsabilizamos por decisões tomadas com base nos
                        resultados apresentados neste site.
                    </p>
                </section>

                {/* Disclaimer */}
                <section className="space-y-3">
                    <h2 className="text-2xl font-semibold text-foreground">
                        Isenção de Responsabilidade
                    </h2>

                    <p className="text-muted-foreground">
                        Embora busquemos manter os cálculos corretos e atualizados, não
                        garantimos que os resultados estejam livres de erros ou reflitam
                        condições reais específicas de cada usuário.
                    </p>

                    <p className="text-muted-foreground">
                        Recomendamos que qualquer decisão importante seja tomada com base em
                        análise própria ou com o auxílio de um profissional qualificado.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Page;
