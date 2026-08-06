import { requireSession } from "@/lib/auth/server";
import { getProgress } from "@/lib/self-service/service";
import { ProgressPage } from "@/components/self-service-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getProgress(session);
  return <ProgressPage data={data} />;
}
