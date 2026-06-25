"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── warp star streaks ─────────────────────────────────────────────
function WarpStars({ speed }: { speed: React.MutableRefObject<number> }) {
  const COUNT = 2000;
  const ref = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const theta  = Math.random() * Math.PI * 2;
      const radius = Math.random() * 4 + 0.5;
      positions[i * 3]     = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80;

      // colour: blue dominant, occasional green flash
      const r = Math.random();
      if (r < 0.06) {
        colors[i*3] = 0; colors[i*3+1] = 1; colors[i*3+2] = 0.53; // green
      } else if (r < 0.3) {
        colors[i*3] = 0.65; colors[i*3+1] = 0.71; colors[i*3+2] = 0.99; // lavender
      } else {
        colors[i*3] = 0.1; colors[i*3+1] = 0.34; colors[i*3+2] = 0.86; // blue
      }
    }
    return { positions, colors };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    g.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const s   = 0.6 + speed.current * 4;

    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 2] += s * delta * 60 * 0.06;
      if (arr[i * 3 + 2] > 30) arr[i * 3 + 2] = -50;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    // grow points to streaks as speed increases
    (ref.current.material as THREE.PointsMaterial).size = 0.05 + speed.current * 0.18;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial vertexColors sizeAttenuation transparent opacity={0.9} size={0.04} depthWrite={false} />
    </points>
  );
}

// ── tunnel rings ──────────────────────────────────────────────────
function TunnelRings({ speed }: { speed: React.MutableRefObject<number> }) {
  const N = 20;
  const refs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const s   = speed.current;
    const spd = 0.06 + s * 0.5;

    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const t = ((clock.elapsedTime * spd + i / N) % 1);
      // z goes from -60 (far) to +12 (just past camera)
      mesh.position.z = -60 + t * 72;
      // rings narrow as they approach — perspective already handles this, but
      // we can also scale slightly
      const sc = 0.8 + t * 0.3;
      mesh.scale.set(sc, sc, 1);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      // fade in then fade out as ring passes camera
      mat.opacity = Math.sin(t * Math.PI) * (0.15 + s * 0.35);
    });
  });

  return (
    <group>
      {Array.from({ length: N }, (_, i) => (
        <mesh key={i} ref={el => { refs.current[i] = el; }} rotation={[0, 0, 0]}>
          <torusGeometry args={[3.2, 0.015, 6, 64]} />
          <meshBasicMaterial color="#1a56db" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

// ── line streaks (true line geometry, z-aligned) ──────────────────
function LineStreaks({ speed }: { speed: React.MutableRefObject<number> }) {
  const COUNT = 250;
  const ref = useRef<THREE.LineSegments>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 6); // 2 points per line
    const colors    = new Float32Array(COUNT * 6);
    for (let i = 0; i < COUNT; i++) {
      const theta  = Math.random() * Math.PI * 2;
      const radius = Math.random() * 3.5 + 0.3;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      const z = (Math.random() - 0.5) * 80;

      const len = Math.random() * 1.2 + 0.3;
      positions[i*6]   = x; positions[i*6+1] = y; positions[i*6+2] = z;
      positions[i*6+3] = x; positions[i*6+4] = y; positions[i*6+5] = z + len;

      const r = Math.random();
      const col = r < 0.07
        ? [0, 1, 0.53]
        : r < 0.25
        ? [0.65, 0.71, 0.99]
        : [0.1, 0.34, 0.86];
      for (let k = 0; k < 2; k++) {
        colors[i*6 + k*3]     = col[0];
        colors[i*6 + k*3 + 1] = col[1];
        colors[i*6 + k*3 + 2] = col[2];
      }
    }
    return { positions, colors };
  }, []);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    g.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    const s   = 0.4 + speed.current * 4;

    for (let i = 0; i < COUNT; i++) {
      const move = s * delta * 60 * 0.05;
      arr[i*6 + 2] += move;
      arr[i*6 + 5] += move;

      if (arr[i*6 + 2] > 30) {
        const theta  = Math.random() * Math.PI * 2;
        const radius = Math.random() * 3.5 + 0.3;
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius;
        const newZ = -50;
        arr[i*6]   = x; arr[i*6+1] = y; arr[i*6+2] = newZ;
        arr[i*6+3] = x; arr[i*6+4] = y; arr[i*6+5] = newZ + 0.4;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    // stretch lines with speed for motion-blur
    const mat = ref.current.material as THREE.LineBasicMaterial;
    mat.opacity = 0.6 + speed.current * 0.4;
  });

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial vertexColors transparent opacity={0.5} depthWrite={false} />
    </lineSegments>
  );
}

// ── subtle fog tunnel glow at center ──────────────────────────────
function CenterGlow() {
  return (
    <mesh position={[0, 0, -5]}>
      <sphereGeometry args={[1.2, 16, 16]} />
      <meshBasicMaterial color="#1a56db" transparent opacity={0.04} depthWrite={false} />
    </mesh>
  );
}

// ── camera drift with mouse ───────────────────────────────────────
function CameraDrift({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.03;
    camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, -10);
  });
  return null;
}

// ── exported component ────────────────────────────────────────────
export default function WarpTunnel() {
  const speedRef  = useRef(0);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const targetRef = useRef(0);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    let lastY = window.scrollY;
    let decay: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      targetRef.current = Math.min(dy * 0.015, 1.0);
      clearTimeout(decay);
      decay = setTimeout(() => { targetRef.current = 0; }, 200);
    };

    let raf: number;
    const tick = () => {
      speedRef.current += (targetRef.current - speedRef.current) * 0.06;
      raf = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("scroll",    onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(decay);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll",    onScroll);
    };
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 80, near: 0.1, far: 200 }}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <CenterGlow />
        <TunnelRings speed={speedRef} />
        <WarpStars   speed={speedRef} />
        <LineStreaks  speed={speedRef} />
        <CameraDrift mouse={mouseRef} />
      </Canvas>
    </div>
  );
}
