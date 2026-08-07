import { requireModule } from "@/lib/auth/server";
import { listManagedEstablishments } from "@/lib/platform/service";
import { EstablishmentsManagementPage } from "@/components/establishments-ui";

export default async function Page() {
  const session = await requireModule("establishments");
  const schools = await listManagedEstablishments(session);
  return <EstablishmentsManagementPage schools={schools} />;
}
