"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Printer } from "lucide-react";
import Logo from "@/components/Logo";
import { useTheme } from "@/app/hooks/useTheme";

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
  transaction: Transaction;
  onClose: () => void;
};

export default function TransactionReceipt({ transaction, onClose }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const sender =
    transaction.type === "transfer_in"
      ? "Внешний отправитель"
      : transaction.type === "transfer_out"
      ? "Вы (" + transaction.account.accountNumber + ")"
      : transaction.type === "mobile_payment"
      ? "Вы (Платёж)"
      : "";

  const recipient =
    transaction.type === "transfer_out"
      ? "Внешний получатель"
      : transaction.type === "transfer_in"
      ? "Вы (" + transaction.account.accountNumber + ")"
      : transaction.type === "mobile_payment"
      ? transaction.description.replace("Оплата мобильной связи ", "")
      : "";

  const handlePrint = () => {
    window.print();
  };

  const receiptContent = () => (
    <>
      <div className="flex flex-col items-center mb-4">
        <Logo
          variant={isDark ? "white" : "blue"}
          className="h-8 w-auto mb-2"
        />
        <p className="text-xs text-gray-500">Квитанция по операции</p>
      </div>

      <div className="space-y-3 text-sm relative">
        {/* Штамп */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="relative transform -rotate-12 opacity-20">
            <div className="border-4 border-blue-600 rounded-xl px-6 py-2 text-center">
              <p className="text-3xl font-black text-blue-600 tracking-widest">
                ОПЛАЧЕНО
              </p>
              <p className="text-xs text-blue-600 mt-1">через интернет-банкинг</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">ID операции:</span>
          <span className="font-medium">{transaction.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Дата и время:</span>
          <span className="font-medium">{formatDateTime(transaction.createdAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Тип:</span>
          <span className="font-medium">
            {transaction.type === "transfer_in" && "Входящий перевод"}
            {transaction.type === "transfer_out" && "Исходящий перевод"}
            {transaction.type === "mobile_payment" && "Оплата мобильной связи"}
          </span>
        </div>
        {transaction.type === "mobile_payment" && (
          <div className="flex justify-between">
            <span className="text-gray-500">Номер телефона:</span>
            <span className="font-medium">
              {transaction.description.replace("Оплата мобильной связи ", "")}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Сумма:</span>
          <span
            className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
          >
            {transaction.amount > 0 ? "+" : ""}
            {transaction.amount.toFixed(2)} {transaction.account.currency}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Счёт:</span>
          <span className="font-medium">{transaction.account.accountNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Отправитель:</span>
          <span className="font-medium truncate max-w-[180px]">{sender}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Получатель:</span>
          <span className="font-medium truncate max-w-[180px]">{recipient}</span>
        </div>
      </div>
    </>
  );

  const printPortal = mounted
    ? createPortal(
        <div
          id="receipt-printable"
          className="hidden"
          style={{ background: "white", color: "black", padding: "2rem" }}
        >
          {receiptContent()}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* Глобальные стили печати */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-printable,
          #receipt-printable * {
            visibility: visible;
          }
          #receipt-printable {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: white !important;
            color: black !important;
            margin: 0;
            box-shadow: none;
            border-radius: 0;
            display: block !important;
            z-index: 9999;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Модальное окно (только на экране) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
          <div className="absolute top-4 right-4 flex gap-2 no-print">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Печать"
            >
              <Printer size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Закрыть"
            >
              <X size={20} />
            </button>
          </div>

          {receiptContent()}

          <button
            onClick={onClose}
            className="mt-6 w-full py-2 bg-[#3ebbec] text-white rounded-xl font-medium hover:bg-cyan-600 transition no-print"
          >
            Закрыть
          </button>
        </div>
      </div>

      {/* Портал с печатным блоком */}
      {printPortal}
    </>
  );
}