import { requireCapability, requireModule } from "@/lib/auth/server";
import { getReports } from "@/lib/admin/reports-service";
import { ReportsPage } from "@/components/reports-ui";

export default async function Page() {
  const session = await requireCapability("reports:export");
  await requireModule("reports");
  const data = await getReports(session);
  return <ReportsPage data={data} />;
}
