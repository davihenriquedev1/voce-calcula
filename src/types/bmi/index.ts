import { bmiSchema } from "@/schemas/bmi";
import { z } from "zod";

export type BmiCategory = {
    category: string;
    rangeText: string;
    min:number;
    max:number;
    color:string;
    emoji:string;
}

export type BmiFormValues = z.infer<typeof bmiSchema>
