import { HomepageSectionsManager } from "@/components/admin/homepage-sections-manager";

export default function AdminHomepagePage() {
  return (
    <div>
      <h1 className="font-display mb-2 text-2xl font-semibold text-ink">Homepage</h1>
      <p className="mb-6 text-sm text-ink-muted">
        Manage promotional banners and image sections shown on the homepage. The 3D hero, printer finder and
        Pakistan map are custom components and aren&rsquo;t editable here.
      </p>
      <HomepageSectionsManager />
    </div>
  );
}
