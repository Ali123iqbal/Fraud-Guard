import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneCanvas } from "./SceneCanvas";
import { Phone } from "./Phone";
import { NetworkNodes, Particles, ThreatStream } from "./Particles";
import type { DeviceTier } from "@/hooks/useDeviceTier";

function ThreatRig({ tier, progress }: { tier: DeviceTier; progress: number }) {
  const scanner = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);
  const p = useRef(0);

  useFrame((state, delta) => {
    p.current = THREE.MathUtils.damp(p.current, progress, 3, delta);
    const t = state.clock.elapsedTime;
    if (scanner.current) {
      scanner.current.rotation.y = t * 0.3;
      scanner.current.rotation.x = t * 0.15;
      const mat = scanner.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.05 + p.current * 0.14;
      scanner.current.scale.setScalar(2.2 + Math.sin(t) * 0.05);
    }
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        -0.4 + p.current * 0.8 + state.pointer.x * 0.25,
        3,
        delta,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        state.pointer.y * 0.15,
        3,
        delta,
      );
    }
  });

  const low = tier === "low";

  return (
    <group ref={group}>
      <Phone shieldStrength={progress} />
      <mesh ref={scanner}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#4f8dff" wireframe transparent opacity={0.12} />
      </mesh>
      <ThreatStream count={low ? 8 : 18} blocked={progress} />
      <Particles count={low ? 60 : 200} radius={low ? 5 : 8} color="#4f8dff" />
      {!low && <NetworkNodes count={20} />}
    </group>
  );
}

export default function ThreatScene({ tier, progress }: { tier: DeviceTier; progress: number }) {
  return (
    <SceneCanvas tier={tier} cameraZ={7} className="!absolute inset-0">
      <ThreatRig tier={tier} progress={progress} />
    </SceneCanvas>
  );
}
