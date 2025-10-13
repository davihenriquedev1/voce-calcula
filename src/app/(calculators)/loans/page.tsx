"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomInput } from "@/components/partials/CustomInput";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import AmortizationTable from "@/components/calculators/loans/AmortizationTable";
import LoansSummary from "@/components/calculators/loans/LoansSummary";
import { Option } from "@/types/Option";
import { LoansFormValues, LoansSummary as LoansSummaryType } from "@/types/loans";
import { loansSchema } from "@/schemas/loans";
import { applyExtraAmortization, generateConsorcioSchedule, generatePriceSchedule, generateSacSchedule, toMonthlyRate, } from "@/utils/calculators/loans";
import { normalizeSchedule } from "@/helpers/loans/normalizeSchedule";
import { round2 } from "@/helpers/math";
import { parseMonthIndex } from "@/helpers/date";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { exportPdf } from "@/helpers/files/pdf";
import { calculateCET } from "@/utils/calculators/loans/cet";

// Constantes estáticas
const creditOptions: Option[] = [
	{ label: "Empréstimo", value: "emprestimo" },
	{ label: "Financiamento", value: "financiamento" },
	{ label: "Consórcio", value: "consorcio" },
];

const amortizationTypeOptions: Option[] = [
	{ label: "Reduzir Prazo", value: "reduzir_prazo" },
	{ label: "Reduzir Parcela", value: "reduzir_parcela" },
];

