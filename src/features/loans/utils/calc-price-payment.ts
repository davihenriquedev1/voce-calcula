export function calcPricePayment(P:number, r:number, n:number) {
    if(r===0) return P/n;
    return (P * r) / (1 - Math.pow(1 + r, -n));
}