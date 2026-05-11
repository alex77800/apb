import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const resolvedParams = await params;
  const transactionId = Number(resolvedParams.id);
  if (isNaN(transactionId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
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
  });

  if (!transaction || transaction.account.userId !== userId) {
    return Response.json({ error: "Transaction not found" }, { status: 404 });
  }

  return Response.json(transaction);
}