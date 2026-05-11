"use client";
import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import {
  Smartphone,
  Wifi,
  Droplets,
  Zap,
  CreditCard,
  ArrowLeft,
} from "lucide-react";

// Типы аккаунтов (полные, с name)
type Account = {
  id: number;
  name: string;
  balance: number;
  currency: string;
  accountNumber: string;
  isActive: boolean;
};

type Props = {
  accounts: Account[];
  onSuccess: () => void;
};

// Категории платежей (пока только мобильная связь)
const categories = [
  {
    id: "mobile",
    label: "Мобильная связь",
    icon: Smartphone,
    gradient: "from-cyan-400 to-blue-500",
  },
  // В будущем можно добавить:
  // { id: "internet", label: "Интернет", icon: Wifi, gradient: "from-purple-400 to-pink-500" },
  // { id: "utilities", label: "Коммунальные", icon: Droplets, gradient: "from-green-400 to-teal-500" },
  // { id: "electricity", label: "Электричество", icon: Zap, gradient: "from-yellow-400 to-orange-500" },
];

export default function PaymentsTab({ accounts, onSuccess }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Если категория выбрана – показываем форму оплаты
  if (selectedCategory === "mobile") {
    return (
      <MobilePaymentForm
        accounts={accounts}
        onSuccess={onSuccess}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  // Экран выбора категории
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <CreditCard size={20} className="text-[#3ebbec]" />
        Выберите услугу
      </h3>
      <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`p-6 rounded-2xl bg-gradient-to-br ${cat.gradient} text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] text-left`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <cat.icon size={24} />
              </div>
              <span className="font-semibold text-lg">{cat.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Вынесенная форма оплаты мобильной связи
function MobilePaymentForm({
  accounts,
  onSuccess,
  onBack,
}: {
  accounts: Account[];
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [shortageInfo, setShortageInfo] = useState<{
    shortage: number;
    pmrBalance: number;
    activeCurrency: string;
    activeBalance: number;
    conversionNeeded: number | null;
  } | null>(null);

  const activeAccount = accounts.find((a) => a.isActive);
  const pmrAccount = accounts.find((a) => a.currency === "PMR");

  const handlePayment = async (forceConversion = false) => {
    if (!phone || !amount) {
      toast.error("Заполните номер и сумму");
      return;
    }
    setLoading(true);
    setShortageInfo(null);

    try {
      await apiClient("/api/payments/mobile", {
        method: "POST",
        body: JSON.stringify({
          phone,
          amount: Number(amount),
          forceConversion,
        }),
      });
      toast.success("Платёж выполнен");
      setPhone("");
      setAmount("");
      onSuccess();
    } catch (error: unknown) {
      const err = error as any;
      if (err?.details) {
        setShortageInfo(err.details);
      } else {
        toast.error(err?.message || "Ошибка платежа");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConvertAndPay = async () => {
    if (!shortageInfo?.conversionNeeded || !activeAccount || !pmrAccount) return;

    try {
      const body = {
        amount: shortageInfo.conversionNeeded,
        toAccountId: pmrAccount.id,
      };
      await apiClient("/api/transactions/transfer", {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast.success("Конвертация выполнена");
      onSuccess();
      setShortageInfo(null);
      handlePayment(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Ошибка конвертации";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-md space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="Назад"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </button>
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Smartphone size={20} className="text-[#3ebbec]" />
          Пополнение мобильного
        </h3>
      </div>

      <input
        className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-[#3ebbec] outline-none"
        placeholder="Номер телефона (077XXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="number"
        className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-[#3ebbec] outline-none"
        placeholder="Сумма (PMR)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button
        onClick={() => handlePayment(false)}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3ebbec] to-cyan-500 text-white p-3 rounded-xl hover:shadow-lg transition disabled:opacity-50"
      >
        <Zap size={18} />
        {loading ? "Оплата..." : "Оплатить"}
      </button>

      {shortageInfo && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-300 dark:border-amber-600/50 text-sm space-y-2">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            На PMR счёте недостаточно средств
          </p>
          <p>
            Баланс PMR: {shortageInfo.pmrBalance.toFixed(2)} PMR
            <br />
            Не хватает: {shortageInfo.shortage.toFixed(2)} PMR
          </p>
          {shortageInfo.conversionNeeded && activeAccount ? (
            <p>
              Вы можете сконвертировать{" "}
              <strong>
                {shortageInfo.conversionNeeded.toFixed(2)}{" "}
                {shortageInfo.activeCurrency}
              </strong>{" "}
              из активного счёта ({activeAccount.name} —{" "}
              {activeAccount.balance.toFixed(2)} {activeAccount.currency})
            </p>
          ) : (
            <p>Невозможно выполнить автоматическую конвертацию.</p>
          )}
          {shortageInfo.conversionNeeded && activeAccount && (
            <button
              onClick={handleConvertAndPay}
              className="w-full py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition"
            >
              Конвертировать и оплатить
            </button>
          )}
        </div>
      )}
    </div>
  );
}