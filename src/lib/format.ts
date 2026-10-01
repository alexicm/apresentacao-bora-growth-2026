// Formatação pt-BR para números de simulação.
const int = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const dec1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlCompact = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });

export const fmtInt = (n: number) => int.format(Math.round(n));
export const fmtDec = (n: number) => dec1.format(n);
export const fmtPct = (n: number, digits = 0) => `${(n * 100).toFixed(digits).replace(".", ",")}%`;
export const fmtBRL = (n: number) => brl.format(Math.round(n));
export const fmtBRLCompact = (n: number) => brlCompact.format(n);
