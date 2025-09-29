type ExpToken =
        | { type: "number"; value: number }                     // números normais
        | { type: "operator"; value: "+" | "-" | "/" | "^" | "*" | "mod" | "!"} // operadores
        | { type: "unary"; value: "neg" | "pos"} // operadores unários
        | { type: "percent" ; value: "%" } 
        | { type: "comma" ; value: "," } 
        | { type: "function"; value: "cos" | "sin" | "tan" | "cosh" | "sinh" | "tanh" | "abs" | "factor" | "log" | "ln" | "sqrt"}                   // funções
        | { type: "constant"; value: "pi" | "e" | "i" }          // constantes matemáticas
        | { type: "complex"; value: "re" | "im" | "arg" | "conj" } // funções de número complexo
        | { type: "paren"; value: "(" | ")" };                 // parênteses

type Complex = { re: number; im: number };

export const evaluateSafe = (expression:string): { ok: true; result: string } | { ok: false; error: string } => {
    const formatResult = (value: number | { re: number; im: number } | string): string => {
        if (typeof value === "string") {
            return value;
        }
        if (typeof value === "number") {
            if (Object.is(value, -0)) return "0";
            if (Math.abs(value) < 1e-12) return "0";
            // usa formatBigNumber para inteiros grandes / floats
            if (Number.isInteger(value)) return formatBigNumber(value);
            return parseFloat(value.toFixed(12)).toString();
        }

        // Complex
        const reIsInt = Number.isInteger(value.re);
        const imIsInt = Number.isInteger(value.im);

        const reStr = reIsInt ? formatBigNumber(value.re) : parseFloat(value.re.toFixed(12)).toString();
        const imStr = imIsInt ? formatBigNumber(value.im) : parseFloat(value.im.toFixed(12)).toString();

        if (Math.abs(value.re) < 1e-12 && Math.abs(value.im) < 1e-12) return "0";
        if (Math.abs(value.im) < 1e-12) return reStr;
        if (Math.abs(value.re) < 1e-12) return `${imStr}i`;
        const sign = value.im >= 0 ? "+" : "-";
        return `${reStr}${sign}${Math.abs(Number(imStr))}i`;

    }

    try {
        const raw = calculateExpression(expression);
        return {ok: true, result: formatResult(raw)};
    } catch (err: any) {
        const msg = (err && err.message) ? err.message : String(err);
        return {ok: false, error: msg};
    }
}

function calculateExpression (expression: string) : number | Complex | string  {
    // Tokenizar: transforma a string em unidades entendíveis.
    const tokens = tokenize(expression);
    // Shunting Yard: garante que a precedência e associatividade sejam respeitadas
    const rpn = shuntingYard(tokens);
    // Retorna a avaliação em RPN (que empilha e desempilha valores)
    return evalRPN(rpn);
}

