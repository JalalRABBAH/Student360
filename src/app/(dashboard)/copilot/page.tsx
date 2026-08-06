import { requireCapability } from "@/lib/auth/server";
import { getCopilotData } from "@/lib/copilot/service";
import { CopilotPage } from "@/components/copilot-ui";

export default async function Page() {
  const session = await requireCapability("copilot:use");
  const data = await getCopilotData(session);
  return <CopilotPage data={data} firstName={session.firstName} />;
}
