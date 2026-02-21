import { Option } from "@/types/Option";

// Constantes estáticas
export const creditOptions: Option[] = [
    { label: "Empréstimo", value: "emprestimo" },
    { label: "Financiamento", value: "financiamento" },
    { label: "Consórcio", value: "consorcio" },
];

export const amortizationTypeOptions: Option[] = [
    { label: "Reduzir Prazo", value: "reduzir_prazo" },
    { label: "Reduzir Parcela", value: "reduzir_parcela" },
];