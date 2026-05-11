import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accountId } = await req.json();
    const userId = getUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }



    // 🔥 снимаем активность со всех счетов
    await prisma.account.updateMany({
      where: { userId: Number(userId) },
      data: { isActive: false },
    });

    // 🔥 ставим активный
    await prisma.account.update({
      where: { id: accountId },
      data: { isActive: true },
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}