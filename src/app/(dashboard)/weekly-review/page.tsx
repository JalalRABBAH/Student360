import { requireSession } from "@/lib/auth/server";
import { getWeeklyReview } from "@/lib/workflow/service";
import { WeeklyReviewPage } from "@/components/workflow-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getWeeklyReview(session);
  return <WeeklyReviewPage data={data} />;
}
