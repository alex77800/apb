// hooks/useAuth.ts
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

type User = {
  id: number;
  clientId: string;
  name: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    apiClient<User | null>('/api/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Редирект при отсутствии пользователя (опционально, т.к. middleware уже защищает)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const logout = async () => {
    await apiClient('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return { user, loading, logout };
}