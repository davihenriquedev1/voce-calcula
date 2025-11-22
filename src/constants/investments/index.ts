// src/constants/investments.ts
import { InvestmentType } from "@/types/investments";

export const FIXED_INVESTMENT_TYPES: InvestmentType[] = [
	"cdb",
	"lci",
	"lca",
	"cri",
	"cra",
	"debentures",
	"debentures_incentivadas",
	"tesouro_selic",
	"tesouro_prefixado",
	"tesouro_ipca+",
];

export const VARIABLE_INVESTMENT_TYPES: InvestmentType[] = ["fii", "stock"];

export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
	cdb: "CDB",
	lci: "LCI",
	lca: "LCA",
	cri: "CRI",
	cra: "CRA",
	debentures: "Debêntures",
	debentures_incentivadas: "Debêntures Incentivadas (isentas)",
	tesouro_selic: "Tesouro Selic",
	tesouro_prefixado: "Tesouro Prefixado",
	"tesouro_ipca+": "Tesouro IPCA+",
	fii: "FII",
	stock: "Ações",
};

export const investmentOptions = [
	{ label: "CDB", value: "cdb" },
	{ label: "LCI", value: "lci" },
	{ label: "LCA", value: "lca" },
	{ label: "CRI", value: "cri" },
	{ label: "CRA", value: "cra" },
	{ label: "Debêntures", value: "debentures" },
	{ label: "Debêntures Incentivadas (isentas)", value: "debentures_incentivadas" },
	{ label: "Tesouro Selic", value: "tesouro_selic" },
	{ label: "Tesouro Prefixado", value: "tesouro_prefixado" },
	{ label: "Tesouro IPCA+", value: "tesouro_ipca+" },
	{ label: "FII", value: "fii" },
	{ label: "Ações", value: "stock" },
];

export const ALL_INVESTMENT_TYPES = [...FIXED_INVESTMENT_TYPES, ...VARIABLE_INVESTMENT_TYPES];

export const getInvestmentLabel = (t: InvestmentType | string) => INVESTMENT_TYPE_LABELS[t] ?? t;

export const getBucketTypes = (t: InvestmentType | string): InvestmentType[] => {
	if (FIXED_INVESTMENT_TYPES.includes(t as InvestmentType)) return FIXED_INVESTMENT_TYPES;
	if (VARIABLE_INVESTMENT_TYPES.includes(t as InvestmentType)) return VARIABLE_INVESTMENT_TYPES;
	return [];
};
