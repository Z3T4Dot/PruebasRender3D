import { Canvas } from "@react-three/fiber"
import { OrbitControls, Grid } from "@react-three/drei"
import { useRef, useCallback, useEffect, useState } from "react"
import SceneObject from "../components/SceneObject"
import * as THREE from "three"
import sceneConfig from "../config/sceneConfig"

export default function Scene({ sceneObjects, setSceneObjects, selectedId, setSelectedId }) {
  const wallsRef = useRef([])
  const controlsRef = useRef()
  const [transparentWalls, setTransparentWalls] = useState([false, false, false, false])

  const updateObject = (id, newData) => {
    setSceneObjects((prev) => prev.map((o) => (o.id === id ? newData : o)))
  }

  const handleSelect = (id) => {
    setSelectedId(id)
  }

  const handleCanvasClick = (e) => {
    // Solo deseleccionar si se hace clic en el canvas vacío
    if (e.target === e.currentTarget) {
      setSelectedId(null)
    }
  }

  // Manejador global para asegurar que los controles se rehabiliten
  const handleGlobalPointerUp = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true
    }
  }, [])

  // Agregar listener global para pointer up
  useEffect(() => {
    document.addEventListener('pointerup', handleGlobalPointerUp)
    document.addEventListener('mouseup', handleGlobalPointerUp)
    
    return () => {
      document.removeEventListener('pointerup', handleGlobalPointerUp)
      document.removeEventListener('mouseup', handleGlobalPointerUp)
    }
  }, [handleGlobalPointerUp])

  // Definir paredes de la escena
  const wallThickness = sceneConfig.wallThickness
  const roomSize = sceneConfig.roomSize
  const wallHeight = sceneConfig.wallHeight

  // Función para actualizar la transparencia de las paredes según la posición de la cámara
  const updateWallsTransparency = () => {
    if (!controlsRef.current) return
    const camera = controlsRef.current.object
    const pos = camera.position


    // Calcular ángulos o posiciones para determinar qué paredes hacer transparentes
    // Aquí se usa la posición de la cámara para decidir
    // Paredes: 0-back, 1-front, 2-left, 3-right
    const newTransparency = [false, false, false, false]

    // Si la cámara está mirando hacia la pared frontal o trasera y cerca de ellas, hacerlas transparentes
    if (pos.z > 2) {
      newTransparency[1] = true // pared frontal
    } else if (pos.z < -2) {
      newTransparency[0] = true // pared trasera
    }

    // Si la cámara está cerca de la pared izquierda o derecha, hacerlas transparentes
    if (pos.x < -2) {
      newTransparency[2] = true // pared izquierda
    } else if (pos.x > 2) {
      newTransparency[3] = true // pared derecha
    }

    setTransparentWalls(newTransparency)
  }

  // Actualizar transparencia en cada frame
  useEffect(() => {
    const callback = () => {
      updateWallsTransparency()
      requestAnimationFrame(callback)
    }
    callback()
    return () => cancelAnimationFrame(callback)
  }, [])

    const walls = [
    // Pared trasera
    <mesh
      key="wall-back"
      position={[0, wallHeight / 2, -roomSize / 2]}
      ref={(el) => (wallsRef.current[0] = el)}
      receiveShadow
      visible={!transparentWalls[0]}
    >
      <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
      <meshStandardMaterial color="#888888" transparent={transparentWalls[0]} opacity={transparentWalls[0] ? 0 : 1} />
    </mesh>,
    // Pared frontal
    <mesh
      key="wall-front"
      position={[0, wallHeight / 2, roomSize / 2]}
      ref={(el) => (wallsRef.current[1] = el)}
      receiveShadow
      visible={!transparentWalls[1]}
    >
      <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
      <meshStandardMaterial color="#888888" transparent={transparentWalls[1]} opacity={transparentWalls[1] ? 0 : 1} />
    </mesh>,
    // Pared izquierda
    <mesh
      key="wall-left"
      position={[-roomSize / 2, wallHeight / 2, 0]}
      ref={(el) => (wallsRef.current[2] = el)}
      receiveShadow
      visible={!transparentWalls[2]}
    >
      <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
      <meshStandardMaterial color="#888888" transparent={transparentWalls[2]} opacity={transparentWalls[2] ? 0 : 1} />
    </mesh>,
    // Pared derecha
    <mesh
      key="wall-right"
      position={[roomSize / 2, wallHeight / 2, 0]}
      ref={(el) => (wallsRef.current[3] = el)}
      receiveShadow
      visible={!transparentWalls[3]}
    >
      <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
      <meshStandardMaterial color="#888888" transparent={transparentWalls[3]} opacity={transparentWalls[3] ? 0 : 1} />
    </mesh>
  ]

  return (
    <div onClick={handleCanvasClick} style={{ width: "100%", height: "100%" }}>
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        style={{ background: "#f0f0f0", height: "100vh", width: "100%" }}
        onPointerMissed={() => setSelectedId(null)}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Grid args={[10, 10]} />
        {walls}
        {sceneObjects.map((obj) => (
          <SceneObject
            key={obj.id}
            object={obj}
            onUpdate={updateObject}
            isSelected={selectedId === obj.id}
            onSelect={handleSelect}
            sceneWalls={wallsRef.current}
            controls={controlsRef.current}
            allObjects={sceneObjects}
          />
        ))}
        <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          enableDamping 
          dampingFactor={0.1}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
        />
      </Canvas>
    </div>
  )
}
