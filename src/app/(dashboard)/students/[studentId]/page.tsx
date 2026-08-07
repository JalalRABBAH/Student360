import { requireModule } from "@/lib/auth/server";
import { getStudentProfile } from "@/lib/students/service";
import { StudentProfilePage } from "@/components/student-profile-page";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const session = await requireModule("performance");
  let profile;
  try {
    profile = await getStudentProfile(session, studentId);
  } catch (error) {
    if (error instanceof Error && error.message === "STUDENT_ACCESS_DENIED") redirect("/forbidden");
    notFound();
  }
  return <StudentProfilePage profile={profile} />;
}
