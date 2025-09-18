// utils/input-handlers/calculatorInputHandler.ts
import { InputToken } from "@/app/(calculators)/scientific/page";
import { NotationMode } from "@/app/(calculators)/scientific/page";

export function calculatorInputHandler(
  mode: NotationMode,
  newValue: string,
  inputTokens: InputToken[],
  cursorCharIndex: number
): { tokens: InputToken[]; inserted: number } {

    const mathFunctions = ["mod","cos","sin","tan","cosh","sinh","tanh","arg","log","ln","re","im","conj","abs"];

    // make tokens from a single value string (keeps it as one token)
    const makeTokensForValue = (val: string): InputToken[] => {
      if (mathFunctions.includes(val.toLowerCase())) {
        // keep surrounding spaces as you wanted
        const tokenVal = (inputTokens.length === 0) ? `${val} ` : ` ${val} `;
        return [{ type: "normal", value: tokenVal }];
      }

      if ((mode === "sup" || mode === "sub") && /^[0-9]+$/.test(val)) {
        return [{ type: mode, value: val }];
      }

      return [{ type: "normal", value: val }];
    };

    const insertedTokens = makeTokensForValue(newValue);
    const insertedChars = insertedTokens.reduce((s, t) => s + (t.value?.length || 0), 0);

    // clamp cursorCharIndex
    const totalChars = inputTokens.reduce((s, t) => s + (t.value?.length || 0), 0);
    const charIndex = Math.max(0, Math.min(cursorCharIndex, totalChars));

    // find token index and inner offset
    let acc = 0;
    let tokenIndex = inputTokens.length; // default: append
    let innerOffset = 0;

    for (let i = 0; i < inputTokens.length; i++) {
      const len = inputTokens[i].value.length;
      if (acc + len >= charIndex) {
        tokenIndex = i;
        innerOffset = charIndex - acc; // position inside this token
        break;
      }
      acc += len;
    }

    // build new token array
    const out: InputToken[] = [];

    // tokens before tokenIndex
    out.push(...inputTokens.slice(0, tokenIndex));

    if (tokenIndex === inputTokens.length) {
      // append at end
      out.push(...insertedTokens);
      out.push(...inputTokens.slice(tokenIndex));
      return { tokens: out, inserted: insertedChars };
    }

    const target = inputTokens[tokenIndex];
    if (innerOffset === 0) {
      // insert before entire token
      out.push(...insertedTokens);
      out.push(target, ...inputTokens.slice(tokenIndex + 1));
      return { tokens: out, inserted: insertedChars };
    }

    // split existing token into left + right
    const leftVal = target.value.slice(0, innerOffset);
    const rightVal = target.value.slice(innerOffset);

    if (leftVal.length) out.push({ ...target, value: leftVal });
    out.push(...insertedTokens);
    if (rightVal.length) out.push({ ...target, value: rightVal });

    // append remainder
    out.push(...inputTokens.slice(tokenIndex + 1));

    return { tokens: out, inserted: insertedChars };
}
