import { LinkButton } from "@/components/ui/button";
import { HeroStaticVisual } from "@/components/hero/hero-static";
import { PhotoCarousel } from "@/components/sections/photo-carousel";
import { getSiteSettings } from "@/lib/data/settings";

/**
 * A lightweight image carousel (dot navigation, admin-managed photos) —
 * replaces the earlier scroll-scrubbed printer animation attempts (see
 * archive/hero-video-scene/ and archive/hero-3d-scene/ for why those didn't
 * work out). Heading sits above the carousel rather than overlaid on it, so
 * it isn't tied to the carousel's own aspect ratio/dot-row layout, and reads
 * cleanly regardless of what photos are in rotation.
 */
export async function HomepageHero() {
  const settings = await getSiteSettings();
  const hasPhotos = settings.heroImages.length > 0;

  return (
    <div className="bg-hero-bg-deep py-12 sm:py-16">
      <div className="container-page">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-on-navy sm:text-5xl lg:text-6xl">
            Build what&rsquo;s next.
          </h1>
          <p className="mt-4 max-w-md text-base text-on-navy-muted sm:text-lg">
            3D printing technology, materials and digital fabrication for Pakistan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/category/3d-printers" size="lg">
              Shop 3D Printers
            </LinkButton>
            <LinkButton href="/about" variant="outline-invert" size="lg">
              Explore Technology
            </LinkButton>
          </div>
        </div>

        <div className="mt-10">
          {hasPhotos ? (
            <PhotoCarousel images={settings.heroImages} />
          ) : (
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[21/9]">
              <HeroStaticVisual />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
