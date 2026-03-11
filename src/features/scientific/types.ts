import { z } from "zod";
import { scientificSchema } from "./schema";

export type ExpToken =
        | { type: "number"; value: number }
        | { type: "operator"; value: "+" | "-" | "/" | "^" | "*" | "mod" | "!"}
        | { type: "unary"; value: "neg" | "pos"}
        | { type: "percent" ; value: "%" } 
        | { type: "comma" ; value: "," } 
        | { type: "function"; value: "cos" | "sin" | "tan" | "cosh" | "sinh" | "tanh" | "abs" | "factor" | "log" | "ln" | "sqrt"}
        | { type: "constant"; value: "pi" | "e" | "i" }
        | { type: "complex"; value: "re" | "im" | "arg" | "conj" }
        | { type: "paren"; value: "(" | ")" };

export type Complex = { re: number; im: number };

export type ScientificFormValue = z.infer<typeof scientificSchema>;

export type ScientificResult = {
    expression: string;
    dataResult: {
        ok: boolean,
        result?: string,
        error?: string
    }
}

export type ScientificNotationMode = "normal" | "sup" | "sub" | "scientific";

export type ScientificInputToken = { type: ScientificNotationMode; value: string }

export type ScientificInputHistoryEntry = { tokens: ScientificInputToken[]; cursor: number };
