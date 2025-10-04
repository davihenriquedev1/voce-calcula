import { NumberFormat } from "@/types/NumberFormat";
import { Unit } from "@/types/Unit";

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
        // fallback se parse falhar
    if (typeof value !== "number" || Number.isNaN(value)) {
        value = 0;
    }

    switch(format) {
        case "currency":
            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency,
                minimumFractionDigits: 2, maximumFractionDigits: 2  
            }).format(value);
        case "percent":
            const inputIsPercent = options?.inputIsPercent ?? false;
            let percentValue: number; // percentValue é a percentagem "número" (ex: 10, 0.0082)
            let fraction: number; // valor para passar pro Intl (ex: 0.1, 0.000082, 0.00833)

            //Se value foi passado como "percent" (ex: 10, ou 0.0082),
             // convertemos para fraction que Intl espera: fraction = percent / 100
            if (inputIsPercent) {
                percentValue = Number(value); // ex: 0.0082 ou 10
                fraction = percentValue / 100; 
            } else { 
                // Se foi passado como fraction (ex: 0.00833), mantemos.
                fraction = Number(value);
                percentValue = fraction * 100;
            }
            // decide digits: se a percentagem é muito pequena (< 0.1%), dar mais casas
            const absPct = Math.abs(percentValue);
            const smallThreshold = 0.1; // <0.1% considera pequeno (ex: 0.0082)
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
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        default:
            return  new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
    }
}