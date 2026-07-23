import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { RulesEditor } from "@/components/settings/RulesEditor";
import { UserPermissionsPanel } from "@/components/settings/UserPermissionsPanel";
import { getCommissionRules, getCommissionTiers, getEmployees, getUsers } from "@/lib/api";
import { getCurrentUser } from "@/lib/session";
import { getServerLocale } from "@/lib/i18n/getServerLocale";
import { dictionaries } from "@/lib/i18n/dictionaries";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/dashboard");

  const locale = await getServerLocale();
  const dict = dictionaries[locale];

  const [rules, tiers, users, employees] = await Promise.all([
    getCommissionRules(),
    getCommissionTiers(),
    getUsers(),
    getEmployees(),
  ]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <PageHeader title={dict.settings.title} />
      <div className="grid grid-cols-1 gap-6 px-8 lg:grid-cols-[2fr_1fr]">
        <RulesEditor rules={rules} tiers={tiers} />
        <UserPermissionsPanel users={users} employees={employees} />
      </div>
    </div>
  );
}
