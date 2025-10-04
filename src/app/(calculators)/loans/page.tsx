"use client"

import { cleanNumberString, CustomInput } from "@/components/partials/CustomInput";
import { CustomSelect } from "@/components/partials/CustomSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { generateConsorcioSchedule, generatePriceSchedule, generateSacSchedule, round, toMonthlyRate } from "@/utils/calculators/loans";
import { formatNumber } from "@/utils/formatters/formatNumber";
import { maskNumberInput } from "@/utils/masks/maskNumberInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const commonNumber = z.string().min(1).transform((value) => {
    const cleaned = String(value)
        .replace(/[^\d,-]/g, "") // remove R$, espaços, letras etc
        .replace(/\./g, "")      // remove separador de milhares
        .replace(",", ".");      // vírgula -> ponto para parseFloat
    return parseFloat(cleaned);
});

const schema = z.object({
    type: z.enum(["emprestimo", "financiamento", "consorcio"]).default("emprestimo"),
    amount: commonNumber,
    termMonths: commonNumber,
    downPayment: z.string().optional().transform((v) => {
        if (!v) return 0;
        const cleaned = String(v).replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
        return parseFloat(cleaned);
    }),
    extraAmortization: z.string().optional().transform((v) => {
        if (!v) return 0;
        const cleaned = String(v).replace(/[^\d,-]/g, "").replace(/\./g, "").replace(",", ".");
        return parseFloat(cleaned);
    }),
    extraAmortizationMonth: z.string().optional(), // armazenará "YYYY-MM" ou "2025-10"
    extraAmortizationType: z.enum(["reduzir_prazo", "reduzir_parcela"]).optional(),
    method: z.enum(["price", "sac"]).default("price"), // apenas para financiamento e emprestimo
    annualRate: commonNumber,
    adminPercent: commonNumber.optional(), //para consórcio
    fixedIofPct: commonNumber,
    dailyIofPct: commonNumber,
});

// z.input descreve o que o schema aceita na entrada (string)
type FormValues = z.input<typeof schema>;

type Summary = { 
    type: string; 
    method: string; 
    amount: number; 
    downPayment: number; 
    extraAmortization: number,
    extraAmortizationType?: string,
    extraAmortizationMonth?: string
    monthly: number; 
    totalPaid: number; 
    totalInterest: number;
    annualRate: number; 
    monthlyRate: number; 
    fixedIofPct: number,
    dailyIofPct: number,
    fixedIof: number,
    dailyIof: number,
    totalIof: number,
};

