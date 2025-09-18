/* funções relacionadas às operações básicas, como adição, subtração, multiplicação e divisão */

function add(a:number, b:number):number {
    return a + b;
}

function subtract(a:number, b:number):number {
    return a - b;
}

function multiply(a: number, b: number): number {
    return a * b;
}

function divide(a: number, b: number): number {
    if (b === 0) {
        throw new Error("Divisão por zero não é permitida.");
    }
    return a / b;
}

function complexAdd(a: { real: number; imag: number }, b: { real: number; imag: number }) {
    if (isNaN(a.real) || isNaN(a.imag) || isNaN(b.real) || isNaN(b.imag)) {
        throw new Error("Os números complexos devem ser números válidos.");
    }
    return {
        real: a.real + b.real,
        imag: a.imag + b.imag,
    };
}

function complexSubtract(a: { real: number; imag: number }, b: { real: number; imag: number }) {
    if (isNaN(a.real) || isNaN(a.imag) || isNaN(b.real) || isNaN(b.imag)) {
        throw new Error("Os números complexos devem ser números válidos.");
    }
    return {
        real: a.real - b.real,
        imag: a.imag - b.imag,
    };
}

function complexMultiply(a: { real: number; imag: number }, b: { real: number; imag: number }) {
    if (isNaN(a.real) || isNaN(a.imag) || isNaN(b.real) || isNaN(b.imag)) {
        throw new Error("Os números complexos devem ser números válidos.");
    }
    return {
        real: a.real * b.real - a.imag * b.imag,
        imag: a.real * b.imag + a.imag * b.real,
    };
}

function complexDivide(a: { real: number; imag: number }, b: { real: number; imag: number }) {
    if (isNaN(a.real) || isNaN(a.imag) || isNaN(b.real) || isNaN(b.imag)) {
        throw new Error("Os números complexos devem ser números válidos.");
    }
    const denominator = b.real * b.real + b.imag * b.imag;
    if (denominator === 0) {
        throw new Error("Divisão por zero não é permitida.");
    }
    return {
        real: (a.real * b.real + a.imag * b.imag) / denominator,
        imag: (a.imag * b.real - a.real * b.imag) / denominator,
    };
}

function complexMagnitude(z: { real: number; imag: number }): number {
    if (isNaN(z.real) || isNaN(z.imag)) {
        throw new Error("O número complexo deve ser um número válido.");
    }
    return Math.sqrt(z.real * z.real + z.imag * z.imag);
}

function complexArg(z: { real: number; imag: number }): number {
    if (isNaN(z.real) || isNaN(z.imag)) {
        throw new Error("O número complexo deve ser um número válido.");
    }
    if (z.real === 0 && z.imag === 0) {
        throw new Error('Não é possível calcular o argumento para 0 + 0i.');
    }

    return Math.atan2(z.imag, z.real);
}

function complexPower(z: { real: number; imag: number }, n: number): { real: number; imag: number } {
    if (isNaN(z.real) || isNaN(z.imag)) {
        throw new Error("O número complexo deve ser um número válido.");
    }
    const magnitude = complexMagnitude(z);

    const argument = complexArg(z);
    const resultMagnitude = Math.pow(magnitude, n);
    const resultArgument = argument * n;
    return {
        real: resultMagnitude * Math.cos(resultArgument),
        imag: resultMagnitude * Math.sin(resultArgument),
    };
}

function complexConjugate(a: { real: number; imag: number }) {
    return {
        real: a.real,
        imag: -a.imag,
    };
}

function mod(x:number, y:number):number{
    return x % y;
}

function squareRoot(x: number): number {
    if (x < 0) {
        throw new Error("Não é possível calcular a raiz quadrada de números negativos.");
    }
    const res = Math.sqrt(x);
    return res
}
    
function raise(base: number, ex:number): number {
    if (ex === 0) {
        return 1;
    } else if (ex === 1) {
        return base;
    }

    let res = 1;

    for(let i = 0; i < ex; i++) {
        res *= base;
    }
    return res;
}

function factorial(x:number):number {
    let res = 1;
    while(x > 1) {
        res *= x;
        x--;
    }
    return res
}

function naturalLog(number:number):number | string {
    if (number <= 0) {
      return "O número deve ser maior que zero para calcular o logaritmo.";
    }
    const res = Math.log(number);
    return res;
}

function decimalLog(number:number):number | string {
    if (number <= 0) {
      return "O número deve ser maior que zero para calcular o logaritmo.";
    }
    const res = Math.log10(number);
    return res;
}

//trigonometricas
function seno(angulo:number):number {
    return Math.sin(angulo);
}

function cosseno(angulo:number):number {
    return Math.cos(angulo)
}

function tangente(angulo:number):number {
    return Math.tan(angulo)
}

function senoHiperb(angulo:number):number {
    return Math.sinh(angulo);
}

function cossenoHiperb(angulo:number):number {
    return Math.cosh(angulo);
}

function tangenteHiperb(angulo:number):number {
    return Math.tanh(angulo);
}