function tokenize(expression: string) {
    const tokens: ExpToken[] = [];
    let i = 0;

    const isOperator = (t: ExpToken): t is { type: "operator"; value: "+" | "-" | "/" | "^" | "*" | "mod" | "!" } =>
    t.type === "operator";
    // helper para inserir token respeitando multiplicação implícita
    const pushToken = (tk: ExpToken) => {
        const prev = tokens[tokens.length - 1];

        const prevAllowsImplicit = !!prev && prev.type !== "comma" && (
            prev.type === "number" ||
            prev.type === "constant" ||
            (prev.type === "paren" && prev.value === ")") ||
            prev.type === "percent"
        );

        const nextIsProductStarter = (
            tk.type === "constant" ||
            tk.type === "function" ||
            (tk.type === "paren" && tk.value === "(") ||
            tk.type === "complex"
        );
        if (prevAllowsImplicit && nextIsProductStarter && !(isOperator(prev) && (prev as any).value === "^")) {
            tokens.push({ type: "operator", value: "*" } as any);
        }
        tokens.push(tk);
    };
    
    //  Percorrer a string do início ao fim
    while (i < expression.length) {
        const char = expression[i]; 

        // Ignorar espaços 
        if(char === " ") {i++; continue;}

        // Reconhecer números → pegar dígitos e ponto decimal
        if(/\d/.test(char) || char === ".") {
            let numStr = char;
            i++;
            let dotCount = char === "." ? 1 : 0;

            while(i < expression.length && /[\d.]/.test(expression[i])) {
                if(expression[i] === ".") {
                    dotCount++;
                    if(dotCount > 1) break;
                }
                numStr += expression[i++];
            }

            // captura expoente completo somente se houver dígitos depois do e/E
            if (i < expression.length && (expression[i] === "e" || expression[i] === "E")) {
            const rest = expression.slice(i);
            const m = rest.match(/^[eE][+-]?\d+/);
                if (m) {
                    numStr += m[0];      // exemplo: "e-10"
                    i += m[0].length;
                }
            }

            const parsed = parseFloat(numStr);
            if (Number.isNaN(parsed)) throw new Error("Número inválido: " + numStr);

            pushToken({ type: "number", value: parsed });
            continue;
        }

        // Vírgula (argument separator)
        if (char === ",") {
            pushToken({ type: "comma", value: "," });
            i++;
            continue;
        }

        // operadores
        if(["+","-","÷","^","×","!"].includes(char)) {
            let prev = tokens[tokens.length - 1];
            const isUnary = !prev || prev.type === "operator" || prev.type === "unary" || prev.type === "comma" || (prev.type === "paren" && prev.value === "(");   

            if (isUnary && (char === "+" || char === "-")) {
                pushToken({ type: "unary", value: char === "-" ? "neg" : "pos" });
            }  else if (char === "×") {
                pushToken({ type: "operator", value: "*" } as any);
            } else if (char === "÷") {
                pushToken({ type: "operator", value: "/" } as any);
            } else {
                pushToken({ type: "operator", value: char as any });
            }
            i++;
            continue;
        }

        if (char === "%") {
            pushToken({ type: "percent", value: "%" });
            i++;
            continue;
        }
                
        // parenteses
        if (char === "(") {
            let j = i + 1;
            while (j < expression.length && expression[j] === " ") j++; // pula espaços
            const nextChar = expression[j];
            if (nextChar === undefined) throw new Error("Parêntese vazio '()' não permitido");
            if (["*", "/", "^", "×", "÷", "!", ","].includes(nextChar)) {
                throw new Error(`Caractere '${nextChar}' inválido no início de parêntese`);
            }
            pushToken({ type: "paren", value: "(" });
            i++;
            continue;
        }
        if (char === ")") {
            // antes de empurrar ')', garante que exista algo útil entre parênteses:
            const prev = tokens[tokens.length - 1];
            if (!prev) throw new Error("Parêntese fechado sem conteúdo");
            // se o token anterior for operador/unário/virgula ou um '(' aberto -> parêntese vazio ou inválido
            if (prev.type === "operator" || prev.type === "unary" || prev.type === "comma" || (prev.type === "paren" && prev.value === "(")) {
                throw new Error("Parêntese fechado sem conteúdo válido ou com operador solto");
            }

            pushToken({ type: "paren", value: ")" });
            i++;
            continue;
        }

        // Funções, complexos e mod
        if (/[a-zA-Z]/.test(char)) {
            let ident = char;
            i++;
            while (i < expression.length && /[a-zA-Z]/.test(expression[i])) {
                ident += expression[i++];
            }
            ident = ident.toLowerCase();

            if (["cos","sin","tan","cosh","sinh","tanh","abs","factor","log","ln"].includes(ident)) {
                pushToken({ type: "function", value: ident as any });
                continue;
            }
            if (["re","im","arg","conj"].includes(ident)) {
                pushToken({ type: "complex", value: ident as any });
                continue;
            }
            if (ident === "mod") {
                pushToken({ type: "operator", value: "mod" } as any);
                continue;
            }
            if (["e", "i"].includes(ident)) {
                pushToken({ type: "constant", value: ident as any });
                continue;
            }
            throw new Error(`Identificador desconhecido: ${ident}`);
        }

        // constantes
        if (char === "π") {
            pushToken({ type: "constant", value: "pi" as any });
            i++;
            continue;
        }

        if (char === "√") {
            pushToken({ type: "function", value: "sqrt" });
            i++;

            if (i < expression.length) {
                // caso: √-8  ou √9
                if (expression[i] === "-") {
                    i++; // consome '-'
                    let numStr = "-";
                    while (i < expression.length && /[\d.]/.test(expression[i])) numStr += expression[i++];
                    const parsed = parseFloat(numStr);
                    if (Number.isNaN(parsed)) throw new Error("Número inválido após √: " + numStr);
                    pushToken({ type: "number", value: parsed });
                } else if (/[\d.]/.test(expression[i])) {
                    let numStr = "";
                    while (i < expression.length && /[\d.]/.test(expression[i])) numStr += expression[i++];
                    pushToken({ type: "number", value: parseFloat(numStr) });
                }
            }
            continue;
        }

        throw new Error("Caractere inválido: " + char);
    }

    return tokens;
}

