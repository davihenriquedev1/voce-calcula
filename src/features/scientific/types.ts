import { z } from "zod";
import { scientificSchema } from "./schema";

export type ExpToken =
        | { type: "number"; value: number }                     // números normais
        | { type: "operator"; value: "+" | "-" | "/" | "^" | "*" | "mod" | "!"} // operadores
        | { type: "unary"; value: "neg" | "pos"} // operadores unários
        | { type: "percent" ; value: "%" } 
        | { type: "comma" ; value: "," } 
        | { type: "function"; value: "cos" | "sin" | "tan" | "cosh" | "sinh" | "tanh" | "abs" | "factor" | "log" | "ln" | "sqrt"}                   // funções
        | { type: "constant"; value: "pi" | "e" | "i" }          // constantes matemáticas
        | { type: "complex"; value: "re" | "im" | "arg" | "conj" } // funções de número complexo
        | { type: "paren"; value: "(" | ")" };                 // parênteses

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
