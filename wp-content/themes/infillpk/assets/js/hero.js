// Cinematic scroll-driven exploded-to-assembled 3D printer hero.
// Ported 1:1 (part data, phase math) from the Next.js prototype's
// src/components/hero/{printer-parts.ts,printer-rig.tsx,cinematic-hero.tsx}.
//
// Progressive enhancement: the PHP template (front-page.php) always renders
// the static SVG blueprint visual. This script only swaps in the Three.js
// canvas when the browser supports WebGL, the viewport isn't small, and the
// user hasn't asked for reduced motion — otherwise the static visual stays.

import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const metal = "#23262c";
const metalLight = "#3a3f48";
const blueAccent = "#1f3f8a";
const brass = "#b8863b";
const pcbGreen = "#1d3b2a";
const cream = "#efe9df";
const gray = "#d7dade";
const black = "#111318";

const printerParts = [
  { id: "post-fl", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [-1.05, 1.3, 1.05], explodeOffset: [-1.6, -0.6, 1.4], explodeRotation: [0.4, 0.2, 0.1], settleOrder: 0.05 },
  { id: "post-fr", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [1.05, 1.3, 1.05], explodeOffset: [1.6, -0.6, 1.4], explodeRotation: [-0.3, -0.2, 0.15], settleOrder: 0.05 },
  { id: "post-bl", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [-1.05, 1.3, -1.05], explodeOffset: [-1.5, 0.7, -1.5], explodeRotation: [0.2, 0.3, -0.1], settleOrder: 0.08 },
  { id: "post-br", geometry: { kind: "box", args: [0.09, 2.6, 0.09] }, color: metal, metalness: 0.6, roughness: 0.4, restPosition: [1.05, 1.3, -1.05], explodeOffset: [1.5, 0.7, -1.5], explodeRotation: [-0.2, -0.3, 0.1], settleOrder: 0.08 },
  { id: "base", geometry: { kind: "box", args: [2.3, 0.3, 2.3] }, color: metalLight, metalness: 0.3, roughness: 0.6, restPosition: [0, 0.15, 0], explodeOffset: [0, -1.8, 0], explodeRotation: [0.15, 0, 0.08], settleOrder: 0 },
  { id: "top-beam", geometry: { kind: "box", args: [2.3, 0.12, 0.3] }, color: blueAccent, metalness: 0.4, roughness: 0.5, restPosition: [0, 2.55, 1.0], explodeOffset: [0, 1.9, 1.6], explodeRotation: [-0.3, 0, 0], settleOrder: 0.12 },

  { id: "rail-x1", geometry: { kind: "cylinder", args: [0.03, 0.03, 2.2, 12] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [0, 2.2, 0.18], restRotation: [0, 0, Math.PI / 2], explodeOffset: [0, 1.4, 1.8], explodeRotation: [0, 0.6, Math.PI / 2], settleOrder: 0.2 },
  { id: "rail-x2", geometry: { kind: "cylinder", args: [0.03, 0.03, 2.2, 12] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [0, 2.2, -0.18], restRotation: [0, 0, Math.PI / 2], explodeOffset: [0, 1.4, -1.8], explodeRotation: [0, -0.6, Math.PI / 2], settleOrder: 0.2 },
  { id: "rail-z1", geometry: { kind: "cylinder", args: [0.035, 0.035, 2.4, 12] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [0.95, 1.3, -0.9], explodeOffset: [1.9, -0.4, -1.2], explodeRotation: [0.3, 0, 0], settleOrder: 0.18 },
  { id: "rail-z2", geometry: { kind: "cylinder", args: [0.035, 0.035, 2.4, 12] }, color: gray, metalness: 0.8, roughness: 0.25, restPosition: [-0.95, 1.3, -0.9], explodeOffset: [-1.9, -0.4, -1.2], explodeRotation: [-0.3, 0, 0], settleOrder: 0.18 },

  { id: "motor-a", geometry: { kind: "box", args: [0.22, 0.22, 0.28] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [0.95, 2.5, -0.95], explodeOffset: [1.7, 1.2, -2.0], explodeRotation: [0.4, 0.5, 0], settleOrder: 0.3 },
  { id: "motor-b", geometry: { kind: "box", args: [0.22, 0.22, 0.28] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [-0.95, 2.5, -0.95], explodeOffset: [-1.7, 1.2, -2.0], explodeRotation: [-0.4, -0.5, 0], settleOrder: 0.3 },
  { id: "motor-z", geometry: { kind: "cylinder", args: [0.14, 0.14, 0.24, 16] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [0.95, 0.2, -0.95], explodeOffset: [1.6, -1.0, -1.6], explodeRotation: [0, 0.5, 0.3], settleOrder: 0.28 },
  { id: "motor-e", geometry: { kind: "cylinder", args: [0.11, 0.11, 0.18, 16] }, color: black, metalness: 0.5, roughness: 0.5, restPosition: [0.2, 2.05, 0.32], explodeOffset: [1.3, 0.9, 1.5], explodeRotation: [0.5, 0, 0.2], ridesGantry: true, settleOrder: 0.42 },

  { id: "belt-1", geometry: { kind: "box", args: [2.0, 0.02, 0.02] }, color: black, roughness: 0.9, restPosition: [0, 2.15, 0.15], explodeOffset: [0, -1.6, 1.3], explodeRotation: [0, 0, 0.1], settleOrder: 0.35 },
  { id: "belt-2", geometry: { kind: "box", args: [2.0, 0.02, 0.02] }, color: black, roughness: 0.9, restPosition: [0, 2.15, -0.15], explodeOffset: [0, -1.6, -1.3], explodeRotation: [0, 0, -0.1], settleOrder: 0.35 },

  { id: "extruder", geometry: { kind: "box", args: [0.3, 0.25, 0.3] }, color: metalLight, metalness: 0.5, roughness: 0.4, restPosition: [0, 2.0, 0], explodeOffset: [0.4, 1.6, 2.2], explodeRotation: [0.6, 0.3, 0], ridesGantry: true, settleOrder: 0.45 },
  { id: "heatsink", geometry: { kind: "cylinder", args: [0.06, 0.06, 0.22, 12] }, color: gray, metalness: 0.7, roughness: 0.3, restPosition: [0, 1.82, 0], explodeOffset: [-0.3, 1.3, 2.4], explodeRotation: [0.3, 0.2, 0], ridesGantry: true, settleOrder: 0.5 },
  { id: "nozzle", geometry: { kind: "cone", args: [0.045, 0.12, 16] }, color: brass, metalness: 0.8, roughness: 0.25, restPosition: [0, 1.66, 0], restRotation: [Math.PI, 0, 0], explodeOffset: [0.2, 0.9, 2.6], explodeRotation: [0.8, 0.4, 0], ridesGantry: true, settleOrder: 0.55 },
  { id: "fan-1", geometry: { kind: "cylinder", args: [0.09, 0.09, 0.04, 16] }, color: gray, roughness: 0.5, restPosition: [0.16, 1.95, 0.14], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [1.1, 1.5, 1.9], explodeRotation: [0, 0.9, 0], ridesGantry: true, settleOrder: 0.48 },
  { id: "fan-2", geometry: { kind: "cylinder", args: [0.07, 0.07, 0.04, 16] }, color: gray, roughness: 0.5, restPosition: [-0.16, 2.05, 0.05], restRotation: [Math.PI / 2, 0.3, 0], explodeOffset: [-1.0, 1.7, 1.7], explodeRotation: [0, -0.9, 0], ridesGantry: true, settleOrder: 0.48 },

  { id: "mainboard", geometry: { kind: "box", args: [0.9, 0.02, 0.5] }, color: pcbGreen, roughness: 0.7, restPosition: [0, 0.16, -0.7], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [0, -1.9, -2.0], explodeRotation: [0.5, 0, 0.2], settleOrder: 0.1 },
  { id: "chip-1", geometry: { kind: "box", args: [0.08, 0.02, 0.1] }, color: metal, restPosition: [0.25, 0.18, -0.7], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [0.5, -2.0, -2.2], explodeRotation: [0, 0.4, 0], settleOrder: 0.1 },
  { id: "chip-2", geometry: { kind: "box", args: [0.08, 0.02, 0.1] }, color: metal, restPosition: [-0.1, 0.18, -0.7], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [-0.5, -2.0, -2.2], explodeRotation: [0, -0.4, 0], settleOrder: 0.1 },

  { id: "bed-frame", geometry: { kind: "box", args: [1.95, 0.06, 1.95] }, color: metalLight, metalness: 0.3, roughness: 0.6, restPosition: [0, 0.32, 0], explodeOffset: [0, -1.2, 0.4], explodeRotation: [0, 0, 0], settleOrder: 0.15 },
  { id: "build-plate", geometry: { kind: "box", args: [1.9, 0.03, 1.9] }, color: cream, roughness: 0.6, restPosition: [0, 0.36, 0], explodeOffset: [0, -1.0, 0.9], explodeRotation: [0, 0, 0], settleOrder: 0.22 },

  { id: "spool", geometry: { kind: "cylinder", args: [0.28, 0.28, 0.12, 24] }, color: blueAccent, metalness: 0.2, roughness: 0.6, restPosition: [0, 2.75, -1.0], restRotation: [Math.PI / 2, 0, 0], explodeOffset: [0, 2.2, -2.4], explodeRotation: [0.3, 0.2, 0], settleOrder: 0.6 },
  { id: "ptfe-tube", geometry: { kind: "cylinder", args: [0.02, 0.02, 0.9, 8] }, color: "#2a2f38", restPosition: [0, 2.35, -0.5], restRotation: [1.1, 0, 0], explodeOffset: [0.6, 1.9, -2.0], explodeRotation: [0.5, 0.5, 0], settleOrder: 0.62 },

  { id: "screw-1", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [-1.05, 2.58, 1.05], explodeOffset: [-2.1, 2.3, 1.9], explodeRotation: [1, 1, 0], settleOrder: 0.7 },
  { id: "screw-2", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [1.05, 2.58, 1.05], explodeOffset: [2.1, 2.3, 1.9], explodeRotation: [-1, -1, 0], settleOrder: 0.7 },
  { id: "screw-3", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [-1.05, 0.02, 1.05], explodeOffset: [-2.0, -2.1, 2.0], explodeRotation: [1, 0, 1], settleOrder: 0.65 },
  { id: "screw-4", geometry: { kind: "cylinder", args: [0.025, 0.025, 0.02, 8] }, color: gray, metalness: 0.9, restPosition: [1.05, 0.02, 1.05], explodeOffset: [2.0, -2.1, 2.0], explodeRotation: [-1, 0, -1], settleOrder: 0.65 },
];

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function makeGeometry(part) {
  const { geometry } = part;
  if (geometry.kind === "box") return new THREE.BoxGeometry(...geometry.args);
  if (geometry.kind === "cylinder") return new THREE.CylinderGeometry(...geometry.args);
  return new THREE.ConeGeometry(...geometry.args);
}

function makeShadowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(10,21,38,0.45)");
  gradient.addColorStop(1, "rgba(10,21,38,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function shouldUseCinematic() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSmallScreen = window.innerWidth < 768;
  return !reducedMotion && !isSmallScreen && supportsWebGL();
}

function initHeroScene(canvasHost) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, canvasHost.clientWidth / canvasHost.clientHeight, 0.1, 100);
  camera.position.set(3.4, 2.6, 4.6);
  camera.lookAt(0, 1.3, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
  renderer.shadowMap.enabled = true;
  canvasHost.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 4);
  key.castShadow = true;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x85a3de, 0.6);
  rim.position.set(-4, 3, -4);
  scene.add(rim);

  const rig = new THREE.Group();
  scene.add(rig);

  const meshes = {};
  for (const part of printerParts) {
    const geo = makeGeometry(part);
    const mat = new THREE.MeshStandardMaterial({
      color: part.color,
      metalness: part.metalness ?? 0.15,
      roughness: part.roughness ?? 0.55,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    rig.add(mesh);
    meshes[part.id] = mesh;
  }

  // Small printed object that grows once the assembly + gantry sweep finish.
  const printGroup = new THREE.Group();
  printGroup.position.set(0, 0.38, 0);
  const printMat = new THREE.MeshStandardMaterial({ color: "#2f58ae", roughness: 0.4 });
  const printBase = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.06, 6), printMat);
  printBase.position.set(0, 0.03, 0);
  const printMid = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.1, 6), printMat);
  printMid.position.set(0, 0.11, 0);
  const printTop = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.14, 6), printMat);
  printTop.position.set(0, 0.21, 0);
  printGroup.add(printBase, printMid, printTop);
  rig.add(printGroup);

  const shadowMat = new THREE.MeshBasicMaterial({ map: makeShadowTexture(), transparent: true, depthWrite: false });
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -0.01;
  rig.add(shadowPlane);

  let progress = 0;
  let gantryOffset = 0;
  const clock = new THREE.Clock();

  function render() {
    const assemble = clamp01(progress / 0.65);
    const sweep = clamp01((progress - 0.65) / 0.2);
    const print = clamp01((progress - 0.85) / 0.15);

    const sweepX = Math.sin(sweep * Math.PI) * 0.55;
    const idle = progress >= 0.98 ? Math.sin(clock.getElapsedTime() * 0.6) * 0.03 : 0;
    gantryOffset = sweepX + idle;

    for (const part of printerParts) {
      const mesh = meshes[part.id];
      if (!mesh) continue;

      const localT = clamp01((assemble - part.settleOrder * 0.35) / (1 - part.settleOrder * 0.35));
      const eased = easeOutCubic(localT);

      const ox = part.explodeOffset[0] * (1 - eased);
      const oy = part.explodeOffset[1] * (1 - eased);
      const oz = part.explodeOffset[2] * (1 - eased);
      const gx = part.ridesGantry ? gantryOffset * eased : 0;

      mesh.position.set(part.restPosition[0] + ox + gx, part.restPosition[1] + oy, part.restPosition[2] + oz);

      const er = part.explodeRotation ?? [0, 0, 0];
      const rr = part.restRotation ?? [0, 0, 0];
      mesh.rotation.set(rr[0] + er[0] * (1 - eased), rr[1] + er[1] * (1 - eased), rr[2] + er[2] * (1 - eased));

      mesh.material.opacity = 0.35 + 0.65 * eased;
    }

    rig.rotation.y = -0.18 + 0.24 * assemble;
    const s = Math.max(0.001, print);
    printGroup.scale.set(1, s, 1);

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  function handleResize() {
    const w = canvasHost.clientWidth;
    const h = canvasHost.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", handleResize);

  return {
    setProgress(p) {
      progress = p;
    },
  };
}

function initHero() {
  const wrapper = document.querySelector(".js-hero-wrapper");
  const pin = document.querySelector(".js-hero-pin");
  const staticVisual = document.querySelector(".js-hero-static");
  const canvasHost = document.querySelector(".js-hero-canvas");
  if (!wrapper || !pin || !canvasHost) return;

  if (!shouldUseCinematic()) return; // static SVG (already in the DOM) stays.

  wrapper.style.height = "280vh";
  canvasHost.classList.remove("hidden");
  if (staticVisual) staticVisual.classList.add("hidden");

  const scene = initHeroScene(canvasHost);

  ScrollTrigger.create({
    trigger: wrapper,
    start: "top top",
    end: "bottom bottom",
    pin,
    pinSpacing: false,
    scrub: 0.4,
    onUpdate(self) {
      scene.setProgress(self.progress);
    },
  });
}

document.addEventListener("DOMContentLoaded", initHero);
