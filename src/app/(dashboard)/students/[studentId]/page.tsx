import { StudentProfileDemo } from "@/components/student-profile-demo";
import { demoStudents } from "@/lib/demo-data";
import { requireSession } from "@/lib/auth/server";
import { canAccessDemoStudent } from "@/lib/auth/rbac";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const student = demoStudents.find((item) => item.id === studentId);
  if (!student) notFound();

  const session = await requireSession();
  if (!(await canAccessDemoStudent(session, student))) redirect("/forbidden");

  return <StudentProfileDemo studentId={studentId} />;
}