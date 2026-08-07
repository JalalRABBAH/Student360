import { requireSession } from "@/lib/auth/server";
import { isLeadership } from "@/lib/auth/rbac";
import { listMyActions, listTemplates } from "@/lib/actions/service";
import { ActionsPage, type AdminTemplateRow, type AssignableUser } from "@/components/actions-page";
import { prisma } from "@/lib/db";
import { ROLES } from "@/lib/domain/enums";

export default async function Page() {
  const session = await requireSession();

  if (isLeadership(session) && session.schoolId) {
    const templates = await listTemplates(session);
    const schoolId = session.schoolId;

    let users: AssignableUser[] = [];
    if (schoolId) {
      const [teachers, students, guardians] = await Promise.all([
        prisma.teacher.findMany({
          where: { schoolId },
          select: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { user: { lastName: "asc" } },
        }),
        prisma.student.findMany({
          where: { schoolId },
          select: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { user: { lastName: "asc" } },
        }),
        prisma.guardian.findMany({
          where: { schoolId },
          select: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { user: { lastName: "asc" } },
        }),
      ]);
      users = [
        ...teachers.map((t) => ({ id: t.user.id, name: `${t.user.firstName} ${t.user.lastName}`, role: ROLES.TEACHER })),
        ...students.map((s) => ({ id: s.user.id, name: `${s.user.firstName} ${s.user.lastName}`, role: ROLES.STUDENT })),
        ...guardians.map((g) => ({ id: g.user.id, name: `${g.user.firstName} ${g.user.lastName}`, role: ROLES.PARENT })),
      ];
    }

    const classes = schoolId
      ? await prisma.schoolClass.findMany({ where: { schoolId }, select: { id: true, name: true }, orderBy: { name: "asc" } })
      : [];

    return <ActionsPage mode="admin" templates={templates as AdminTemplateRow[]} users={users} classes={classes} />;
  }

  const data = await listMyActions(session);
  return <ActionsPage mode="mine" pending={data.pending} history={data.history} counts={data.counts} />;
}
