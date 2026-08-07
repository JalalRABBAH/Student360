import { requireSession } from "@/lib/auth/server";
import { getClassDetail } from "@/lib/students/service";
import { ClassDashboardPage } from "@/components/class-dashboard-page";
import { adminClassDetailData } from "@/lib/admin/panels-data";
import { notFound, redirect } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const session = await requireSession();
  let schoolClass;
  try {
    schoolClass = await getClassDetail(session, classId);
  } catch (error) {
    if (error instanceof Error && error.message === "CLASS_ACCESS_DENIED") redirect("/forbidden");
    notFound();
  }
  const admin = await adminClassDetailData(session, classId);
  return <ClassDashboardPage schoolClass={schoolClass} admin={admin} />;
}
