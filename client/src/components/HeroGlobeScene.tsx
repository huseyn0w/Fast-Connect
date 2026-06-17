import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Single azure accent, matching the Tailwind `aurora` hue (#38bdf8). */
const AURORA = "#38bdf8";
const AURORA_GLOW = "#22d3ee";

/** Evenly distribute `count` points on a unit sphere (Fibonacci lattice). */
function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // 1 → -1
    const ring = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3] = Math.cos(theta) * ring * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * ring * radius;
  }
  return positions;
}

/**
 * A dot globe: ~1600 points scattered over a sphere with a faint wireframe
 * shell behind them. Rotates slowly on its tilted axis. The whole group is
 * disposed on unmount so navigating away doesn't leak GPU buffers.
 */
function Globe({ radius = 1.35, rotationSpeed = 0.0016 }) {
  const group = useRef<THREE.Group>(null!);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(fibonacciSphere(1600, radius), 3));
    return geometry;
  }, [radius]);

  const shellGeometry = useMemo(() => new THREE.SphereGeometry(radius * 0.99, 48, 48), [radius]);

  useEffect(() => {
    return () => {
      pointsGeometry.dispose();
      shellGeometry.dispose();
    };
  }, [pointsGeometry, shellGeometry]);

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += rotationSpeed;
    }
  });

  return (
    <group ref={group} rotation={[0.42, 0, 0.18]}>
      <points geometry={pointsGeometry}>
        <pointsMaterial
          color={AURORA}
          size={0.02}
          sizeAttenuation
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh geometry={shellGeometry}>
        <meshBasicMaterial color={AURORA_GLOW} wireframe transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

/**
 * The full Three.js canvas for the hero globe. Imported lazily so the Three
 * bundle is code-split out of the initial load, and only mounted by
 * {@link ./HeroGlobe} when WebGL is available and motion is allowed.
 */
export default function HeroGlobeScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 3.5], fov: 70 }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.6} />
      <Globe />
    </Canvas>
  );
}
