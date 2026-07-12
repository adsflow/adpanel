import { redirect } from "next/navigation";
import { getPortalSession } from "@/lib/portal-auth";

export default async function PortalIndexPage() {
  const session = await getPortalSession();
  if (session) {
    redirect("/portal/dashboard");
  } else {
    redirect("/portal/login");
  }
}
