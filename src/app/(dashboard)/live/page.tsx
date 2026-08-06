import { requireCapability } from "@/lib/auth/server";
import { getLive } from "@/lib/intelligence/service";
import { LivePage } from "@/components/intelligence-ui";

export default async function Page() {
  const session = await requireCapability("analytics:class");
  const data = await getLive(session);
  return <LivePage data={data} />;
}
