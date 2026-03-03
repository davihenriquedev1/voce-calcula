import { Complex, ExpToken } from "../types";
import { absolute, add, arg, conjugate, cosine, cosineHiperb, divide, factorial, factorizeInteger, formatBigNumber, isComplex, logBase, mod, multiply, naturalLog, raise, sine, sineHiperb, squareRoot, subtract, tangent, tangentHiperb, toComplex } from "./math";

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

export const evaluateSafe = (expression: string): { ok: true; result: string } | { ok: false; error: string } => {

    try {
        const raw = calculateExpression(expression);
        return { ok: true, result: formatResult(raw) };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        const msg = (error && error.message) ? error.message : String(error);
        return { ok: false, error: msg };
    }
}

function calculateExpression(expression: string): number | Complex | string {
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
        if (prevAllowsImplicit && nextIsProductStarter && !(isOperator(prev) && (prev as ExpToken).value === "^")) {
            tokens.push({ type: "operator", value: "*" } as ExpToken);
        }
        tokens.push(tk);
    };

    //  Percorrer a string do início ao fim
    while (i < expression.length) {
        const char = expression[i];

        // Ignorar espaços 
        if (char === " ") { i++; continue; }

        // Reconhecer números → pegar dígitos e ponto decimal
        if (/\d/.test(char) || char === ".") {
            let numStr = char;
            i++;
            let dotCount = char === "." ? 1 : 0;

            while (i < expression.length && /[\d.]/.test(expression[i])) {
                if (expression[i] === ".") {
                    dotCount++;
                    if (dotCount > 1) break;
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
        if (["+", "-", "÷", "^", "×", "!"].includes(char)) {
            const prev = tokens[tokens.length - 1];
            const isUnary = !prev || prev.type === "operator" || prev.type === "unary" || prev.type === "comma" || (prev.type === "paren" && prev.value === "(");

            if (isUnary && (char === "+" || char === "-")) {
                pushToken({ type: "unary", value: char === "-" ? "neg" : "pos" });
            } else if (char === "×") {
                pushToken({ type: "operator", value: "*" } as ExpToken);
            } else if (char === "÷") {
                pushToken({ type: "operator", value: "/" } as ExpToken);
            } else {
                pushToken({ type: "operator", value: char } as ExpToken);
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

            if (["cos", "sin", "tan", "cosh", "sinh", "tanh", "abs", "factor", "log", "ln"].includes(ident)) {
                pushToken({ type: "function", value: ident } as ExpToken);
                continue;
            }
            if (["re", "im", "arg", "conj"].includes(ident)) {
                pushToken({ type: "complex", value: ident } as ExpToken);
                continue;
            }
            if (ident === "mod") {
                pushToken({ type: "operator", value: "mod" } as ExpToken);
                continue;
            }
            if (["e", "i"].includes(ident)) {
                pushToken({ type: "constant", value: ident } as ExpToken);
                continue;
            }
            throw new Error(`Identificador desconhecido: ${ident}`);
        }

        // constantes
        if (char === "π") {
            pushToken({ type: "constant", value: "pi" } as ExpToken);
            i++;
            continue;
        }

        if (char === "√") {
            pushToken({ type: "function", value: "sqrt" } as ExpToken);
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
                while (stack.length > 0 && (stack[stack.length - 1].type !== "paren" || (stack[stack.length - 1] as ExpToken).value !== "(")) {
                    output.push(stack.pop()!);
                }
                if (stack.length === 0) throw new Error("Separador de argumentos fora de função");
                break;

            case "operator":
            case "unary": {
                const val = (token as ExpToken).value;
                while (
                    stack.length > 0 &&
                    (stack[stack.length - 1].type === "operator" || stack[stack.length - 1].type === "unary") &&
                    (
                        (precedence[(stack[stack.length - 1] as ExpToken).value] ?? 0) > (precedence[val] ?? 0) ||
                        (
                            (precedence[(stack[stack.length - 1] as ExpToken).value] ?? 0) === (precedence[val] ?? 0) &&
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
                if (token.value === '(') {
                    stack.push(token);
                } else {
                    // desempilha até achar "("
                    if (stack.length === 0) throw new Error("Parêntese fechado sem ser aberto");
                    while (stack.length > 0 && (stack[stack.length - 1] as ExpToken).value !== "(") {
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
                stack.push(divide(a, 100));
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

