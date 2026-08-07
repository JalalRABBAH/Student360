import { requireModule } from "@/lib/auth/server";
import { getSchoolOverview } from "@/lib/students/service";
import { SchoolPage } from "@/components/students-directory-ui";
import { adminPanelsData } from "@/lib/admin/panels-data";
import { notFound } from "next/navigation";

export default async function Page() {
  const session = await requireModule("establishments");
  let overview;
  try {
    overview = await getSchoolOverview(session);
  } catch {
    notFound();
  }
  const admin = await adminPanelsData(session);
  return <SchoolPage overview={overview} admin={admin} />;
}
