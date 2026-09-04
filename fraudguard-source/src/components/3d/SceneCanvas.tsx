import { Suspense, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import type { DeviceTier } from "@/hooks/useDeviceTier";

interface SceneCanvasProps {
  children: ReactNode;
  tier: DeviceTier;
  cameraZ?: number;
  className?: string;
}

export function SceneCanvas({ children, tier, cameraZ = 6.5, className }: SceneCanvasProps) {
  return (
    <Canvas
      className={className}
      dpr={tier === "low" ? [1, 1.3] : [1, 1.8]}
      gl={{ antialias: tier !== "low", powerPreference: "high-performance", alpha: true }}
      camera={{ position: [0, 0, cameraZ], fov: 45 }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 6]} intensity={1.4} color="#8fd8ff" />
      <pointLight position={[-5, -2, 3]} intensity={22} color="#4f8dff" distance={16} />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
