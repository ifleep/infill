import { getSiteSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display mb-6 text-2xl font-semibold text-ink">Settings</h1>
      <SettingsForm initial={settings} />
    </div>
  );
}
