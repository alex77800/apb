import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const { clientId, password } = await req.json();

  if (!clientId || !password) {
    return Response.json({ error: "Заполните поля" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { clientId },
  });

  if (!user) {
    return Response.json({ error: "Неверные данные" }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return Response.json({ error: "Неверные данные" }, { status: 401 });
  }

  const token = signToken({
    userId: user.id,
    clientId: user.clientId,
  });

  (await cookies()).set("token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({
    success: true,
    user: {
      id: user.id,
      clientId: user.clientId,
      name: user.name,
    },
  });
}