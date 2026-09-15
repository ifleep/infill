"use client";

import { type RefObject, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
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
      <color attach="background" args={["#1c3560"]} />
      <fog attach="fog" args={["#1c3560", 8, 16]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 3]} intensity={1.3} castShadow />
      {/* Cool rim light from behind-left, separates the rig from the background */}
      <directionalLight position={[-4, 2, -2]} intensity={0.5} color="#6d9bf7" />
      {/* Warm accent light, opposite the cool rim — adds dimension instead of flat blue-on-blue */}
      <pointLight position={[2.2, 1.2, 2.4]} intensity={0.9} color="#f2a24a" distance={7} />
      <pointLight position={[0, 1.8, 1.5]} intensity={0.5} color="#3b74f0" distance={6} />
      <CameraAim />
      {/* Procedural environment (a few soft light panels) for realistic
          metal reflections — built entirely in-scene rather than a
          preset, which would fetch an HDR texture from a remote CDN on
          every page load. */}
      <Environment resolution={64} environmentIntensity={0.4}>
        <Lightformer form="rect" intensity={2} color="#6d9bf7" scale={[6, 4, 1]} position={[-4, 3, 2]} target={[0, 1, 0]} />
        <Lightformer form="rect" intensity={1.5} color="#f2a24a" scale={[4, 3, 1]} position={[4, 2, 3]} target={[0, 1, 0]} />
        <Lightformer form="ring" intensity={1} color="#ffffff" scale={3} position={[0, 5, -3]} target={[0, 0, 0]} />
      </Environment>

      {hasCustomModel ? (
        <OptionalGltfModel progressRef={progressRef} />
      ) : (
        <PrinterRig progressRef={progressRef} />
      )}
    </Canvas>
  );
}
