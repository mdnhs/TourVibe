export type CurrencyOption = {
  code: string;
  symbol: string;
  label: string;
};

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: "usd", symbol: "$",   label: "US Dollar (USD)" },
  { code: "eur", symbol: "€",   label: "Euro (EUR)" },
  { code: "gbp", symbol: "£",   label: "British Pound (GBP)" },
  { code: "bdt", symbol: "৳",   label: "Bangladeshi Taka (BDT)" },
  { code: "inr", symbol: "₹",   label: "Indian Rupee (INR)" },
  { code: "aud", symbol: "A$",  label: "Australian Dollar (AUD)" },
  { code: "cad", symbol: "C$",  label: "Canadian Dollar (CAD)" },
  { code: "jpy", symbol: "¥",   label: "Japanese Yen (JPY)" },
  { code: "sgd", symbol: "S$",  label: "Singapore Dollar (SGD)" },
  { code: "aed", symbol: "د.إ", label: "UAE Dirham (AED)" },
];

const DEFAULT_CODE = "usd";

export function getCurrencySymbol(code: string | null | undefined): string {
  const normalized = (code || DEFAULT_CODE).toLowerCase();
  return CURRENCY_OPTIONS.find((c) => c.code === normalized)?.symbol ?? "$";
}

export function formatPrice(
  amount: number,
  code: string | null | undefined,
  opts: { decimals?: number; compact?: boolean } = {},
): string {
  const symbol = getCurrencySymbol(code);
  const decimals = opts.decimals ?? 0;
  const formatted = opts.compact
    ? amount.toLocaleString(undefined, { maximumFractionDigits: decimals })
    : amount.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
  return `${symbol}${formatted}`;
}
