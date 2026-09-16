import { LinkButton } from "@/components/ui/button";
import { HeroCarousel } from "@/components/hero/hero-carousel";
import { getSiteSettings } from "@/lib/data/settings";

/**
 * Full-viewport hero — heading/CTA overlaid on a full-bleed carousel whose
 * first slide is the printer exploded/assembled animation (played forward
 * once per view, not scroll-scrubbed — see archive/hero-video-scene/ and
 * archive/hero-frame-sequence/ for why scroll-driven versions of this
 * didn't work out), followed by any admin-managed photos from Settings.
 */
export async function HomepageHero() {
  const settings = await getSiteSettings();

  return (
    <div className="relative h-screen min-h-[560px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <HeroCarousel photos={settings.heroImages} />
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
