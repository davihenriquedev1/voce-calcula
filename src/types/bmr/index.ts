import { bmrSchema } from "@/schemas/bmr";
import { z } from "zod";

export type Bmr = {
    sex: "male" | "female",
    weight: number,
    height: number;
    age: number;
}

export type BmrFormValues = z.input<typeof bmrSchema>;

export type BmrParsedValues = z.infer<typeof bmrSchema>;