import { requireCapability } from "@/lib/auth/server";
import { getReports } from "@/lib/admin/service";
import { ReportsPage } from "@/components/reports-ui";

export default async function Page() {
  const session = await requireCapability("reports:export");
  const data = await getReports(session);
  return <ReportsPage data={data} />;
}
