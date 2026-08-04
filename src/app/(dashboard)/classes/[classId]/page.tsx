import { ClassDashboardDemo } from "@/components/class-dashboard-demo";
import { demoClasses } from "@/lib/demo-data";
import { requireSession } from "@/lib/auth/server";
import { canAccessDemoClass } from "@/lib/auth/rbac";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const schoolClass = demoClasses.find((item) => item.id === classId);
  if (!schoolClass) notFound();

  const session = await requireSession();
  if (!(await canAccessDemoClass(session, schoolClass))) redirect("/forbidden");

  return <ClassDashboardDemo classId={classId} />;
}