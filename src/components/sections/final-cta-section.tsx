import { LinkButton } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="bg-navy-900 py-20 text-on-navy sm:py-28">
      <div className="container-page text-center">
        <h2 className="font-display mx-auto max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Make something that matters.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-on-navy-muted">
          Whether you&rsquo;re printing your first model or building your next product, INFiLLPK gives
          you the technology to make it real.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/category/3d-printers" size="lg">
            Shop 3D Printers
          </LinkButton>
          <LinkButton href="/about" variant="outline-invert" size="lg">
            Explore INFiLLPK
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
