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
      establishmentAccess: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        take: 1,
      },
    },
  });

  if (!school) notFound();

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
        manager: school.establishmentAccess[0]?.user ?? null,
      }}
    />
  );
}
