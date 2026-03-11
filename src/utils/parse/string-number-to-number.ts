export default function stringNumberToNumber(value: unknown): number | undefined {
    const cleaned = String(value)
        .replace(/[^\d,-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");
    if (cleaned.trim() === "") return undefined;
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : undefined;
}