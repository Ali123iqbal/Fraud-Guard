import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  speed?: number;
}

/** Instanced ambient particle field — cheap, GPU friendly. */
export function Particles({
  count = 220,
  radius = 7,
  color = "#5ce1ff",
  size = 0.022,
  speed = 0.08,
}: ParticlesProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        base: new THREE.Vector3(
          (Math.random() - 0.5) * radius * 2,
          (Math.random() - 0.5) * radius,
          (Math.random() - 0.5) * radius,
        ),
        phase: Math.random() * Math.PI * 2,
        amp: 0.15 + Math.random() * 0.5,
        scale: 0.5 + Math.random(),
      })),
    [count, radius],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime * speed;
    seeds.forEach((s, i) => {
      dummy.position.set(
        s.base.x + Math.sin(t + s.phase) * s.amp,
        s.base.y + Math.cos(t * 1.3 + s.phase) * s.amp,
        s.base.z + Math.sin(t * 0.7 + s.phase) * s.amp,
      );
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[size, 6, 6]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

interface ThreatStreamProps {
  count?: number;
  blocked?: number;
}

/** Red/amber threat objects travelling toward the device, deflected by the shield. */
export function ThreatStream({ count = 14, blocked = 0 }: ThreatStreamProps) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + Math.random(),
        y: (Math.random() - 0.5) * 2.6,
        speed: 0.25 + Math.random() * 0.4,
        offset: Math.random() * 6,
      })),
    [count],
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const s = seeds[i]!;
      const cycle = ((t * s.speed + s.offset) % 4) / 4;
      const minR = 1.75 + blocked * 0.35;
      const r = THREE.MathUtils.lerp(6.5, minR, cycle);
      child.position.set(Math.cos(s.angle) * r, s.y * (1 - cycle * 0.4), Math.sin(s.angle) * r);
      const near = 1 - Math.min(1, (r - minR) / 2);
      child.scale.setScalar(0.6 + near * 0.6);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = blocked > 0.5 && near > 0.7 ? 0.25 : 0.85 - cycle * 0.2;
      child.rotation.y += 0.02;
    });
  });

  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i}>
          <octahedronGeometry args={[0.11, 0]} />
          <meshBasicMaterial
            color={i % 3 === 0 ? "#ff6b4a" : "#ffb020"}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Small floating SMS cards orbiting the device. */
export function MessageCards({ count = 5 }: { count?: number }) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2,
        radius: 2.5 + (i % 2) * 0.7,
        y: -0.9 + (i / count) * 1.9,
        speed: 0.12 + (i % 3) * 0.03,
      })),
    [count],
  );

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((child, i) => {
      const s = seeds[i]!;
      const a = s.angle + t * s.speed;
      child.position.set(Math.cos(a) * s.radius, s.y + Math.sin(t * 0.7 + i) * 0.12, Math.sin(a) * s.radius);
      child.lookAt(0, 0, 0);
      child.position.x += state.pointer.x * 0.25;
      child.position.y += state.pointer.y * 0.15;
    });
  });

  return (
    <group ref={group}>
      {seeds.map((_, i) => (
        <group key={i}>
          <mesh>
            <planeGeometry args={[0.7, 0.4]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#ff8a5b" : "#5ce1ff"}
              transparent
              opacity={0.14}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, 0.07, 0.001]}>
            <planeGeometry args={[0.44, 0.045]} />
            <meshBasicMaterial color="#cfefff" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.08, -0.04, 0.001]}>
            <planeGeometry args={[0.28, 0.04]} />
            <meshBasicMaterial color="#cfefff" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Faint network node lattice. */
export function NetworkNodes({ count = 26 }: { count?: number }) {
  const points = useMemo(
    () =>
      Array.from(
        { length: count },
        () =>
          new THREE.Vector3(
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 6 - 2,
          ),
      ),
    [count],
  );

  const geometry = useMemo(() => {
    const positions: number[] = [];
    points.forEach((p, i) => {
      const q = points[(i + 3) % points.length]!;
      if (p.distanceTo(q) < 6) positions.push(p.x, p.y, p.z, q.x, q.y, q.z);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [points]);

  return (
    <group>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#4f8dff" transparent opacity={0.16} />
      </lineSegments>
      {points.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshBasicMaterial color="#5ce1ff" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}
