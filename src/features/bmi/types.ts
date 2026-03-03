import { z } from "zod";
import { bmiSchema } from "./schema";

export type BmiCategory = {
    category: string;
    rangeText: string;
    min:number;
    max:number;
    color:string;
    emoji:string;
}

export type BmiFormValues = z.infer<typeof bmiSchema>