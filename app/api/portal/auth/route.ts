import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { SignJWT } from "jose";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const PORTAL_SECRET = new TextEncoder().encode(
  process.env.PORTAL_SECRET ?? process.env.AUTH_SECRET ?? "fallback-portal-secret-change-me"
);

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  let client;
  try {
    client = await prisma.client.findUnique({
      where: { portalEmail: email },
      select: { id: true, name: true, portalEmail: true, portalPassword: true, status: true },
    });
  } catch (err) {
    console.error("[portal/auth] DB error:", err);
    return NextResponse.json({ error: "Authentication service unavailable." }, { status: 503 });
  }

  // Constant-time: always run bcrypt to prevent timing attacks
  const hash = client?.portalPassword ?? "$2a$12$dummyhashtopreventtimingattacks00000000000000000000000";
  const match = await bcrypt.compare(password, hash);

  if (!client || !match || client.status !== "ACTIVE") {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  // Issue a short-lived JWT stored in an httpOnly cookie
  const token = await new SignJWT({ sub: client.id, name: client.name, email: client.portalEmail })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(PORTAL_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("portal_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("portal_token");
  return NextResponse.json({ ok: true });
}
