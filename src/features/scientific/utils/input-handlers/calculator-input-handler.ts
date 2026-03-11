import { ScientificInputToken, ScientificNotationMode } from "../../types";

export function calculatorInputHandler(
  mode: ScientificNotationMode,
  newValue: string,
  inputTokens: ScientificInputToken[],
  cursorCharIndex: number
): { tokens: ScientificInputToken[]; inserted: number } {

    const mathFunctionsAndMod = new Set (["mod","cos","sin","tan","cosh","sinh","tanh","arg","log","ln","re","im","conj","abs", "factor"]);

    const makeTokensForValue = (val: string): ScientificInputToken[] => {
		if (mathFunctionsAndMod.has(val.toLowerCase())) {
			const tokens: ScientificInputToken[] = [];

			if (inputTokens.length > 0) {
				tokens.push({ type: "normal", value: " " });
			}

			if (val.toLowerCase() === "mod") {
				tokens.push({ type: "normal", value: val });
				tokens.push({ type: "normal", value: " " }); // espaço depois de "mod"
				return tokens;
			}

			tokens.push({ type: "normal", value: val });
			tokens.push({ type: "normal", value: "(" });
			tokens.push({ type: "normal", value: ")" });
			tokens.push({ type: "normal", value: " " });

			return tokens;
		}

		if (mode === "sup" || mode === "sub") {
			return [{ type: mode, value: val }];
		}

		if (val === " ") {
			return [{ type: "normal", value: " " }];
		}

		return [{ type: "normal", value: val }];
	};

	const insertedTokens = makeTokensForValue(newValue);
	
    let insertedChars = insertedTokens.reduce((s, t) => s + (t.value?.length || 0), 0);

	if (mathFunctionsAndMod.has(newValue.toLowerCase())) {
		const spaceBefore = insertedTokens[0].value === " " ? 1 : 0;
		insertedChars = insertedTokens.slice(0, spaceBefore + 2).reduce((s, t) => s + t.value.length, 0);
	}

    const totalChars = inputTokens.reduce((s, t) => s + (t.value?.length || 0), 0);

    const charIndex = Math.max(0, Math.min(cursorCharIndex, totalChars));

    let offsetAcc = 0;
    let tokenIndex = inputTokens.length;
    let innerOffset = 0;

    for (let i = 0; i < inputTokens.length; i++) {
		const len = inputTokens[i].value.length;
		if (offsetAcc + len >= charIndex) {
			tokenIndex = i;
			innerOffset = charIndex - offsetAcc;
			break;
		}
		offsetAcc += len;
    }

    const out: ScientificInputToken[] = [];

    out.push(...inputTokens.slice(0, tokenIndex));

    if (tokenIndex === inputTokens.length) {
		out.push(...insertedTokens);
		out.push(...inputTokens.slice(tokenIndex));
		return { tokens: out, inserted: insertedChars };
    }

    const target = inputTokens[tokenIndex];

    if (innerOffset === 0) {
		out.push(...insertedTokens);
		out.push(target, ...inputTokens.slice(tokenIndex + 1));
		return { tokens: out, inserted: insertedChars };
    }

    const leftVal = target.value.slice(0, innerOffset);
    const rightVal = target.value.slice(innerOffset);
    
    if (leftVal.length) out.push({ ...target, value: leftVal });
   
    out.push(...insertedTokens);
   
    if (rightVal.length) out.push({ ...target, value: rightVal }); 
    
    out.push(...inputTokens.slice(tokenIndex + 1));

    const merged: ScientificInputToken[] = [];
    for (const t of out) {
        const last = merged[merged.length - 1];
        if (last && last.type === t.type) {
            last.value = last.value + t.value;
        } else {
            merged.push({ ...t });
        }
    }

    return { tokens: merged, inserted: insertedChars };
}
