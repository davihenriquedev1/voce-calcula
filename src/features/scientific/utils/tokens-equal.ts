import { ScientificInputToken } from "../types";

export const tokensEqual = (a: ScientificInputToken[], b: ScientificInputToken[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i].type !== b[i].type || a[i].value !== b[i].value) return false;
    }
    return true;
}