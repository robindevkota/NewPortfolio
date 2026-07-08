"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/data/projects";

const PROJECT_EMOJI: Record<string, string> = {
  "royal-suites": "🏨",
  agentinbox: "🤖",
  helosarkar: "🏛️",
  waiterless: "🍽️",
  newweb: "🧩",
};

const CYCLE_MS = 4500;

// ─── Custom "engineering identity" shapes (built from primitives, not earcut-triangulated fills, so wireframes stay clean) ───

function createGearGeometry(): THREE.BufferGeometry {
  const baseRing = new THREE.TorusGeometry(0.4, 0.085, 8, 48);

  const hub = new THREE.CylinderGeometry(0.15, 0.15, 0.22, 16);
  hub.rotateX(Math.PI / 2);

  const teethCount = 8;
  const teeth: THREE.BufferGeometry[] = [];
  for (let i = 0; i < teethCount; i++) {
    const angle = (i / teethCount) * Math.PI * 2;
    const tooth = new THREE.BoxGeometry(0.16, 0.18, 0.18);
    tooth.translate(0.48, 0, 0);
    tooth.rotateZ(angle);
    teeth.push(tooth);
  }

  const merged = mergeGeometries([baseRing, hub, ...teeth], false);
  merged.center();
  return merged;
}

// Built as bent 3D tubes (not flat boxes) so the "</>" glyph keeps its
// silhouette from any rotation angle instead of collapsing to a line edge-on.
function createBracketsGeometry(): THREE.BufferGeometry {
  const tubeRadius = 0.055;

  const makeTube = (points: THREE.Vector3[]) =>
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 24, tubeRadius, 8, false);

  const left = makeTube([
    new THREE.Vector3(-0.16, 0.42, 0.05),
    new THREE.Vector3(-0.46, 0.16, 0),
    new THREE.Vector3(-0.58, 0, -0.05),
    new THREE.Vector3(-0.46, -0.16, 0),
    new THREE.Vector3(-0.16, -0.42, 0.05),
  ]);

  const right = makeTube([
    new THREE.Vector3(0.16, 0.42, 0.05),
    new THREE.Vector3(0.46, 0.16, 0),
    new THREE.Vector3(0.58, 0, -0.05),
    new THREE.Vector3(0.46, -0.16, 0),
    new THREE.Vector3(0.16, -0.42, 0.05),
  ]);

  const slash = makeTube([
    new THREE.Vector3(-0.08, -0.44, -0.05),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.08, 0.44, 0.05),
  ]);

  const merged = mergeGeometries([left, right, slash], false);
  merged.center();
  return merged;
}

function createAtomGeometry(): THREE.BufferGeometry {
  const nucleus = new THREE.SphereGeometry(0.17, 14, 14);

  const ring = (zRot: number) => {
    const g = new THREE.TorusGeometry(0.6, 0.032, 8, 64);
    g.scale(1, 0.4, 1);
    g.rotateX(Math.PI / 2.1);
    g.rotateZ(zRot);
    return g;
  };

  const merged = mergeGeometries(
    [nucleus, ring(0), ring(Math.PI / 3), ring(-Math.PI / 3)],
    false
  );
  merged.center();
  return merged;
}

type ScreenRef = React.MutableRefObject<{ x: number; y: number } | null>;
type HoverRef = React.MutableRefObject<boolean>;

interface FloatingMeshProps {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  speed?: number;
  floatIntensity?: number;
  rotationSpeed?: number;
  hoverRef: HoverRef;
  screenRef: ScreenRef;
}

