"use client";
import { Dispatch, SetStateAction } from "react";
import { useTheme } from "@/app/hooks/useTheme";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  History,
  User,
  Receipt,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

type Tab = "accounts" | "cards" | "transfer" | "history" | "profile" | "payments";

type Props = {
  tab: Tab;
  setTab: Dispatch<SetStateAction<Tab>>;
  onLogout: () => void;
  onClose?: () => void;
};

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "accounts", label: "Счета", icon: LayoutDashboard },
  { id: "cards", label: "Карты", icon: CreditCard },
  { id: "transfer", label: "Переводы", icon: ArrowLeftRight },
  { id: "history", label: "История", icon: History },
  { id: "payments", label: "Платежи", icon: Receipt },
  { id: "profile", label: "Профиль", icon: User },
];

export default function Sidebar({ tab, setTab, onLogout, onClose }: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside
      className={`w-72 p-6 flex flex-col gap-8 h-full transition-colors
        ${isDark
          ? "bg-gradient-to-b from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-b from-white to-gray-50 text-gray-800 border-r border-gray-200"
        }`}
    >
      {/* Логотип (растянут по ширине) */}
      <div className="px-2">
        <Logo
          variant={isDark ? "white" : "blue"}
          className="w-full h-auto max-w-[200px]"
        />
      </div>

      {/* Навигация */}
      <nav className="flex flex-col gap-2 flex-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setTab(id);
              onClose?.();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${tab === id
                ? "bg-[#3ebbec]/20 text-[#3ebbec] font-medium shadow-[inset_0_0_0_1px_rgba(62,187,236,0.3)]"
                : isDark
                  ? "hover:bg-white/5 text-gray-300"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Нижняя часть */}
      <div className="flex flex-col gap-3">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-2 text-sm transition ${
            isDark ? "text-gray-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? "Светлая тема" : "Тёмная тема"}
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>
    </aside>
  );
}