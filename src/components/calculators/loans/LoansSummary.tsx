import { LoansSummary as LoansSummaryType } from "@/types/loans"
import { Option } from "@/types/Option"
import { formatDate } from "@/utils/formatters/formatDate";
import { formatNumber } from "@/utils/formatters/formatNumber"

type Props = {
	summary: LoansSummaryType;
	creditOptions: Option[];
	amortizationTypeOptions: Option[];
}
const LoansSummary = ({summary, creditOptions, amortizationTypeOptions}: Props)=> {
	return (
		<>
			<div className="my-2">
				<h4>Tipo: {creditOptions.find(i => i.value === summary?.type)?.label ?? ""}</h4>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<div className="text-sm">Valor solicitado</div>
					<div className="font-bold text-2xl">{formatNumber(summary.amount, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Vencimento</div>
					<div className="font-bold text-2xl">{summary.startDate? 'dia ' + new Date(summary.startDate).getDate() + 1 : '--'}</div>
				</div>
				<div>
					<div className="text-sm">Entrada</div>
					<div className="font-bold text-2xl">{formatNumber(summary.downPayment ? summary.downPayment : 0, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Método</div>
					<div className="font-bold text-2xl">{summary.method ? summary.method : '-'}</div>
				</div>
				<div>
					<div className="text-sm">Parcela inicial (estimada)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.firstInstallment, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Média das parcelas</div>
					<div className="font-bold text-2xl">{formatNumber(summary.avgInstallments, "currency", "brl")}</div>
				</div>
				<div>   
					<div className="text-sm" title="Taxa embutida no valor total financiado">Taxa do seguro (%)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.insurancePercent, "percent", undefined, "percent", {inputIsPercent: true} )}</div>
				</div>
				<div>
					<div className="text-sm" title="Valor da taxa aplicada no montante">Taxa do seguro (valor)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.insuranceValue, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Amortização Extra</div>
					<div className="font-bold text-2xl">{formatNumber(summary.extraAmortization? summary.extraAmortization : '--', "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Amortização Extra Mês</div>
					<div className="font-bold text-2xl">{summary.extraAmortizationMonth? formatDate(summary.extraAmortizationMonth, {locale: "pt-BR", format: "monthYear"}): '-- de --'}</div>
				</div>
				<div>
					<div className="text-sm">Amortização Extra Tipo</div>
					<div className="font-bold text-2xl">{amortizationTypeOptions.find(i => i.value === summary?.extraAmortizationType)?.label ?? "--"}</div>
				</div>
				<div>   
					<div className="text-sm">Juros anuais</div>
					<div className="font-bold text-2xl">{formatNumber(summary.annualRate, "percent", undefined, "percent", {inputIsPercent: true} )}</div>
				</div>
				<div>
					<div className="text-sm">Juros Mensais</div>
					<div className="font-bold text-2xl">{formatNumber(summary.monthlyRate, "percent",  undefined, "percent")}</div>
				</div>
				<div>
					<div className="text-sm">Juros Base Total</div>
					<div className="font-bold text-2xl">{formatNumber(summary.totalInterest, "currency", "brl")}</div>
				</div>
				<div>   
					<div className="text-sm">Total a pagar sem IOF</div>
					<div className="font-bold text-2xl">{formatNumber(summary.totalPaidNoIof, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Alíquota fixa IOF (%)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.fixedIofPct, "percent", undefined, "percent", {inputIsPercent: true} )}</div>
				</div>
				<div>
					<div className="text-sm">Alíquota fixa IOF (valor bruto)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.fixedIof, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Alíquota diária IOF (%)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.dailyIofPct, "percent",  undefined, "percent", {inputIsPercent: true})}</div>
				</div>
				<div>
					<div className="text-sm">Alíquota diária IOF (valor bruto)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.dailyIof, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Total pago IOF (aplicado teto de {summary.iofCeiling}%)</div>
					<div className="font-bold text-2xl">{formatNumber(summary.totalIof, "currency", "brl")}</div>
				</div>
				<div>
					<div className="text-sm">Juros Base aplicados + IOF</div>
					<div className="font-bold text-2xl">{formatNumber(summary.totalInterestWithIof, "currency", "brl")}</div>
				</div>	
				<div>
					<div className="text-sm">CET </div>
					<div className="font-bold text-2xl">{formatNumber(summary.cet, "percent",  undefined, "percent", {inputIsPercent: true})}</div>				
				</div>
				<div>   
					<div className="text-base">Total a pagar com IOF</div>
					<div className="font-bold text-3xl text-red-700">{formatNumber(summary.totalPaidWithIof, "currency", "brl")}</div>
				</div>
				<div>   
					<div className="text-base" title="(fin. + entrada)">Sairá do seu bolso</div>
					<div className="font-bold text-3xl text-red-800/80">{formatNumber(summary.totalPaidWithIof + summary.downPayment, "currency", "brl")}</div>
				</div>
			</div>
		</>
	)
}
export default LoansSummary;