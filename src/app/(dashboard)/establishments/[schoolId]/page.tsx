import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/server";
import { canManageSchool } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { EstablishmentSupervisionPage } from "@/components/establishment-supervision-ui";

type PageParams = Promise<{ schoolId: string }>;

export default async function Page({ params }: { params: PageParams }) {
  const session = await requireSession();
  const { schoolId } = await params;

  const allowed = await canManageSchool(session, schoolId);
  if (!allowed) redirect("/forbidden");

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      _count: { select: { students: true, teachers: true, classes: true } },
    },
  });

  if (!school) notFound();

  const managers = await prisma.establishmentAccess.findMany({
    where: { schoolId, role: { in: ["ADMIN", "PRINCIPAL", "MANAGER"] } },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <EstablishmentSupervisionPage
      school={{
        id: school.id,
        name: school.name,
        slug: school.slug,
        city: school.city,
        country: school.country,
        plan: school.plan,
        status: school.status,
        seatsLimit: school.seatsLimit,
        studentCount: school._count.students,
        teacherCount: school._count.teachers,
        classCount: school._count.classes,
        managers: managers.map((row) => ({
          id: row.user.id,
          firstName: row.user.firstName,
          lastName: row.user.lastName,
          email: row.user.email,
          accessRole: row.role,
        })),
      }}
    />
  );
}
