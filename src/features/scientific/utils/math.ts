import { Complex } from "../types";

export function add(a: number | Complex, b: number | Complex): Complex {
    const ca = toComplex(a), cb = toComplex(b);
    return { re: ca.re + cb.re, im: ca.im + cb.im };
}

export function subtract(a: number | Complex, b: number | Complex): Complex {
    const ca = toComplex(a), cb = toComplex(b);
    return { re: ca.re - cb.re, im: ca.im - cb.im };
}

export function multiply(a: number | Complex, b: number | Complex): Complex {
    const ca = toComplex(a), cb = toComplex(b);
    return {
        re: ca.re * cb.re - ca.im * cb.im,
        im: ca.re * cb.im + ca.im * cb.re
    };
}

export function divide(a: number | Complex, b: number | Complex): Complex {
    const ca = toComplex(a), cb = toComplex(b);
    const denom = cb.re * cb.re + cb.im * cb.im;
    if (denom === 0) throw new Error("Divisão por zero não permitida");
    return {
        re: (ca.re * cb.re + ca.im * cb.im) / denom,
        im: (ca.im * cb.re - ca.re * cb.im) / denom
    };
}

export function mod(a: number | Complex, b: number | Complex): Complex {
    const ca = toComplex(a), cb = toComplex(b);
    if (ca.im !== 0 || cb.im !== 0) throw new Error("mod só definido para reais");
    return { re: ca.re % cb.re, im: 0 };
}

export function raise(base: number | Complex, exp: number | Complex): Complex {
    const b = toComplex(base), e = toComplex(exp);
    if (e.im === 0 && Number.isInteger(e.re) && e.re >= 0) {
        const maxExp = 1e6;
        if (e.re > maxExp) throw new Error("Expoente muito grande para computar");

        let expInt = Math.floor(e.re);
        let result: Complex = {re:1, im:0};
        let baseC: Complex = b;
        while (expInt > 0) {
            if(expInt % 2 === 1) result = multiply(result, baseC);
            baseC = multiply(baseC, baseC);
            expInt = Math.floor(expInt / 2);
        }
        return result 
    }
    // fórmula geral: b^e = exp(e * ln(b))
    const lnB = naturalLog(b);
    return expComplex(multiply(e, lnB));
}

export function factorial(x: number | Complex): Complex | string {
    const c = toComplex(x);
    if (c.im !== 0) throw new Error("Fatorial só definido para reais");
    if (c.re < 0 || !Number.isInteger(c.re)) throw new Error("Fatorial inválido");

    const n = Math.floor(c.re);

    // Para valores pequenos mantemos Number (até 170! evita Infinity)
    if (n <= 170) {
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return { re: res, im: 0 };
    }

    // Para valores grandes, usar BigInt e formatar a saída como string
    let res = BigInt(1);
    const limit = BigInt(n);
    for (let i = BigInt(2); i <= limit; i++) res *= i;

    return formatBigNumber(res); // string formatada (ex: "6.3507e+3175")
}

export function squareRoot(x: number | Complex): Complex {
    const c = toComplex(x);
    if (c.im === 0 && c.re >= 0) return { re: Math.sqrt(c.re), im: 0 };
    const r = Math.sqrt(Math.hypot(c.re, c.im));
    const theta = Math.atan2(c.im, c.re) / 2;
    return { re: r * Math.cos(theta), im: r * Math.sin(theta) };
}

export function naturalLog(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: Math.log(Math.hypot(c.re, c.im)), im: Math.atan2(c.im, c.re) };
}

export function logBase(x: number | Complex, base: number | Complex): Complex {
    return divide(naturalLog(x), naturalLog(base));
}

export function factorizeInteger(nInput: number | bigint): string {
    let n = typeof nInput === "bigint" ? nInput : BigInt(Math.floor(nInput));
    
    const LIMIT =  BigInt(10) ** BigInt(14); // se maior que isso, apenas retorna notação
    if (n > LIMIT) return formatBigNumber(n);

    const factors: bigint[] = [];
    while (n % BigInt(2) === BigInt(0)) { 
        factors.push(BigInt(2)); 
        n /= BigInt(2); 
    }

    let p = BigInt(3);
    while (p * p <= n) {
        while (n % p === BigInt(0)) {
            factors.push(p);
            n /= p;
        }
        p += BigInt(2);
    }
    if (n > BigInt(1)) factors.push(n);

    return factors.map(f => formatBigNumber(f)).join(" × ");
}

export const toComplex = (x: number | Complex): Complex =>
    typeof x === "number" ? { re: x, im: 0 } : x;

export const isComplex = (x: number | Complex): x is Complex => 
    typeof x !== "number";

export function arg(x: number | Complex): Complex {
    const c = toComplex(x);
    if (c.re === 0 && c.im === 0) throw new Error("arg indefinido para 0");
    return { re: Math.atan2(c.im, c.re), im: 0 };
}

export function absolute(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: Math.hypot(c.re, c.im), im: 0 };
}

export function conjugate(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: c.re, im: -c.im };
}

export function expComplex(x: number | Complex): Complex {
    const c = toComplex(x);
    const er = Math.exp(c.re);
    return { re: er * Math.cos(c.im), im: er * Math.sin(c.im) };
}

export function real(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: c.re, im: 0 };
}

export function imag(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: c.im, im: 0 };
}

export function sine(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: Math.sin(c.re) * Math.cosh(c.im), im: Math.cos(c.re) * Math.sinh(c.im) };
}

export function cosine(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: Math.cos(c.re) * Math.cosh(c.im), im: -Math.sin(c.re) * Math.sinh(c.im) };
}

export function tangent(x: number | Complex): Complex {
    return divide(sine(x), cosine(x));
}

export function sineHiperb(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: Math.sinh(c.re) * Math.cos(c.im), im: Math.cosh(c.re) * Math.sin(c.im) };
}

export function cosineHiperb(x: number | Complex): Complex {
    const c = toComplex(x);
    return { re: Math.cosh(c.re) * Math.cos(c.im), im: Math.sinh(c.re) * Math.sin(c.im) };
}

export function tangentHiperb(x: number | Complex): Complex {
    return divide(sineHiperb(x), cosineHiperb(x));
}

export function formatBigNumber(n: number | bigint, sigDigits = 4): string {
  // bigint
    if (typeof n === "bigint") {
        const s = n.toString();
        if (s.length <= 12) return s;
        const exp = s.length - 1;
        const mant = `${s[0]}.${s.slice(1, 1 + sigDigits)}`;
        return `${mant}e+${exp}`;
    }

    // number
    if (!Number.isFinite(n)) return String(n);
    const abs = Math.abs(n);
    if (Number.isInteger(n)) {
        if (abs >= 1e12) return n.toExponential(6);
        return n.toString();
    } else {
        if (abs >= 1e12) return n.toExponential(6);
        if (Math.abs(n) < 1e-12) return "0";
        return parseFloat(n.toFixed(12)).toString();
    }
}
