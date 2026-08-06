import { requireCapability } from "@/lib/auth/server";
import { getPlatformOverview, listPlatformUsers } from "@/lib/platform/service";
import { UsersPage } from "@/components/platform-directory-ui";

export default async function Page() {
  const session = await requireCapability("tenant:manage");
  const [users, overview] = await Promise.all([listPlatformUsers(session, {}), getPlatformOverview()]);
  return <UsersPage users={users} overview={overview} />;
}
