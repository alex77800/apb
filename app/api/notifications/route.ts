import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30, // последние 30 уведомлений
    });

    return Response.json(notifications);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PATCH – отметить все как прочитанные (или конкретное по id, если передан)
export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json().catch(() => ({}));

    if (id) {
      // Отметить одно уведомление
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: true },
      });
    } else {
      // Отметить все
      await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true },
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}