import type { ServiceOffering } from "@/lib/types";

export const services: ServiceOffering[] = [
  {
    id: "svc-printing",
    name: "3D Printing",
    headline: "Don't own a printer? We'll print it for you.",
    description:
      "Upload your file and get a price in seconds — then we print it and get it to you. One part or a hundred, in PLA, ABS, PETG, TPU or another material.",
    bullets: ["Instant online price — no need to call first", "PLA, ABS, PETG, TPU and more", "One-off parts or small production runs"],
  },
  {
    id: "svc-prototyping",
    name: "Prototyping",
    headline: "Rapidly iterate physical concepts.",
    description:
      "Fast turnaround on design iterations so you can test fit, form and function before committing to tooling or a production run.",
    bullets: ["Same-week turnaround on most parts", "Multiple materials per iteration", "Design-for-manufacture feedback"],
  },
  {
    id: "svc-design",
    name: "Design",
    headline: "Help customers prepare and optimize models.",
    description:
      "Not every idea starts as a print-ready file. We help clean up, repair, and optimize models for the technology and material you're using.",
    bullets: ["Model repair and optimization", "Print-orientation and support strategy", "Reverse engineering from photos or sketches"],
  },
  {
    id: "svc-installation",
    name: "Installation & Training",
    headline: "Get machines operating correctly.",
    description:
      "On-site or remote setup, calibration, and hands-on training so your team is productive on day one, not week three.",
    bullets: ["Machine setup and calibration", "Operator training sessions", "Workflow and slicer configuration"],
  },
  {
    id: "svc-support",
    name: "Technical Support",
    headline: "Long-term assistance after purchase.",
    description:
      "Machines are only as good as the support behind them. Ongoing troubleshooting, maintenance guidance and spare parts access.",
    bullets: ["Remote troubleshooting", "Maintenance scheduling", "Genuine spare parts access"],
  },
];
