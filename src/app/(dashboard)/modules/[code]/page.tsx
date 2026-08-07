import { notFound } from "next/navigation";
import { requireModule } from "@/lib/auth/server";
import { MODULES, type ModuleCode } from "@/lib/modules/registry";
import { ComingSoonPage } from "@/components/coming-soon";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const module = MODULES.find((m) => m.code === code && m.placeholder);
  if (!module) notFound();
  await requireModule(module.code as ModuleCode);
  return <ComingSoonPage label={module.label} icon={module.icon} />;
}
