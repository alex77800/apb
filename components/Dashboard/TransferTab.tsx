"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import { Send, Smartphone, ArrowRightLeft } from "lucide-react";

type Account = { id: number; name: string; balance: number; currency: string; accountNumber: string; isActive: boolean; };
type TransferRequestBody = { amount: number; toAccountNumber?: string; toAccountId?: number; phone?: string; };

type Props = { accounts: Account[]; onSuccess: () => void; };

export default function TransferTab({ accounts, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedOwnAccount, setSelectedOwnAccount] = useState<Account | null>(null);
  const [transferMode, setTransferMode] = useState<"external" | "own" | "phone">("external");
  const [rates, setRates] = useState<Record<string, number> | null>(null);

  useEffect(() => { apiClient<Record<string, number>>("/api/rates").then(setRates).catch(() => setRates(null)); }, []);

  const activeAccount = accounts.find(a => a.isActive);
  const ownAccounts = accounts.filter(a => a.id !== activeAccount?.id);

  const getConvertedAmount = () => {
    if (!selectedOwnAccount || !activeAccount || !rates || !amount) return null;
    if (activeAccount.currency === selectedOwnAccount.currency) return null;
    const from = activeAccount.currency as keyof typeof rates;
    const to = selectedOwnAccount.currency as keyof typeof rates;
    if (!rates[from] || !rates[to]) return null;
    return (Number(amount) * rates[from]) / rates[to];
  };

  const handleTransfer = async () => {
    if (!amount) { toast.error("Введите сумму"); return; }
    const body: TransferRequestBody = { amount: Number(amount) };
    if (transferMode === "external") {
      if (!toAccountNumber) { toast.error("Введите номер счёта"); return; }
      body.toAccountNumber = toAccountNumber;
    } else if (transferMode === "own") {
      if (!selectedOwnAccount) { toast.error("Выберите счёт"); return; }
      body.toAccountId = selectedOwnAccount.id;
    } else if (transferMode === "phone") {
      if (!phone || !/^077\d{6}$/.test(phone)) { toast.error("Формат: 077XXXXXX"); return; }
      body.phone = phone;
    }
    try {
      await apiClient("/api/transactions/transfer", { method: "POST", body: JSON.stringify(body) });
      toast.success("Перевод выполнен");
      setAmount(""); setToAccountNumber(""); setPhone(""); setSelectedOwnAccount(null);
      onSuccess();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Ошибка перевода";
      toast.error(msg);
    }
  };

  const converted = getConvertedAmount();

  return (
    <div className="max-w-md space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2"><Send size={20} className="text-[#3ebbec]" /> Перевод средств</h3>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTransferMode("external")} className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1 ${transferMode === "external" ? "bg-[#3ebbec] text-white" : "bg-gray-100 dark:bg-gray-700"}`}><ArrowRightLeft size={16} /> По счёту</button>
        <button onClick={() => setTransferMode("own")} className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1 ${transferMode === "own" ? "bg-[#3ebbec] text-white" : "bg-gray-100 dark:bg-gray-700"}`}><ArrowRightLeft size={16} /> Между своими</button>
        <button onClick={() => setTransferMode("phone")} className={`px-4 py-2 rounded-xl font-medium transition flex items-center gap-1 ${transferMode === "phone" ? "bg-[#3ebbec] text-white" : "bg-gray-100 dark:bg-gray-700"}`}><Smartphone size={16} /> По телефону</button>
      </div>

      <input type="number" className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-[#3ebbec] outline-none" placeholder="Сумма" value={amount} onChange={e => setAmount(e.target.value)} />

      {transferMode === "external" && <input className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-[#3ebbec] outline-none" placeholder="Номер счёта получателя" value={toAccountNumber} onChange={e => setToAccountNumber(e.target.value)} />}
      {transferMode === "own" && (
        <>
          <select className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-[#3ebbec] outline-none" value={selectedOwnAccount?.id ?? ""} onChange={e => setSelectedOwnAccount(ownAccounts.find(a => a.id === Number(e.target.value)) || null)}>
            <option value="">-- Выберите счёт --</option>
            {ownAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
          </select>
          {selectedOwnAccount && activeAccount && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {activeAccount.currency !== selectedOwnAccount.currency && rates && converted !== null ? (
                <p>Курс: {rates[activeAccount.currency]} → {rates[selectedOwnAccount.currency]}<br />Получатель получит: <strong>{converted.toFixed(2)} {selectedOwnAccount.currency}</strong></p>
              ) : <p>Валюта совпадает.</p>}
            </div>
          )}
        </>
      )}
      {transferMode === "phone" && <input className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-[#3ebbec] outline-none" placeholder="077XXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />}

      <button onClick={handleTransfer} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#3ebbec] to-cyan-500 text-white p-3 rounded-xl hover:shadow-lg transition">
        <Send size={18} /> Перевести
      </button>
    </div>
  );
}