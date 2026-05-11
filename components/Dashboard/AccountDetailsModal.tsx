"use client";
import { useEffect, useState } from "react";
import { X, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { maskCardNumber } from "@/lib/cardUtils";
import { useTheme } from "@/app/hooks/useTheme";
import Logo from "@/components/Logo";

type Account = {
  id: number;
  name: string;
  balance: number;
  currency: string;
  accountNumber: string;
  isActive: boolean;
};

type Transaction = {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  account: {
    accountNumber: string;
    currency: string;
    userId: number;
  };
};

type CardData = {
  id: number;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  paymentSystem: string;
  account: { name: string; currency: string };
};

type Props = {
  account: Account;
  onClose: () => void;
};

export default function AccountDetailsModal({ account, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiClient<Transaction[]>(`/api/transactions?accountId=${account.id}`),
      apiClient<CardData[]>(`/api/cards?accountId=${account.id}`),
    ])
      .then(([txs, crds]) => {
        setTransactions(Array.isArray(txs) ? txs : []);
        setCards(Array.isArray(crds) ? crds : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [account.id]);

  // Простая визуализация последних сумм операций (для графика)
  const amounts = [...transactions].reverse().map(tx => tx.amount);
  const maxAmount = Math.max(...amounts.map(Math.abs), 1);
  const chartBars = amounts.slice(-7); // последние 7 операций для мини-графика

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>

        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-4">
          <Logo variant={isDark ? "white" : "blue"} className="h-6 w-auto" />
          <div>
            <h2 className="text-xl font-bold">{account.name}</h2>
            <p className="text-xs text-gray-500">Детали счёта</p>
          </div>
        </div>

        {/* Основные реквизиты */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div className="col-span-2">
            <p className="text-gray-500">Номер счёта</p>
            <p className="font-mono font-medium">{account.accountNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Валюта</p>
            <p className="font-medium">{account.currency}</p>
          </div>
          <div>
            <p className="text-gray-500">Баланс</p>
            <p className="font-bold">{account.balance.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Тип</p>
            <p className="font-medium">{account.isActive ? "Активный" : "Неактивный"}</p>
          </div>
          <div>
            <p className="text-gray-500">ID счёта</p>
            <p className="font-medium">{account.id}</p>
          </div>
        </div>

        {/* Привязанные карты */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
            <CreditCard size={16} className="text-gray-400" /> Привязанные карты
          </h3>
          {cards.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет выпущенных карт</p>
          ) : (
            <div className="space-y-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-sm"
                >
                  <span className="font-mono">{maskCardNumber(card.cardNumber)}</span>
                  <span className="text-xs text-gray-500">
                    {card.paymentSystem} · {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Мини-график движения средств (последние 7 операций) */}
        {chartBars.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">Последние операции</h3>
            <div className="flex items-end gap-1 h-10">
              {chartBars.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 bg-[#3ebbec] rounded-t"
                  style={{
                    height: `${Math.max((Math.abs(val) / maxAmount) * 100, 8)}%`,
                    backgroundColor: val < 0 ? "#ef4444" : "#3ebbec",
                  }}
                  title={val.toFixed(2)}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>← старые</span>
              <span>новые →</span>
            </div>
          </div>
        )}

        {/* Последние транзакции */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Последние 10 транзакций</h3>
          {loading ? (
            <p className="text-gray-400 text-sm">Загрузка...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-400 text-sm">Нет операций</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded"
                >
                  <div>
                    <p className="truncate w-48">{tx.type === "transfer_in" ? "Поступление" : "Списание"}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <span className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
                    {tx.amount.toFixed(2)} {account.currency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-[#3ebbec] text-white rounded-xl font-medium hover:bg-cyan-600 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}