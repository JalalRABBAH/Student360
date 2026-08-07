import { requireCapability } from "@/lib/auth/server";
import { listStudents } from "@/lib/students/service";
import { StudentsPage } from "@/components/students-directory-ui";
import { adminPanelsData } from "@/lib/admin/panels-data";

export default async function Page() {
  const session = await requireCapability("student:read");
  const [students, admin] = await Promise.all([listStudents(session), adminPanelsData(session)]);
  return <StudentsPage students={students} admin={admin} />;
}