const Page = () => {
	const form = useForm<LoansFormValues>({
		resolver: zodResolver(loansSchema),
		defaultValues: { type: "emprestimo", amount: "10000", termMonths: "12", downPayment: "0", method: "price", adminPercent: "0", annualRate: "10", fixedIofPct: "0,38", dailyIofPct: "0,0082", extraAmortization: "0", iofCeiling: "3,5",},
		mode: "onTouched",
    	criteriaMode: "all",
	});

	const { handleSubmit, setValue, watch, formState: { errors, isValid }  } = form;
	const watched = watch();

	const [schedule, setSchedule] = useState<any[]>([]); // array com cada parcela da tabela de amortização.
	const [summary, setSummary] = useState<LoansSummaryType | null>(null); // resumo

	// Se o usuário escolher consorcio, força method = "price".
	useEffect(() => {
		if (watched.type === "consorcio") {
			setValue("method", "price");
		}
		if(watched.type === "financiamento") {
			setValue("method", "sac");
		}
	}, [watched.type, setValue]);

	const onSubmit = (values: LoansFormValues) => {
		setSchedule([]);
		setSummary(null);
		const amount = Number(values.amount);
		const method = values.method!;
		const startDate = values.startDate? values.startDate : '';
		const insurancePercent = values.insurancePercent? Number(values.insurancePercent) : 0;
		const type = values.type!;
		const n = Math.max(1, Math.round(Number(values.termMonths))); // (months) garantido ≥ 1
		const down = values.downPayment ? Number(values.downPayment) : 0;
		let financed = round2(Math.max(0, amount - down)); // valor - entrada.
		const insuranceValue = financed * (insurancePercent / 100);
		financed = financed + insuranceValue;
		const extraAmortization = Number(values.extraAmortization);
		const extraAmortizationType = values.extraAmortizationType;
		const extraAmortizationMonth = values.extraAmortizationMonth;
		const extraAmortizationMonthIndex = parseMonthIndex(extraAmortizationMonth);
		const annualRate = Number(values.annualRate)!;
		const r = toMonthlyRate(Number(values.annualRate)); // taxa mensal derivada da taxa anual

		// IOF
		const iofCeiling = Number(values.iofCeiling);
		const fixedIofPct = Number(values.fixedIofPct);
		const dailyIofPct = Number(values.dailyIofPct);
		const fixedIof = financed * (fixedIofPct / 100);
		const days = n * 30; // usar 30 dias por mês (simplificação)
		const dailyIof = financed * (dailyIofPct / 100) * Math.min(days, 365);// limita o IOF a no máximo 1 ano de dias, que é o teto real usado pelo Banco Central.
		let totalIof = fixedIof + dailyIof;
		const iofCapped = financed * (iofCeiling / 100); // teto do IOF%
		let iofWasCapped = false;
		if (totalIof > iofCapped) {
			totalIof = iofCapped;
			iofWasCapped = true;
		};

		const finalize = (rawSchedule: any[]) => {
			const sNorm = normalizeSchedule(rawSchedule);
			const totalPaidNoIof = round2(sNorm.reduce((acc, cur) => acc + (Number(cur.payment) || 0), 0));
			const totalInterest = round2(totalPaidNoIof - financed); // juros sobre o que foi financiado
			const totalPaidWithIof = round2(totalPaidNoIof + totalIof);
			const totalInterestWithIof = round2(totalInterest + totalIof);
			const avgInstallments = round2(totalPaidNoIof / n); // média das parcelas
			const firstInstallment = sNorm[0]?.payment ?? avgInstallments; // parcela inicial estimada (primeira linha do schedule)
			const cet = calculateCET(financed, rawSchedule); // baseSchedule para Price/SAC, s para consórcio
			
			setSchedule(sNorm);
			setSummary({ method, annualRate, monthlyRate: r, amount, downPayment: down, type,firstInstallment, avgInstallments, extraAmortization, extraAmortizationType, extraAmortizationMonth, fixedIofPct, dailyIofPct, fixedIof, dailyIof, totalIof, totalPaidNoIof, totalPaidWithIof, totalInterest, totalInterestWithIof,iofWasCapped
			,startDate, insurancePercent, insuranceValue, cet, iofCeiling });
		};

		if (values.type === "consorcio") {
			const admin = values.adminPercent ? Number(values.adminPercent) : 0;
			const s = generateConsorcioSchedule(financed, n, admin);
			finalize(s);
			return;
		}

		// PRICE ou SAC: primeiro gera schedule base
		let baseSchedule =
			values.method === "price"
				? generatePriceSchedule(financed, r, n)
				: generateSacSchedule(financed, r, n);
		
		// Amortização extra
		if(extraAmortization > 0 && extraAmortizationType && extraAmortizationMonthIndex) {
			baseSchedule = applyExtraAmortization(extraAmortization, extraAmortizationType,extraAmortizationMonthIndex, baseSchedule, method, r, financed, n);
		}
		
		// finalizar para PRICE/SAC.
		finalize(baseSchedule);
		return;
	};

	const handleReset = () => {
		form.reset();
		setSchedule([]);
		setSummary(null);
	};

	return (
		<div className="p-2 md:p-4">
			<h2 className="text-xl md:text-3xl font-bold mb-6 break-words ">
				Simulador de Empréstimo / Financiamento / Consórcio
			</h2>

			<section className="flex flex-col sm:flex-row gap-8 ">
				<div className="flex-1 max-w-full">
					<Form {...form}>
						<form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 max-w-full">
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 w-full">
								<CustomSelect
									form={form}
									name="type"
									label="Operação de crédito"
									placeholder="Selecione o tipo"
									options={creditOptions}
								/>
								<CustomInput
									type="text"
									form={form}
									name="amount"
									label="Valor (R$)"
									placeholder="10000"
									mask={maskNumberInput()}
									formatParams={{ format: "currency", currency: "brl" }}
								/>
								<CustomInput
									type="text"
									form={form}
									name="termMonths"
									label="Prazo (meses)"
									mask={maskNumberInput()}
								/>
								<CustomInput
									type="text"
									form={form}
									name="downPayment"
									label="Entrada"
									placeholder="0"
									mask={maskNumberInput()}
									formatParams={{ format: "currency", currency: "brl" }}
								/>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
								<CustomInput
									type="date"
									form={form}
									name="startDate"
									label="Data de Pagamento"
								/>
								<CustomInput
									type="text"
									form={form}
									name="insurancePercent"
									label="Percentual do Seguro (%)"
									mask={maskNumberInput()}
									formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
								/>
								<CustomInput
									type="text"
									form={form}
									name="annualRate"
									label="Juros anuais (%)"
									mask={maskNumberInput()}
									formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
								<CustomInput
									type="text"
									form={form}
									name="extraAmortization"
									label="Valor da Amortização Extra"
									placeholder="0"
									mask={maskNumberInput()}
									formatParams={{ format: "currency", currency: "brl" }}
								/>
								<CustomInput
									type="month"
									form={form}
									name="extraAmortizationMonth"
									label="Mês da Amortização Extra"
								/>
								<CustomSelect
									form={form}
									name="extraAmortizationType"
									label="Tipo Amortização Extra"
									placeholder="Selecione o tipo"
									options={amortizationTypeOptions}
								/>
								<CustomInput
									type="text"
									form={form}
									name="iofCeiling"
									label="Teto do IOF sobre o valor (%)"
									mask={maskNumberInput()}
									formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
								/>
								<CustomInput
									type="text"
									form={form}
									name="fixedIofPct"
									label="Alíquota fixa IOF (%)"
									mask={maskNumberInput()}
									formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
								/>
								<CustomInput
									type="text"
									form={form}
									name="dailyIofPct"
									label="Alíquota diária IOF (%)"
									mask={maskNumberInput()}
									formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
								/>
							</div>

							<div className="flex flex-col justify-between items-start xs:flex-row xs:items-end gap-4">
								{watched.type !== "consorcio" && (
									<div className="w-full">
										<label className="block font-bold mb-1">Método</label>
										<div className="flex flex-col xs:flex-row gap-2 w-full">
											<Button
												type="button"
												onClick={() => setValue("method", "price")}
												className={`${watched.method === "price" ? "bg-secondary text-secondary-foreground text-white" : "bg-softgray border text-gray-400  border-gray-300"} font-bold`}
											>
												PRICE
											</Button>
											<Button
												type="button"
												onClick={() => setValue("method", "sac")}
												className={`${watched.method === "sac" ? "bg-secondary text-secondary-foreground text-white" : "bg-softgray border text-gray-400 border-gray-300"} font-bold`}
											>
												SAC
											</Button>
										</div>
									</div>
								)}
								{watched.type === "consorcio" && (
									<CustomInput
										type="text"
										form={form}
										name="adminPercent"
										label="Taxa administrativa (%)"
										placeholder="2"
										mask={maskNumberInput()}
										formatParams={{ format: "percent", unit: "percent", options: { inputIsPercent: true } }}
									/>
								)}
								<div className="flex flex-col xs:flex-row gap-2 mt-4 w-full xs:justify-end">
									<Button type="submit" className="font-semibold" disabled={!isValid}>
										Simular
									</Button>
									<Button type="button" onClick={handleReset} className="bg-secondary text-white font-bold">
										Resetar
									</Button>
								</div>
							</div>
						</form>
					</Form>
				</div>
				<div className="flex-1">
					<div className="bg-softgray p-4 rounded border">
						<h3 className="text-xl font-bold mb-2">Resumo</h3>
						{!summary && <div className="text-sm">Faça uma simulação para ver o resultado.</div>}
						{summary && <LoansSummary summary={summary} creditOptions={creditOptions} amortizationTypeOptions={amortizationTypeOptions} />}
						{schedule.length > 0 && <AmortizationTable schedule={schedule} />}
						{/*
							{summary && schedule && (
								<div className="flex w-full justify-end mt-2">
									<Button type="button" onClick={exportPdf}>Exportar PDF</Button>
								</div>
							)}
						*/}
					</div>
				</div>
			</section>

			<section className="mt-10 text-sm text-muted-foreground">
				<p>
					Observação: modelo simplificado. Para financiamentos reais considere seguros, tarifas e regime de cobrança específicos da
					instituição. Consórcio aqui é simulado de forma simplificada (parcela = quota + taxa administrativa rateada).
				</p>
			</section>
		</div>
	);
};

export default Page;
