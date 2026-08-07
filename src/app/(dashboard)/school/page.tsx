import { requireModule } from "@/lib/auth/server";
import { getSchoolOverview } from "@/lib/students/service";
import { SchoolPage } from "@/components/students-directory-ui";
import { notFound } from "next/navigation";

export default async function Page() {
  const session = await requireModule("establishments");
  let overview;
  try {
    overview = await getSchoolOverview(session);
  } catch {
    notFound();
  }
  return <SchoolPage overview={overview} />;
}
