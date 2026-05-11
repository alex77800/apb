"use client";
import { Dispatch, SetStateAction } from "react";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  History,
  User,
  Receipt,
  LogOut,
} from "lucide-react";

type Tab = "accounts" | "cards" | "transfer" | "history" | "profile" | "payments";

type Props = {
  tab: Tab;
  setTab: Dispatch<SetStateAction<Tab>>;
  onLogout: () => void;
};

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "accounts", label: "Счета", icon: LayoutDashboard },
  { id: "cards", label: "Карты", icon: CreditCard },
  { id: "transfer", label: "Переводы", icon: ArrowLeftRight },
  { id: "payments", label: "Платежи", icon: Receipt },
  { id: "history", label: "История", icon: History },
];

export default function MobileBottomNav({ tab, setTab, onLogout }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-1 flex items-center justify-around md:hidden">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = tab === id;
        return (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-colors min-w-[60px] ${
              isActive
                ? "text-[#3ebbec]"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px] mt-0.5">{label}</span>
          </button>
        );
      })}
      {/* Кнопка выхода (отдельно, чтобы не путать с вкладками) */}
      <button
        onClick={onLogout}
        className="flex flex-col items-center justify-center px-2 py-1 rounded-lg text-red-400 hover:text-red-500 transition-colors min-w-[60px]"
      >
        <LogOut size={22} />
        <span className="text-[10px] mt-0.5">Выход</span>
      </button>
    </nav>
  );
}