const Page = () => {
    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            type: "emprestimo",
            amount: "10000", 
            termMonths: "12",
            downPayment: "0", 
            method: "price", 
            adminPercent: "0",
            annualRate: "10", 
            fixedIofPct: "0,38",
            dailyIofPct: "0,0082",
            extraAmortization: "0",
        }
    });

    const {handleSubmit, setValue, watch} = form;
    const watched = watch();

    const [schedule, setSchedule] = useState<any[]>([]); // array com cada parcela/linha da tabela de amortização.
    // dados resumidos (parcela inicial, total pago, total de juros).
    const [summary, setSummary] = useState<Summary | null>(null);

    // Se o usuário escolher consorcio, força method = "price". (Porque SAC/PRICE não se aplicam ao consórcio.)
    useEffect(()=> {
        if(watched.type === "consorcio") {
            setValue("method", "price");
        }
    }, [watched.type, setValue]);

    const creditOptions = [
        {label: 'Empréstimo', value: 'emprestimo'},
        {label: 'Financiamento', value: 'financiamento'},
        {label: 'Consórcio', value: 'consorcio'},
    ]
    const amortizationTypeOptions = [
        {label: 'Reduzir Prazo', value: 'reduzir_prazo'},
        {label: 'Reduzir Parcela', value: 'reduzir_parcela'}
    ]   

    const parseMonthIndex = (ym?: string, startDate = new Date()) => {
        if(!ym) return null;
        const [y, m] = ym.split('-').map(Number);
        const startY = startDate.getFullYear();
        const startM = startDate.getMonth() + 1;
        const index = (y - startY) * 12 + (m - startM) + 1;
        return index > 0 ? index : null;
    }

    const onSubmit = (values: FormValues) => {
        setSchedule([]);
        setSummary(null);
        console.log(values);
        const amount = Number(values.amount);
        const method = values.method!;
        const type = values.type!;
        const n = Math.max(1, Math.round(Number(values.termMonths))); // (months) garantido ≥ 1
        const down = values.downPayment ? Number(values.downPayment): 0;
        const financed = Math.max(0, amount - (down || 0)); // valor - entrada.
        const extraAmortization = Number(values.extraAmortization);
        const extraAmortizationType = values.extraAmortizationType;
        const extraAmortizationMonth = values.extraAmortizationMonth;
        const extraAmortizationMonthIndex = parseMonthIndex(extraAmortizationMonth);
        const annualRate = Number(values.annualRate)!;   
        const r = toMonthlyRate(Number(values.annualRate)); // é taxa mensal derivada da taxa anual por toMonthlyRate.
        const fixedIofPct = Number(values.fixedIofPct);
        const dailyIofPct = Number(values.dailyIofPct);
        const fixedIof = financed * (fixedIofPct / 100); // 0.38% -> 0.0038 * financed
        const days = n * 30; // // usar 30 dias por mês (simplificação)
        const dailyIof = financed * (dailyIofPct / 100) * days;
        let totalIof = fixedIof + dailyIof;
        const iofCap = financed * 0.03; // aplicar teto de 3% do valor do crédito
        if (totalIof > iofCap) totalIof = iofCap;
       
        if(values.type === "consorcio") {
            const admin = values.adminPercent ? Number(values.adminPercent) : 0;
            const s = generateConsorcioSchedule(financed, n, admin);
            const totalPaid = s.reduce((acc, cur) => acc + (Number(cur.payment) || 0), 0);
            const totalInterest = totalPaid - financed;
            const totalPaidWithIof = totalPaid + totalIof;
            const totalInterestWithIof = totalInterest + totalIof;
            setSchedule(s);
            setSummary({ method, annualRate, monthlyRate: r, amount, downPayment: down, type, monthly: s[0]?.payment ?? 0, totalPaid: totalPaidWithIof, totalInterest: totalInterestWithIof , extraAmortization, extraAmortizationType, extraAmortizationMonth, fixedIofPct, dailyIofPct, fixedIof, dailyIof, totalIof, });
            return; 
        }   

        if (values.method === "price") {
            const s = generatePriceSchedule(financed, r, n);
            const totalPaid = s.reduce((acc, cur) => acc + (Number(cur.payment) || 0), 0);
            const totalInterest = totalPaid - financed;
            const totalPaidWithIof = totalPaid + totalIof;
            const totalInterestWithIof = totalInterest + totalIof;
            setSchedule(s);
            setSummary({ method, annualRate, monthlyRate: r, amount, downPayment: down, type, monthly: s[0]?.payment ?? 0, totalPaid: totalPaidWithIof, totalInterest: totalInterestWithIof , extraAmortization, extraAmortizationType, extraAmortizationMonth, fixedIofPct, dailyIofPct, fixedIof, dailyIof, totalIof });
            return;
        }

        // SAC
        const s = generateSacSchedule(financed, r, n);
        const totalPaid = s.reduce((acc, cur) => acc + (Number(cur.payment) || 0), 0);
        const totalInterest = totalPaid - financed;
        const totalPaidWithIof = totalPaid + totalIof;
        const totalInterestWithIof = totalInterest + totalIof;
        setSchedule(s);
        setSummary({ method, annualRate, monthlyRate: r, amount, downPayment: down, type, monthly: s[0]?.payment ?? 0, totalPaid: totalPaidWithIof, totalInterest: totalInterestWithIof , extraAmortization, extraAmortizationType, extraAmortizationMonth, fixedIofPct, dailyIofPct, fixedIof, dailyIof, totalIof });
    };

    // finalizar conta com amortização extra:
    // implementar função de exportação de PDF
    const exportPdf = () => {

    }

    const handleReset = () => {
        form.reset(); 
        setSchedule([]); 
        setSummary(null);
    }

    const labels: Record<string, string> = {month: "Mês", payment: "Parcela", interest: "Juros", principal: "Amortização", balance: "Saldo devedor",};

    return (
        <div className="p-2 md:p-4">
            <h2 className="text-xl md:text-3xl font-bold mb-6 break-words ">Simulador de Empréstimo / Financiamento / Consórcio</h2>
            <section className="flex flex-col sm:flex-row gap-8 ">
                <div className="flex-1 max-w-full">
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 max-w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 w-full">
                                <CustomSelect form={form} name="type" label="Operação de crédito" placeholder="Selecione o tipo" options={creditOptions}/>
                                <CustomInput type="text" form={form} name="amount" label="Valor (R$)" placeholder="10000" mask={maskNumberInput()} formatParams={{format: "currency", currency: "brl"}}/>
                                <CustomInput type="text" form={form} name="termMonths" label="Prazo (meses)" mask={maskNumberInput()}/>
                                <CustomInput type="text" form={form} name="downPayment" label="Entrada" placeholder="0" mask={maskNumberInput()} formatParams={{format: "currency", currency: "brl"}} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 w-full">
                                <CustomInput type="text" form={form} name="extraAmortization" label="Valor da Amortização Extra" placeholder="0" mask={maskNumberInput()} formatParams={{format: "currency", currency: "brl"}}/>
                                <CustomInput type="month" form={form} name="extraAmortizationMonth" label="Mês da Amortização Extra"/>
                                <CustomSelect form={form} name="extraAmortizationType" label="Tipo Amortização Extra" placeholder="Selecione o tipo" options={amortizationTypeOptions}/>
                                <CustomInput type="text" form={form} name="annualRate" label="Juros anuais (%)" mask={maskNumberInput()} formatParams={{format: "percent", unit: "percent", options: {inputIsPercent: true}}}/>
                                <CustomInput type="text" form={form} name="fixedIofPct" label="Alíquota fixa IOF (%)" mask={maskNumberInput()} formatParams={{format: "percent", unit: "percent",  options: {inputIsPercent: true}}}/>
                                <CustomInput type="text" form={form} name="dailyIofPct" label="Alíquota diária IOF (%)" mask={maskNumberInput()} formatParams={{format: "percent", unit: "percent",  options: {inputIsPercent: true}}}/>
                            </div> 
                            <div className="flex flex-col justify-between items-start xs:flex-row xs:items-end gap-4">
                                {watched.type !== "consorcio" && (
                                    <div className="w-full">
                                        <label className="block font-bold mb-1">Método</label>
                                        <div className="flex flex-col xs:flex-row gap-2 w-full">
                                            <Button type="button" onClick={()=> setValue("method", "price")} className={`${watched.method === "price" ? 'bg-secondary text-secondary-foreground text-white' : 'bg-softgray border text-gray-400  border-gray-300'} font-bold`}>PRICE</Button>
                                            <Button type="button" onClick={() => setValue("method", "sac")} className={`${watched.method === 'sac' ? 'bg-secondary text-secondary-foreground text-white' : 'bg-softgray border text-gray-400 border-gray-300'} font-bold`}>SAC</Button>
                                        </div>
                                    </div>
                                )}  
                                {watched.type === "consorcio" && (
                                    <CustomInput type="text" form={form} name="adminPercent" label="Taxa administrativa (%)" placeholder="2" mask={maskNumberInput()} formatParams={{format: "percent", unit: "percent",  options: {inputIsPercent: true}}}/>
                                )}
                                <div className="flex flex-col xs:flex-row gap-2 mt-4 w-full xs:justify-end">
                                    <Button type="submit" className="font-semibold">Simular</Button>
                                    <Button type="button" onClick={handleReset} className="bg-secondary text-white">Resetar</Button>
                                </div>
                            </div>
                            
                        </form>
                    </Form>
                </div>
                <div className="flex-1">
                    <div className="bg-softgray p-4 rounded border">
                        <h3 className="text-xl font-bold mb-2">Resumo</h3>
                        {!summary && <div className="text-sm">Faça uma simulação para ver o resultado.</div>}
                        {summary && (
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
                                    <div className="text-sm">Entrada</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.downPayment ? summary.downPayment : 0, "currency", "brl")}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Método</div>
                                    <div className="font-bold text-2xl">{summary.method ? summary.method : '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Parcela inicial (estimada)</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.monthly, "currency", "brl")}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Amortização Extra</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.extraAmortization, "currency", "brl")}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Amortização Extra Mês</div>
                                    <div className="font-bold text-2xl">{summary.extraAmortizationMonth?summary.extraAmortizationMonth : '-' }</div>
                                </div>
                                <div>
                                    <div className="text-sm">Amortização Extra Tipo</div>
                                    <div className="font-bold text-2xl">{amortizationTypeOptions.find(i => i.value === summary?.extraAmortizationType)?.label ?? "-"}</div>
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
                                    <div className="text-sm">Juros / Taxas</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.totalInterest, "currency", "brl")}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Alíquota fixa IOF (%)</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.fixedIofPct, "percent", undefined, "percent", {inputIsPercent: true} )}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Alíquota fixa IOF (valor)</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.fixedIof, "currency", "brl")}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Alíquota diária IOF (%)</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.dailyIofPct, "percent",  undefined, "percent", {inputIsPercent: true})}</div>
                                </div>
                                <div>
                                    <div className="text-sm">Alíquota diária IOF (valor)</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.dailyIof, "currency", "brl")}</div>
                                </div>
                                <div>   
                                    <div className="text-sm">Total a pagar</div>
                                    <div className="font-bold text-2xl">{formatNumber(summary.totalPaid, "currency", "brl")}</div>
                                </div>
                            </div>
                            </>
                        )}
                        {schedule.length > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold">Tabela de amortização ({schedule.length} meses)</h4>
                                    <div className="flex">
                                        <Button type="button" onClick={exportPdf}>Exportar PDF</Button>
                                    </div>
                                </div> 
                                <div className="overflow-auto max-h-72 border rounded">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-muted text-left">
                                                {Object.keys(schedule[0]).map((k)=> (
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
                                                                ["payment","balance", "principal", "interest","admin","quota","monthly","totalPaid","totalInterest"].includes(k)
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
                        )}
                    </div>
                </div>
            </section>
            <section className="mt-10 text-sm text-muted-foreground">
                <p>Observação: modelo simplificado. Para financiamentos reais considere seguros, tarifas e regime de cobrança específicos da instituição. Consórcio aqui é simulado de forma simplificada (parcela = quota + taxa administrativa rateada).</p>
            </section>
        </div>
    );
}

export default Page;