export function calculateTIR(
  cashFlows: number[],
  guess = 0.01,
  maxIter = 1000,
  tol = 1e-6
): number {
    let rate = guess;

    for (let i = 0; i < maxIter; i++) {
        let f = 0;
        let df = 0;

        for (let t = 0; t < cashFlows.length; t++) {
            f += cashFlows[t] / Math.pow(1 + rate, t);  
            df += -t * cashFlows[t] / Math.pow(1 + rate, t + 1);
        }

        if (df === 0) return 0;
        const newRate = rate - f / df;

        if (!isFinite(newRate)) return 0;
        if (Math.abs(newRate - rate) < tol) return newRate; 
        rate = newRate; 
    }

    return 0;
}