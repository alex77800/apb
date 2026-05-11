"use client";
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import { Bell, RefreshCw } from "lucide-react";
import TransactionReceipt from "./TransactionReceipt";

type Notification = {
  id: number;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  transactionId?: number;
};

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

function formatNumbersInString(str: string): string {
  return str.replace(/\d+\.\d{3,}/g, (match) => parseFloat(match).toFixed(2));
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "только что";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} мин. назад`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч. назад`;
  return new Date(date).toLocaleDateString();
}

type Props = {
  onRefresh: () => void; // callback для обновления данных
};

export default function NotificationBell({ onRefresh }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await apiClient<Notification[]>("/api/notifications");
      const filtered = data.filter(
        (n) => n.type === "transfer_in" || n.type === "transfer_out"
      );
      setNotifications(filtered);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await apiClient("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Уведомления прочитаны");
    } catch {
      toast.error("Ошибка");
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (notif.transactionId) {
      try {
        const tx = await apiClient<Transaction>(
          `/api/transactions/${notif.transactionId}`
        );
        setSelectedTransaction(tx);
        await apiClient("/api/notifications", {
          method: "PATCH",
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch {
        toast.error("Не удалось загрузить данные транзакции");
      }
    }
  };

  const handleRefresh = () => {
    onRefresh();
    toast.success("Данные обновлены");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        {/* Кнопка обновления */}
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          title="Обновить данные"
        >
          <RefreshCw size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* Кнопка уведомлений */}
        <button
          onClick={() => setOpen(!open)}
          className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <Bell size={20} className="text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#3ebbec] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold">Уведомления</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-blue-500 hover:underline"
              >
                Прочитать все
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-gray-500">Загрузка...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm">Пока нет уведомлений</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b dark:border-gray-700 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                    notif.read ? "" : "bg-blue-50 dark:bg-blue-900/20"
                  }`}
                >
                  <p>{formatNumbersInString(notif.message)}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {selectedTransaction && (
        <TransactionReceipt
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}