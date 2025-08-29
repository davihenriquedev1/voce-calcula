import { NumberFormat } from "@/types/NumberFormat";
import { Unit } from "@/types/Unit";

export const maskNumberInput = (maxIntDgts?: number, format?: NumberFormat, currency?: string, unit?: Unit) => {
    
    return (value:string) => { 
        if (!value) return "";
        
        // Remover todos os caracteres inválidos (só aceita dígitos e vírgulas).  
        let cleaned = value.replace(/[^0-9,]/g, "");

        if(maxIntDgts && cleaned.length > maxIntDgts) {
            if((/^[0-9]+$/).test(cleaned)) {
                let intPart = cleaned.slice(0, maxIntDgts);
                let decPart = cleaned.slice(maxIntDgts);
                cleaned = cleanParts(intPart, decPart);
            } else {
                let [intPart, decPart] = cleaned.split(',');
                cleaned = cleanParts(intPart, decPart);
            }
        } else if(maxIntDgts === undefined) { 
            if (/[0-9]/.test(cleaned) && /,/.test(cleaned)) {
                let [intPart, decPart] = cleaned.split(',');
                cleaned = cleanParts(intPart, decPart);
            }
        }
        return cleaned;
    }
}

const cleanParts = (intPart: string, decimalPart: string): string => {
    intPart = intPart.replace(/[,.]/g, '');
    decimalPart = decimalPart.replace(/[.,]/g, '');
    return `${intPart},${decimalPart}`;
}