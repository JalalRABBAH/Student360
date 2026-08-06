import { requireSession } from "@/lib/auth/server";
import { getFeedback } from "@/lib/self-service/service";
import { FeedbackPage } from "@/components/self-service-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getFeedback(session);
  return <FeedbackPage data={data} />;
}
