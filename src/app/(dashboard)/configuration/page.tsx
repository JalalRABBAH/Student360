import { requireCapability } from "@/lib/auth/server";
import { getConfiguration } from "@/lib/admin/reports-service";
import { ConfigurationPage } from "@/components/school-config-ui";

export default async function Page() {
  const session = await requireCapability("school:configure");
  const data = await getConfiguration(session);
  return <ConfigurationPage data={data} />;
}
