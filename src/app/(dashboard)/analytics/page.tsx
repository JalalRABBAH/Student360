import { requireCapability } from "@/lib/auth/server";
import { getAnalytics } from "@/lib/intelligence/service";
import { AnalyticsPage } from "@/components/intelligence-ui";

export default async function Page() {
  const session = await requireCapability("analytics:class");
  const data = await getAnalytics(session);
  return <AnalyticsPage data={data} />;
}
