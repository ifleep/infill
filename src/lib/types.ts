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
  | "laser";

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

export interface Product extends SeoFields {
  id: string;
  slug: string;
  name: string;
  brandId: string;
  category: ProductCategory;
  subcategory: string;
  machineCategory?: MachineCategory;
  technology?: PrinterTechnology;
  experienceLevel?: ExperienceLevel[];
  useCases?: UseCase[];
  price: number;
  compareAtPrice?: number;
  currency: "PKR";
  stock: number;
  /** Below this stock count, product cards/pages show a "only N left" urgency badge. Unset disables it. */
  lowStockThreshold?: number;
  /** Set directly by an admin — not derived from `stock`, so a preorder or a temporarily out-of-stock item can be flagged independently of the count. */
  availability: Availability;
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
