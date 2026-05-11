import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return Response.json({ success: true });
}