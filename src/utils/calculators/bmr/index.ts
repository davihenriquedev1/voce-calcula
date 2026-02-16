import { Bmr } from "@/types/bmr";

// Altura tem que vir em cm e Peso em kg
export const calculateBmr = (data: Bmr) => {
    if (data.sex === "male") {
        return parseFloat((10 * data.weight + 6.25 * data.height - 5 * data.age + 5).toFixed(2))
    }

    return parseFloat(
        (10 * data.weight + 6.25 * data.height - 5 * data.age - 161).toFixed(2)
    );
}