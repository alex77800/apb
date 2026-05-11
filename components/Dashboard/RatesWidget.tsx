"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
type Rates = Record<string, number>;

const currenciesInfo: Record<string, { symbol: string; label: string; gradient: string }> = {
  USD: { symbol: "$", label: "Доллар", gradient: "from-green-400 to-emerald-500" },
  EUR: { symbol: "€", label: "Евро", gradient: "from-blue-400 to-indigo-500" },
  MDL: { symbol: "L", label: "Лей", gradient: "from-yellow-400 to-orange-500" },
  UAH: { symbol: "₴", label: "Гривна", gradient: "from-purple-400 to-pink-500" },
};

export default function RatesWidget() {
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient<Rates>("/api/rates")
      .then((data) => setRates(data))
      .catch(() => setRates(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-full rounded-xl" />;
  if (!rates) return null;

  return (
<div className="flex flex-wrap gap-3">
  {Object.entries(currenciesInfo).map(([code, { symbol, label, gradient }]) => {
    const rate = rates[code];
    if (!rate) return null;
    return (
      <div key={code} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex-1 min-w-[140px]">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold`}>{symbol}</div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-sm font-semibold">{rate.toFixed(2)} ₽</p>
        </div>
      </div>
    );
  })}
</div>
  );
}