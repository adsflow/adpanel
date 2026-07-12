import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("portal_token");
  return NextResponse.redirect(new URL("/portal/login", process.env.NEXTAUTH_URL ?? "http://localhost:3000"));
}
