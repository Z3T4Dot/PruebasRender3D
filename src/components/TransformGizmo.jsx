"use client"
import { useState } from "react"

export default function TransformGizmo({ selectedObject, setSelectedObject, onTransformModeChange }) {
  const [activeMode, setActiveMode] = useState("translate")

  if (!selectedObject) return null

  const handleModeChange = (mode) => {
    setActiveMode(mode)
    onTransformModeChange(mode)
    setSelectedObject({
      ...selectedObject,
      transformMode: mode,
    })
  }

  const updateValue = (property, axis, value) => {
    const newObject = { ...selectedObject }
    const axisIndex = ["x", "y", "z"].indexOf(axis.toLowerCase())
    newObject[property][axisIndex] = Number.parseFloat(value) || 0
    setSelectedObject(newObject)
  }

  return (
    <div className="transform-gizmo">
      <div className="gizmo-header">
        <h3>Transform Object</h3>
        <div className="mode-buttons">
          <button
            className={`mode-btn ${activeMode === "translate" ? "active" : ""}`}
            onClick={() => handleModeChange("translate")}
            title="Move (G)"
          >
            📍
          </button>
          <button
            className={`mode-btn ${activeMode === "rotate" ? "active" : ""}`}
            onClick={() => handleModeChange("rotate")}
            title="Rotate (R)"
          >
            🔄
          </button>
          <button
            className={`mode-btn ${activeMode === "scale" ? "active" : ""}`}
            onClick={() => handleModeChange("scale")}
            title="Scale (S)"
          >
            📏
          </button>
        </div>
      </div>

      <div className="gizmo-controls">
        {/* Position */}
        <div className="control-group">
          <label>Position</label>
          <div className="xyz-inputs">
            {["X", "Y", "Z"].map((axis, index) => (
              <div key={axis} className="input-wrapper">
                <span className={`axis-label axis-${axis.toLowerCase()}`}>{axis}</span>
                <input
                  type="number"
                  step="0.1"
                  value={selectedObject.position[index].toFixed(2)}
                  onChange={(e) => updateValue("position", axis, e.target.value)}
                  className="axis-input"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Rotation */}
        <div className="control-group">
          <label>Rotation</label>
          <div className="xyz-inputs">
            {["X", "Y", "Z"].map((axis, index) => (
              <div key={axis} className="input-wrapper">
                <span className={`axis-label axis-${axis.toLowerCase()}`}>{axis}</span>
                <input
                  type="number"
                  step="0.1"
                  value={(selectedObject.rotation[index] * (180 / Math.PI)).toFixed(1)}
                  onChange={(e) =>
                    updateValue("rotation", axis, (Number.parseFloat(e.target.value) || 0) * (Math.PI / 180))
                  }
                  className="axis-input"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Scale */}
        <div className="control-group">
          <label>Scale</label>
          <div className="xyz-inputs">
            {["X", "Y", "Z"].map((axis, index) => (
              <div key={axis} className="input-wrapper">
                <span className={`axis-label axis-${axis.toLowerCase()}`}>{axis}</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={selectedObject.scale[index].toFixed(2)}
                  onChange={(e) => updateValue("scale", axis, e.target.value)}
                  className="axis-input"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
