"use client";
import { useState } from "react";
import { maskCardNumber, formatCardNumber } from "@/lib/cardUtils";

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

const gradients: Record<string, string> = {
  Mir: "from-[#3ebbec] to-cyan-600",
  Visa: "from-blue-600 to-blue-800",
  Mastercard: "from-orange-500 to-red-600",
  Klever: "from-green-500 to-teal-700",  // зелёный градиент
};

const logos: Record<string, string> = {
  Mir: "МИР",
  Visa: "VISA",
  Mastercard: "MC",
  Klever: "КЛЕВЕР",   // или "🍀" на твой вкус
};

export default function CardItem({ card }: { card: CardData }) {
  const [showDetails, setShowDetails] = useState(false);
  const gradient = gradients[card.paymentSystem] || "from-gray-700 to-gray-800";

  return (
    <div
      className={`relative w-full max-w-sm h-56 rounded-2xl bg-gradient-to-br ${gradient} text-white p-6 shadow-xl transition-transform hover:scale-[1.02]`}
    >
      {/* Платежная система */}
      <div className="absolute top-4 right-4 text-xl font-bold">
        {logos[card.paymentSystem]}
      </div>

      {/* Чип */}
      <div className="w-10 h-8 bg-yellow-300/80 rounded mb-4 mt-2" />

      {/* Номер карты */}
      <p className="text-2xl tracking-wider font-mono">
        {showDetails ? formatCardNumber(card.cardNumber) : maskCardNumber(card.cardNumber)}
      </p>

      {/* Срок и CVV */}
      <div className="flex justify-between items-end mt-4">
        <div>
          <p className="text-xs opacity-70">Срок</p>
          <p className="font-mono">
            {String(card.expiryMonth).padStart(2, "0")}/{String(card.expiryYear).slice(-2)}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-70">CVV</p>
          <p className="font-mono">{showDetails ? card.cvv : "***"}</p>
        </div>
      </div>

      {/* Счёт */}
      <div className="mt-4 text-xs opacity-70">
        {card.account.name} ({card.account.currency})
      </div>

      {/* Кнопка показать/скрыть */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="absolute bottom-4 right-4 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition"
      >
        {showDetails ? "Скрыть" : "Реквизиты"}
      </button>
    </div>
  );
}