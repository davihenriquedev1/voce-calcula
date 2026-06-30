import { NumberFormat } from "@/types/number-format";
import { Unit } from "@/types/unit";

const getFractionDigits = (value: number) => {
    const abs = Math.abs(value);

    if (abs >= 1 || abs === 0) return 2;
    if (abs >= 0.01) return 4;
    if (abs >= 0.0001) return 6;
    if (abs >= 0.000001) return 10;
    return 12;
};

export const formatNumber = (value: number | string, format: NumberFormat = 'decimal', currency: string = 'brl', unit?: Unit, options?: {inputIsPercent: boolean, minFractionDigitsPercent?: number, maxFractionDigitsPercent?: number })=> {
    if (typeof value === "string") {
        let cleaned = String(value).replace(/[^\d,.-]/g, "");
        if (cleaned.includes(",")) {
            cleaned = cleaned.replace(/\./g, "").replace(",", ".");
        } else {
            cleaned = cleaned.replace(/,/g, "");
        }
        value = parseFloat(cleaned);
    }
    if (typeof value !== "number" || Number.isNaN(value)) {
        value = 0;
    }

    const fractionDigits = getFractionDigits(value);

    switch(format) {
        case "currency":
        
            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency,
                minimumFractionDigits: fractionDigits, 
                maximumFractionDigits: fractionDigits
            }).format(value);
        case "percent":
            const inputIsPercent = options?.inputIsPercent ?? false;
            let percentValue: number;
            let fraction: number;

            if (inputIsPercent) {
                percentValue = Number(value);
                fraction = percentValue / 100; 
            } else { 
                fraction = Number(value);
                percentValue = fraction * 100;
            }
            const absPct = Math.abs(percentValue);
            const smallThreshold = 0.1;
            const defaultDigits = absPct < smallThreshold ? 4 : 2;

            const minDigits = options?.minFractionDigitsPercent ?? defaultDigits;
            const maxDigits = options?.maxFractionDigitsPercent ?? defaultDigits;

            return  new Intl.NumberFormat("pt-BR", {
                style: "percent",
                minimumFractionDigits: minDigits,
                maximumFractionDigits: maxDigits,   
            }).format(fraction);
        case "unit":
            return  new Intl.NumberFormat("pt-BR", {
                style: "unit",
                unit: unit ?? "meter",
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits
            }).format(value);
        default:
            return  new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: fractionDigits,
                maximumFractionDigits: fractionDigits
            }).format(value);
    }
}