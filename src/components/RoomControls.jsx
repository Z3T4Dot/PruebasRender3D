"use client"

export default function RoomControls({ roomSize, setRoomSize, physicsEnabled, setPhysicsEnabled }) {
    const updateRoomSize = (dimension, value) => {
        const newSize = [...roomSize]
        const dimensionIndex = ["width", "height", "depth"].indexOf(dimension)
        newSize[dimensionIndex] = Math.max(2, Number.parseFloat(value) || 2)
        setRoomSize(newSize)
    }

    return (
        <div className="room-controls">
            <div className="control-header">
                <h3>Room Settings</h3>
                <button
                    onClick={() => setPhysicsEnabled(!physicsEnabled)}
                    className={`physics-btn ${physicsEnabled ? "enabled" : "disabled"}`}
                >
                    {physicsEnabled ? "🔴 Physics ON" : "🟢 Physics OFF"}
                </button>
            </div>

            <div className="room-dimensions">
                <label>Room Dimensions</label>
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
    )
}
