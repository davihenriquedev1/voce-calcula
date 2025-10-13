type DateFormat = "short" | "medium" | "long" | "monthYear";

interface FormatDateOptions extends Intl.DateTimeFormatOptions {
    format?: DateFormat;
    locale?: string;
}

export const formatDate = (dateInput: string | Date, options?: FormatDateOptions): string => {
    if (!dateInput) return "";

    let date: Date;

    if (typeof dateInput === "string") {
        if (options?.format === "monthYear") {
            const [year, month] = dateInput.split("-").map(Number);
            if (!year || !month) return "";
            date = new Date(year, month - 1, 1); // sempre dia 1
        } else {
            const [year, month, day] = dateInput.split("-").map(Number);
            if (!year || !month || !day) return "";
            date = new Date(year, month - 1, day);
        }
    } else {
        date = dateInput;
    }

    const locale = options?.locale ?? "pt-BR";

    // Predefinições de formatos
    let defaultOptions: Intl.DateTimeFormatOptions;
    switch (options?.format) {
        case "short":
            defaultOptions = { day: "2-digit", month: "2-digit", year: "2-digit" };
            break;
        case "medium":
            defaultOptions = { day: "2-digit", month: "short", year: "numeric" };
            break;
        case "long":
            defaultOptions = { weekday: "long", day: "2-digit", month: "long", year: "numeric" };
            break;
        case "monthYear":
            defaultOptions = { month: "long", year: "numeric" };
            break;
        default:
            defaultOptions = { day: "2-digit", month: "2-digit", year: "numeric" };
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
};
