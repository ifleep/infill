import Link from "next/link";
import type { ContentBlock } from "@/lib/content-blocks/types";

// Dispatches each stored block to its matching presentational component —
// this is the only place that switches on block.type, so the product page
// (and later Pages/Articles) stay free of block-specific JSX (see AGENTS
// requirement #19).
export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) return null;
  return (
    <div className="space-y-10">
      {blocks.map((block) => (
        <BlockView key={block.id} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading":
      return <HeadingBlockView block={block} />;
    case "richText":
      return <RichTextBlockView block={block} />;
    case "image":
      return <ImageBlockView block={block} />;
    case "imageText":
      return <ImageTextBlockView block={block} />;
    case "gallery":
      return <GalleryBlockView block={block} />;
    case "featureGrid":
      return <FeatureGridBlockView block={block} />;
    case "specTable":
      return <SpecTableBlockView block={block} />;
    case "comparisonTable":
      return <ComparisonTableBlockView block={block} />;
    case "video":
      return <VideoBlockView block={block} />;
    case "download":
      return <DownloadBlockView block={block} />;
    case "callout":
      return <CalloutBlockView block={block} />;
    case "quote":
      return <QuoteBlockView block={block} />;
    case "faq":
      return <FaqBlockView block={block} />;
    case "spacer":
      return <SpacerBlockView block={block} />;
  }
}

function HeadingBlockView({ block }: { block: Extract<ContentBlock, { type: "heading" }> }) {
  if (!block.text) return null;
  const className = "font-display font-semibold text-ink";
  if (block.level === 2) return <h2 className={`${className} text-xl`}>{block.text}</h2>;
  if (block.level === 3) return <h3 className={`${className} text-lg`}>{block.text}</h3>;
  return <h4 className={`${className} text-base`}>{block.text}</h4>;
}

function RichTextBlockView({ block }: { block: Extract<ContentBlock, { type: "richText" }> }) {
  if (!block.html) return null;
  return (
    <div
      className="prose-content max-w-2xl text-ink-muted [&_a]:text-blue-700 [&_a]:underline [&_h3]:font-display [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_strong]:text-ink"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

function ImageBlockView({ block }: { block: Extract<ContentBlock, { type: "image" }> }) {
  if (!block.image.url) return null;
  return (
    <figure className={block.fullWidth ? "-mx-4 sm:mx-0" : "max-w-2xl"}>
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
      <img
        src={block.image.url}
        alt={block.image.alt}
        className="w-full rounded-lg object-cover"
        loading="lazy"
        decoding="async"
      />
      {block.image.caption && <figcaption className="mt-2 text-xs text-ink-faint">{block.image.caption}</figcaption>}
    </figure>
  );
}

function ImageTextBlockView({ block }: { block: Extract<ContentBlock, { type: "imageText" }> }) {
  const imageFirst = block.imagePosition === "left";
  return (
    <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
      <div className={imageFirst ? "order-1" : "order-2"}>
        {block.image.url && (
          // eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import
          <img
            src={block.image.url}
            alt={block.image.alt}
            className="w-full rounded-lg object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      <div className={imageFirst ? "order-2" : "order-1"}>
        {block.heading && <h3 className="font-display text-lg font-semibold text-ink">{block.heading}</h3>}
        {block.html && (
          <div
            className="mt-2 text-sm text-ink-muted [&_p]:mt-2"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        )}
      </div>
    </div>
  );
}

function GalleryBlockView({ block }: { block: Extract<ContentBlock, { type: "gallery" }> }) {
  if (block.images.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {block.images.map((img, i) => (
        <figure key={img.mediaId || i} className="overflow-hidden rounded-lg bg-surface-sunken">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded files, not a static import */}
          <img src={img.url} alt={img.alt} className="aspect-square w-full object-cover" loading="lazy" decoding="async" />
        </figure>
      ))}
    </div>
  );
}

function FeatureGridBlockView({ block }: { block: Extract<ContentBlock, { type: "featureGrid" }> }) {
  if (block.items.length === 0) return null;
  const colsClass = block.columns === 2 ? "sm:grid-cols-2" : block.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>
      {block.items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border bg-surface p-5">
          <p className="font-display font-semibold text-ink">{item.title}</p>
          <p className="mt-1.5 text-sm text-ink-muted">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function SpecTableBlockView({ block }: { block: Extract<ContentBlock, { type: "specTable" }> }) {
  if (block.rows.length === 0) return null;
  return (
    <div>
      {block.title && <h3 className="font-display mb-3 text-lg font-semibold text-ink">{block.title}</h3>}
      <div className="overflow-hidden rounded-lg border border-border">
        {block.rows.map((row, i) => (
          <div
            key={row.label + i}
            className={`flex justify-between px-4 py-3 text-sm ${i % 2 === 0 ? "bg-surface" : "bg-surface-sunken"}`}
          >
            <span className="text-ink-muted">{row.label}</span>
            <span className="tabular font-medium text-ink">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonTableBlockView({ block }: { block: Extract<ContentBlock, { type: "comparisonTable" }> }) {
  if (block.rows.length === 0) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="bg-surface-sunken text-left text-xs uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3 font-medium"> </th>
            {block.columnHeadings.map((h) => (
              <th key={h} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {block.rows.map((row) => (
            <tr key={row.label}>
              <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
              {row.values.map((v, i) => (
                <td key={i} className="tabular px-4 py-3 text-ink-muted">
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VideoBlockView({ block }: { block: Extract<ContentBlock, { type: "video" }> }) {
  if (!block.embedUrl) return null;
  return (
    <figure>
      <div className="aspect-video overflow-hidden rounded-lg bg-ink">
        <iframe
          src={block.embedUrl}
          title={block.caption ?? "Video"}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {block.caption && <figcaption className="mt-2 text-xs text-ink-faint">{block.caption}</figcaption>}
    </figure>
  );
}

function DownloadBlockView({ block }: { block: Extract<ContentBlock, { type: "download" }> }) {
  if (!block.url) return null;
  return (
    <Link
      href={block.url}
      target="_blank"
      className="focus-ring flex max-w-md items-center justify-between rounded-lg border border-border-strong px-4 py-3 text-sm font-medium text-ink hover:bg-surface-sunken"
    >
      <span>{block.label || "Download"}</span>
      <span className="text-xs text-ink-faint">{block.fileSizeLabel ?? "↓"}</span>
    </Link>
  );
}

function CalloutBlockView({ block }: { block: Extract<ContentBlock, { type: "callout" }> }) {
  if (!block.html) return null;
  const toneClass =
    block.tone === "warning"
      ? "border-amber-300 bg-amber-50"
      : block.tone === "success"
        ? "border-pk-green/30 bg-pk-green/5"
        : "border-blue-200 bg-blue-50";
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm text-ink [&_p]:mt-1.5 [&_p:first-child]:mt-0 ${toneClass}`}
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

function QuoteBlockView({ block }: { block: Extract<ContentBlock, { type: "quote" }> }) {
  if (!block.text) return null;
  return (
    <blockquote className="border-l-2 border-blue-600 pl-4">
      <p className="font-display text-lg text-ink">&ldquo;{block.text}&rdquo;</p>
      {block.attribution && <cite className="mt-2 block text-sm not-italic text-ink-faint">— {block.attribution}</cite>}
    </blockquote>
  );
}

function FaqBlockView({ block }: { block: Extract<ContentBlock, { type: "faq" }> }) {
  if (block.items.length === 0) return null;
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {block.items.map((item, i) => (
        <details key={i} className="group px-4 py-3">
          <summary className="focus-ring cursor-pointer list-none text-sm font-medium text-ink">{item.question}</summary>
          <p className="mt-2 text-sm text-ink-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function SpacerBlockView({ block }: { block: Extract<ContentBlock, { type: "spacer" }> }) {
  const height = block.size === "sm" ? "h-4" : block.size === "lg" ? "h-16" : "h-8";
  return <div className={height} aria-hidden="true" />;
}
