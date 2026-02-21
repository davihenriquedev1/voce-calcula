import { formatNumber } from "@/utils/formatters/formatNumber";

type Props = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	schedule: any[];
}
const AmortizationTable = ({ schedule }: Props) => {

	const labels: Record<string, string> = { month: "Mês", payment: "Parcela", interest: "Juros", principal: "Amortização", balance: "Saldo devedor", };

	return (
		<div className="mt-4">
			<div className="flex justify-between items-center mb-2">
				<h4 className="font-semibold">Tabela de amortização ({schedule.length} meses)</h4>
			</div>
			<div className="overflow-auto max-h-72 border rounded">
				<table className="w-full text-sm">
					<thead>
						<tr className="bg-muted text-left text-white">
							{Object.keys(schedule[0]).map((k) => (
								<th key={k} className="p-2">{labels[k] || k}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{schedule.map((row, idx) => (
							<tr key={idx} className="border-t">
								{Object.keys(row).map((k) => (
									<td key={k} className="p-2">
										{row[k] === undefined || row[k] === null ? "-" : (
											// se for uma chave monetária, formatar como currency; senão, se for número, formatar decimal; se for string, mostrar direto
											["payment", "balance", "principal", "interest", "admin", "quota", "monthly", "totalPaid", "totalInterest"].includes(k)
												? formatNumber(Number(row[k]), "currency", "brl")
												: (typeof row[k] === "number" ? row[k] : String(row[k]))
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}
export default AmortizationTable;