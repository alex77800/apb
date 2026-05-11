import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export async function getUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const decoded = verifyToken(token) as { userId: number } | null;

  return decoded?.userId ?? null;
}