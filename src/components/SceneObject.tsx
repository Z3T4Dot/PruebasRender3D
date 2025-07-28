// src/components/SceneObject.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Edges } from "@react-three/drei";
import DimensionLines from "./DimensionLines";

export default function SceneObject({
  object,
  onUpdate,
  isSelected,
  onSelect,
  sceneWalls,   // { minX, maxX, minZ, maxZ }
  controls,
  allObjects,
}) {
  const meshRef = useRef(null);
  const { camera, gl, raycaster } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());

  // Sincronizar transformaciones
  useEffect(() => {
    if (!isDragging && meshRef.current) {
      meshRef.current.position.set(...object.position);
      meshRef.current.rotation.set(...object.rotation);
      meshRef.current.scale.set(...object.scale);
    }
  }, [object, isDragging]);

  // Iniciar selección o arrastre
  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    if (!isSelected) {
      onSelect(object.id);
      return;
    }
    setIsDragging(true);
    const pt = e.intersections[0]?.point;
    if (pt) setDragOffset(meshRef.current.position.clone().sub(pt));
    controls.enabled = false;
    gl.domElement.setPointerCapture(e.pointerId);
  };
  const handlePointerUp = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
    setIsDragging(false);
    controls.enabled = true;
    if (gl.domElement.hasPointerCapture(e.pointerId)) {
      gl.domElement.releasePointerCapture(e.pointerId);
    }
  };

  // Detectar colisiones entre objetos
  const checkCollisions = useCallback(
    (pos, scale) => {
      const box = new THREE.Box3().setFromCenterAndSize(pos, scale);
      return allObjects.some((o) => {
        if (o.id === object.id) return false;
        const otherBox = new THREE.Box3().setFromCenterAndSize(
          new THREE.Vector3(...o.position),
          new THREE.Vector3(...o.scale)
        );
        return box.intersectsBox(otherBox);
      });
    },
    [allObjects, object.id]
  );

  // Manejador global de arrastre
  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      e.preventDefault();
      const rect = gl.domElement.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera({ x: mx, y: my }, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pt = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, pt)) {
        const raw = pt.clone().add(dragOffset);

        // Calcular medio tamaño del objeto
        const halfX = meshRef.current.scale.x / 2;
        const halfZ = meshRef.current.scale.z / 2;

        // Limitar centro para que los bordes no crucen las paredes
        raw.x = THREE.MathUtils.clamp(
          raw.x,
          sceneWalls.minX + halfX,
          sceneWalls.maxX - halfX
        );
        raw.z = THREE.MathUtils.clamp(
          raw.z,
          sceneWalls.minZ + halfZ,
          sceneWalls.maxZ - halfZ
        );

        // Mantener la altura mínima en Y
        raw.y = Math.max(meshRef.current.scale.y / 2, 0);

        // Verificar colisiones con otros objetos
        if (!checkCollisions(raw, meshRef.current.scale)) {
          meshRef.current.position.copy(raw);
          onUpdate(object.id, {
            ...object,
            position: [raw.x, raw.y, raw.z],
          });
        }
      }
    };
    const handleUp = () => {
      setIsDragging(false);
      controls.enabled = true;
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };
    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
    };
  }, [
    isDragging,
    dragOffset,
    object,
    sceneWalls,
    checkCollisions,
    camera,
    gl.domElement,
    raycaster,
    controls,
    onUpdate,
  ]);

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={(e) => {
          e.stopPropagation();
          if (!isSelected) onSelect(object.id);
        }}
        castShadow
        receiveShadow
      >
        {/* Renderizar siempre como caja usando la escala del objeto */}
        {/* Caja unitaria, luego escalada por mesh.scale */}
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={object.color || "lightgray"} />

        {/* Outline */}
        {isSelected && (
          <Edges
            scale={1.02}
            threshold={15}
            color="#2724fbff"
            renderOrder={999}
          />
        )}
      </mesh>

      {/* Líneas de medida dinámicas */}
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
