import { requireSession } from "@/lib/auth/server";
import { getGoals } from "@/lib/self-service/service";
import { GoalsPage } from "@/components/self-service-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getGoals(session);
  return <GoalsPage data={data} />;
}
