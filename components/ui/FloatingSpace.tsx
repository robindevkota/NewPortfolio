"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FloatingMeshProps {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  speed?: number;
  floatIntensity?: number;
  rotationSpeed?: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
}

function FloatingMesh({
  geometry,
  position,
  speed = 1.0,
  floatIntensity = 1.0,
  rotationSpeed = 0.4,
  mouse,
}: FloatingMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Slow drift floating motion (sine wave)
    const time = state.clock.getElapsedTime() * speed;
    meshRef.current.position.y = initialY + Math.sin(time + phase.current) * 0.25 * floatIntensity;

    // Project 3D coordinates to 2D screen space to check mouse proximity
    const tempPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(tempPos);
    tempPos.project(state.camera);

    const dx = tempPos.x - mouse.current.x;
    const dy = tempPos.y - mouse.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const isHovered = dist < 0.32;

    // Dynamic rotation speed
    const currentSpeed = isHovered ? rotationSpeed * 3.5 : rotationSpeed;
    meshRef.current.rotation.x += currentSpeed * delta;
    meshRef.current.rotation.y += currentSpeed * delta * 0.8;

    // Smooth scale transition
    const targetScale = isHovered ? 1.25 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    // Smooth color and opacity transitions
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, isHovered ? 0.45 : 0.18, 0.1);

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

export default function FloatingSpace() {
  const mouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const handleMouseLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const torusKnot    = new THREE.TorusKnotGeometry(0.55, 0.16, 80, 12);
  const icosahedron  = new THREE.IcosahedronGeometry(0.65, 1);
  const dodecahedron = new THREE.DodecahedronGeometry(0.55, 0);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        {/* Top-left corner */}
        <FloatingMesh
          geometry={torusKnot}
          position={[-3.8, 1.8, -1]}
          speed={1.4}
          floatIntensity={1.1}
          rotationSpeed={0.3}
          mouse={mouse}
        />

        {/* Right side — not overlapping center */}
        <FloatingMesh
          geometry={icosahedron}
          position={[3.6, 0.2, -0.8]}
          speed={1.8}
          floatIntensity={1.3}
          rotationSpeed={0.45}
          mouse={mouse}
        />

        {/* Bottom-left */}
        <FloatingMesh
          geometry={dodecahedron}
          position={[-3.4, -2.0, 0]}
          speed={1.1}
          floatIntensity={0.8}
          rotationSpeed={0.25}
          mouse={mouse}
        />
      </Canvas>
    </div>
  );
}