function shuntingYard(tokens: ExpToken[]): ExpToken[] {
    const precedence: Record<string, number> = { "+": 2, "-": 2, "*": 3, "/": 3, "mod": 3, "^": 4, "neg": 5, "pos": 5, "!": 6 };

    const rightAssociative: Record<string, boolean> = {
        "^": true,
        "neg": true,
        "pos": true,
    } as Record<string, boolean>;

    const output: ExpToken[] = [];
    const stack: ExpToken[] = [];

    for (const token of tokens) {   
        switch (token.type) {
            case "number":
            case "constant":
                output.push(token);
                break;

            case "complex":
            case "function":
                stack.push(token);
                break;  

            case "comma":
                while (stack.length > 0 && (stack[stack.length - 1].type !== "paren" || (stack[stack.length - 1] as any).value !== "(")) {
                    output.push(stack.pop()!);
                }
                if (stack.length === 0) throw new Error("Separador de argumentos fora de função");
                break;
                
            case "operator": 
            case "unary": {
                const val = (token as any).value;
                while (
                    stack.length > 0 &&
                    (stack[stack.length - 1].type === "operator" || stack[stack.length - 1].type === "unary") &&
                    (
                        (precedence[(stack[stack.length - 1] as any).value] ?? 0) > (precedence[val] ?? 0) ||
                        (
                            (precedence[(stack[stack.length - 1] as any).value] ?? 0) === (precedence[val] ?? 0) &&
                            !rightAssociative[val]
                        )
                    )
                ) {
                    output.push(stack.pop()!);
                }
                stack.push(token);
                break;
            }

            case "percent":
                output.push(token);
                break;

            case "paren":
                if(token.value === '(') {
                    stack.push(token);
                } else {
                    // desempilha até achar "("
                    if (stack.length === 0) throw new Error("Parêntese fechado sem ser aberto");
                    while (stack.length > 0 && (stack[stack.length -1 ] as any).value !== "(") {
                        output.push(stack.pop()!);  
                    }
                    if (stack.length === 0) throw new Error("Parêntese não balanceado");
                    stack.pop(); // remove o "("
                    // se o próximo no topo for função, manda também pra saída
                    if (stack.length > 0 && stack[stack.length - 1].type === "function") {
                        output.push(stack.pop()!);
                    }
                }
                break;
            default:
                throw new Error("Token inesperado: " + JSON.stringify(token));
        }
    }

    // desempilha o resto
    while (stack.length > 0) {
        const top = stack.pop()!;
        if (top.type === "paren") throw new Error("Parêntese não fechado");
        output.push(top);
    }

    return output;
}

