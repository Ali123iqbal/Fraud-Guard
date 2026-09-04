import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface PhoneProps {
  shieldStrength?: number;
  scanning?: boolean;
}

/** Stylized floating smartphone with a scanning ring and protective shield. */
export function Phone({ shieldStrength = 1 }: PhoneProps) {
  const group = useRef<THREE.Group>(null);
  const shield = useRef<THREE.Mesh>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y += delta * 0.25;
      group.current.position.y = Math.sin(t * 0.8) * 0.12;
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        -state.pointer.y * 0.18,
        0.05,
      );
      group.current.rotation.z = THREE.MathUtils.lerp(
        group.current.rotation.z,
        state.pointer.x * 0.1,
        0.05,
      );
    }
    if (shield.current) {
      const s = 1.55 + Math.sin(t * 1.4) * 0.02;
      shield.current.scale.setScalar(s);
      const mat = shield.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = 0.06 + 0.16 * shieldStrength;
    }
    if (ringA.current) ringA.current.rotation.z = t * 0.6;
    if (ringB.current) ringB.current.rotation.z = -t * 0.4;
  });

  return (
    <group>
      <group ref={group}>
        {/* body */}
        <mesh castShadow>
          <boxGeometry args={[1.05, 2.1, 0.1]} />
          <meshStandardMaterial color="#101827" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* screen */}
        <mesh position={[0, 0, 0.056]}>
          <planeGeometry args={[0.94, 1.96]} />
          <meshStandardMaterial
            color="#0a1a2b"
            emissive="#25d7f0"
            emissiveIntensity={0.35}
            roughness={0.15}
          />
        </mesh>
        {/* message rows on screen */}
        {[0.6, 0.25, -0.1, -0.45].map((y, i) => (
          <mesh key={y} position={[i % 2 ? 0.16 : -0.16, y, 0.062]}>
            <planeGeometry args={[0.5, 0.18]} />
            <meshBasicMaterial
              color={i === 1 ? "#ff8a5b" : "#5ce1ff"}
              transparent
              opacity={i === 1 ? 0.85 : 0.5}
            />
          </mesh>
        ))}
      </group>

      {/* AI scanning rings */}
      <mesh ref={ringA} rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[1.5, 0.008, 8, 96]} />
        <meshBasicMaterial color="#5ce1ff" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ringB} rotation={[Math.PI / 1.9, 0.4, 0]}>
        <torusGeometry args={[1.85, 0.006, 8, 96]} />
        <meshBasicMaterial color="#4f8dff" transparent opacity={0.35} />
      </mesh>

      {/* protective shield */}
      <mesh ref={shield}>
        <icosahedronGeometry args={[1, 3]} />
        <meshPhysicalMaterial
          color="#5ce1ff"
          transparent
          opacity={0.16}
          roughness={0.05}
          metalness={0.1}
          transmission={0.6}
          thickness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh scale={1.56}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#5ce1ff" wireframe transparent opacity={0.12} />
      </mesh>
    </group>
  );
}
