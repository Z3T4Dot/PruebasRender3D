"use client"

import { useState } from "react"
import Scene from "./canvas/Scene"
import ControlPanel from "./components/ControlPanel"
import "./styles/Scene/Scene.css"

export default function App() {
  const [roomSize, setRoomSize] = useState([10, 4, 8]) // width, height, depth
  const [selectedObject, setSelectedObject] = useState(null)
  const [physicsEnabled, setPhysicsEnabled] = useState(false)

  return (
    <div className="app-container">
      <div className="scene-container">
        <Scene
          roomSize={roomSize}
          selectedObject={selectedObject}
          setSelectedObject={setSelectedObject}
          physicsEnabled={physicsEnabled}
          setPhysicsEnabled={setPhysicsEnabled}
        />
      </div>
      <ControlPanel
        selectedObject={selectedObject}
        setSelectedObject={setSelectedObject}
        physicsEnabled={physicsEnabled}
        setPhysicsEnabled={setPhysicsEnabled}
        roomSize={roomSize}
        setRoomSize={setRoomSize}
      />
    </div>
  )
}
