import { requireModule } from "@/lib/auth/server";
import { getGroupSummary, listManagedEstablishments } from "@/lib/platform/service";
import { EstablishmentsManagementPage } from "@/components/establishments-ui";

export default async function Page() {
  const session = await requireModule("establishments");
  const [schools, summary] = await Promise.all([
    listManagedEstablishments(session),
    getGroupSummary(session),
  ]);
  return <EstablishmentsManagementPage schools={schools} summary={summary} />;
}
