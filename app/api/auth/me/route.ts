import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return Response.json(null, { status: 401 });
  }

  const decoded = verifyToken(token) as { userId: number } | null;

  if (!decoded?.userId) {
    return Response.json(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      clientId: true,
      name: true,
    },
  });

  if (!user) {
    return Response.json(null, { status: 401 });
  }

  return Response.json(user);
}