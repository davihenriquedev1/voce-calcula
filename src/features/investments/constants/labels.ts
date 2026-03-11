import { InvestmentsType } from "@/features/investments/types";

export const INVESTMENTS_LABELS: Record<string, string> = {
	cdb: "CDB",
	lci: "LCI",
	lca: "LCA",
	cri: "CRI",
	cra: "CRA",
	debentures: "Debêntures",
	debentures_incentivadas: "Debêntures Incentivadas",
	tesouro_selic: "Tesouro Selic",
	tesouro_prefixado: "Tesouro Prefixado",
	"tesouro_ipca+": "Tesouro IPCA+",
	fund_di: "Fundo DI"
};

export const getInvestmentLabel = (t: InvestmentsType | string) => INVESTMENTS_LABELS[t] ?? t;
