"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/app/hooks/useTheme";
import { apiClient } from "@/lib/api/client";
import Logo from "@/components/Logo";
import Sidebar from "@/components/Dashboard/Sidebar";
import MobileBottomNav from "@/components/Dashboard/MobileBottomNav";
import Stats from "@/components/Dashboard/Stats";
import AccountsTab from "@/components/Dashboard/AccountsTab";
import CardsTab from "@/components/Dashboard/CardsTab";
import TransferTab from "@/components/Dashboard/TransferTab";
import HistoryTab from "@/components/Dashboard/HistoryTab";
import ProfileTab from "@/components/Dashboard/ProfileTab";
import PaymentsTab from "@/components/Dashboard/PaymentsTab";
import RatesWidget from "@/components/Dashboard/RatesWidget";
import NotificationBell from "@/components/Dashboard/NotificationBell";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  History,
  User,
  Receipt,
  Sun,
  Moon,
} from "lucide-react";

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
    name: string;
    currency: string;
    userId: number;
  };
};

type Tab = "accounts" | "cards" | "transfer" | "history" | "profile" | "payments";

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [tab, setTab] = useState<Tab>("accounts");
  const [initialLoading, setInitialLoading] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [acc, tx] = await Promise.all([
        apiClient<Account[]>("/api/accounts"),
        apiClient<Transaction[]>("/api/transactions"),
      ]);
      setAccounts(Array.isArray(acc) ? acc : []);
      setTransactions(Array.isArray(tx) ? tx : []);
    } catch (error) {
      console.error("Ошибка обновления данных", error);
    }
  }, []);

  const loadRates = useCallback(async () => {
    try {
      const data = await apiClient<Record<string, number>>("/api/rates");
      setRates(data);
    } catch (error) {
      console.error("Ошибка загрузки курсов", error);
      setRates(null);
    }
  }, []);

  useEffect(() => {
    if (user) {
      Promise.all([refreshData(), loadRates()]).finally(() =>
        setInitialLoading(false)
      );
    }
  }, [user, refreshData, loadRates]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#0a0f1a] dark:to-[#0c1222]">
        <div className="animate-spin h-8 w-8 border-4 border-[#3ebbec] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeAccount = accounts.find((a) => a.isActive);

  let totalBalance = 0;
  let totalBalanceCurrency = "RUB";

  if (activeAccount && rates) {
    totalBalanceCurrency = activeAccount.currency;
    for (const acc of accounts) {
      if (acc.currency === totalBalanceCurrency) {
        totalBalance += acc.balance;
      } else {
        const from = acc.currency;
        const to = totalBalanceCurrency;
        if (rates[from] && rates[to]) {
          totalBalance += (acc.balance * rates[from]) / rates[to];
        }
      }
    }
  } else if (accounts.length > 0) {
    totalBalanceCurrency = accounts[0].currency;
    totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  }

  const lastTransaction = transactions[0];

  const tabIcons: Record<Tab, React.ElementType> = {
    accounts: LayoutDashboard,
    cards: CreditCard,
    transfer: ArrowLeftRight,
    history: History,
    profile: User,
    payments: Receipt,
  };
  const tabTitles: Record<Tab, string> = {
    accounts: "Счета",
    cards: "Карты",
    transfer: "Переводы",
    history: "История",
    profile: "Профиль",
    payments: "Платежи",
  };

  const CurrentIcon = tabIcons[tab];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#0a0f1a] dark:to-[#0c1222] text-gray-900 dark:text-white">
      <Toaster position="top-right" />

      {/* Мобильный хедер */}
      <div className="md:hidden flex items-center justify-between p-4 border-b dark:border-gray-800">
        <Logo variant={isDark ? "white" : "blue"} className="h-8 w-auto" />
        <div className="flex items-center gap-2">
          <NotificationBell onRefresh={refreshData} />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {isDark ? (
              <Sun size={20} className="text-gray-300" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Сайдбар для десктопа */}
      <div className="hidden md:block md:w-72 flex-shrink-0">
        <Sidebar
          tab={tab}
          setTab={setTab}
          onLogout={logout}
          onClose={() => {}}
        />
      </div>

      {/* Основной контент */}
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        {initialLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <CurrentIcon size={24} className="text-[#3ebbec]" />
                {tabTitles[tab]}
              </h2>
              <div className="hidden md:block">
                <NotificationBell onRefresh={refreshData} />
              </div>
            </div>

            {tab === "accounts" && (
              <>
                <Stats
                  totalBalance={totalBalance}
                  totalBalanceCurrency={totalBalanceCurrency}
                  accountsCount={accounts.length}
                  activeAccountName={activeAccount?.name}
                  lastTransactionAmount={lastTransaction?.amount}
                />
                <div className="mb-6">
                  <RatesWidget />
                </div>
                <AccountsTab
                  accounts={accounts}
                  setAccounts={setAccounts}
                  refreshAll={refreshData}
                />
              </>
            )}

            {tab === "cards" && <CardsTab accounts={accounts} />}
            {tab === "transfer" && (
              <TransferTab accounts={accounts} onSuccess={refreshData} />
            )}
            {tab === "history" && <HistoryTab transactions={transactions} />}
            {tab === "profile" && <ProfileTab />}
            {tab === "payments" && (
              <PaymentsTab accounts={accounts} onSuccess={refreshData} />
            )}
          </>
        )}
      </main>

      {/* Мобильное нижнее меню */}
      <MobileBottomNav tab={tab} setTab={setTab} onLogout={logout} />
    </div>
  );
}