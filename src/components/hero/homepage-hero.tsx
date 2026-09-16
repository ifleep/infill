import { LinkButton } from "@/components/ui/button";
import { HeroStaticVisual } from "@/components/hero/hero-static";
import { PhotoCarousel } from "@/components/sections/photo-carousel";
import { getSiteSettings } from "@/lib/data/settings";

/**
 * Full-viewport hero — heading/CTA overlaid on a full-bleed photo carousel
 * (dot navigation, admin-managed photos), in the same position the earlier
 * scroll-driven animation attempts used. See archive/hero-video-scene/ and
 * archive/hero-frame-sequence/ for why those approaches didn't work out;
 * this keeps the same layout, just with a much simpler, CMS-editable visual
 * instead of a canvas animation. Falls back to a static illustration until
 * an admin adds photos via Settings.
 */
export async function HomepageHero() {
  const settings = await getSiteSettings();
  const hasPhotos = settings.heroImages.length > 0;

  return (
    <div className="relative h-screen min-h-[560px] w-full overflow-hidden">
      <div className="absolute inset-0">
        {hasPhotos ? <PhotoCarousel images={settings.heroImages} fill /> : <HeroStaticVisual />}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-hero-bg-deep/70 to-hero-bg-deep/5" />

      <div className="container-page relative z-10 flex h-full items-center pointer-events-none">
        <div className="max-w-xl pointer-events-auto">
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-on-navy sm:text-6xl lg:text-7xl">
            Build what&rsquo;s next.
          </h1>
          <p className="mt-5 max-w-md text-lg text-on-navy-muted">
            3D printing technology, materials and digital fabrication for Pakistan.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/category/3d-printers" size="lg">
              Shop 3D Printers
            </LinkButton>
            <LinkButton href="/about" variant="outline-invert" size="lg">
              Explore Technology
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  );
}
