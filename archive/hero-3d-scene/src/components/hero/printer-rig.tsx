"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";
import { printerParts } from "@/components/hero/printer-parts";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function makeGeometry(part: (typeof printerParts)[number]) {
  const { geometry } = part;
  if (geometry.kind === "box") return new THREE.BoxGeometry(...geometry.args);
  if (geometry.kind === "cylinder") return new THREE.CylinderGeometry(...geometry.args);
  return new THREE.ConeGeometry(...geometry.args);
}

export function PrinterRig({ progressRef }: { progressRef: RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const printGroupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<Record<string, THREE.Mesh | null>>({});
  const nozzleGlowRef = useRef<THREE.Mesh>(null);
  const gantryRidersOffset = useRef(0);

  const geometries = useMemo(
    () => Object.fromEntries(printerParts.map((p) => [p.id, makeGeometry(p)])),
    []
  );

  useFrame(({ clock }) => {
    const progress = progressRef.current ?? 0;
    const assemble = clamp01(progress / 0.65);
    const sweep = clamp01((progress - 0.65) / 0.2);
    const print = clamp01((progress - 0.85) / 0.15);

    // Phase 5: a single deliberate gantry sweep tied to scroll, plus a very
    // small continuous idle sway once fully assembled (skipped entirely for
    // reduced-motion users, since this component isn't mounted for them).
    const sweepX = Math.sin(sweep * Math.PI) * 0.55;
    const idle = progress >= 0.98 ? Math.sin(clock.elapsedTime * 0.6) * 0.03 : 0;
    gantryRidersOffset.current = sweepX + idle;

    for (const part of printerParts) {
      const mesh = meshRefs.current[part.id];
      if (!mesh) continue;

      const localT = clamp01(
        (assemble - part.settleOrder! * 0.35) / (1 - part.settleOrder! * 0.35)
      );
      const eased = easeOutCubic(localT);

      const ox = part.explodeOffset[0] * (1 - eased);
      const oy = part.explodeOffset[1] * (1 - eased);
      const oz = part.explodeOffset[2] * (1 - eased);

      const gantryX = part.ridesGantry ? gantryRidersOffset.current * eased : 0;

      mesh.position.set(
        part.restPosition[0] + ox + gantryX,
        part.restPosition[1] + oy,
        part.restPosition[2] + oz
      );

      const er = part.explodeRotation ?? [0, 0, 0];
      const rr = part.restRotation ?? [0, 0, 0];
      mesh.rotation.set(
        rr[0] + er[0] * (1 - eased),
        rr[1] + er[1] * (1 - eased),
        rr[2] + er[2] * (1 - eased)
      );

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) mat.opacity = (part.finalOpacity ?? 1) * (0.35 + 0.65 * eased);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = -0.18 + 0.24 * assemble;
    }

    if (printGroupRef.current) {
      const s = Math.max(0.001, print);
      printGroupRef.current.scale.set(1, s, 1);
    }

    // Hot nozzle glow while actively "printing" — pulses subtly rather than
    // holding a flat brightness, reads as heat rather than a plain light bulb.
    if (nozzleGlowRef.current) {
      const mat = nozzleGlowRef.current.material as THREE.MeshStandardMaterial;
      const active = print > 0.02 && print < 1 ? 1 : print >= 1 ? 0.5 : 0;
      const pulse = active > 0 ? 0.75 + Math.sin(clock.elapsedTime * 8) * 0.25 : 0;
      mat.emissiveIntensity = active * pulse * 1.4;
    }
  });

  return (
    <group ref={groupRef}>
      {printerParts.map((part) => (
        <mesh
          key={part.id}
          ref={(m) => {
            meshRefs.current[part.id] = m;
          }}
          geometry={geometries[part.id]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={part.color}
            metalness={part.metalness ?? 0.15}
            roughness={part.roughness ?? 0.55}
            emissive={part.emissive}
            emissiveIntensity={part.emissiveIntensity ?? 0}
            transparent
            side={part.finalOpacity !== undefined ? THREE.DoubleSide : THREE.FrontSide}
          />
        </mesh>
      ))}

      {/* Nozzle heat glow — a small sphere tucked just above the tip, dark
          like the surrounding metal at rest and only reading as "lit" once
          emissiveIntensity ramps up during the print phase (see useFrame
          above) — a literal bright base color would show as a stray orange
          dot even outside the print phase. */}
      <mesh ref={nozzleGlowRef} position={[0, 1.73, 0.15]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#3a3f48" emissive="#ff8a3d" emissiveIntensity={0} roughness={0.4} />
      </mesh>

      {/* The printed object: a small rocket, built up as the printer "prints" */}
      <group ref={printGroupRef} position={[0, 0.62, 0.15]}>
        {/* Engine nozzle */}
        <mesh position={[0, 0.02, 0]}>
          <coneGeometry args={[0.07, 0.07, 20]} />
          <meshStandardMaterial color="#2a2f38" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* Body */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.1, 0.11, 0.3, 24]} />
          <meshStandardMaterial color="#e8ebef" metalness={0.25} roughness={0.35} />
        </mesh>
        {/* Accent stripe */}
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.104, 0.104, 0.045, 24]} />
          <meshStandardMaterial color="#f2622e" metalness={0.3} roughness={0.4} />
        </mesh>
        {/* Cockpit window */}
        <mesh position={[0, 0.3, 0.075]}>
          <sphereGeometry args={[0.032, 16, 16]} />
          <meshStandardMaterial color="#3c5a8f" metalness={0.5} roughness={0.15} emissive="#3c5a8f" emissiveIntensity={0.25} />
        </mesh>
        {/* Nose cone */}
        <mesh position={[0, 0.44, 0]}>
          <coneGeometry args={[0.1, 0.22, 24]} />
          <meshStandardMaterial color="#f2622e" metalness={0.3} roughness={0.35} />
        </mesh>
        {/* Fins */}
        {[0, 120, 240].map((deg) => (
          <mesh
            key={deg}
            position={[Math.sin((deg * Math.PI) / 180) * 0.12, 0.06, Math.cos((deg * Math.PI) / 180) * 0.12]}
            rotation={[0, (-deg * Math.PI) / 180, 0]}
          >
            <boxGeometry args={[0.018, 0.14, 0.09]} />
            <meshStandardMaterial color="#c7cbd1" metalness={0.3} roughness={0.5} />
          </mesh>
        ))}
      </group>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.5} scale={6.5} blur={2.2} far={2.4} color="#142645" />
    </group>
  );
}
