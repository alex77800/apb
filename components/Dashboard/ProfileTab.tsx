"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import toast from "react-hot-toast";
import { User, Save } from "lucide-react";

type Profile = {
  id: number;
  clientId: string;
  name: string;
  phone: string | null;
};

export default function ProfileTab() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient<Profile>("/api/profile")
      .then((data) => {
        setProfile(data);
        setPhone(data.phone || "");
      })
      .catch(() => toast.error("Не удалось загрузить профиль"))
      .finally(() => setLoading(false));
  }, []);

  const savePhone = async () => {
    if (phone && !/^077\d{6}$/.test(phone)) {
      toast.error("Формат: 077XXXXXX");
      return;
    }
    setSaving(true);
    try {
      const updated = await apiClient<Profile>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ phone: phone || null }),
      });
      setProfile(updated);
      toast.success("Номер сохранён");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Ошибка";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-gray-500">Загрузка профиля...</div>;
  if (!profile) return <div className="text-red-500">Профиль не найден</div>;

  return (
    <div className="max-w-md p-6 rounded-2xl bg-white dark:bg-gray-800 shadow space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <User size={20} className="text-[#3ebbec]" /> Профиль
      </h3>
      <div>
        <p className="text-sm text-gray-500">ID клиента</p>
        <p className="font-medium">{profile.clientId}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Имя</p>
        <p className="font-medium">{profile.name}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">
          Номер телефона для быстрых переводов
        </p>
        <input
          className="w-full p-3 rounded-xl border dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-green-400 outline-none mt-1"
          placeholder="077XXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <button
        onClick={savePhone}
        disabled={saving}
        className="w-full py-3 bg-gradient-to-r from-[#3ebbec] to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition flex items-center justify-center gap-2"
      >
        <Save size={18} /> {saving ? "Сохранение..." : "Сохранить номер"}
      </button>
    </div>
  );
}
