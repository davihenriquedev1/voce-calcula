import { NumberFormat } from "@/types/NumberFormat";
import { Unit } from "@/types/Unit";

export const formatNumber = (number: number, format: NumberFormat = 'decimal', currency: string = 'brl', unit?: Unit, )=> {
    switch(format) {
        case "currency":
            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency,
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(number);
        case "percent":
            return  new Intl.NumberFormat("pt-BR", {
                style: "percent",
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(number);
        case "unit":
            return  new Intl.NumberFormat("pt-BR", {
                style: "unit",
                unit: unit ?? "meter",
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(number);
        default:
            return  new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(number);
    }
}