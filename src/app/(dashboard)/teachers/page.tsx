import { requireSession } from "@/lib/auth/server";
import { listTeachers } from "@/lib/students/service";
import { TeachersPage } from "@/components/students-directory-ui";

export default async function Page() {
  const session = await requireSession();
  const teachers = await listTeachers(session);
  return <TeachersPage teachers={teachers} />;
}
