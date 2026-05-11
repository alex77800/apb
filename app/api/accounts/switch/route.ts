import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return Response.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { accountId } = await req.json();
    if (!accountId || typeof accountId !== "number") {
      return Response.json({ error: "Некорректный ID счёта" }, { status: 400 });
    }

    // Проверяем, что счёт принадлежит пользователю
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId },
    });
    if (!account) {
      return Response.json(
        { error: "Счёт не найден или не принадлежит вам" },
        { status: 404 },
      );
    }

    // Деактивируем все счета пользователя
    await prisma.account.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    // Активируем выбранный
    await prisma.account.update({
      where: { id: accountId },
      data: { isActive: true },
    });
    await prisma.notification.create({
      data: {
        userId,
        message: `Активный счёт изменён на ${account.name} (${account.accountNumber})`,
        type: "account_switch",
      },
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Ошибка переключения счёта" },
      { status: 500 },
    );
  }
}
