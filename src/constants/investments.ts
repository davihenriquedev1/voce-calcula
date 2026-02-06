// src/constants/investments.ts
import { InvestmentsType } from "@/types/investments";

export const INVESTMENTS_TYPES = [
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
	"fund_di",
];

export const INVESTMENTS_LABELS: Record<string, string> = {
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
	fund_di: "Fundo DI"
};

export const investmentsOptions = [
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
	{ label: "Fundo DI", value: "fund_di" }
];

export const getInvestmentLabel = (t: InvestmentsType | string) => INVESTMENTS_LABELS[t] ?? t;
export const INVESTMENTS_RATE_TYPES = ["pre","pos"] as const;