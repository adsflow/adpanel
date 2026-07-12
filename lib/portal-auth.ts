/**
 * Portal authentication helper — verifies the portal_token cookie
 * and returns the decoded payload, or null if invalid/missing.
 */

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const rawSecret = process.env.PORTAL_SECRET ?? process.env.AUTH_SECRET;
if (!rawSecret) {
  throw new Error("[portal-auth] PORTAL_SECRET or AUTH_SECRET must be set.");
}
export const PORTAL_SECRET = new TextEncoder().encode(rawSecret);

export type PortalPayload = {
  sub: string;   // client ID
  name: string | null;
  email: string | null;
};

export async function getPortalSession(): Promise<PortalPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("portal_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, PORTAL_SECRET);
    return {
      sub: payload.sub as string,
      name: (payload.name as string) ?? null,
      email: (payload.email as string) ?? null,
    };
  } catch {
    return null;
  }
}
