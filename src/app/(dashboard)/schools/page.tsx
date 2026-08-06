import { requireCapability } from "@/lib/auth/server";
import { getPlatformOverview, listPlatformSchools } from "@/lib/platform/service";
import { SchoolsPage } from "@/components/platform-directory-ui";

export default async function Page() {
  const session = await requireCapability("tenant:manage");
  const [schools, overview] = await Promise.all([listPlatformSchools(session, {}), getPlatformOverview()]);
  return <SchoolsPage schools={schools} overview={overview} />;
}
