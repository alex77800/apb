import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { getRates, convert, CurrencyCode } from "@/lib/rates";
import { generateAccountNumber } from "@/lib/accountNumber";

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, toAccountNumber, toAccountId, phone } = await req.json();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Активный счёт отправителя
    const fromAccount = await prisma.account.findFirst({
      where: { userId, isActive: true },
      include: { transactions: true },
    });

    if (!fromAccount) {
      return Response.json({ error: "No active account" }, { status: 400 });
    }

    let toAccount;
    let toUserId: number | null = null;

    if (toAccountId) {
      // Внутренний перевод между своими счетами
      toAccount = await prisma.account.findFirst({
        where: { id: Number(toAccountId), userId },
      });
    } else if (toAccountNumber) {
      // Внешний перевод по номеру счёта
      toAccount = await prisma.account.findUnique({
        where: { accountNumber: toAccountNumber },
      });
    } else if (phone) {
      // Быстрый перевод по номеру телефона
      if (!/^077\d{6}$/.test(phone)) {
        return Response.json(
          { error: "Номер телефона должен быть в формате 077XXXXXX" },
          { status: 400 }
        );
      }

      const recipient = await prisma.user.findUnique({
        where: { phone },
        include: { accounts: { where: { currency: "PMR" } } },
      });

      if (!recipient) {
        return Response.json(
          { error: "Пользователь с таким номером не найден" },
          { status: 404 }
        );
      }
      if (recipient.id === userId) {
        return Response.json(
          { error: "Нельзя перевести самому себе" },
          { status: 400 }
        );
      }

      let pmrAccount = recipient.accounts[0];
      if (!pmrAccount) {
        const newAccountNumber = generateAccountNumber("PMR");
        pmrAccount = await prisma.account.create({
          data: {
            name: "Основной ПМР",
            currency: "PMR",
            accountNumber: newAccountNumber,
            userId: recipient.id,
            isActive: false,
          },
        });
      }

      toAccount = pmrAccount;
      toUserId = recipient.id;
    } else {
      return Response.json(
        { error: "Укажите счёт получателя, номер счёта или номер телефона" },
        { status: 400 }
      );
    }

    if (!toAccount) {
      return Response.json(
        { error: "Recipient account not found" },
        { status: 404 }
      );
    }

    if (fromAccount.id === toAccount.id) {
      return Response.json(
        { error: "Cannot transfer to the same account" },
        { status: 400 }
      );
    }

    // Проверка баланса (в валюте отправителя)
    const balance = fromAccount.transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );
    if (balance < numAmount) {
      return Response.json({ error: "Insufficient funds" }, { status: 400 });
    }

    const isCrossCurrency = fromAccount.currency !== toAccount.currency;
    let incomingAmount = numAmount;
    let descriptionOut = `Transfer to ${toAccount.accountNumber}`;
    let descriptionIn = `Transfer from ${fromAccount.accountNumber}`;
    let exchangeRate: string | undefined;

    if (isCrossCurrency) {
      const rates = await getRates();
      const fromCurrency = fromAccount.currency as CurrencyCode;
      const toCurrency = toAccount.currency as CurrencyCode;

      if (!rates[fromCurrency] || !rates[toCurrency]) {
        return Response.json(
          { error: "Currency rate not available" },
          { status: 400 }
        );
      }

      incomingAmount = convert(numAmount, fromCurrency, toCurrency, rates);
      const rateValue = rates[fromCurrency] / rates[toCurrency];
      exchangeRate = rateValue.toFixed(4);

      descriptionOut = `Transfer to ${toAccount.accountNumber} (${fromCurrency} → ${toCurrency}, rate ${exchangeRate})`;
      descriptionIn = `Transfer from ${fromAccount.accountNumber} (${fromCurrency} → ${toCurrency}, rate ${exchangeRate})`;
    }

    // Атомарная запись с сохранением созданных транзакций
    const [outgoingTx, incomingTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          accountId: fromAccount.id,
          amount: -numAmount,
          type: "transfer_out",
          description: descriptionOut,
        },
      }),
      prisma.transaction.create({
        data: {
          accountId: toAccount.id,
          amount: incomingAmount,
          type: "transfer_in",
          description: descriptionIn,
        },
      }),
    ]);

    // Уведомления с привязкой к транзакциям
    await prisma.notification.createMany({
      data: [
        {
          userId: fromAccount.userId,
          message: `Вы перевели ${numAmount.toFixed(2)} ${fromAccount.currency} со счёта ${fromAccount.accountNumber} на счёт ${toAccount.accountNumber}`,
          type: "transfer_out",
          transactionId: outgoingTx.id,
        },
        {
          userId: toUserId ?? toAccount.userId,
          message: `Вам поступило ${incomingAmount.toFixed(2)} ${toAccount.currency} от счёта ${fromAccount.accountNumber}`,
          type: "transfer_in",
          transactionId: incomingTx.id,
        },
      ],
    });

    return Response.json({ ok: true, exchangeRate });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Transfer failed" }, { status: 500 });
  }
}