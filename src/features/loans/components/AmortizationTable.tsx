import { formatNumber } from "@/utils/format/format-number";
import { labels } from "../constants/labels";
import { LoansSchedule } from "../types";

type Props = {
	schedule: LoansSchedule[];
}
const AmortizationTable = ({ schedule }: Props) => {
	
	return (
		<div className="mt-4 max-w-full">
			<div className="flex items-center mb-2">
				<h3 className="font-semibold">Tabela de amortização ({schedule.length} meses)</h3>
			</div>
			<div className="grid grid-cols-1 overflow-x-auto overflow-y-auto max-h-72 w-full ">
				<div className="w-full">
					<table className="w-max min-w-full table-auto border ">
						<thead className="sticky top-0 z-10">
							<tr className="bg-chart-3 text-left text-white">
								{Object.keys(schedule[0]).map((k) => (
									<th key={k} className="p-2">{labels[k] || k}</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{schedule.map((row, idx) => (
								<tr key={idx} className="hover:bg-gray-50 transition-colors">
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
		</div>
	)
}
export default AmortizationTable;