"use client";

import { type RefObject, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PrinterRig } from "@/components/hero/printer-rig";
import { OptionalGltfModel, useHasCustomModel } from "@/components/hero/optional-gltf-model";

const TARGET: [number, number, number] = [0, 1.3, 0];

function CameraAim() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(...TARGET);
  }, [camera]);
  return null;
}

export function HeroScene({ progressRef }: { progressRef: RefObject<number> }) {
  const hasCustomModel = useHasCustomModel();

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [4.4, 2.6, 7.2], fov: 30 }}
      shadows
    >
      <color attach="background" args={["#0a1526"]} />
      <fog attach="fog" args={["#0a1526", 7, 15]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.35} color="#4d7bd6" />
      <pointLight position={[0, 1.8, 1.5]} intensity={0.4} color="#2f58ae" />
      <CameraAim />

      {hasCustomModel ? (
        <OptionalGltfModel progressRef={progressRef} />
      ) : (
        <PrinterRig progressRef={progressRef} />
      )}
    </Canvas>
  );
}
