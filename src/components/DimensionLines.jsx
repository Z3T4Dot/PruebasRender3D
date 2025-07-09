import { useRef, useEffect, useMemo } from "react"
import { Text } from "@react-three/drei"
import * as THREE from "three"

export default function DimensionLines({ object, allObjects, isSelected }) {
  const groupRef = useRef()

  // Función para obtener TODOS los objetos en la escena
  const getAllObjects = () => {
    if (!allObjects || !Array.isArray(allObjects)) return [object]
    return allObjects // Devolver TODOS los objetos, no solo los cercanos
  }

  // Calcular las dimensiones de TODOS los objetos en la escena
  const calculateGroupDimensions = useMemo(() => {
    if (!isSelected) return null

    const allSceneObjects = getAllObjects()

    // Calcular bounding box para todos los objetos
    const calculateBounds = (objects, axis) => {
      let min = Infinity
      let max = -Infinity

      objects.forEach(obj => {
        const pos = obj.position[axis]
        const scale = obj.scale[axis]
        const objMin = pos - scale / 2
        const objMax = pos + scale / 2
        
        min = Math.min(min, objMin)
        max = Math.max(max, objMax)
      })

      return { min, max, size: max - min, center: (min + max) / 2 }
    }

    return {
      width: {
        objects: allSceneObjects,
        bounds: calculateBounds(allSceneObjects, 0), // eje X
        dimension: calculateBounds(allSceneObjects, 0).size
      },
      height: {
        objects: allSceneObjects,
        bounds: calculateBounds(allSceneObjects, 1), // eje Y
        dimension: calculateBounds(allSceneObjects, 1).size
      },
      depth: {
        objects: allSceneObjects,
        bounds: calculateBounds(allSceneObjects, 2), // eje Z
        dimension: calculateBounds(allSceneObjects, 2).size
      }
    }
  }, [object, allObjects, isSelected])


  // Función para verificar si hay colisión en una dirección específica
  const checkCollisionInDirection = (direction, distance) => {
    if (!allObjects || !Array.isArray(allObjects)) return false

    const currentPos = new THREE.Vector3(...object.position)
    const testPos = currentPos.clone().add(direction.clone().multiplyScalar(distance))
    
    // Crear un pequeño bounding box para la línea de medida
    const lineBox = new THREE.Box3()
    lineBox.setFromCenterAndSize(testPos, new THREE.Vector3(0.1, 0.1, 0.1))

    for (const otherObject of allObjects) {
      if (otherObject.id === object.id) continue

      const otherBox = new THREE.Box3()
      const otherPos = new THREE.Vector3(...otherObject.position)
      const otherScale = new THREE.Vector3(...otherObject.scale)
      
      otherBox.setFromCenterAndSize(otherPos, otherScale)
      
      if (lineBox.intersectsBox(otherBox)) {
        return true
      }
    }
    return false
  }

  // Calcular posiciones inteligentes para evitar interferencias (estilo IKEA)
  const calculateLinePositions = () => {
    const groupBounds = calculateGroupDimensions
    
    // Distancia base desde el grupo de objetos
    const baseDistance = 2.5

    // Posiciones fijas para evitar interferencias (como IKEA)
    const positions = {
      width: {
        direction: new THREE.Vector3(0, 0, 1),  // Siempre adelante
        distance: baseDistance
      },
      height: {
        direction: new THREE.Vector3(1, 0, 0),  // Siempre a la derecha
        distance: baseDistance
      },
      depth: {
        direction: new THREE.Vector3(-1, 0, 0), // Siempre a la izquierda (separado del height)
        distance: baseDistance
      }
    }

    return positions
  }

  const linePositions = calculateLinePositions()

  // Crear líneas de medida estilo IKEA - claras y sin interferencias
  const createGroupDimensionLine = (measureType, groupData) => {
    const { bounds, dimension, objects } = groupData
    const { direction, distance } = linePositions[measureType]
    
    let mainStartPoint, mainEndPoint, textPos
    let extensionLines = []

  // Calcular el centro del grupo completo
  const groupCenterX = calculateGroupDimensions?.width?.bounds?.center ?? 0
  const groupCenterY = calculateGroupDimensions?.height?.bounds?.center ?? 0
  const groupCenterZ = calculateGroupDimensions?.depth?.bounds?.center ?? 0
    
    // Altura base elevada para evitar interferencias
    const baseHeight = Math.max(groupCenterY + 1.0, 1.5)

    if (measureType === 'width') {
      // Línea de ancho - siempre adelante y elevada
      const offset = direction.clone().multiplyScalar(distance)
      const lineHeight = 0.1 // Cambiar para que esté en el piso
      
      const groupStart = new THREE.Vector3(bounds.min, lineHeight, groupCenterZ)
      const groupEnd = new THREE.Vector3(bounds.max, lineHeight, groupCenterZ)
      
      mainStartPoint = groupStart.clone().add(offset)
      mainEndPoint = groupEnd.clone().add(offset)
      textPos = new THREE.Vector3(bounds.center, lineHeight, groupCenterZ).add(offset)
      
      // Líneas de extensión verticales
      extensionLines = [
        {
          start: new THREE.Vector3(bounds.min, 0, groupCenterZ),
          end: mainStartPoint.clone()
        },
        {
          start: new THREE.Vector3(bounds.max, 0, groupCenterZ),
          end: mainEndPoint.clone()
        }
      ]
    } else if (measureType === 'height') {
      // Línea de altura - siempre a la derecha
      // Ajustar para que la línea se muestre en dirección a la cámara y fuera del mueble
      const offset = direction.clone().multiplyScalar(distance)
      
      // Obtener dirección hacia la cámara para orientar la línea de altura
      const cameraDirection = new THREE.Vector3()
      if (groupRef.current && groupRef.current.parent) {
        groupRef.current.parent.getWorldDirection(cameraDirection)
      }
      cameraDirection.normalize()
      
      // Calcular un vector perpendicular a la dirección de la cámara para desplazar la línea
      const upVector = new THREE.Vector3(0, 1, 0)
      const perpendicular = new THREE.Vector3().crossVectors(cameraDirection, upVector).normalize()
      
      const groupStart = new THREE.Vector3(groupCenterX, bounds.min, groupCenterZ)
      const groupEnd = new THREE.Vector3(groupCenterX, bounds.max, groupCenterZ)
      
      // Desplazar la línea en la dirección perpendicular para que no quede dentro del mueble
      mainStartPoint = groupStart.clone().add(perpendicular.clone().multiplyScalar(distance)).add(new THREE.Vector3(0, 0.6, 0))
      mainEndPoint = groupEnd.clone().add(perpendicular.clone().multiplyScalar(distance)).add(new THREE.Vector3(0, 0.6, 0))
      textPos = new THREE.Vector3(groupCenterX, bounds.center, groupCenterZ).add(perpendicular.clone().multiplyScalar(distance)).add(new THREE.Vector3(0, 0.6, 0))
      
      // Líneas de extensión horizontales
      extensionLines = [
        {
          start: groupStart.clone(),
          end: mainStartPoint.clone()
        },
        {
          start: groupEnd.clone(),
          end: mainEndPoint.clone()
        }
      ]
    } else { // depth
      // Línea de profundidad - siempre a la izquierda y elevada
      const offset = direction.clone().multiplyScalar(distance)
      const lineHeight = baseHeight + 0.5 // Más elevada que width para evitar interferencia
      
      const groupStart = new THREE.Vector3(groupCenterX, lineHeight, bounds.min)
      const groupEnd = new THREE.Vector3(groupCenterX, lineHeight, bounds.max)
      
      mainStartPoint = groupStart.clone().add(offset)
      mainEndPoint = groupEnd.clone().add(offset)
      textPos = new THREE.Vector3(groupCenterX, lineHeight, bounds.center).add(offset)
      
      // Líneas de extensión verticales
      extensionLines = [
        {
          start: new THREE.Vector3(groupCenterX, 0, bounds.min),
          end: mainStartPoint.clone()
        },
        {
          start: new THREE.Vector3(groupCenterX, 0, bounds.max),
          end: mainEndPoint.clone()
        }
      ]
    }

    return {
      mainStartPoint,
      mainEndPoint,
      textPos,
      extensionLines,
      dimension: (dimension * 100).toFixed(0), // Convertir a centímetros
      objectCount: objects.length
    }
  }

  const widthLine = createGroupDimensionLine('width', calculateGroupDimensions.width)
  const heightLine = createGroupDimensionLine('height', calculateGroupDimensions.height)
  const depthLine = createGroupDimensionLine('depth', calculateGroupDimensions.depth)

  return (
    <group ref={groupRef}>
      {/* Línea de ancho */}
      <group>
        {/* Línea principal de medida */}
        <line renderOrder={1000}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                ...widthLine.mainStartPoint.toArray(),
                ...widthLine.mainEndPoint.toArray()
              ])}
              itemSize={3}
            />
          </bufferGeometry>
      <lineBasicMaterial 
        color="#ff6b6b" 
        linewidth={3}
        transparent={true}
        opacity={1}
        depthTest={false}
        depthWrite={true}
      />
        </line>
        
        {/* Líneas de extensión */}
        {widthLine.extensionLines.map((extLine, index) => (
          <line key={`width-ext-${index}`} renderOrder={1000}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  ...extLine.start.toArray(),
                  ...extLine.end.toArray()
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial 
              color="#ff6b6b" 
              linewidth={2}
              transparent={true}
              opacity={1}
              depthTest={true}
              depthWrite={false}
            />
          </line>
        ))}
        
        <Text
          position={widthLine.textPos.toArray()}
          fontSize={0.3}
          color="#ff6b6b"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          {`${widthLine.dimension}cm`}
        </Text>
        
        {/* Marcadores en los extremos de la línea principal */}
        <mesh position={widthLine.mainStartPoint.toArray()}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
        <mesh position={widthLine.mainEndPoint.toArray()}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#ff6b6b" />
        </mesh>
      </group>

      {/* Línea de altura */}
      <group>
        {/* Línea principal de medida */}
        <line renderOrder={1000}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                ...heightLine.mainStartPoint.toArray(),
                ...heightLine.mainEndPoint.toArray()
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#4ecdc4" 
            linewidth={3}
            transparent={true}
            opacity={1}
            depthTest={false}
            depthWrite={true}
          />
        </line>
        
        {/* Líneas de extensión */}
        {heightLine.extensionLines.map((extLine, index) => (
          <line key={`height-ext-${index}`} renderOrder={1000}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  ...extLine.start.toArray(),
                  ...extLine.end.toArray()
                ])}
                itemSize={3}
              />
            </bufferGeometry>
      <lineBasicMaterial 
        color="#4ecdc4" 
        linewidth={2}
        transparent={true}
        opacity={1}
        depthTest={false}
        depthWrite={true}
      />
          </line>
        ))}
        
        <Text
          position={heightLine.textPos.toArray()}
          fontSize={0.3}
          color="#4ecdc4"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          {`${heightLine.dimension}cm`}
        </Text>
        
        {/* Marcadores en los extremos de la línea principal */}
        <mesh position={heightLine.mainStartPoint.toArray()}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#4ecdc4" />
        </mesh>
        <mesh position={heightLine.mainEndPoint.toArray()}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#4ecdc4" />
        </mesh>
      </group>

      {/* Línea de profundidad */}
      <group>
        {/* Línea principal de medida */}
        <line renderOrder={1000}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                ...depthLine.mainStartPoint.toArray(),
                ...depthLine.mainEndPoint.toArray()
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#45b7d1" 
            linewidth={3}
            transparent={true}
            opacity={1}
            depthTest={true}
            depthWrite={false}
          />
        </line>
        
        {/* Líneas de extensión */}
        {depthLine.extensionLines.map((extLine, index) => (
          <line key={`depth-ext-${index}`} renderOrder={1000}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  ...extLine.start.toArray(),
                  ...extLine.end.toArray()
                ])}
                itemSize={3}
              />
            </bufferGeometry>
      <lineBasicMaterial 
        color="#45b7d1" 
        linewidth={2}
        transparent={true}
        opacity={1}
        depthTest={false}
        depthWrite={true}
      />
          </line>
        ))}
        
        <Text
          position={depthLine.textPos.toArray()}
          fontSize={0.3}
          color="#45b7d1"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          {`${depthLine.dimension}cm`}
        </Text>
        
        {/* Marcadores en los extremos de la línea principal */}
        <mesh position={depthLine.mainStartPoint.toArray()}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#45b7d1" />
        </mesh>
        <mesh position={depthLine.mainEndPoint.toArray()}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#45b7d1" />
        </mesh>
      </group>
    </group>
  )
}
