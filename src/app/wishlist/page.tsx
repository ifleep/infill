import type { Metadata } from "next";
import { Heart } from "@phosphor-icons/react/ssr";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container-page flex flex-col items-center gap-4 py-24 text-center">
      <Heart size={40} weight="thin" className="text-ink-faint" />
      <h1 className="font-display text-2xl font-semibold text-ink">Your wishlist is empty</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        Sign in to save products for later, or start browsing the catalog.
      </p>
      <LinkButton href="/category/3d-printers">Browse 3D Printers</LinkButton>
    </div>
  );
}
