export default function stringNumberToNumber(value: unknown): number {
    const cleaned = String(value)
        .replace(/[^\d,-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
}