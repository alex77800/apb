// lib/rates.ts
export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'MDL' | 'UAH' | 'PMR';

export type Rates = {
  [key in CurrencyCode]: number;
};

const staticRates: Record<CurrencyCode, number> = {
  RUB: 0.23,  // 1 RUB ≈ 0.23 PMR (примерный курс)
  USD: 16.5,
  EUR: 19.78,
  MDL: 1.01,
  UAH: 0.38,
  PMR: 1,   // 1 PMR ≈ 0.9 RUB (примерный курс)
};
export async function getRates(): Promise<Rates> {
  // В будущем можно заменить на fetch к API ЦБ или парсинг
  return staticRates;
}

export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Rates
): number {
  if (from === to) return amount;
  const amountInRub = amount * rates[from];
  return amountInRub / rates[to];
}