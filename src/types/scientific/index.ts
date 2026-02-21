import { scientificSchema } from "@/schemas/scientific";
import { z } from "zod";

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

export type ScientificHistoryEntry = { tokens: ScientificInputToken[]; cursor: number };