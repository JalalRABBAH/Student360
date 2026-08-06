import { requireCapability } from "@/lib/auth/server";
import { getAuditOverview, listAuditLogs } from "@/lib/audit/service";
import { AuditPage } from "@/components/audit-ui";

export default async function Page() {
  const session = await requireCapability("audit:read");
  const [logs, overview] = await Promise.all([listAuditLogs(session, {}), getAuditOverview(session)]);
  return <AuditPage logs={logs} overview={overview} />;
}
