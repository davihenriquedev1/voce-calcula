// Calcula a TIR aproximada de um fluxo de caixa usando o método de Newton-Raphson
export function calculateTIR(
  cashFlows: number[], // array de fluxos de caixa (negativo = saída, positivo = entrada)
  guess = 0.01,        // chute inicial da taxa de retorno (1% por padrão)
  maxIter = 1000,      // número máximo de iterações para tentar convergir
  tol = 1e-6           // tolerância para considerar que a taxa convergiu
): number {
    let rate = guess;  // inicializa a taxa atual com o chute inicial

    // loop principal de iteração
    for (let i = 0; i < maxIter; i++) {
        let f = 0;    // valor da função NPV (valor presente líquido) para a taxa atual
        let df = 0;   // derivada da função NPV em relação à taxa atual

        // calcula NPV e sua derivada para todos os períodos
        for (let t = 0; t < cashFlows.length; t++) {
            f += cashFlows[t] / Math.pow(1 + rate, t);       // NPV = Σ (fluxo / (1+rate)^t)
            df += -t * cashFlows[t] / Math.pow(1 + rate, t + 1); // derivada de NPV em relação à taxa
        }

        // evita divisão por zero
        if (df === 0) return 0;
        const newRate = rate - f / df; // passo do método de Newton-Raphson

        if (!isFinite(newRate)) return 0; // evita retorno de NaN ou Infinity
        if (Math.abs(newRate - rate) < tol) return newRate; // se convergiu, retorna a taxa

        rate = newRate; // atualiza a taxa para a próxima iteração
    }

    return 0;
}