function evalRPN(rpn: ExpToken[]): number | Complex | string {
    const functionArity: Record<string, number> = {
        sqrt: 1, abs: 1, ln: 1, log: 2,
        cos: 1, sin: 1, tan: 1,
        cosh: 1, sinh: 1, tanh: 1,
        factor: 1
    };

    const stack: (number | Complex)[] = [];

    for (const token of rpn) {
        switch (token.type) {   
            case "number":
                stack.push(token.value as number);
                break;

            case "constant":
                if (token.value === "pi") stack.push(Math.PI);
                else if (token.value === "e") stack.push(Math.E);
                else if (token.value === "i") stack.push({ re: 0, im: 1 });
                else throw new Error("Constante não suportada: " + token.value);
                break;

            case "operator": {
                if (token.value === "!") {
                    const a = stack.pop();
                    if (a === undefined) throw new Error("Argumento insuficiente para !");
                    const res = factorial(a);
                    // Se factorial retornar string (resultado formatado/pesado), interrompe a avaliação e retorna string
                    if (typeof res === "string") return res;
                    stack.push(res as Complex);
                    break;
                }
                const b = stack.pop();
                const a = stack.pop();
                if (a === undefined || b === undefined)
                    throw new Error("Argumentos insuficientes");

                switch (token.value) {
                    case "+": stack.push(add(a, b)); break;
                    case "-": stack.push(subtract(a, b)); break;
                    case "*": stack.push(multiply(a, b)); break;
                    case "/": stack.push(divide(a, b)); break;
                    case "mod": stack.push(mod(a, b)); break;
                    case "^": {
                        // usa os valores já extraídos: a = base, b = exponent
                        stack.push(raise(a, b));
                        break;
                    }
                    default: throw new Error("Operador não suportado: " + token.value);
                }
                break;
            }

            case "complex": {
                const a = stack.pop();
                if (a === undefined) throw new Error("Argumento insuficiente para função complexa " + token.value);

                const c = toComplex(a);
                switch (token.value) {
                    case "re": stack.push((c.re)); break;
                    case "im": stack.push((c.im)); break;
                    case "arg": {           
                        const ang = arg(c);
                        stack.push(isComplex(ang) ? ang.re : ang as number);
                        break;
                    }
                    case "conj": stack.push(conjugate(c)); break;
                    default: throw new Error("Função complexa não suportada ");
                }   
                break;
            }

            case "unary": {
                const a = stack.pop();
                if (a === undefined) throw new Error("Argumento insuficiente");
                const ca = toComplex(a);
                if (token.value === "neg") stack.push({ re: -ca.re, im: -ca.im });
                if (token.value === "pos") stack.push(ca);
                break;
            }

            case "percent": {
                const a = stack.pop();
                if (a === undefined) throw new Error("Argumento insuficiente para %");
                stack.push(divide(a,100));
                break;
            }

            case "function": {
                const arity = functionArity[token.value as string];
                const args: (number | Complex)[] = [];

                if (arity === undefined && token.value !== "log") {
                    throw new Error("Função não suportada ou aridade desconhecida ->     " + token.value);
                }

                if (token.value === "log") {
                    // RPN: x base log  OR  x log (-> assume base 10)
                    const maybeBase = stack.pop(); // top da stack, base (se tiver)
                    const maybeX = stack.pop();    // then x    
                    if (maybeX !== undefined && maybeBase !== undefined) {
                        args.push(maybeX, maybeBase); // [x, base]
                    } else if (maybeX !== undefined) {
                        args.push(maybeX, 10);        // só x -> base 10
                    } else {
                        throw new Error("Argumentos insuficientes para função log");
                    }   
                } else if (token.value === "factor") {
                    const a = stack.pop();
                    if (a === undefined) throw new Error("Argumento insuficiente para factor");
                    const c = toComplex(a);
                    if (c.im !== 0 || !Number.isInteger(c.re))
                        throw new Error("Factor só definido para inteiros reais");
                    // aqui já retorna string, sem empilhar
                    return factorizeInteger(c.re);
                } else {
                    for (let k = 0; k < arity; k++) {
                        const val = stack.pop();
                        if (val === undefined) throw new Error("Argumentos insuficientes para função " + token.value);
                        args.unshift(val);
                    }
                } 
                
                switch (token.value) {
                    case "sqrt": stack.push(squareRoot(args[0])); break;
                    case "abs": stack.push(absolute(args[0])); break;
                    case "ln": stack.push(naturalLog(args[0])); break;
                    case "log": stack.push(logBase(args[0], args[1])); break;
                    case "cos": stack.push(cosine(args[0])); break;
                    case "sin": stack.push(sine(args[0])); break;
                    case "tan": stack.push(tangent(args[0])); break;
                    case "cosh": stack.push(cosineHiperb(args[0])); break;
                    case "sinh": stack.push(sineHiperb(args[0])); break;
                    case "tanh": stack.push(tangentHiperb(args[0])); break;
                    default: throw new Error("Função não suportada ");                
                }
                break;
            }
        }
    }
        
    if (stack.length !== 1) throw new Error("Expressão mal formulada");

    const result = stack[0];
    return typeof result === "string" ? result : 
       (isComplex(result) && result.im === 0 ? result.re : result);
}

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

function factorizeInteger(nInput: number | bigint): string {
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

const toComplex = (x: number | Complex): Complex =>
    typeof x === "number" ? { re: x, im: 0 } : x;

const isComplex = (x: number | Complex): x is Complex => 
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
