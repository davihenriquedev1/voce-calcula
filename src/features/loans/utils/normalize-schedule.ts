import { round2 } from "@/utils/math";
import { LoansSchedule } from "../types";

export const normalizeSchedule = (
    s: LoansSchedule[]
): LoansSchedule[] => {
    return s.map((row) => {
        const out: LoansSchedule = { ...row }

        const numericKeys: (keyof LoansSchedule)[] = [
            "payment",
            "balance",
            "principal",
            "interest",
            "admin",
            "quota",
            "monthly",
            "totalPaid",
            "totalInterest",
        ]

        numericKeys.forEach((k) => {
            const n = Number(row[k])
            if (Number.isFinite(n)) {
                out[k] = round2(n)
            }
        })

        return out
    })
}