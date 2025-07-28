import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Plane, Box } from "@react-three/drei";

// Configuración inicial de pared y piso
export function RoomSetup({ onComplete }) {
  const [walls, setWalls] = useState({
    north: true,
    east: true,
    south: true,
    west: true,
  });
  const [floorDims, setFloorDims] = useState({ width: 8, depth: 8 }); // metros
  const [wallColor, setWallColor] = useState("#ffffff");
  const [floorTexture, setFloorTexture] = useState("#cccccc");

  // Manejo de walls toggles
  const toggleWall = (dir) => {
    setWalls((prev) => ({ ...prev, [dir]: !prev[dir] }));
  };

  // Inputs de dimensiones
  const handleFloorChange = (e) => {
    const { name, value } = e.target;
    setFloorDims((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Finalizar configuración
  const handleNext = () => {
    onComplete({ walls, floorDims, wallColor, floorTexture });
  };

  return (
    <div
      className="room-setup-container"
      style={{ display: "flex", height: "100%", width: "100%" }}
    >
      {/* Preview Canvas */}
      <div style={{ flex: 1, background: "#333" }}>
        <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 10, 5]} />
          <OrbitControls />

          {/* Floor */}
          <Plane
            args={[floorDims.width, floorDims.depth]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <meshStandardMaterial color={floorTexture} />
          </Plane>

          {/* Walls */}
          {walls.north && (
            <Box
              args={[floorDims.width, 3, 0.1]}
              position={[0, 1.5, -floorDims.depth / 2]}
            >
              <meshStandardMaterial color={wallColor} />
            </Box>
          )}
          {walls.south && (
            <Box
              args={[floorDims.width, 3, 0.1]}
              position={[0, 1.5, floorDims.depth / 2]}
            >
              <meshStandardMaterial color={wallColor} />
            </Box>
          )}
          {walls.east && (
            <Box
              args={[0.1, 3, floorDims.depth]}
              position={[floorDims.width / 2, 1.5, 0]}
            >
              <meshStandardMaterial color={wallColor} />
            </Box>
          )}
          {walls.west && (
            <Box
              args={[0.1, 3, floorDims.depth]}
              position={[-floorDims.width / 2, 1.5, 0]}
            >
              <meshStandardMaterial color={wallColor} />
            </Box>
          )}
        </Canvas>
      </div>

      {/* Controls */}
      <div style={{ width: 300, padding: 20, background: "#fafafa" }}>
        <h2>Configuración de habitación</h2>
        <fieldset>
          <legend>Selecciona paredes</legend>
          {Object.keys(walls).map((dir) => (
            <label key={dir} style={{ display: "block", marginBottom: 8 }}>
              <input
                type="checkbox"
                checked={walls[dir]}
                onChange={() => toggleWall(dir)}
              />{" "}
              {dir}
            </label>
          ))}
        </fieldset>

        <fieldset>
          <legend>Dimensiones del piso (m)</legend>
          <label>
            Ancho:{" "}
            <input
              type="number"
              name="width"
              value={floorDims.width}
              onChange={handleFloorChange}
              step="0.1"
            />
          </label>
          <label>
            Profundidad:{" "}
            <input
              type="number"
              name="depth"
              value={floorDims.depth}
              onChange={handleFloorChange}
              step="0.1"
            />
          </label>
        </fieldset>

        <fieldset>
          <legend>Estética</legend>
          <label>
            Color de paredes:{" "}
            <input
              type="color"
              value={wallColor}
              onChange={(e) => setWallColor(e.target.value)}
            />
          </label>
          <label>
            Color/textura piso:{" "}
            <input
              type="color"
              value={floorTexture}
              onChange={(e) => setFloorTexture(e.target.value)}
            />
          </label>
        </fieldset>

        <button
          onClick={handleNext}
          style={{ marginTop: 20, padding: "10px 20px" }}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
