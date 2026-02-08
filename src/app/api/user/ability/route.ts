import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ALLOWED = new Set([
  "blind",
  "partially-blind",
  "color-blind",
  "non-blind",
]);

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { ability?: string }
    | null;

  const ability = body?.ability;
  if (!ability || !ALLOWED.has(ability)) {
    return new Response("Invalid ability", { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { ability },
  });

  return Response.json({ ability });
}
