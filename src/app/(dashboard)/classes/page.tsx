import { requireSession } from "@/lib/auth/server";
import { listClasses } from "@/lib/students/service";
import { ClassesPage } from "@/components/students-directory-ui";
import { adminPanelsData } from "@/lib/admin/panels-data";

export default async function Page() {
  const session = await requireSession();
  const [classes, admin] = await Promise.all([listClasses(session), adminPanelsData(session)]);
  return <ClassesPage classes={classes} admin={admin} />;
}
