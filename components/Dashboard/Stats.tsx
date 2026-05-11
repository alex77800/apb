import { Wallet, CreditCard, Star, ArrowRightLeft } from "lucide-react";

type Props = {
  totalBalance: number;
  totalBalanceCurrency: string;
  accountsCount: number;
  activeAccountName?: string;
  lastTransactionAmount?: number;
};

const currencySymbols: Record<string, string> = {
  RUB: "₽",
  USD: "$",
  EUR: "€",
  MDL: "L",
  UAH: "₴",
  PMR: "₽",
};

export default function Stats({
  totalBalance,
  totalBalanceCurrency,
  accountsCount,
  activeAccountName,
  lastTransactionAmount,
}: Props) {
  const symbol = currencySymbols[totalBalanceCurrency] || totalBalanceCurrency;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard icon={<Wallet size={24} />} label="Общий баланс" value={`${symbol} ${totalBalance.toFixed(2)}`} gradient="from-[#3ebbec] to-cyan-400" />
      <StatCard icon={<CreditCard size={24} />} label="Счетов" value={accountsCount} gradient="from-blue-400 to-indigo-500" />
      <StatCard icon={<Star size={24} />} label="Активный" value={activeAccountName || "—"} gradient="from-amber-400 to-orange-500" />
      <StatCard icon={<ArrowRightLeft size={24} />} label="Последняя операция" value={lastTransactionAmount !== undefined ? `${lastTransactionAmount > 0 ? "+" : ""}${lastTransactionAmount.toFixed(2)}` : "—"} gradient="from-purple-400 to-pink-500" />
    </div>
  );
}

function StatCard({ icon, label, value, gradient }: { icon: React.ReactNode; label: string; value: string | number; gradient: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-5 shadow-md hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
      </div>
    </div>
  );
}