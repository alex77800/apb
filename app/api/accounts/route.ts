import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId(); // ❗ sync

  if (!userId) {
    return Response.json([], { status: 401 });
  }

  const accounts = await prisma.account.findMany({
    where: { userId },
    include: { transactions: true },
  });

  return Response.json(
    accounts.map((acc) => {
      const balance = acc.transactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );

      return {
        id: acc.id,
        name: acc.name,
        accountNumber: acc.accountNumber,
        currency: acc.currency,
        isActive: acc.isActive,
        balance,
      };
    })
  );
}