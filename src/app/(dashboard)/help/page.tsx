import { requireSession } from "@/lib/auth/server";
import { getHelp } from "@/lib/self-service/service";
import { HelpPage } from "@/components/self-service-ui";

export default async function Page() {
  const session = await requireSession();
  const data = await getHelp(session);
  return <HelpPage data={data} />;
}
