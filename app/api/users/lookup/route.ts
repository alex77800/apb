// app/api/users/lookup/route.ts
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const phone = url.searchParams.get("phone");
  if (!phone || !/^077\d{6}$/.test(phone)) {
    return Response.json({ error: "Некорректный номер" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { phone },
    select: {
      id: true,
      name: true,
      accounts: {
        where: { currency: "PMR" },
        take: 1, // берём первый PMR-счёт
      },
    },
  });

  if (!user) {
    return Response.json({ error: "Пользователь с таким номером не найден" }, { status: 404 });
  }

  // Если PMR-счёта нет – создадим автоматически (или вернём ошибку; решим создать)
  // Пока вернём null, а создание выполним в момент перевода
  const pmrAccount = user.accounts[0] || null;

  return Response.json({
    id: user.id,
    name: user.name,
    hasPmrAccount: !!pmrAccount,
    pmrAccountId: pmrAccount?.id ?? null,
  });
}