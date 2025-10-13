// passar o mês da amortização pra index 
export const parseMonthIndex = (ym?: string, startDate = new Date()) => {
    if(!ym) return null;
    const [y, m] = ym.split('-').map(Number);
    const startY = startDate.getFullYear();
    const startM = startDate.getMonth() + 1;
    const index = (y - startY) * 12 + (m - startM) + 1;
    return index > 0 ? index : null;
}