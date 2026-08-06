import { requireSession } from "@/lib/auth/server";
import { getHomework } from "@/lib/workflow/service";
import { HomeworkPage } from "@/components/workflow-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getHomework(session);
  return <HomeworkPage data={data} />;
}
