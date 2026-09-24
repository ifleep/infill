import type { ContentBlock } from "@/lib/content-blocks/types";

export type PrinterTechnology =
  | "FDM"
  | "Resin"
  | "CoreXY"
  | "Large Format"
  | "Industrial"
  | "Educational"
  | "DIY";

export type MachineCategory =
  | "3d-printing"
  | "cnc"
  | "uv-printing"
  | "laser"
  | "robots";

export type ExperienceLevel = "Beginner" | "Intermediate" | "Professional" | "Industrial";

export type UseCase = "Hobby" | "Engineering" | "Prototyping" | "Education" | "Business" | "Industrial";

export interface Dimensions {
  width: number;
  depth: number;
  height: number;
  unit: "mm";
}

export interface BuildVolume {
  x: number;
  y: number;
  z: number;
  unit: "mm";
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string;
  description: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parent?: string;
}

export type ProductCategory =
  | "printers"
  | "filament"
  | "resin"
  | "parts"
  | "machines";

export interface Specification {
  label: string;
  value: string;
}

export type Availability = "in-stock" | "out-of-stock" | "preorder";

// Shared by Product/Page/Article — see requirement #12: every product/CMS
// page needs editable SEO fields, all optional with sensible fallbacks
// (e.g. product name + shortDescription) when left blank.
export interface SeoFields {
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  noindex?: boolean;
  includeInSitemap?: boolean;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  sku?: string;
  availability: Availability;
  isDefault: boolean;
}

export interface Product extends SeoFields {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  /** Denormalized from the Brand table at read time (see products.ts's `fromRow`) so client components can display it without touching the database themselves. */
  brandName: string;
  brandSlug: string;
  category: ProductCategory;
  /** Optional assignment into the admin-managed Category taxonomy (see /admin/categories) — internal organization, separate from `category` above which drives the actual shop routing. */
  categoryId?: string;
  subcategory: string;
  machineCategory?: MachineCategory;
  technology?: PrinterTechnology[];
  experienceLevel?: ExperienceLevel[];
  useCases?: UseCase[];
  /**
   * Optional purchasable configurations of this same listing (e.g. "Standard"
   * vs "Combo (AMS Lite)"), each with its own price/stock — see
   * ProductVariant. Empty when the product has none, in which case `price`/
   * `stock` below are used directly, exactly as before variants existed.
   * When non-empty, `price` is the cheapest variant's price and `stock` is
   * the summed variant stock (derived in products.ts's `fromRow`), so every
   * page that isn't variant-aware still shows something correct.
   */
  variants: ProductVariant[];
  price: number;
  compareAtPrice?: number;
  currency: "PKR";
  stock: number;
  /** Below this stock count, product cards/pages show a "only N left" urgency badge. Unset disables it. */
  lowStockThreshold?: number;
  /** Set directly by an admin — not derived from `stock`, so a preorder or a temporarily out-of-stock item can be flagged independently of the count. */
  availability: Availability;
  /** Effective preorder lead time in days — this product's own override if set, otherwise the site-wide default (see getEffectivePreorderLeadDays in products.ts). Always a resolved number, never needs a settings lookup at render time. */
  preorderLeadDays: number;
  quoteOnly?: boolean;
  images: string[];
  shortDescription: string;
  description: string;
  /** Rich block-based body — when present, takes over from `description` on the product page. */
  contentBlocks?: ContentBlock[];
  specifications: Specification[];
  materials?: string[];
  buildVolume?: BuildVolume;
  speedMmPerSec?: number;
  weightKg?: number;
  dimensions?: Dimensions;
  warrantyMonths: number;
  accessoryIds?: string[];
  relatedProductIds?: string[];
  compatibleFilamentTags?: string[];
  tags: string[];
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  soldCount?: number;
  saleEndsAt?: string;
  limitedStockEnabled?: boolean;
  limitedStockQuantity?: number;
}

export interface Article extends SeoFields {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Buying Guide" | "Comparison" | "Materials" | "Maintenance" | "Technology";
  readingMinutes: number;
  publishedAt: string;
  contentBlocks: ContentBlock[];
  author?: string;
  featuredImageUrl?: string;
  status: "draft" | "published" | "scheduled";
  relatedProductIds?: string[];
}

export interface ServiceOffering {
  id: string;
  name: string;
  headline: string;
  description: string;
  bullets: string[];
}

export interface PakistanRegion {
  id: string;
  name: string;
  shortLabel: string;
  motif: string;
  copy: string;
  /** Stylized hotspot ellipse in the 0–300 x 0–420 map viewBox (abstract, not survey-accurate). */
  shape: { cx: number; cy: number; rx: number; ry: number };
  labelPoint: { x: number; y: number };
}
