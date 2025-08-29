import { NumberFormat } from "@/types/NumberFormat";
import { Unit } from "@/types/Unit";

export const formatNumber = (value: number | string, format: NumberFormat = 'decimal', currency: string = 'brl', unit?: Unit, )=> {
  
    if (typeof value === 'string') {
        let cleaned = value.replace(/[^0-9,]/g, "");
        value = parseFloat(cleaned.replace(',', '.'));
    }

    switch(format) {
        case "currency":
            return new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency,
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(value);
        case "percent":
            return  new Intl.NumberFormat("pt-BR", {
                style: "percent",
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(value);
        case "unit":
            return  new Intl.NumberFormat("pt-BR", {
                style: "unit",
                unit: unit ?? "meter",
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(value);
        default:
            return  new Intl.NumberFormat("pt-BR", {
                style: "decimal",
                minimumFractionDigits: 2, maximumFractionDigits: 2
            }).format(value);
    }
}