// The block-based rich content system (AGENTS/requirement #5): lets a
// non-developer build a manufacturer-style product/article/page body out of
// discrete, reorderable blocks from the admin, with no HTML/React/Markdown
// authoring required. Stored as JSON (Product.contentBlocks / Page.contentBlocks
// / Article.contentBlocks / HomepageSection.config) and rendered by
// src/components/content-blocks/content-renderer.tsx.
//
// Image blocks reference a Media Library item, but store its url/alt/caption
// alongside the id (denormalized) so rendering never needs a DB join —
// the tradeoff is that deleting a Media row that's still referenced inside a
// content block won't be caught by the "in use" check on /api/admin/media/[id]
// (that only tracks ProductMedia usage), which is a known limitation.

export interface BlockImageRef {
  mediaId: string;
  url: string;
  alt: string;
  caption?: string;
}

interface BaseBlock {
  id: string;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
}

export interface RichTextBlock extends BaseBlock {
  type: "richText";
  html: string;
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  image: BlockImageRef;
  fullWidth: boolean;
}

export interface ImageTextBlock extends BaseBlock {
  type: "imageText";
  image: BlockImageRef;
  imagePosition: "left" | "right";
  heading?: string;
  html: string;
}

export interface GalleryBlock extends BaseBlock {
  type: "gallery";
  images: BlockImageRef[];
}

export interface FeatureGridItem {
  title: string;
  text: string;
}

export interface FeatureGridBlock extends BaseBlock {
  type: "featureGrid";
  columns: 2 | 3 | 4;
  items: FeatureGridItem[];
}

export interface SpecTableBlock extends BaseBlock {
  type: "specTable";
  title?: string;
  rows: { label: string; value: string }[];
}

export interface ComparisonTableBlock extends BaseBlock {
  type: "comparisonTable";
  columnHeadings: string[];
  rows: { label: string; values: string[] }[];
}

export interface VideoBlock extends BaseBlock {
  type: "video";
  embedUrl: string;
  caption?: string;
}

export interface DownloadBlock extends BaseBlock {
  type: "download";
  label: string;
  url: string;
  fileSizeLabel?: string;
}

export interface CalloutBlock extends BaseBlock {
  type: "callout";
  tone: "info" | "warning" | "success";
  html: string;
}

export interface QuoteBlock extends BaseBlock {
  type: "quote";
  text: string;
  attribution?: string;
}

export interface FaqBlock extends BaseBlock {
  type: "faq";
  items: { question: string; answer: string }[];
}

export interface SpacerBlock extends BaseBlock {
  type: "spacer";
  size: "sm" | "md" | "lg";
}

export type ContentBlock =
  | HeadingBlock
  | RichTextBlock
  | ImageBlock
  | ImageTextBlock
  | GalleryBlock
  | FeatureGridBlock
  | SpecTableBlock
  | ComparisonTableBlock
  | VideoBlock
  | DownloadBlock
  | CalloutBlock
  | QuoteBlock
  | FaqBlock
  | SpacerBlock;

export type ContentBlockType = ContentBlock["type"];

export const BLOCK_TYPE_LABELS: Record<ContentBlockType, string> = {
  heading: "Heading",
  richText: "Rich text",
  image: "Image",
  imageText: "Image + text",
  gallery: "Image gallery",
  featureGrid: "Feature grid",
  specTable: "Specification table",
  comparisonTable: "Comparison table",
  video: "Video / embed",
  download: "PDF / manual download",
  callout: "Callout",
  quote: "Quote",
  faq: "FAQ",
  spacer: "Spacer",
};

export function newBlockId(): string {
  return `b-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function createBlock(type: ContentBlockType): ContentBlock {
  const id = newBlockId();
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "" };
    case "richText":
      return { id, type, html: "" };
    case "image":
      return { id, type, image: { mediaId: "", url: "", alt: "" }, fullWidth: false };
    case "imageText":
      return { id, type, image: { mediaId: "", url: "", alt: "" }, imagePosition: "left", html: "" };
    case "gallery":
      return { id, type, images: [] };
    case "featureGrid":
      return { id, type, columns: 3, items: [] };
    case "specTable":
      return { id, type, rows: [] };
    case "comparisonTable":
      return { id, type, columnHeadings: [], rows: [] };
    case "video":
      return { id, type, embedUrl: "" };
    case "download":
      return { id, type, label: "", url: "" };
    case "callout":
      return { id, type, tone: "info", html: "" };
    case "quote":
      return { id, type, text: "" };
    case "faq":
      return { id, type, items: [] };
    case "spacer":
      return { id, type, size: "md" };
  }
}

// Loose runtime guard for JSON coming out of the DB — deliberately
// permissive (admin-authored content, not untrusted user input) since the
// goal is just to drop anything malformed rather than validate every field.
export function parseContentBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (b): b is ContentBlock =>
      typeof b === "object" && b !== null && typeof (b as { id?: unknown }).id === "string" && typeof (b as { type?: unknown }).type === "string"
  );
}
