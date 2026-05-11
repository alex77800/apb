"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, FileText } from "lucide-react";
import TransactionReceipt from "./TransactionReceipt";

type Transaction = {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
  account: {
    accountNumber: string;
    name: string;
    currency: string;
    userId: number;
  };
};

type Props = {
  transactions: Transaction[];
};

// Преобразует английское описание в читаемое русское
function localizeDescription(tx: Transaction): string {
  const { type, description, amount, account } = tx;
  if (type === "transfer_in") {
    return `Входящий перевод на счёт ${account.accountNumber}`;
  } else if (type === "transfer_out") {
    return `Исходящий перевод со счёта ${account.accountNumber}`;
  }else if (tx.type === "mobile_payment") {
    // Извлекаем номер телефона из description
    const phone = tx.description.replace(/^Оплата мобильной связи\s*/, "");
    return `Оплата мобильной связи ${phone}`;
  }
  // fallback
  return description || "Операция";
}

// Группировка по дням
function groupByDate(txs: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  txs.forEach((tx) => {
    const date = new Date(tx.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "Сегодня";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Вчера";
    } else {
      key = date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return groups;
}

export default function HistoryTab({ transactions }: Props) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const grouped = groupByDate(transactions);

  if (transactions.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        У вас пока нет операций
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Модальное окно квитанции */}
      {selectedTx && (
        <TransactionReceipt
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}

      {Object.entries(grouped).map(([dateLabel, txs]) => (
        <div key={dateLabel}>
          <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 mb-2 ml-1">
            {dateLabel}
          </h3>
          <div className="space-y-2">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-full ${
                      tx.type === "transfer_in"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {tx.type === "transfer_in" ? (
                      <ArrowDown size={16} className="text-green-600" />
                    ) : (
                      <ArrowUp size={16} className="text-red-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-sm">
                      {localizeDescription(tx)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      ID: {tx.id} ·{" "}
                      {new Date(tx.createdAt).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`font-bold text-sm ${
                      tx.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount.toFixed(2)} {tx.account.currency}
                  </span>
                  <button
                    onClick={() => setSelectedTx(tx)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title="Квитанция"
                  >
                    <FileText size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}