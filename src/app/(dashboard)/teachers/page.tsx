import { requireModule } from "@/lib/auth/server";
import { listTeachers } from "@/lib/students/service";
import { TeachersPage } from "@/components/students-directory-ui";
import { adminPanelsData } from "@/lib/admin/panels-data";

export default async function Page() {
  const session = await requireModule("teachers");
  const [teachers, admin] = await Promise.all([listTeachers(session), adminPanelsData(session)]);
  return <TeachersPage teachers={teachers} admin={admin} />;
}
