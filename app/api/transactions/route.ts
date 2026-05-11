import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return Response.json([], { status: 401 });
    }

    const url = new URL(req.url);
    const accountIdParam = url.searchParams.get("accountId");
    const accountId = accountIdParam ? Number(accountIdParam) : null;

    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
          userId,
          ...(accountId ? { id: accountId } : {}),
        },
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            name: true,
            currency: true,
            userId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: accountId ? 10 : undefined, // для деталей счета берём только последние 10
    });

    return Response.json(transactions);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Ошибка загрузки транзакций" }, { status: 500 });
  }
}