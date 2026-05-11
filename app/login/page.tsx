"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { User, Lock } from "lucide-react";
import Logo from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();

  const [clientId, setClientId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!clientId || !password) {
      toast.error("Заполните все поля");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Ошибка входа");
        return;
      }

      toast.success("Добро пожаловать");
      router.push("/dashboard");
    } catch {
      toast.error("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#0a0f1a] dark:to-[#0c1222] px-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8 backdrop-blur-sm">
        {/* Логотип и заголовок */}
        <div className="flex flex-col items-center mb-8">
          <Logo variant="blue" className="h-10 w-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Вход в систему
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Агропромбанк — интернет-банкинг
          </p>
        </div>

        {/* Поле Client ID */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={20} className="text-gray-400" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#3ebbec] transition-all"
              placeholder="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        {/* Поле Пароль */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={20} className="text-gray-400" />
            </div>
            <input
              type="password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-[#3ebbec] transition-all"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
        </div>

        {/* Кнопка Войти */}
        <button
          onClick={login}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#3ebbec] to-cyan-500 hover:shadow-lg hover:scale-[1.02]"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Входим...
            </span>
          ) : (
            "Войти"
          )}
        </button>

        {/* Футер */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Защищённое соединение · Безопасность гарантирована
        </p>
      </div>
    </div>
  );
}