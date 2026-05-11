import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getRates, CurrencyCode, convert } from "@/lib/rates";

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone, amount } = await req.json();

  if (!phone || !/^077\d{6}$/.test(phone)) {
    return Response.json({ error: "Некорректный номер телефона" }, { status: 400 });
  }

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return Response.json({ error: "Некорректная сумма" }, { status: 400 });
  }

  // Ищем PMR-счёт пользователя
  let pmrAccount = await prisma.account.findFirst({
    where: { userId, currency: "PMR" },
    include: { transactions: true },
  });

  if (!pmrAccount) {
    const { generateAccountNumber } = await import("@/lib/accountNumber");
    pmrAccount = await prisma.account.create({
      data: {
        name: "Основной ПМР",
        currency: "PMR",
        accountNumber: generateAccountNumber("PMR"),
        userId,
        isActive: false,
      },
      include: { transactions: true },
    });
  }

  const balance = pmrAccount.transactions.reduce((sum, t) => sum + t.amount, 0);

  if (balance < numAmount) {
    const shortage = numAmount - balance;
    const rates = await getRates();

const activeAccount = await prisma.account.findFirst({
  where: { userId, isActive: true },
  include: { transactions: true },
});

const activeBalance = activeAccount
  ? activeAccount.transactions.reduce((sum, t) => sum + t.amount, 0)
  : 0;

    const activeCurrency = (activeAccount?.currency || "RUB") as CurrencyCode;
    const pmrCurrency = "PMR" as CurrencyCode;

    let conversionAmount = 0;
    if (activeAccount && rates[activeCurrency] && rates[pmrCurrency]) {
      conversionAmount = convert(shortage, pmrCurrency, activeCurrency, rates);
    }

    return Response.json(
      {
        error: "Недостаточно средств на PMR счёте",
        details: {
          shortage,
          pmrBalance: balance,
          activeCurrency,
          activeBalance: activeBalance,
          conversionNeeded: conversionAmount > 0 ? conversionAmount : null,
        },
      },
      { status: 400 }
    );
  }

  // Средств достаточно — выполняем платёж
  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({
      data: {
        accountId: pmrAccount!.id,
        amount: -numAmount,
        type: "mobile_payment",
        description: `Оплата мобильной связи ${phone}`,
      },
    });
    await tx.notification.create({
      data: {
        userId,
        message: `Оплачена мобильная связь ${phone} на сумму ${numAmount.toFixed(2)} PMR`,
        type: "mobile_payment",
      },
    });
  });

  return Response.json({ success: true });
}