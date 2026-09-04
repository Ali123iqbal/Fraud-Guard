import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SceneCanvas } from "./SceneCanvas";
import { Phone } from "./Phone";
import { MessageCards, NetworkNodes, Particles, ThreatStream } from "./Particles";
import type { DeviceTier } from "@/hooks/useDeviceTier";

function HeroRig({ tier, progress }: { tier: DeviceTier; progress: number }) {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const p = useRef(0);

  useFrame((state, delta) => {
    p.current = THREE.MathUtils.damp(p.current, progress, 3, delta);
    if (group.current) {
      group.current.position.z = p.current * 2.2;
      group.current.position.y = -p.current * 0.6;
      group.current.rotation.y = p.current * 0.5;
    }
    if (light.current) {
      light.current.position.x = THREE.MathUtils.damp(
        light.current.position.x,
        state.pointer.x * 6,
        4,
        delta,
      );
      light.current.position.y = THREE.MathUtils.damp(
        light.current.position.y,
        state.pointer.y * 4,
        4,
        delta,
      );
    }
  });

  const low = tier === "low";

  return (
    <group ref={group}>
      <pointLight ref={light} position={[0, 0, 4]} intensity={30} color="#5ce1ff" distance={14} />
      <Phone shieldStrength={0.4 + progress * 0.6} />
      <MessageCards count={low ? 3 : 5} />
      <ThreatStream count={low ? 6 : 14} blocked={progress} />
      <Particles count={low ? 70 : 240} radius={low ? 5 : 8} />
      {!low && <NetworkNodes count={22} />}
    </group>
  );
}

export default function HeroScene({ tier, progress }: { tier: DeviceTier; progress: number }) {
  return (
    <SceneCanvas tier={tier} cameraZ={6.2} className="!absolute inset-0">
      <HeroRig tier={tier} progress={progress} />
    </SceneCanvas>
  );
}
