import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, clientId: true, name: true, phone: true },
  });

  return Response.json(user);
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { phone } = await req.json();

  if (phone && !/^077\d{6}$/.test(phone)) {
    return Response.json(
      { error: "Номер телефона должен быть в формате 077XXXXXX" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { phone },
      select: { id: true, clientId: true, name: true, phone: true },
    });
    return Response.json(updated);
  } catch (error: unknown) {
    // Проверяем на уникальность номера
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === "P2002"
    ) {
      return Response.json(
        { error: "Этот номер телефона уже используется" },
        { status: 409 }
      );
    }
    console.error(error);
    return Response.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}