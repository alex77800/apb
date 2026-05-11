import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function GET() {
  const password = "123456";

  const user = await prisma.user.create({
    data: {
      clientId: "CL-100002",
      password: await bcrypt.hash(password, 10),
      name: "Test2",
      surname: "User2",
    },
  });

  await prisma.account.create({
    data: {
      name: "Main Account",
      currency: "USD",
      balance: 1000,
      accountNumber: "ACC-TEST-002",
      userId: user.id,
    },
  });

  return NextResponse.json({
    clientId: "CL-100002",
    password,
  });
}