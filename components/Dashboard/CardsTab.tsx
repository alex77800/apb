"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import CardItem from "@/components/Dashboard/CardItem";
import toast from "react-hot-toast";

type CardData = {
  id: number;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  paymentSystem: string;
  isActive: boolean;
  account: { name: string; currency: string };
};

type Props = {
  accounts: { id: number; name: string; currency: string }[];
};

export default function CardsTab({ accounts }: Props) {
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<number | "">("");
  const [paymentSystem, setPaymentSystem] = useState("Mir");

  useEffect(() => {
    apiClient<CardData[]>("/api/cards")
      .then(setCards)
      .catch(() => toast.error("Не удалось загрузить карты"))
      .finally(() => setLoading(false));
  }, []);

  const issueCard = async () => {
    if (!selectedAccountId) {
      toast.error("Выберите счёт");
      return;
    }
    try {
      await apiClient("/api/cards", {
        method: "POST",
        body: JSON.stringify({
          accountId: Number(selectedAccountId),
          paymentSystem,
        }),
      });
      toast.success("Карта выпущена");
      const updated = await apiClient<CardData[]>("/api/cards");
      setCards(updated);
    } catch {
      toast.error("Ошибка выпуска");
    }
  };

  if (loading) return <div className="text-gray-500">Загрузка карт...</div>;

  return (
    <div className="space-y-8">
      {/* 1. Список карт (теперь сверху) */}
      <div>
        <h3 className="font-semibold text-lg mb-4">💳 Ваши карты</h3>
        {cards.length === 0 ? (
          <p className="text-gray-500">У вас пока нет выпущенных карт.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 max-w-5xl">
            {cards.map((card) => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>

      {/* 2. Форма выпуска новой карты (снизу) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow max-w-md">
        <h3 className="font-semibold text-lg mb-3">Выпустить новую карту</h3>
        <select
          className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 mb-2"
          value={selectedAccountId}
          onChange={(e) =>
            setSelectedAccountId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">-- Выберите счёт --</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.currency})
            </option>
          ))}
        </select>

        <div className="flex gap-2 mb-4">
          {["Mir", "Visa", "Mastercard", "Klever"].map((ps) => (
            <button
              key={ps}
              onClick={() => setPaymentSystem(ps)}
              className={`px-4 py-2 rounded-xl font-medium transition ${
                paymentSystem === ps
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {ps === "Klever" ? "Клевер" : ps}
            </button>
          ))}
        </div>

        <button
          onClick={issueCard}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:shadow-lg transition"
        >
          Выпустить карту
        </button>
      </div>
    </div>
  );
}