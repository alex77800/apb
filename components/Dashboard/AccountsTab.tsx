"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import { Plus, CheckCircle } from "lucide-react";
import AccountDetailsModal from "./AccountDetailsModal";

type Account = {
  id: number;
  name: string;
  balance: number;
  currency: string;
  accountNumber: string;
  isActive: boolean;
};

type Props = {
  accounts: Account[] | undefined;
  setAccounts: (accounts: Account[]) => void;
  refreshAll: () => void;
};

const currencies = [
  { code: "RUB", symbol: "₽", label: "Рубль" },
  { code: "USD", symbol: "$", label: "Доллар" },
  { code: "EUR", symbol: "€", label: "Евро" },
  { code: "MDL", symbol: "L", label: "Лей" },
  { code: "UAH", symbol: "₴", label: "Гривна" },
  { code: "PMR", symbol: "₽", label: "Рубль ПМР" },
];

export default function AccountsTab({ accounts, setAccounts, refreshAll }: Props) {
  const [newName, setNewName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  if (!accounts) {
    return <div className="text-gray-500">Загрузка счетов...</div>;
  }

  const switchAccount = async (accountId: number) => {
    const updated = accounts.map((acc) => ({ ...acc, isActive: acc.id === accountId }));
    setAccounts(updated);
    try {
      await apiClient("/api/accounts/switch", {
        method: "POST",
        body: JSON.stringify({ accountId }),
      });
      toast.success("Активный счёт изменён");
    } catch {
      setAccounts([...accounts]);
      toast.error("Ошибка переключения");
    }
  };

  const createAccount = async () => {
    if (!newName.trim()) {
      toast.error("Введите название");
      return;
    }
    try {
      await apiClient("/api/accounts/create", {
        method: "POST",
        body: JSON.stringify({ name: newName, currency }),
      });
      toast.success("Счёт создан");
      setNewName("");
      setCurrency("USD");
      refreshAll();
    } catch {
      toast.error("Ошибка создания");
    }
  };

  return (
    <div className="space-y-6">
      {selectedAccount && (
        <AccountDetailsModal
          account={selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {accounts.map((acc) => (
          <div
            key={acc.id}
            onClick={() => setSelectedAccount(acc)}
            className={`relative p-6 rounded-2xl transition-all duration-300 cursor-pointer
              ${acc.isActive
                ? "ring-2 ring-[#3ebbec] bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/30 dark:to-teal-900/20 shadow-lg shadow-cyan-500/20"
                : "bg-white dark:bg-gray-800 shadow hover:shadow-md border border-gray-100 dark:border-gray-700"
              }`}
          >
            {acc.isActive && (
              <span className="absolute top-3 right-3 bg-[#3ebbec] text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> Активный
              </span>
            )}
            <h3 className="text-lg font-semibold">{acc.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-mono">
              {acc.accountNumber}
            </p>
            <p className="text-2xl font-bold mt-3">
              {acc.balance.toFixed(2)}{" "}
              <span className="text-sm font-normal">{acc.currency}</span>
            </p>
            {!acc.isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  switchAccount(acc.id);
                }}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[#3ebbec] to-cyan-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition"
              >
                Сделать основным
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Форма создания счёта */}
      <div className="flex flex-col gap-3 max-w-md">
        <input
          className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-[#3ebbec] outline-none"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Название счёта"
        />
        <div className="flex flex-wrap gap-2">
          {currencies.map((cur) => (
            <button
              key={cur.code}
              onClick={() => setCurrency(cur.code)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                currency === cur.code
                  ? "bg-[#3ebbec] text-white shadow"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
              }`}
            >
              {cur.symbol} {cur.label}
            </button>
          ))}
        </div>
        <button
          onClick={createAccount}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3ebbec] to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition"
        >
          <Plus size={18} /> Создать счёт
        </button>
      </div>
    </div>
  );
}