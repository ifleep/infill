"use client";

import { Suspense, useEffect, useMemo, useState, type RefObject } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const MODEL_PATH = "/models/printer.glb";

/**
 * True once we know whether a real glTF printer model has been placed at
 * /public/models/printer.glb — lets HeroScene swap the procedural rig for a
 * real asset later with no other code changes. Null while still checking.
 */
export function useHasCustomModel() {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch(MODEL_PATH, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return available;
}

// react-three-fiber's useFrame is an intentional escape hatch from React's
// render model: it mutates Three.js objects imperatively on every frame
// instead of triggering re-renders, which is the standard, required pattern
// for performant WebGL animation and is incompatible with the React
// Compiler lint rules' render-purity assumptions (which are written for
// regular DOM components, not R3F's scene graph). Disabling those rules
// here is standard practice in the R3F ecosystem, not a workaround for a
// real bug.
/* eslint-disable react-hooks/immutability */

function Model({ progressRef }: { progressRef: RefObject<number> }) {
  const { scene } = useGLTF(MODEL_PATH);
  // useGLTF caches and shares the loaded scene graph, so clone it before
  // mutating transform properties per-frame — mutating the cached original
  // would leak into any other place this model is rendered.
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  useFrame(() => {
    const p = progressRef.current ?? 0;
    clonedScene.scale.setScalar(0.4 + 0.6 * Math.min(1, p / 0.5));
    clonedScene.rotation.y = -0.2 + 0.3 * Math.min(1, p);
  });
  return <primitive object={clonedScene} />;
}

export function OptionalGltfModel({ progressRef }: { progressRef: RefObject<number> }) {
  return (
    <Suspense fallback={null}>
      <Model progressRef={progressRef} />
    </Suspense>
  );
}
