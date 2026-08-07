import { requireModule } from "@/lib/auth/server";
import { getAttendance } from "@/lib/workflow/service";
import { AttendancePage } from "@/components/workflow-ui";

export default async function Page() {
  const session = await requireModule("attendance");
  const data = await getAttendance(session);
  return <AttendancePage data={data} />;
}
