import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { generateAccountNumber } from "@/lib/accountNumber";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, currency } = await req.json();
    if (!name || !currency) {
      return Response.json({ error: "Name and currency required" }, { status: 400 });
    }

    // Генерируем уникальный номер
    let accountNumber = generateAccountNumber(currency);
    // Убедимся, что такой номер не существует (очень маловероятно, но проверим)
    const existing = await prisma.account.findUnique({ where: { accountNumber } });
    if (existing) {
      accountNumber = generateAccountNumber(currency); // повторная попытка
    }

    const account = await prisma.account.create({
      data: {
        name,
        currency,
        accountNumber,
        userId,
        isActive: false, // Новый счет не становится активным автоматически
      },
    });

    return Response.json({ success: true, account });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка создания счёта" }, { status: 500 });
  }
}