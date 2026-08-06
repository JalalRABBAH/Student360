import { requireSession } from "@/lib/auth/server";
import { listChildren } from "@/lib/students/service";
import { ChildrenPage } from "@/components/students-directory-ui";
import { hasRole } from "@/lib/auth/rbac";
import { ROLES } from "@/lib/domain/enums";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await requireSession();
  if (!hasRole(session, ROLES.PARENT)) redirect("/forbidden");
  const children = await listChildren(session);
  return <ChildrenPage children={children} />;
}
