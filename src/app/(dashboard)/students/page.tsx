import { requireCapability } from "@/lib/auth/server";
import { listStudents } from "@/lib/students/service";
import { StudentsPage } from "@/components/students-directory-ui";

export default async function Page() {
  const session = await requireCapability("student:read");
  const students = await listStudents(session);
  return <StudentsPage students={students} />;
}
