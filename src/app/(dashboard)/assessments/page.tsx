import { requireSession } from "@/lib/auth/server";
import { getAssessments } from "@/lib/workflow/service";
import { AssessmentsPage } from "@/components/workflow-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getAssessments(session);
  return <AssessmentsPage data={data} />;
}
