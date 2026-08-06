import { requireSession } from "@/lib/auth/server";
import { getDashboard } from "@/lib/dashboard/service";
import { DashboardPage } from "@/components/dashboard-page";

export default async function Page() {
  const session = await requireSession();
  const data = await getDashboard(session);
  return <DashboardPage data={data} />;
}
