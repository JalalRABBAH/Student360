import { requireModule } from "@/lib/auth/server";
import { getObservations } from "@/lib/workflow/service";
import { ObservationsPage } from "@/components/workflow-ui";

export default async function Page() {
  const session = await requireModule("observations");
  const data = await getObservations(session);
  return <ObservationsPage data={data} />;
}
