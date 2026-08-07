import { requireModule } from "@/lib/auth/server";
import { ModulesPermissionsPage } from "@/components/modules-permissions-ui";
import { MODULES, MODULE_CATEGORIES, ROLE_MODULE_ACCESS } from "@/lib/modules/registry";
import { ROLES, type RoleCode } from "@/lib/domain/enums";

export default async function Page() {
  await requireModule("permissions");
  const roles: RoleCode[] = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER, ROLES.NURSE, ROLES.PARENT, ROLES.STUDENT];
  return (
    <ModulesPermissionsPage
      categories={MODULE_CATEGORIES}
      modules={MODULES}
      roles={roles}
      matrix={ROLE_MODULE_ACCESS}
    />
  );
}
