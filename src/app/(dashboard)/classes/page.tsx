import { requireSession } from "@/lib/auth/server";
import { listClasses } from "@/lib/students/service";
import { ClassesPage } from "@/components/students-directory-ui";

export default async function Page() {
  const session = await requireSession();
  const classes = await listClasses(session);
  return <ClassesPage classes={classes} />;
}
