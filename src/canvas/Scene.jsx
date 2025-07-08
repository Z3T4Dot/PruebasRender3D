"use client"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Physics } from "@react-three/rapier"
import EditableBox from "../components/EditableBox"
import Room from "../components/Room"
import Lights from "../components/Lights"

export default function Scene({ roomSize, selectedObject, setSelectedObject, physicsEnabled, setPhysicsEnabled }) {
  const togglePhysics = () => {
    // RESET del objeto al cambiar físicas para evitar bugs
    if (selectedObject) {
      setSelectedObject({
        ...selectedObject,
        position: [0, 2, 0], // Reset a posición segura
      })
    }
    setPhysicsEnabled(!physicsEnabled)
  }

  const handlePointerMissed = () => {
    setSelectedObject(null)
  }

  return (
    <div className="canvas-wrapper">
      <div className="scene-info">
        <div>🏠 Room Designer • Click objects to select • Drag to transform</div>
        <div>
          📐 Room: {roomSize[0]}×{roomSize[1]}×{roomSize[2]} • Physics: {physicsEnabled ? "🔴 ON" : "🟢 OFF"}
        </div>
        {physicsEnabled && (
          <div style={{ color: "#ff6b6b", fontSize: "11px" }}>
            ⚠️ Physics active - object will fall. Use transform controls to move.
          </div>
        )}
      </div>

      <Canvas shadows camera={{ position: [8, 6, 8], fov: 60 }} onPointerMissed={handlePointerMissed}>
        <Lights />

        <Physics gravity={[0, -9.81, 0]} debug={false} paused={!physicsEnabled}>
          <Room roomSize={roomSize} physicsEnabled={physicsEnabled} />
          <EditableBox
            selectedObject={selectedObject}
            setSelectedObject={setSelectedObject}
            physicsEnabled={physicsEnabled}
          />
        </Physics>

        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2} />
      </Canvas>

      <div className="scene-controls">
        <button className="scene-button" onClick={togglePhysics}>
          {physicsEnabled ? "🔴 Disable Physics" : "🟢 Enable Physics"}
        </button>
        <button className="scene-button">🏠 Reset View</button>
        <button className="scene-button">📷 Screenshot</button>
      </div>
    </div>
  )
}