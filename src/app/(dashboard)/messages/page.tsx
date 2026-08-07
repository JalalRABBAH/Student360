import { requireCapability, requireModule } from "@/lib/auth/server";
import { listThreadsFor, recipientDirectory } from "@/lib/messages/service";
import { MessagesPage } from "@/components/messages-page";

export default async function Page() {
  const session = await requireCapability("message:write");
  await requireModule("messaging");
  const [threads, directory] = await Promise.all([listThreadsFor(session, {}), recipientDirectory(session, "")]);
  return (
    <MessagesPage
      sessionUser={{ id: session.sub, firstName: session.firstName, lastName: session.lastName }}
      initialThreads={threads}
      directory={directory}
    />
  );
}
