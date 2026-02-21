import { ScientificInputToken, ScientificNotationMode } from "@/types/scientific";

export function calculatorInputHandler(
  mode: ScientificNotationMode,
  newValue: string,
  inputTokens: ScientificInputToken[],
  cursorCharIndex: number
): { tokens: ScientificInputToken[]; inserted: number } {

    // Conjunto de funções matemáticas reconhecidas (precisam de tratamento especial)
    const mathFunctionsAndMod = new Set (["mod","cos","sin","tan","cosh","sinh","tanh","arg","log","ln","re","im","conj","abs", "factor"]);

    // Função auxiliar para transformar o valor digitado em tokens
    const makeTokensForValue = (val: string): ScientificInputToken[] => {
        // Se o valor digitado for uma função matemática
		if (mathFunctionsAndMod.has(val.toLowerCase())) {
			const tokens: ScientificInputToken[] = [];

            // Se já existir algo antes, adiciona um espaço separado
			if (inputTokens.length > 0) {
				tokens.push({ type: "normal", value: " " });
			}

            // Caso especial para "mod" → é uma função binária, não usa parênteses
			if (val.toLowerCase() === "mod") {
				tokens.push({ type: "normal", value: val });
				tokens.push({ type: "normal", value: " " }); // espaço depois de "mod"
				return tokens;
			}

            // Para outras funções matemáticas → adiciona parênteses automaticamente
			tokens.push({ type: "normal", value: val });
			tokens.push({ type: "normal", value: "(" });
			tokens.push({ type: "normal", value: ")" });
			tokens.push({ type: "normal", value: " " });

			return tokens;
		}

        // Caso seja sobrescrito ou subscrito → cria token especial
		if (mode === "sup" || mode === "sub") {
			return [{ type: mode, value: val }];
		}

		// Se o usuário digitar apenas espaço, mantém como token independente
		if (val === " ") {
			return [{ type: "normal", value: " " }];
		}

        // Qualquer outro caractere vira token normal
		return [{ type: "normal", value: val }];
	};

    // Transforma o valor digitado em lista de tokens
	const insertedTokens = makeTokensForValue(newValue);
	
    // Conta quantos caracteres foram realmente inseridos
    let insertedChars = insertedTokens.reduce((s, t) => s + (t.value?.length || 0), 0);

    // Se for uma função matemática, ajusta a contagem de caracteres
	if (mathFunctionsAndMod.has(newValue.toLowerCase())) {
		// Verifica se há espaço antes da função
		const spaceBefore = insertedTokens[0].value === " " ? 1 : 0;
		// Conta até o parêntese de abertura (ignora o fechamento)
		insertedChars = insertedTokens.slice(0, spaceBefore + 2).reduce((s, t) => s + t.value.length, 0);
	}

    // -----------------------------
    // Localizar a posição do cursor
    // -----------------------------

    // Calcula total de caracteres já existentes
    const totalChars = inputTokens.reduce((s, t) => s + (t.value?.length || 0), 0);

    // Garante que o cursor não passe do limite
    const charIndex = Math.max(0, Math.min(cursorCharIndex, totalChars));

    // Encontra em qual token e qual posição dentro do token está o cursor
    let offsetAcc = 0;
    let tokenIndex = inputTokens.length; // por padrão, adiciona no final
    let innerOffset = 0;

    for (let i = 0; i < inputTokens.length; i++) {
		const len = inputTokens[i].value.length;
		if (offsetAcc + len >= charIndex) {
			tokenIndex = i;
			innerOffset = charIndex - offsetAcc; // posição dentro do token atual
			break;
		}
		offsetAcc += len;
    }

    // -----------------------------
    // Construção do novo array final
    // -----------------------------

    const out: ScientificInputToken[] = [];

    // Copia todos os tokens até o ponto onde vai inserir
    out.push(...inputTokens.slice(0, tokenIndex));

    // Caso o cursor esteja no final → apenas anexa
    if (tokenIndex === inputTokens.length) {
		out.push(...insertedTokens);
		out.push(...inputTokens.slice(tokenIndex));
		return { tokens: out, inserted: insertedChars };
    }

    const target = inputTokens[tokenIndex];

    // Caso o cursor esteja no início do token → insere antes dele
    if (innerOffset === 0) {
		out.push(...insertedTokens);
		out.push(target, ...inputTokens.slice(tokenIndex + 1));
		return { tokens: out, inserted: insertedChars };
    }

    // Caso o cursor esteja no meio do token → divide em duas partes
    const leftVal = target.value.slice(0, innerOffset);
    const rightVal = target.value.slice(innerOffset);
    
    if (leftVal.length) out.push({ ...target, value: leftVal }); // Parte da esquerda (se existir)
   
    out.push(...insertedTokens);  // Inserção
   
    if (rightVal.length) out.push({ ...target, value: rightVal });  // Parte da direita (se existir)
    
    out.push(...inputTokens.slice(tokenIndex + 1)); // Adiciona o resto dos tokens

    const merged: ScientificInputToken[] = [];
    for (const t of out) {
        // Mescla tokens adjacentes do mesmo tipo (ex.: sup + sup -> sup com value concatenado)
        const last = merged[merged.length - 1];
        if (last && last.type === t.type) {
            // concatena preservando a imutabilidade do objeto anterior
            last.value = last.value + t.value;
        } else {
            merged.push({ ...t });
        }
    }

    return { tokens: merged, inserted: insertedChars };
}
