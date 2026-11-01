import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import { AppShell } from "@/components/layout/AppShell";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <AppShell>{children}</AppShell>;
}