import { bmrSchema } from "@/features/bmr/schema";
import { z } from "zod";

export type Bmr = {
    sex: "male" | "female",
    weight: number,
    height: number;
    age: number;
}

export type BmrFormValues = z.infer<typeof bmrSchema>;