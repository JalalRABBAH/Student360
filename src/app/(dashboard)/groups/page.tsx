import { requireCapability, requireModule } from "@/lib/auth/server";
import { getGroupsOverview, listGroupBilling, listPlatformGroups } from "@/lib/platform/groups";
import { GroupsPage } from "@/components/groups-ui";

export default async function Page() {
  const session = await requireCapability("tenant:manage");
  await requireModule("groups");
  const [groups, overview, billing] = await Promise.all([
    listPlatformGroups(session),
    getGroupsOverview(session),
    listGroupBilling(session),
  ]);
  return <GroupsPage groups={groups} overview={overview} billing={billing} />;
}
