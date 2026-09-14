"use client";

import { useEffect, useState } from "react";
import { CaretUp, CaretDown, Trash, Plus } from "@phosphor-icons/react";
import type {
  HomepageSection,
  HomepageSectionType,
  PromoBannerConfig,
  PromoImageConfig,
  PromoImageVariant,
} from "@/lib/content-blocks/homepage-types";
import { HOMEPAGE_SECTION_TYPE_LABELS, createHomepageSectionConfig } from "@/lib/content-blocks/homepage-types";
import type { BlockImageRef } from "@/lib/content-blocks/types";
import type { MediaItem } from "@/lib/admin/media-types";
import { MediaPicker } from "@/components/admin/media-picker";

const textInput =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

function toImageRef(m: MediaItem): BlockImageRef {
  return { mediaId: m.id, url: m.url, alt: m.alt ?? "", caption: m.caption ?? undefined };
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function HomepageSectionsManager() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/homepage-sections");
      const data = await res.json();
      setSections(data);
    } catch {
      setError("Couldn't load homepage sections.");
    } finally {
      setLoading(false);
    }
  }

  async function addSection(type: HomepageSectionType) {
    setAddOpen(false);
    const res = await fetch("/api/admin/homepage-sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title: HOMEPAGE_SECTION_TYPE_LABELS[type],
        config: createHomepageSectionConfig(type),
        enabled: false,
        startsAt: null,
        endsAt: null,
      }),
    });
    if (res.ok) load();
    else setError("Couldn't create the section — fill in the required fields and save.");
  }

  async function save(section: HomepageSection) {
    const res = await fetch(`/api/admin/homepage-sections/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: section.type,
        title: section.title,
        config: section.config,
        enabled: section.enabled,
        startsAt: section.startsAt,
        endsAt: section.endsAt,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Couldn't save this section.");
      return false;
    }
    setError(null);
    return true;
  }

  function updateLocal(id: string, patch: Partial<HomepageSection>) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function remove(id: string) {
    if (!confirm("Remove this homepage section?")) return;
    await fetch(`/api/admin/homepage-sections/${id}`, { method: "DELETE" });
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = sections.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSections(next);
    await fetch("/api/admin/homepage-sections/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((s) => s.id) }),
    });
  }

  if (loading) return <p className="text-sm text-ink-faint">Loading…</p>;

  return (
    <div>
      {error && <p className="mb-4 rounded-md bg-destructive-tint px-3 py-2 text-sm text-destructive">{error}</p>}

      {sections.length === 0 && (
        <p className="mb-4 text-sm text-ink-faint">
          No promotional sections yet — add one below. They appear on the homepage between the featured printers and
          materials sections once enabled.
        </p>
      )}

      <div className="space-y-3">
        {sections.map((section, i) => (
          <SectionCard
            key={section.id}
            section={section}
            index={i}
            total={sections.length}
            onChange={(patch) => updateLocal(section.id, patch)}
            onSave={() => save({ ...section })}
            onRemove={() => remove(section.id)}
            onMoveUp={() => move(section.id, -1)}
            onMoveDown={() => move(section.id, 1)}
          />
        ))}
      </div>

      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => setAddOpen((o) => !o)}
          className="focus-ring flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border-strong px-3 py-2 text-sm font-medium text-ink-muted hover:border-blue-400 hover:text-blue-700"
        >
          <Plus size={14} /> Add section
        </button>
        {addOpen && (
          <div className="absolute z-10 mt-1 w-64 rounded-md border border-border bg-surface p-2 shadow-lg">
            {(Object.entries(HOMEPAGE_SECTION_TYPE_LABELS) as [HomepageSectionType, string][]).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => addSection(type)}
                className="focus-ring block w-full cursor-pointer rounded px-2 py-1.5 text-left text-sm font-medium text-ink hover:bg-surface-sunken"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({
  section,
  index,
  total,
  onChange,
  onSave,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  section: HomepageSection;
  index: number;
  total: number;
  onChange: (patch: Partial<HomepageSection>) => void;
  onSave: () => Promise<boolean>;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    const ok = await onSave();
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border bg-surface-sunken px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
            {HOMEPAGE_SECTION_TYPE_LABELS[section.type]}
          </p>
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={(e) => onChange({ enabled: e.target.checked })}
            />
            Enabled
          </label>
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Move up" disabled={index === 0} onClick={onMoveUp}>
            <CaretUp size={14} />
          </IconButton>
          <IconButton label="Move down" disabled={index === total - 1} onClick={onMoveDown}>
            <CaretDown size={14} />
          </IconButton>
          <IconButton label="Remove" onClick={onRemove}>
            <Trash size={14} />
          </IconButton>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <input
          value={section.title ?? ""}
          onChange={(e) => onChange({ title: e.target.value || null })}
          placeholder="Internal label (not shown on the site)"
          className={textInput}
        />

        {section.type === "promo_banner" ? (
          <PromoBannerFields
            config={section.config as PromoBannerConfig}
            onChange={(config) => onChange({ config })}
          />
        ) : (
          <PromoImageFields
            config={section.config as PromoImageConfig}
            onChange={(config) => onChange({ config })}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-ink">Starts (optional)</span>
            <input
              type="date"
              value={toDateInputValue(section.startsAt)}
              onChange={(e) => onChange({ startsAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className={textInput}
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-ink">Ends (optional)</span>
            <input
              type="date"
              value={toDateInputValue(section.endsAt)}
              onChange={(e) => onChange({ endsAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className={textInput}
            />
          </label>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="focus-ring cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && <span className="text-xs font-medium text-pk-green">Saved</span>}
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="focus-ring cursor-pointer rounded p-1 text-ink-muted hover:bg-border disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function ImagePickerField({
  label,
  image,
  onPick,
}: {
  label: string;
  image: BlockImageRef | undefined;
  onPick: (image: BlockImageRef) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {image?.url ? (
        <div className="mb-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
          <img src={image.url} alt="" className="h-14 w-14 rounded object-cover" />
          <input
            value={image.alt}
            onChange={(e) => onPick({ ...image, alt: e.target.value })}
            placeholder="Alt text"
            className={`${textInput} flex-1`}
          />
        </div>
      ) : (
        <p className="mb-2 text-xs text-ink-faint">No image selected.</p>
      )}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="focus-ring cursor-pointer rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunken"
      >
        {image?.url ? "Change image" : "Choose image"}
      </button>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        multiple={false}
        onSelect={(items) => items[0] && onPick(toImageRef(items[0]))}
      />
    </div>
  );
}

function PromoBannerFields({
  config,
  onChange,
}: {
  config: PromoBannerConfig;
  onChange: (config: PromoBannerConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <ImagePickerField
        label="Desktop image"
        image={config.desktopImage}
        onPick={(img) => onChange({ ...config, desktopImage: img })}
      />
      <ImagePickerField
        label="Mobile image (optional)"
        image={config.mobileImage}
        onPick={(img) => onChange({ ...config, mobileImage: img })}
      />
      <input
        value={config.heading}
        onChange={(e) => onChange({ ...config, heading: e.target.value })}
        placeholder="Heading"
        className={textInput}
      />
      <input
        value={config.text ?? ""}
        onChange={(e) => onChange({ ...config, text: e.target.value })}
        placeholder="Short text (optional)"
        className={textInput}
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          value={config.buttonText ?? ""}
          onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
          placeholder="Button text (optional)"
          className={textInput}
        />
        <input
          value={config.buttonUrl ?? ""}
          onChange={(e) => onChange({ ...config, buttonUrl: e.target.value })}
          placeholder="Button URL (e.g. /category/filament)"
          className={textInput}
        />
      </div>
    </div>
  );
}

function PromoImageFields({
  config,
  onChange,
}: {
  config: PromoImageConfig;
  onChange: (config: PromoImageConfig) => void;
}) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  return (
    <div className="space-y-3">
      <select
        value={config.variant}
        onChange={(e) => onChange({ ...config, variant: e.target.value as PromoImageVariant })}
        className={textInput}
      >
        <option value="full-width">Full-width image</option>
        <option value="image-text">Image + text</option>
        <option value="overlay-text">Image with overlay text</option>
        <option value="gallery">Image gallery</option>
      </select>

      {config.variant === "gallery" ? (
        <div>
          {config.images && config.images.length > 0 && (
            <div className="mb-2 grid grid-cols-4 gap-2">
              {config.images.map((img, i) => (
                <div key={img.mediaId || i} className="group relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
                  {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onChange({ ...config, images: config.images!.filter((_, idx) => idx !== i) })}
                    aria-label="Remove"
                    className="focus-ring absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setGalleryOpen(true)}
            className="focus-ring cursor-pointer rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunken"
          >
            Add images
          </button>
          <MediaPicker
            open={galleryOpen}
            onClose={() => setGalleryOpen(false)}
            multiple
            onSelect={(items) => {
              const existing = new Set((config.images ?? []).map((i) => i.mediaId));
              const additions = items.filter((i) => !existing.has(i.id)).map(toImageRef);
              onChange({ ...config, images: [...(config.images ?? []), ...additions] });
            }}
          />
        </div>
      ) : (
        <ImagePickerField label="Image" image={config.image} onPick={(img) => onChange({ ...config, image: img })} />
      )}

      {config.variant === "image-text" && (
        <select
          value={config.imagePosition ?? "left"}
          onChange={(e) => onChange({ ...config, imagePosition: e.target.value as "left" | "right" })}
          className={textInput}
        >
          <option value="left">Image on left</option>
          <option value="right">Image on right</option>
        </select>
      )}

      {config.variant !== "gallery" && (
        <>
          <input
            value={config.heading ?? ""}
            onChange={(e) => onChange({ ...config, heading: e.target.value })}
            placeholder="Heading (optional)"
            className={textInput}
          />
          <input
            value={config.text ?? ""}
            onChange={(e) => onChange({ ...config, text: e.target.value })}
            placeholder="Text (optional)"
            className={textInput}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={config.buttonText ?? ""}
              onChange={(e) => onChange({ ...config, buttonText: e.target.value })}
              placeholder="Button text (optional)"
              className={textInput}
            />
            <input
              value={config.buttonUrl ?? ""}
              onChange={(e) => onChange({ ...config, buttonUrl: e.target.value })}
              placeholder="Button URL (optional)"
              className={textInput}
            />
          </div>
        </>
      )}
    </div>
  );
}
