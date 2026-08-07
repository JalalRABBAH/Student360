import { requireModule } from "@/lib/auth/server";
import { getToday } from "@/lib/workflow/service";
import { TodayPage } from "@/components/workflow-ui";

export default async function Page() {
  const session = await requireModule("calendar");
  const data = await getToday(session);
  return <TodayPage data={data} />;
}
