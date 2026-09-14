"use client";

import { useState } from "react";
import { CaretUp, CaretDown, Trash, Plus } from "@phosphor-icons/react";
import type {
  ContentBlock,
  ContentBlockType,
  BlockImageRef,
} from "@/lib/content-blocks/types";
import { BLOCK_TYPE_LABELS, createBlock } from "@/lib/content-blocks/types";
import type { MediaItem } from "@/lib/admin/media-types";
import { MediaPicker } from "@/components/admin/media-picker";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

function toImageRef(m: MediaItem): BlockImageRef {
  return { mediaId: m.id, url: m.url, alt: m.alt ?? "", caption: m.caption ?? undefined };
}

/**
 * Add/reorder/edit/remove UI for a product (or page/article) body built out
 * of content blocks — see src/lib/content-blocks/types.ts for the block
 * shapes and src/components/content-blocks/content-renderer.tsx for how
 * they render on the public site.
 */
export function ContentBlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);

  function patch(id: string, fields: Record<string, unknown>) {
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...fields } as ContentBlock) : b)));
  }
  function remove(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }
  function move(id: string, dir: -1 | 1) {
    const idx = blocks.findIndex((b) => b.id === id);
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }
  function add(type: ContentBlockType) {
    onChange([...blocks, createBlock(type)]);
    setAddOpen(false);
  }

  return (
    <div>
      {blocks.length === 0 && (
        <p className="mb-3 text-sm text-ink-faint">
          No content blocks yet — the legacy description above is shown instead. Add a block to build a richer page.
        </p>
      )}

      <div className="space-y-3">
        {blocks.map((block, i) => (
          <div key={block.id} className="rounded-lg border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border bg-surface-sunken px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {BLOCK_TYPE_LABELS[block.type]}
              </p>
              <div className="flex items-center gap-1">
                <IconButton label="Move up" disabled={i === 0} onClick={() => move(block.id, -1)}>
                  <CaretUp size={14} />
                </IconButton>
                <IconButton label="Move down" disabled={i === blocks.length - 1} onClick={() => move(block.id, 1)}>
                  <CaretDown size={14} />
                </IconButton>
                <IconButton label="Remove block" onClick={() => remove(block.id)}>
                  <Trash size={14} />
                </IconButton>
              </div>
            </div>
            <div className="p-4">
              <BlockFields block={block} onPatch={(fields) => patch(block.id, fields)} />
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-4">
        <button
          type="button"
          onClick={() => setAddOpen((o) => !o)}
          className="focus-ring flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-border-strong px-3 py-2 text-sm font-medium text-ink-muted hover:border-blue-400 hover:text-blue-700"
        >
          <Plus size={14} /> Add block
        </button>
        {addOpen && (
          <div className="absolute z-10 mt-1 grid w-72 grid-cols-2 gap-1 rounded-md border border-border bg-surface p-2 shadow-lg">
            {(Object.entries(BLOCK_TYPE_LABELS) as [ContentBlockType, string][]).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => add(type)}
                className="focus-ring cursor-pointer rounded px-2 py-1.5 text-left text-xs font-medium text-ink hover:bg-surface-sunken"
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

const textInput =
  "focus-ring w-full rounded-md border border-border-strong px-3 py-2 text-sm text-ink placeholder:text-ink-faint";

function BlockFields({
  block,
  onPatch,
}: {
  block: ContentBlock;
  onPatch: (fields: Record<string, unknown>) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <div className="flex gap-3">
          <select
            value={block.level}
            onChange={(e) => onPatch({ level: Number(e.target.value) })}
            className={`${textInput} w-24`}
          >
            <option value={2}>H2</option>
            <option value={3}>H3</option>
            <option value={4}>H4</option>
          </select>
          <input
            value={block.text}
            onChange={(e) => onPatch({ text: e.target.value })}
            placeholder="Heading text"
            className={textInput}
          />
        </div>
      );

    case "richText":
      return <RichTextEditor html={block.html} onChange={(html) => onPatch({ html })} placeholder="Write the content…" />;

    case "image":
      return (
        <div>
          <ImagePickerField image={block.image} onPick={(img) => onPatch({ image: img })} />
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={block.fullWidth} onChange={(e) => onPatch({ fullWidth: e.target.checked })} />
            Full width (breaks out of the content column)
          </label>
          <input
            value={block.image.caption ?? ""}
            onChange={(e) => onPatch({ image: { ...block.image, caption: e.target.value } })}
            placeholder="Caption (optional)"
            className={`${textInput} mt-3`}
          />
        </div>
      );

    case "imageText":
      return (
        <div className="space-y-3">
          <ImagePickerField image={block.image} onPick={(img) => onPatch({ image: img })} />
          <select
            value={block.imagePosition}
            onChange={(e) => onPatch({ imagePosition: e.target.value })}
            className={textInput}
          >
            <option value="left">Image on left</option>
            <option value="right">Image on right</option>
          </select>
          <input
            value={block.heading ?? ""}
            onChange={(e) => onPatch({ heading: e.target.value })}
            placeholder="Heading (optional)"
            className={textInput}
          />
          <RichTextEditor html={block.html} onChange={(html) => onPatch({ html })} placeholder="Text next to the image…" />
        </div>
      );

    case "gallery":
      return <GalleryField images={block.images} onChange={(images) => onPatch({ images })} />;

    case "featureGrid":
      return (
        <div className="space-y-3">
          <select
            value={block.columns}
            onChange={(e) => onPatch({ columns: Number(e.target.value) })}
            className={`${textInput} w-32`}
          >
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
            <option value={4}>4 columns</option>
          </select>
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-2 rounded-md border border-border p-2">
              <div className="flex-1 space-y-1.5">
                <input
                  value={item.title}
                  onChange={(e) =>
                    onPatch({ items: block.items.map((it, idx) => (idx === i ? { ...it, title: e.target.value } : it)) })
                  }
                  placeholder="Title"
                  className={textInput}
                />
                <textarea
                  value={item.text}
                  onChange={(e) =>
                    onPatch({ items: block.items.map((it, idx) => (idx === i ? { ...it, text: e.target.value } : it)) })
                  }
                  placeholder="Text"
                  rows={2}
                  className={textInput}
                />
              </div>
              <IconButton label="Remove" onClick={() => onPatch({ items: block.items.filter((_, idx) => idx !== i) })}>
                <Trash size={14} />
              </IconButton>
            </div>
          ))}
          <AddRowButton
            label="Add feature"
            onClick={() => onPatch({ items: [...block.items, { title: "", text: "" }] })}
          />
        </div>
      );

    case "specTable":
      return (
        <div className="space-y-3">
          <input
            value={block.title ?? ""}
            onChange={(e) => onPatch({ title: e.target.value })}
            placeholder="Table title (optional)"
            className={textInput}
          />
          {block.rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={row.label}
                onChange={(e) =>
                  onPatch({ rows: block.rows.map((r, idx) => (idx === i ? { ...r, label: e.target.value } : r)) })
                }
                placeholder="Label"
                className={textInput}
              />
              <input
                value={row.value}
                onChange={(e) =>
                  onPatch({ rows: block.rows.map((r, idx) => (idx === i ? { ...r, value: e.target.value } : r)) })
                }
                placeholder="Value"
                className={textInput}
              />
              <IconButton label="Remove" onClick={() => onPatch({ rows: block.rows.filter((_, idx) => idx !== i) })}>
                <Trash size={14} />
              </IconButton>
            </div>
          ))}
          <AddRowButton label="Add row" onClick={() => onPatch({ rows: [...block.rows, { label: "", value: "" }] })} />
        </div>
      );

    case "comparisonTable":
      return (
        <div className="space-y-3">
          <input
            value={block.columnHeadings.join(", ")}
            onChange={(e) => onPatch({ columnHeadings: e.target.value.split(",").map((s) => s.trim()) })}
            placeholder="Column headings, comma-separated (e.g. This model, Competitor A)"
            className={textInput}
          />
          {block.rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={row.label}
                onChange={(e) =>
                  onPatch({ rows: block.rows.map((r, idx) => (idx === i ? { ...r, label: e.target.value } : r)) })
                }
                placeholder="Row label"
                className={`${textInput} w-40 shrink-0`}
              />
              <input
                value={row.values.join(", ")}
                onChange={(e) =>
                  onPatch({
                    rows: block.rows.map((r, idx) =>
                      idx === i ? { ...r, values: e.target.value.split(",").map((s) => s.trim()) } : r
                    ),
                  })
                }
                placeholder="Values, comma-separated"
                className={textInput}
              />
              <IconButton label="Remove" onClick={() => onPatch({ rows: block.rows.filter((_, idx) => idx !== i) })}>
                <Trash size={14} />
              </IconButton>
            </div>
          ))}
          <AddRowButton
            label="Add row"
            onClick={() => onPatch({ rows: [...block.rows, { label: "", values: block.columnHeadings.map(() => "") }] })}
          />
        </div>
      );

    case "video":
      return (
        <div className="space-y-3">
          <input
            value={block.embedUrl}
            onChange={(e) => onPatch({ embedUrl: e.target.value })}
            placeholder="Embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID)"
            className={textInput}
          />
          <input
            value={block.caption ?? ""}
            onChange={(e) => onPatch({ caption: e.target.value })}
            placeholder="Caption (optional)"
            className={textInput}
          />
        </div>
      );

    case "download":
      return (
        <div className="space-y-3">
          <input
            value={block.label}
            onChange={(e) => onPatch({ label: e.target.value })}
            placeholder="Link label (e.g. Download user manual)"
            className={textInput}
          />
          <input
            value={block.url}
            onChange={(e) => onPatch({ url: e.target.value })}
            placeholder="File URL"
            className={textInput}
          />
          <input
            value={block.fileSizeLabel ?? ""}
            onChange={(e) => onPatch({ fileSizeLabel: e.target.value })}
            placeholder="File size label (optional, e.g. 2.4 MB PDF)"
            className={textInput}
          />
        </div>
      );

    case "callout":
      return (
        <div className="space-y-3">
          <select value={block.tone} onChange={(e) => onPatch({ tone: e.target.value })} className={`${textInput} w-40`}>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
          </select>
          <RichTextEditor html={block.html} onChange={(html) => onPatch({ html })} placeholder="Callout text…" />
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3">
          <textarea
            value={block.text}
            onChange={(e) => onPatch({ text: e.target.value })}
            placeholder="Quote text"
            rows={2}
            className={textInput}
          />
          <input
            value={block.attribution ?? ""}
            onChange={(e) => onPatch({ attribution: e.target.value })}
            placeholder="Attribution (optional)"
            className={textInput}
          />
        </div>
      );

    case "faq":
      return (
        <div className="space-y-3">
          {block.items.map((item, i) => (
            <div key={i} className="flex gap-2 rounded-md border border-border p-2">
              <div className="flex-1 space-y-1.5">
                <input
                  value={item.question}
                  onChange={(e) =>
                    onPatch({
                      items: block.items.map((it, idx) => (idx === i ? { ...it, question: e.target.value } : it)),
                    })
                  }
                  placeholder="Question"
                  className={textInput}
                />
                <textarea
                  value={item.answer}
                  onChange={(e) =>
                    onPatch({
                      items: block.items.map((it, idx) => (idx === i ? { ...it, answer: e.target.value } : it)),
                    })
                  }
                  placeholder="Answer"
                  rows={2}
                  className={textInput}
                />
              </div>
              <IconButton label="Remove" onClick={() => onPatch({ items: block.items.filter((_, idx) => idx !== i) })}>
                <Trash size={14} />
              </IconButton>
            </div>
          ))}
          <AddRowButton
            label="Add question"
            onClick={() => onPatch({ items: [...block.items, { question: "", answer: "" }] })}
          />
        </div>
      );

    case "spacer":
      return (
        <select value={block.size} onChange={(e) => onPatch({ size: e.target.value })} className={`${textInput} w-32`}>
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      );
  }
}

function AddRowButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring flex cursor-pointer items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
    >
      <Plus size={12} /> {label}
    </button>
  );
}

function ImagePickerField({ image, onPick }: { image: BlockImageRef; onPick: (image: BlockImageRef) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {image.url ? (
        <div className="mb-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
          <img src={image.url} alt="" className="h-16 w-16 rounded object-cover" />
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
        {image.url ? "Change image" : "Choose image"}
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

function GalleryField({ images, onChange }: { images: BlockImageRef[]; onChange: (images: BlockImageRef[]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {images.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div key={img.mediaId || i} className="group relative aspect-square overflow-hidden rounded-md bg-surface-sunken">
              {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, idx) => idx !== i))}
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
        onClick={() => setOpen(true)}
        className="focus-ring cursor-pointer rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-sunken"
      >
        Add images
      </button>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        multiple
        onSelect={(items) => {
          const existingIds = new Set(images.map((i) => i.mediaId));
          const additions = items.filter((i) => !existingIds.has(i.id)).map(toImageRef);
          if (additions.length > 0) onChange([...images, ...additions]);
        }}
      />
    </div>
  );
}
