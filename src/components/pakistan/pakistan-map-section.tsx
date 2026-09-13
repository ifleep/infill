"use client";

import { useState } from "react";
import { pakistanRegions } from "@/lib/data/pakistan-regions";
import { SectionHeading } from "@/components/ui/section-heading";

const VIEW_W = 300;
const VIEW_H = 420;

export function PakistanMapSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pakistanRegions.find((r) => r.id === activeId) ?? null;

  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Made for Pakistan" title="Built here, for here." />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-xs">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full" aria-hidden="true">
              <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="none" />
              {pakistanRegions.map((r) => {
                const isActive = activeId === r.id;
                return (
                  <ellipse
                    key={r.id}
                    cx={r.shape.cx}
                    cy={r.shape.cy}
                    rx={r.shape.rx}
                    ry={r.shape.ry}
                    className="transition-all duration-300"
                    fill={isActive ? "#1f3f8a" : "#eef2fb"}
                    stroke={isActive ? "#0f6b3f" : "#b3c7ed"}
                    strokeWidth={isActive ? 2 : 1}
                    opacity={activeId && !isActive ? 0.5 : 1}
                  />
                );
              })}
              {pakistanRegions.map((r) => (
                <text
                  key={`${r.id}-label`}
                  x={r.labelPoint.x}
                  y={r.labelPoint.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={r.id === "isb" ? 7 : 10}
                  fill={activeId === r.id ? "#ffffff" : "#17316b"}
                  className="pointer-events-none select-none font-medium transition-colors duration-300"
                >
                  {r.shortLabel}
                </text>
              ))}
            </svg>

            {/* Accessible / touch interaction layer, aligned to the SVG regions above */}
            <div className="absolute inset-0" onMouseLeave={() => setActiveId(null)}>
              {pakistanRegions.map((r) => {
                const left = ((r.shape.cx - r.shape.rx) / VIEW_W) * 100;
                const top = ((r.shape.cy - r.shape.ry) / VIEW_H) * 100;
                const width = ((2 * r.shape.rx) / VIEW_W) * 100;
                const height = ((2 * r.shape.ry) / VIEW_H) * 100;
                return (
                  <button
                    key={r.id}
                    aria-pressed={activeId === r.id}
                    aria-label={r.name}
                    onClick={() => setActiveId(r.id)}
                    onFocus={() => setActiveId(r.id)}
                    className="focus-ring absolute cursor-pointer rounded-full"
                    style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>

          <div className="min-h-[220px] rounded-2xl border border-border bg-surface p-8">
            {active ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-pk-green">{active.name}</p>
                <p className="mt-3 text-lg text-ink">{active.copy}</p>
                <p className="mt-4 text-sm text-ink-muted">{active.motif}</p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Every province. One network.</p>
                <p className="mt-3 text-lg text-ink">
                  Select a region to see how INFiLLPK reaches it — and a hint of the craft that makes it distinct.
                </p>
                <p className="mt-4 text-sm text-ink-muted">
                  Punjab · Sindh · Khyber Pakhtunkhwa · Balochistan · Islamabad · Gilgit-Baltistan · Azad Jammu &amp; Kashmir
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
