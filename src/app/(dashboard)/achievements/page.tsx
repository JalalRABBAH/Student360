import { requireSession } from "@/lib/auth/server";
import { getAchievements } from "@/lib/self-service/service";
import { AchievementsPage } from "@/components/self-service-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getAchievements(session);
  return <AchievementsPage data={data} />;
}
