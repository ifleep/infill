import { getActiveHomepageSections } from "@/lib/data/homepage-sections";
import type { HomepageSection, PromoBannerConfig, PromoImageConfig } from "@/lib/content-blocks/homepage-types";
import { LinkButton } from "@/components/ui/button";
import { PhotoCarousel } from "@/components/sections/photo-carousel";

// Renders the admin-managed promotional content from /admin/homepage
// (requirement #8/9) — explicitly separate from the hand-built hero,
// printer finder and Pakistan map, which stay custom components untouched
// by this system. Nothing renders here until an admin adds a section.
export async function HomepagePromoSections() {
  const sections = await getActiveHomepageSections();
  if (sections.length === 0) return null;

  return (
    <div className="space-y-10 py-10 sm:py-14">
      {sections.map((section) => (
        <SectionView key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionView({ section }: { section: HomepageSection }) {
  if (section.type === "promo_banner") {
    return <PromoBannerView config={section.config as PromoBannerConfig} />;
  }
  return <PromoImageView config={section.config as PromoImageConfig} />;
}

function PromoBannerView({ config }: { config: PromoBannerConfig }) {
  if (!config.desktopImage?.url) return null;
  return (
    <section className="container-page">
      <div className="relative overflow-hidden rounded-2xl bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import */}
        <img
          src={config.mobileImage?.url ?? config.desktopImage.url}
          alt={config.desktopImage.alt}
          className="h-full w-full object-cover sm:hidden"
          loading="lazy"
          decoding="async"
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import */}
        <img
          src={config.desktopImage.url}
          alt={config.desktopImage.alt}
          className="hidden h-full w-full object-cover sm:block"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-ink/80 via-ink/40 to-transparent px-8 py-10 sm:px-14">
          <h3 className="font-display max-w-md text-2xl font-semibold text-white sm:text-3xl">{config.heading}</h3>
          {config.text && <p className="mt-2 max-w-md text-sm text-white/80">{config.text}</p>}
          {config.buttonText && config.buttonUrl && (
            <LinkButton href={config.buttonUrl} className="mt-5 w-fit">
              {config.buttonText}
            </LinkButton>
          )}
        </div>
      </div>
    </section>
  );
}

function PromoImageView({ config }: { config: PromoImageConfig }) {
  if (config.variant === "carousel") {
    if (!config.images || config.images.length === 0) return null;
    return (
      <section className="container-page">
        {(config.heading || config.text) && (
          <div className="mb-6 text-center">
            {config.heading && <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{config.heading}</h3>}
            {config.text && <p className="mt-2 text-sm text-ink-muted">{config.text}</p>}
          </div>
        )}
        <PhotoCarousel images={config.images} />
      </section>
    );
  }

  if (config.variant === "gallery") {
    if (!config.images || config.images.length === 0) return null;
    return (
      <section className="container-page">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {config.images.map((img, i) => (
            <div key={img.mediaId || i} className="aspect-square overflow-hidden rounded-xl bg-surface-sunken">
              {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import */}
              <img src={img.url} alt={img.alt} className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!config.image?.url) return null;

  if (config.variant === "overlay-text") {
    return (
      <section className="container-page">
        <div className="relative overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import */}
          <img
            src={config.image.url}
            alt={config.image.alt}
            className="aspect-[21/9] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/40 px-6 text-center">
            {config.heading && <h3 className="font-display text-2xl font-semibold text-white sm:text-3xl">{config.heading}</h3>}
            {config.text && <p className="mt-2 max-w-lg text-sm text-white/85">{config.text}</p>}
            {config.buttonText && config.buttonUrl && (
              <LinkButton href={config.buttonUrl} className="mt-5">
                {config.buttonText}
              </LinkButton>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (config.variant === "image-text") {
    const imageFirst = config.imagePosition !== "right";
    return (
      <section className="container-page">
        <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
          <div className={imageFirst ? "order-1" : "order-2"}>
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import */}
            <img
              src={config.image.url}
              alt={config.image.alt}
              className="w-full rounded-2xl object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className={imageFirst ? "order-2" : "order-1"}>
            {config.heading && <h3 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{config.heading}</h3>}
            {config.text && <p className="mt-3 text-base text-ink-muted">{config.text}</p>}
            {config.buttonText && config.buttonUrl && (
              <LinkButton href={config.buttonUrl} className="mt-5">
                {config.buttonText}
              </LinkButton>
            )}
          </div>
        </div>
      </section>
    );
  }

  // full-width
  return (
    <section className="container-page">
      <div className="overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- CMS-managed image, not a static import */}
        <img
          src={config.image.url}
          alt={config.image.alt}
          className="w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      {(config.heading || config.buttonText) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {config.heading && <h3 className="font-display text-xl font-semibold text-ink">{config.heading}</h3>}
          {config.buttonText && config.buttonUrl && <LinkButton href={config.buttonUrl}>{config.buttonText}</LinkButton>}
        </div>
      )}
    </section>
  );
}
