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
      if (mat) mat.opacity = 0.35 + 0.65 * eased;
    }

    if (groupRef.current) {
      groupRef.current.rotation.y = -0.18 + 0.24 * assemble;
    }

    if (printGroupRef.current) {
      const s = Math.max(0.001, print);
      printGroupRef.current.scale.set(1, s, 1);
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
            transparent
          />
        </mesh>
      ))}

      {/* Small object the printer "prints" once assembly + sweep complete */}
      <group ref={printGroupRef} position={[0, 0.38, 0]}>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 6]} />
          <meshStandardMaterial color="#2f58ae" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.11, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 0.1, 6]} />
          <meshStandardMaterial color="#2f58ae" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.21, 0]}>
          <coneGeometry args={[0.11, 0.14, 6]} />
          <meshStandardMaterial color="#2f58ae" roughness={0.4} />
        </mesh>
      </group>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={6} blur={2.2} far={2.4} color="#0a1526" />
    </group>
  );
}
