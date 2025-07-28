import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export default function DimensionLines({ object, allObjects, isSelected }) {
  // 1) Bounding box de todos los objetos
  const groupDims = useMemo(() => {
    if (!isSelected || !allObjects?.length) return null;
    const box = new THREE.Box3();
    allObjects.forEach((o) => {
      const pos = new THREE.Vector3(...o.position);
      const scale = new THREE.Vector3(...o.scale).multiplyScalar(0.5);
      box.expandByPoint(pos.clone().sub(scale));
      box.expandByPoint(pos.clone().add(scale));
    });
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    return {
      min: box.min.clone(),
      max: box.max.clone(),
      center,
      width: size.x * 100,
      height: size.y * 100,
      depth: size.z * 100,
    };
  }, [allObjects, isSelected]);

  // 2) Refs a las líneas
  const refW = useRef();
  const refH = useRef();
  const refD = useRef();

  // 3) Cada frame actualizo las geometrías
  useFrame(() => {
    if (!isSelected || !groupDims) return;

    const { min, max, center } = groupDims;
    const offset = 0.1;      // 10cm
    const yFloor = min.y;

    // ANCHO
    refW.current.geometry.setFromPoints([
      new THREE.Vector3(min.x - offset, yFloor + offset, max.z + offset),
      new THREE.Vector3(max.x + offset, yFloor + offset, max.z + offset),
    ]);

    // ALTURA (AHORA from min.y+offset to max.y+offset)
    refH.current.geometry.setFromPoints([
      new THREE.Vector3(max.x + offset, yFloor + offset, center.z),
      new THREE.Vector3(max.x + offset, max.y + offset, center.z),
    ]);

    // PROFUNDIDAD
    refD.current.geometry.setFromPoints([
      new THREE.Vector3(min.x - offset, yFloor + offset, min.z - offset),
      new THREE.Vector3(min.x - offset, yFloor + offset, max.z + offset),
    ]);
  });

  // 4) Si no está seleccionado o no hay dims, nada
  if (!isSelected || !groupDims) return null;

  // 5) Preparo posiciones para texto y esferas
  const { min, max, center, width, height, depth } = groupDims;
  const offset = 0.10; // 10cm
  const yFloor = min.y;

  // Ancho
  const xW1 = min.x - offset;
  const xW2 = max.x + offset;
  const yW  = yFloor + offset;
  const zW  = max.z + offset;

  // Altura
  const xH  = max.x + offset;
  const yH1 = yFloor + offset;     // <-- ya no es min.y - offset
  const yH2 = max.y + offset;
  const zH  = center.z;

  // Profundidad
  const xD  = min.x - offset;
  const yD  = yFloor + offset;
  const zD1 = min.z - offset;
  const zD2 = max.z + offset;

  return (
    <group>
      {/* ——— ANCHO ——— */}
      <line ref={refW} renderOrder={1000}>
        <bufferGeometry />
        <lineBasicMaterial color="#ff6b6b" linewidth={2} depthTest={false} />
      </line>
      <Text
        position={[center.x, yW, zW]}
        fontSize={0.3}
        color="#ff6b6b"
        anchorX="center"
        anchorY="bottom"
        billboard
      >
        {`${Math.round(width)} cm`}
      </Text>
      <mesh position={[xW1, yW, zW]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[xW2, yW, zW]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#ff6b6b" />
      </mesh>

      {/* ——— ALTURA ——— */}
      <line ref={refH} renderOrder={1000}>
        <bufferGeometry />
        <lineBasicMaterial color="#4ecdc4" linewidth={2} depthTest={false} />
      </line>
      <Text
        position={[xH, (yH1 + yH2) / 2, zH]}
        fontSize={0.3}
        color="#4ecdc4"
        anchorX="left"
        anchorY="middle"
        billboard
      >
        {`${Math.round(height)} cm`}
      </Text>
      <mesh position={[xH, yH1, zH]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#4ecdc4" />
      </mesh>
      <mesh position={[xH, yH2, zH]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#4ecdc4" />
      </mesh>

      {/* ——— PROFUNDIDAD ——— */}
      <line ref={refD} renderOrder={1000}>
        <bufferGeometry />
        <lineBasicMaterial color="#45b7d1" linewidth={2} depthTest={false} />
      </line>
      <Text
        position={[xD, yD, (zD1 + zD2) / 2]}
        fontSize={0.3}
        color="#45b7d1"
        anchorX="right"
        anchorY="middle"
        billboard
      >
        {`${Math.round(depth)} cm`}
      </Text>
      <mesh position={[xD, yD, zD1]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#45b7d1" />
      </mesh>
      <mesh position={[xD, yD, zD2]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#45b7d1" />
      </mesh>
    </group>
  );
}
