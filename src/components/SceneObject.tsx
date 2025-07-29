// ─────────────────────────────────────────────────────────────────────────────
// src/components/SceneObject.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import DimensionLines from "./DimensionLines";

export interface SceneObjectProps {
  object: any;
  onUpdate: (id: number, data: any) => void;
  isSelected: boolean;
  onSelect: (id: number) => void;
  sceneWalls: { minX: number; maxX: number; minZ: number; maxZ: number };
  controls: any;
  ceilingHeight: number;            // ← lo recibimos
  allObjects: any[];
}

export default function SceneObject({
  object,
  onUpdate,
  isSelected,
  onSelect,
  sceneWalls,
  controls,
  ceilingHeight,      // ← aquí
  allObjects,
}: SceneObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { camera, gl, raycaster } = useThree();

  const [isDragging, setIsDragging]   = useState(false);
  const [dragOffset, setDragOffset]   = useState(new THREE.Vector3());
  const [hitCeiling, setHitCeiling]   = useState(false);

  // 1) Sincronizar transformaciones
  useEffect(() => {
    if (!isDragging && meshRef.current) {
      const m = meshRef.current;
      m.position.set(...object.position);
      m.rotation.set(...object.rotation);
      m.scale.set(...object.scale);
    }
  }, [object, isDragging]);

  // 2) Start drag o select
  const handlePointerDown = (e: THREE.Event<PointerEvent>) => {
    e.stopPropagation();
    if (e.pointerType !== "mouse" || e.nativeEvent.button !== 0) return;
    if (!isSelected) {
      onSelect(object.id);
      return;
    }
    setIsDragging(true);
    const pt = e.intersections[0]?.point;
    if (pt) setDragOffset(meshRef.current.position.clone().sub(pt));
    controls.enabled = false;
    gl.domElement.setPointerCapture(e.nativeEvent.pointerId);
  };

  const handlePointerUp = (e: THREE.Event<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    setHitCeiling(false);
    controls.enabled = true;
    if (gl.domElement.hasPointerCapture(e.nativeEvent.pointerId)) {
      gl.domElement.releasePointerCapture(e.nativeEvent.pointerId);
    }
  };

  // 3) Chequeo colisión con otros
  const checkCollisions = useCallback(
    (pos: THREE.Vector3, scale: THREE.Vector3) => {
      const b = new THREE.Box3().setFromCenterAndSize(pos, scale);
      return allObjects.some(o => {
        if (o.id === object.id) return false;
        const ob = new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(...o.position),
          new THREE.Vector3(...o.scale)
        );
        return b.intersectsBox(ob);
      });
    },
    [allObjects, object.id]
  );

  // 4) Drag global
  useEffect(() => {
    if (!isDragging) return;
    const move = (ev: PointerEvent) => {
      ev.preventDefault();
      const rect = gl.domElement.getBoundingClientRect();
      const mx = ((ev.clientX - rect.left)  / rect.width ) * 2 - 1;
      const my = -((ev.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera({ x: mx, y: my }, camera);

      // siempre plano horizontal
      const plane = new THREE.Plane(new THREE.Vector3(0,1,0), 0);
      const pt    = new THREE.Vector3();
      if (!raycaster.ray.intersectPlane(plane, pt)) return;

      const raw = pt.clone().add(dragOffset);
      const half = meshRef.current.scale.clone().multiplyScalar(0.5);

      // clamp X/Z
      raw.x = THREE.MathUtils.clamp(raw.x,
        sceneWalls.minX + half.x,
        sceneWalls.maxX - half.x
      );
      raw.z = THREE.MathUtils.clamp(raw.z,
        sceneWalls.minZ + half.z,
        sceneWalls.maxZ - half.z
      );

      // CLAMP Y ENTRE PISO Y TECHO
      const minY = half.y;
      const maxY = ceilingHeight - half.y;
      if (raw.y > maxY) {
        raw.y = maxY;
        setHitCeiling(true);
      } else {
        raw.y = Math.max(raw.y, minY);
        setHitCeiling(false);
      }

      // colisión muebles
      if (!checkCollisions(raw, meshRef.current.scale)) {
        meshRef.current.position.copy(raw);
        onUpdate(object.id, {
          ...object,
          position: [raw.x, raw.y, raw.z],
        });
      }
    };

    const up = (ev: PointerEvent) => {
      setIsDragging(false);
      setHitCeiling(false);
      controls.enabled = true;
      if (gl.domElement.hasPointerCapture(ev.pointerId)) {
        gl.domElement.releasePointerCapture(ev.pointerId);
      }
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
  }, [
    isDragging, dragOffset,
    sceneWalls, ceilingHeight,
    checkCollisions,
    camera, raycaster,
    gl.domElement, controls,
    onUpdate, object.id
  ]);

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1,1,1]} />
        <meshStandardMaterial color={hitCeiling ? "#ff4d4d" : object.color || "lightgray"} />
        {isSelected && (
          <Edges
            scale={1.02}
            threshold={15}
            color={hitCeiling ? "red" : "#fbbf24"}
            renderOrder={999}
          />
        )}
      </mesh>

      {isSelected && (
        <DimensionLines
          object={object}
          allObjects={allObjects}
          isSelected={isSelected}
        />
      )}
    </group>
  );
}
