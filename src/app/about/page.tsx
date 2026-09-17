import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/section-heading";
import { LinkButton } from "@/components/ui/button";
import { RegionalMotifEdge } from "@/components/patterns/regional-motif-edge";

export const metadata: Metadata = {
  title: "About",
  description: "Who INFiLLPK is, and why we exist — modern 3D printing and digital fabrication for Pakistan.",
};

export default function AboutPage() {
  return (
    <div>
      <RegionalMotifEdge motif="balochistan" side="left" />
      <RegionalMotifEdge motif="kp" side="right" />
      <section className="bg-navy-900 py-20 text-on-navy sm:py-28">
        <div className="container-page">
          <SectionHeading
            inverted
            eyebrow="About INFiLLPK"
            title="Pakistan doesn't need to wait for the future to arrive."
            description="We can build it."
          />
        </div>
      </section>

      <section className="container-page py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Who we are</h2>
            <p className="mt-4 text-ink-muted">
              INFiLLPK sells 3D printers, materials, parts and digital fabrication equipment — and,
              just as importantly, the expertise to actually use them. We started with a simple
              observation: Pakistan has no shortage of makers, engineers, students and small
              manufacturers who want to build physical things. What&rsquo;s been missing is a single,
              trustworthy place to get the right machine, the right material, and real support when
              something doesn&rsquo;t work.
            </p>
            <p className="mt-4 text-ink-muted">
              We currently sell established printer and material brands, and are working toward
              becoming an authorized reseller and distributor as the business grows. We are not a
              printer manufacturer — we are the team that helps you choose, install, and get
              productive with the right one.
            </p>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Why we exist</h2>
            <p className="mt-4 text-ink-muted">
              Too many machines get bought and never really used — sitting idle after a difficult
              first week, with no one to call. INFiLLPK exists to close that gap: real installation
              support, real training, and real technical help long after the sale.
            </p>
            <h2 className="font-display mt-8 text-2xl font-semibold text-ink">Our commitment</h2>
            <ul className="mt-4 space-y-2 text-ink-muted">
              <li>— Transparent, public pricing — no hidden &ldquo;contact us&rdquo; gating on standard products.</li>
              <li>— Genuine technical support, not just a sales relationship.</li>
              <li>— Only displaying certifications and partnerships we actually hold.</li>
              <li>— Building our own INFiLL filament line and a broader fabrication ecosystem.</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-surface-sunken p-8 sm:p-12">
          <h2 className="font-display text-2xl font-semibold text-ink">Where we&rsquo;re headed</h2>
          <p className="mt-4 max-w-2xl text-ink-muted">
            3D printing is where we started, and it remains our core. Over time, INFiLLPK is built to
            grow into the broader story: materials, CNC, UV printing, laser cutting, and the services
            that connect them — one brand, one place to go when you want to make something.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/category/3d-printers">Shop 3D Printers</LinkButton>
            <LinkButton href="/contact" variant="secondary">
              Get in Touch
            </LinkButton>
          </div>
        </div>
      </section>
    </div>
  );
}
