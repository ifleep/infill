// Shared shape for a Media Library row as used across admin components
// (image-uploader, media-picker, product-form, and eventually the block
// content editor / homepage CMS) — matches what /api/admin/upload and
// /api/admin/media return.
export interface MediaItem {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  // Present when the item came straight from the Media Library/upload API;
  // absent when it's a lighter-weight ProductMediaItem (see
  // src/lib/data/products.ts) that only carries what the photo manager UI
  // needs (id/url/alt/caption).
  filename?: string;
  mimeType?: string;
  size?: number;
  width?: number | null;
  height?: number | null;
}
