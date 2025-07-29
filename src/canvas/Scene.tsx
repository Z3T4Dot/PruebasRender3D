// ─────────────────────────────────────────────────────────────────────────────
// src/canvas/Scene.tsx
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useCallback, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import SceneObject, { Object3DData } from "../components/SceneObject";
import * as THREE from "three";
import sceneConfig from "../config/sceneConfig";

type WallsConfig = { north: boolean; south: boolean; east: boolean; west: boolean };
type FloorDims   = { width: number; depth: number };

interface SceneProps {
  sceneObjects: Object3DData[];
  setSceneObjects: React.Dispatch<React.SetStateAction<Object3DData[]>>;
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  walls: WallsConfig;
  floorDims: FloorDims;
  wallColor: string;
  floorTexture: string;
}

const Scene: React.FC<SceneProps> = ({
  sceneObjects,
  setSceneObjects,
  selectedId,
  setSelectedId,
  walls,
  floorDims,
  wallColor,
  floorTexture,
}) => {
  const controlsRef = useRef<any>(null);

  // Cálculo de los límites de la habitación
  const halfW = floorDims.width / 2;
  const halfD = floorDims.depth / 2;
  const sceneWalls = {
    minX: -halfW,  maxX: halfW,
    minZ: -halfD,  maxZ: halfD,
  };

  // Handler de actualización de un objeto
  const updateObject = useCallback(
    (id: number, data: Object3DData) => {
      setSceneObjects(prev => prev.map(o => (o.id === id ? data : o)));
    },
    [setSceneObjects]
  );

  const handleSelect = useCallback(
    (id: number) => setSelectedId(id),
    [setSelectedId]
  );

  const { wallThickness, wallHeight } = sceneConfig;

  // Transparencia de muros (igual que antes)...
  const [transparentWalls, setTransparentWalls] = React.useState<boolean[]>([false,false,false,false]);
  const updateWallsTransparency = useCallback(() => {
    if (!controlsRef.current) return;
    const { x: camX, z: camZ } = controlsRef.current.object.position;
    setTransparentWalls([
      camZ < sceneWalls.minZ,
      camZ > sceneWalls.maxZ,
      camX < sceneWalls.minX,
      camX > sceneWalls.maxX,
    ]);
  }, [sceneWalls]);
  useEffect(() => {
    let id = requestAnimationFrame(function loop() {
      updateWallsTransparency();
      id = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, [updateWallsTransparency]);

  return (
    <Canvas
      shadows
      camera={{ position: [5,5,5], fov: 50 }}
      style={{ width: "100%", height: "100%", background: "#f0f0f0" }}
      onPointerMissed={() => setSelectedId(null)}
    >
      <ambientLight intensity={0.5}/>
      <directionalLight position={[10,10,5]} intensity={1} castShadow/>

      <Grid
        args={[
          Math.max(floorDims.width, floorDims.depth),
          Math.max(floorDims.width, floorDims.depth),
        ]}
      />
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[floorDims.width, floorDims.depth]}/>
        <meshStandardMaterial color={floorTexture}/>
      </mesh>

      {walls.south && (
        <mesh position={[0, wallHeight/2, sceneWalls.minZ]} receiveShadow>
          <boxGeometry args={[floorDims.width, wallHeight, wallThickness]}/>
          <meshStandardMaterial
            color={wallColor}
            transparent={transparentWalls[0]}
            opacity={transparentWalls[0]?0.2:1}
          />
        </mesh>
      )}
      {walls.north && (
        <mesh position={[0, wallHeight/2, sceneWalls.maxZ]} receiveShadow>
          <boxGeometry args={[floorDims.width, wallHeight, wallThickness]}/>
          <meshStandardMaterial
            color={wallColor}
            transparent={transparentWalls[1]}
            opacity={transparentWalls[1]?0.2:1}
          />
        </mesh>
      )}
      {walls.west && (
        <mesh position={[sceneWalls.minX, wallHeight/2, 0]} receiveShadow>
          <boxGeometry args={[wallThickness, wallHeight, floorDims.depth]}/>
          <meshStandardMaterial
            color={wallColor}
            transparent={transparentWalls[2]}
            opacity={transparentWalls[2]?0.2:1}
          />
        </mesh>
      )}
      {walls.east && (
        <mesh position={[sceneWalls.maxX, wallHeight/2, 0]} receiveShadow>
          <boxGeometry args={[wallThickness, wallHeight, floorDims.depth]}/>
          <meshStandardMaterial
            color={wallColor}
            transparent={transparentWalls[3]}
            opacity={transparentWalls[3]?0.2:1}
          />
        </mesh>
      )}

      {sceneObjects.map(obj => (
        <SceneObject
          key={obj.id}
          object={obj}
          onUpdate={updateObject}
          isSelected={selectedId === obj.id}
          onSelect={handleSelect}
          sceneWalls={sceneWalls}
          controls={controlsRef.current}
          ceilingHeight={wallHeight}          // ← PASAMOS el techo
          allObjects={sceneObjects}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.1}
      />
    </Canvas>
  );
};

export default Scene;
