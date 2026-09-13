"use client";

import { useMemo, useState } from "react";
import { CheckCircle, ArrowLeft } from "@phosphor-icons/react";
import { products } from "@/lib/data/products";
import type { ExperienceLevel, Product, UseCase } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";

const useCaseOptions: UseCase[] = ["Hobby", "Prototyping", "Engineering", "Education", "Business", "Industrial"];
const experienceOptions: ExperienceLevel[] = ["Beginner", "Intermediate", "Professional"];
const priorityOptions = ["Speed", "Quality", "Large build volume", "Ease of use", "Materials", "Reliability", "Price"] as const;
type Priority = (typeof priorityOptions)[number];
const budgetOptions = [
  { label: "Under Rs 75,000", max: 75000 },
  { label: "Rs 75,000 – 150,000", max: 150000 },
  { label: "Rs 150,000 – 350,000", max: 350000 },
  { label: "Rs 350,000+", max: Infinity },
];

interface Answers {
  useCase: UseCase | null;
  experience: ExperienceLevel | null;
  priority: Priority | null;
  budgetMax: number | null;
}

function score(product: Product, answers: Answers): number {
  if (product.category !== "printers") return -1;
  let s = 0;
  if (answers.useCase && product.useCases?.includes(answers.useCase)) s += 4;
  if (answers.experience && product.experienceLevel?.includes(answers.experience)) s += 3;
  if (answers.budgetMax !== null) {
    if (product.price <= answers.budgetMax) s += 3;
    else if (product.price <= answers.budgetMax * 1.2) s += 1;
    else s -= 2;
  }
  switch (answers.priority) {
    case "Speed":
      if ((product.speedMmPerSec ?? 0) >= 400) s += 3;
      break;
    case "Large build volume":
      if (product.buildVolume && product.buildVolume.x * product.buildVolume.y * product.buildVolume.z > 10_000_000) s += 3;
      break;
    case "Ease of use":
      if (product.experienceLevel?.includes("Beginner")) s += 3;
      break;
    case "Materials":
      if ((product.materials?.length ?? 0) >= 4) s += 3;
      break;
    case "Reliability":
      if ((product.rating ?? 0) >= 4.7) s += 3;
      break;
    case "Price":
      s += Math.max(0, 3 - product.price / 100000);
      break;
    case "Quality":
      if (product.technology === "Resin" || (product.rating ?? 0) >= 4.7) s += 3;
      break;
  }
  return s;
}

export function FindYourPrinterSection() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    useCase: null,
    experience: null,
    priority: null,
    budgetMax: null,
  });

  const steps = [
    {
      question: "What are you making?",
      render: () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {useCaseOptions.map((opt) => (
            <ChoiceCard
              key={opt}
              label={opt}
              selected={answers.useCase === opt}
              onClick={() => {
                setAnswers((a) => ({ ...a, useCase: opt }));
                setStep(1);
              }}
            />
          ))}
        </div>
      ),
    },
    {
      question: "What's your experience?",
      render: () => (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {experienceOptions.map((opt) => (
            <ChoiceCard
              key={opt}
              label={opt}
              selected={answers.experience === opt}
              onClick={() => {
                setAnswers((a) => ({ ...a, experience: opt }));
                setStep(2);
              }}
            />
          ))}
        </div>
      ),
    },
    {
      question: "What matters most?",
      render: () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {priorityOptions.map((opt) => (
            <ChoiceCard
              key={opt}
              label={opt}
              selected={answers.priority === opt}
              onClick={() => {
                setAnswers((a) => ({ ...a, priority: opt }));
                setStep(3);
              }}
            />
          ))}
        </div>
      ),
    },
    {
      question: "What's your budget?",
      render: () => (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {budgetOptions.map((opt) => (
            <ChoiceCard
              key={opt.label}
              label={opt.label}
              selected={answers.budgetMax === opt.max}
              onClick={() => {
                setAnswers((a) => ({ ...a, budgetMax: opt.max }));
                setStep(4);
              }}
            />
          ))}
        </div>
      ),
    },
  ];

  const results = useMemo(() => {
    if (step < 4) return [];
    return [...products]
      .map((p) => ({ p, s: score(p, answers) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((r) => r.p);
  }, [step, answers]);

  return (
    <section className="bg-surface-sunken py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Find Your Printer" title="Answer four questions. Get real matches." />

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 sm:p-10">
          {step < 4 ? (
            <>
              <div className="mb-6 flex items-center gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-blue-700" : "bg-border"}`}
                  />
                ))}
              </div>
              <h3 className="font-display mb-6 text-xl font-semibold text-ink">{steps[step].question}</h3>
              {steps[step].render()}
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="focus-ring mt-6 flex cursor-pointer items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="font-display flex items-center gap-2 text-xl font-semibold text-ink">
                  <CheckCircle size={22} weight="fill" className="text-pk-green" />
                  Your best matches
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(0);
                    setAnswers({ useCase: null, experience: null, priority: null, budgetMax: null });
                  }}
                >
                  Start over
                </Button>
              </div>
              {results.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted">
                  No close matches in the current catalog — browse all printers instead.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function ChoiceCard({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring cursor-pointer rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition-colors ${
        selected
          ? "border-blue-700 bg-blue-50 text-blue-700"
          : "border-border text-ink hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {label}
    </button>
  );
}
