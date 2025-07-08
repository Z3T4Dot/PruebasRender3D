"use client"
import "../styles/ControlPanel/ControlPanel.css"

export default function ControlPanel({
  selectedObject,
  setSelectedObject,
  physicsEnabled,
  setPhysicsEnabled,
  roomSize,
  setRoomSize,
}) {
  const updateRoomSize = (dimension, value) => {
    const newSize = [...roomSize]
    const dimensionIndex = ["width", "height", "depth"].indexOf(dimension)
    newSize[dimensionIndex] = Math.max(2, Number.parseFloat(value) || 2)
    setRoomSize(newSize)
  }

  const updateProperty = (property, index, value) => {
    if (!selectedObject) return

    const newObject = { ...selectedObject }
    const newValue = Number.parseFloat(value) || 0

    // Crear nueva array para forzar re-render
    const newArray = [...newObject[property]]
    newArray[index] = newValue
    newObject[property] = newArray

    setSelectedObject(newObject)
  }

  const updateTransformMode = (mode) => {
    if (!selectedObject) return

    setSelectedObject({
      ...selectedObject,
      transformMode: mode,
    })
  }

  const resetObject = () => {
    if (!selectedObject) return

    setSelectedObject({
      ...selectedObject,
      position: [0, 2, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    })
  }

  // Función para seleccionar el objeto si no está seleccionado
  const selectObject = () => {
    if (!selectedObject) {
      setSelectedObject({
        position: [0, 2, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        transformMode: "translate",
        id: "editableBox",
      })
    }
  }

  return (
    <div className="control-panel">
      <div className="control-card">
        <h2 className="control-title">Scene Editor</h2>

        {/* Room Controls */}
        <div className="control-section">
          <div className="control-header">
            <h3 className="section-title">Room Settings</h3>
            <button
              onClick={() => setPhysicsEnabled(!physicsEnabled)}
              className={`physics-btn ${physicsEnabled ? "enabled" : "disabled"}`}
            >
              {physicsEnabled ? "🔴 Physics ON" : "🟢 Physics OFF"}
            </button>
          </div>

          <div className="room-dimensions">
            <label className="section-label">Room Dimensions</label>
            <div className="dimension-inputs">
              <div className="input-wrapper">
                <span className="dim-label">Width</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="0.5"
                  value={roomSize[0]}
                  onChange={(e) => updateRoomSize("width", e.target.value)}
                  className="dim-input"
                />
              </div>
              <div className="input-wrapper">
                <span className="dim-label">Height</span>
                <input
                  type="number"
                  min="2"
                  max="10"
                  step="0.5"
                  value={roomSize[1]}
                  onChange={(e) => updateRoomSize("height", e.target.value)}
                  className="dim-input"
                />
              </div>
              <div className="input-wrapper">
                <span className="dim-label">Depth</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  step="0.5"
                  value={roomSize[2]}
                  onChange={(e) => updateRoomSize("depth", e.target.value)}
                  className="dim-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="control-divider"></div>

        {/* Object Controls */}
        {selectedObject ? (
          <div className="control-section">
            <h3 className="section-title">Transform Object</h3>

            {/* Transform Mode Buttons */}
            <div className="transform-buttons">
              <button
                className={`transform-button ${selectedObject.transformMode === "translate" ? "active" : "inactive"}`}
                onClick={() => updateTransformMode("translate")}
              >
                <span>📍</span>
                Move
              </button>
              <button
                className={`transform-button ${selectedObject.transformMode === "rotate" ? "active" : "inactive"}`}
                onClick={() => updateTransformMode("rotate")}
              >
                <span>🔄</span>
                Rotate
              </button>
              <button
                className={`transform-button ${selectedObject.transformMode === "scale" ? "active" : "inactive"}`}
                onClick={() => updateTransformMode("scale")}
              >
                <span>📏</span>
                Scale
              </button>
            </div>

            {/* Position Controls */}
            <div className="control-group">
              <label className="section-label">Position</label>
              <div className="xyz-inputs">
                {["X", "Y", "Z"].map((axis, index) => (
                  <div key={axis} className="input-wrapper">
                    <span className={`axis-label axis-${axis.toLowerCase()}`}>{axis}</span>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedObject.position[index].toFixed(2)}
                      onChange={(e) => updateProperty("position", index, e.target.value)}
                      className="axis-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="control-group">
              <label className="section-label">Rotation (degrees)</label>
              <div className="xyz-inputs">
                {["X", "Y", "Z"].map((axis, index) => (
                  <div key={axis} className="input-wrapper">
                    <span className={`axis-label axis-${axis.toLowerCase()}`}>{axis}</span>
                    <input
                      type="number"
                      step="1"
                      value={(selectedObject.rotation[index] * (180 / Math.PI)).toFixed(1)}
                      onChange={(e) =>
                        updateProperty("rotation", index, (Number.parseFloat(e.target.value) || 0) * (Math.PI / 180))
                      }
                      className="axis-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Scale Controls */}
            <div className="control-group">
              <label className="section-label">Scale</label>
              <div className="xyz-inputs">
                {["X", "Y", "Z"].map((axis, index) => (
                  <div key={axis} className="input-wrapper">
                    <span className={`axis-label axis-${axis.toLowerCase()}`}>{axis}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={selectedObject.scale[index].toFixed(2)}
                      onChange={(e) => updateProperty("scale", index, e.target.value)}
                      className="axis-input"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={resetObject} className="reset-button">
              🔄 Reset Transform
            </button>
          </div>
        ) : (
          <div className="no-selection">
            <div className="no-selection-icon">🎯</div>
            <p>Select an object to edit its properties</p>
            <button onClick={selectObject} className="select-button">
              🎯 Select Cube
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
