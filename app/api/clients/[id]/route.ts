import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (response) return response;
  void session;

  const { id } = await params;

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        metaAccounts: {
          select: { id: true, adAccountId: true, adAccountName: true, status: true },
        },
        googleAccounts: {
          select: { id: true, customerId: true, customerName: true, status: true },
        },
        campaigns: {
          select: {
            id: true,
            name: true,
            platform: true,
            status: true,
            spend: true,
            clicks: true,
            conversions: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found." }, { status: 404 });
    }

    // Strip portal password before returning
    const { portalPassword: _omit, ...safe } = client as typeof client & {
      portalPassword?: string;
    };
    void _omit;

    return NextResponse.json(safe);
  } catch (err) {
    console.error("[GET /api/clients/[id]]", err);
    return NextResponse.json(
      { error: "Failed to fetch client." },
      { status: 500 }
    );
  }
}
