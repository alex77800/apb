import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { generateCardNumber } from "@/lib/cardUtils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const accountIdParam = url.searchParams.get("accountId");
  const accountId = accountIdParam ? Number(accountIdParam) : null;

  const cards = await prisma.card.findMany({
    where: {
      account: {
        userId,
        ...(accountId ? { id: accountId } : {}),
      },
    },
    include: { account: { select: { name: true, currency: true } } },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(cards);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { accountId, paymentSystem } = await req.json();
  if (!accountId || !paymentSystem) {
    return Response.json({ error: "accountId and paymentSystem required" }, { status: 400 });
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, userId },
  });
  if (!account) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  const { cardNumber, cvv, expiryMonth, expiryYear } = generateCardNumber(paymentSystem);

  try {
    const card = await prisma.card.create({
      data: {
        cardNumber,
        cvv,
        expiryMonth,
        expiryYear,
        paymentSystem,
        accountId,
      },
      include: { account: { select: { name: true, currency: true } } },
    });

    return Response.json(card);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Card creation failed" }, { status: 500 });
  }
}