function FloatingMesh({
  geometry,
  position,
  speed = 1.0,
  floatIntensity = 1.0,
  rotationSpeed = 0.4,
  hoverRef,
  screenRef,
}: FloatingMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Slow drift floating motion (sine wave)
    const time = state.clock.getElapsedTime() * speed;
    meshRef.current.position.y = initialY + Math.sin(time + phase.current) * 0.25 * floatIntensity;

    // Publish this frame's screen-space position for the HTML hotspot overlay
    const tempPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(tempPos);
    tempPos.project(state.camera);
    screenRef.current = { x: tempPos.x, y: tempPos.y };

    const isHovered = hoverRef.current;

    const currentSpeed = isHovered ? rotationSpeed * 3.5 : rotationSpeed;
    meshRef.current.rotation.x += currentSpeed * delta;
    meshRef.current.rotation.y += currentSpeed * delta * 0.8;

    const targetScale = isHovered ? 1.25 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, isHovered ? 0.5 : 0.18, 0.1);

    const targetColor = new THREE.Color(isHovered ? "#00f0ff" : "#6366f1");
    mat.color.lerp(targetColor, 0.1);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <primitive object={geometry} attach="geometry" />
      <meshBasicMaterial
        color="#6366f1"
        wireframe
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </mesh>
  );
}

function ProjectHotspot({
  projectId,
  screenRef,
  hoverRef,
  onOpen,
}: {
  projectId: string;
  screenRef: ScreenRef;
  hoverRef: HoverRef;
  onOpen: (id: string) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const s = screenRef.current;
      const el = elRef.current;
      if (s && el) {
        const x = ((s.x + 1) / 2) * window.innerWidth;
        const y = ((1 - s.y) / 2) * window.innerHeight;
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [screenRef]);

  if (!project) return null;

  return (
    <div
      ref={elRef}
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
      onClick={() => onOpen(project.id)}
      title={`Open ${project.name}`}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: 140,
        height: 140,
        marginLeft: -70,
        marginTop: -70,
        zIndex: 2,
        pointerEvents: "auto",
        cursor: "pointer",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            textAlign: "center",
            color: "#a5b4fc",
            background: "rgba(10,10,15,0.55)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 6,
            padding: "4px 9px",
            whiteSpace: "nowrap",
            backdropFilter: "blur(4px)",
          }}
        >
          <span style={{ marginRight: 5 }}>{PROJECT_EMOJI[project.id] ?? "📁"}</span>
          {project.name}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function FloatingSpace({ onProjectOpen }: { onProjectOpen: (id: string) => void }) {
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCursor(c => (c + 1) % projects.length), CYCLE_MS);
    return () => clearInterval(t);
  }, []);

  const hoverA = useRef(false);
  const hoverB = useRef(false);
  const hoverC = useRef(false);
  const screenA = useRef<{ x: number; y: number } | null>(null);
  const screenB = useRef<{ x: number; y: number } | null>(null);
  const screenC = useRef<{ x: number; y: number } | null>(null);

  const gear = useMemo(() => createGearGeometry(), []);
  const atom = useMemo(() => createAtomGeometry(), []);
  const brackets = useMemo(() => createBracketsGeometry(), []);

  const n = projects.length;
  const idA = projects[cursor % n].id;
  const idB = projects[(cursor + 1) % n].id;
  const idC = projects[(cursor + 2) % n].id;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
          dpr={[1, 1.5]}
        >
          {/* Top-left corner — gear: systems engineering */}
          <FloatingMesh
            geometry={gear}
            position={[-3.8, 1.8, -1]}
            speed={1.4}
            floatIntensity={1.1}
            rotationSpeed={0.3}
            hoverRef={hoverA}
            screenRef={screenA}
          />

          {/* Right side — atom: AI orchestration */}
          <FloatingMesh
            geometry={atom}
            position={[3.6, 0.2, -0.8]}
            speed={1.8}
            floatIntensity={1.3}
            rotationSpeed={0.45}
            hoverRef={hoverB}
            screenRef={screenB}
          />

          {/* Bottom-left — code brackets: software */}
          <FloatingMesh
            geometry={brackets}
            position={[-3.4, -2.0, 0]}
            speed={1.1}
            floatIntensity={0.8}
            rotationSpeed={0.25}
            hoverRef={hoverC}
            screenRef={screenC}
          />
        </Canvas>
      </div>

      <ProjectHotspot projectId={idA} screenRef={screenA} hoverRef={hoverA} onOpen={onProjectOpen} />
      <ProjectHotspot projectId={idB} screenRef={screenB} hoverRef={hoverB} onOpen={onProjectOpen} />
      <ProjectHotspot projectId={idC} screenRef={screenC} hoverRef={hoverC} onOpen={onProjectOpen} />
    </>
  );
}
