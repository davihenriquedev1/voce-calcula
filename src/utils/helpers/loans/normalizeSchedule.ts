import { round2 } from ".././math";

export const normalizeSchedule = (s: any[]) => {
    return s.map((row) => {
        const out: Record<string, any> = {};
        Object.keys(row).forEach((k) => {
            // chaves que queremos garantir como número arredondado
            if (["payment","balance","principal","interest","admin","quota","monthly","totalPaid","totalInterest"].includes(k)) {
                const n = Number(row[k]);
                out[k] = Number.isFinite(n) ? round2(n) : row[k];
            } else {
                out[k] = row[k];
            }
        });
        return out;
    });
};