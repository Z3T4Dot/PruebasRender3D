import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import DimensionLines from "./DimensionLines"

export default function SceneObject({ 
  object, 
  onUpdate, 
  isSelected, 
  onSelect, 
  sceneWalls, 
  controls,
  allObjects 
}) {
  const meshRef = useRef()
  const outlineRef = useRef()
  const { camera, gl, raycaster, mouse } = useThree()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3())

  // Actualizar posición del mesh cuando cambia el objeto
  useEffect(() => {
    if (meshRef.current && !isDragging) {
      meshRef.current.position.set(...object.position)
      meshRef.current.rotation.set(...object.rotation)
      meshRef.current.scale.set(...object.scale)
      
      // Actualizar outline también (con escala ligeramente mayor)
      if (outlineRef.current) {
        outlineRef.current.position.set(...object.position)
        outlineRef.current.rotation.set(...object.rotation)
        outlineRef.current.scale.set(
          object.scale[0] * 1.01,
          object.scale[1] * 1.01,
          object.scale[2] * 1.01
        )
      }
    }
  }, [object.position, object.rotation, object.scale, isDragging])

  const handleClick = (e) => {
    e.stopPropagation()
    if (!isDragging) {
      onSelect(object.id)
    }
  }

  const handlePointerDown = (e) => {
    if (isSelected && e.button === 0) { // Solo botón izquierdo
      e.stopPropagation()
      setIsDragging(true)
      
      // Calcular offset desde el punto de clic al centro del objeto
      const intersection = e.intersections[0]
      if (intersection && meshRef.current) {
        const objectPos = meshRef.current.position
        const clickPos = intersection.point
        setDragOffset(objectPos.clone().sub(clickPos))
      }
      
      setDragStart({ x: e.clientX, y: e.clientY })
      
      // DESHABILITAR los controles de la cámara mientras se arrastra
      if (controls) {
        controls.enabled = false
      }
      
      // Capturar eventos globales para el arrastre
      gl.domElement.setPointerCapture(e.pointerId)
    }
  }

  const handlePointerUp = (e) => {
    if (isDragging) {
      e.stopPropagation()
      setIsDragging(false)
      setDragStart(null)
      
      // REHABILITAR los controles de la cámara cuando se termina de arrastrar
      if (controls) {
        controls.enabled = true
      }
      
      // Liberar captura del pointer
      if (gl.domElement.hasPointerCapture(e.pointerId)) {
        gl.domElement.releasePointerCapture(e.pointerId)
      }
    }
  }

  // Efecto de seguridad para asegurar que los controles se rehabiliten
  useEffect(() => {
    if (!isDragging && controls) {
      controls.enabled = true
    }
  }, [isDragging, controls])

  // Rehabilitar controles cuando el objeto se deselecciona
  useEffect(() => {
    if (!isSelected && controls) {
      controls.enabled = true
      setIsDragging(false)
    }
  }, [isSelected, controls])

  // Función para detectar colisiones entre objetos
  const checkCollisions = (newPos, currentScale) => {
    if (!allObjects || !Array.isArray(allObjects)) return false
    
    // Crear bounding box para el objeto actual en la nueva posición
    const currentBox = new THREE.Box3()
    currentBox.setFromCenterAndSize(
      newPos,
      new THREE.Vector3(currentScale.x, currentScale.y, currentScale.z)
    )
    
    // Verificar colisión con otros objetos
    for (const otherObject of allObjects) {
      if (otherObject.id === object.id) continue // No verificar contra sí mismo
      
      // Crear bounding box para el otro objeto
      const otherBox = new THREE.Box3()
      const otherPos = new THREE.Vector3(...otherObject.position)
      const otherScale = new THREE.Vector3(...otherObject.scale)
      
      otherBox.setFromCenterAndSize(otherPos, otherScale)
      
      // Verificar intersección
      if (currentBox.intersectsBox(otherBox)) {
        return true // Hay colisión
      }
    }
    
    return false // No hay colisión
  }

  // Manejar el movimiento global del mouse
  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      if (isDragging && isSelected && meshRef.current) {
        e.preventDefault()
        
        // Crear un plano invisible en Y=0 para el arrastre
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
        const intersection = new THREE.Vector3()
        
        // Convertir coordenadas del mouse a coordenadas del mundo
        const rect = gl.domElement.getBoundingClientRect()
        const mouseCoords = new THREE.Vector2()
        mouseCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
        mouseCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
        
        raycaster.setFromCamera(mouseCoords, camera)
        raycaster.ray.intersectPlane(plane, intersection)
        
        if (intersection) {
          // Aplicar el offset calculado
          const newPos = intersection.add(dragOffset)
          
          // Limitar posición dentro de las paredes
          const roomSize = 5
          const scale = meshRef.current.scale
          
          newPos.x = Math.max(-roomSize + scale.x/2, Math.min(roomSize - scale.x/2, newPos.x))
          newPos.z = Math.max(-roomSize + scale.z/2, Math.min(roomSize - scale.z/2, newPos.z))
          newPos.y = Math.max(scale.y/2, object.position[1]) // Mantener Y original
          
          // Verificar colisiones antes de mover
          const hasCollision = checkCollisions(newPos, scale)
          
          if (!hasCollision) {
            // Solo actualizar si no hay colisión
            meshRef.current.position.copy(newPos)
            
            // Actualizar outline (con escala ligeramente mayor)
            if (outlineRef.current) {
              outlineRef.current.position.copy(newPos)
              outlineRef.current.scale.set(
                scale.x * 1.01,
                scale.y * 1.01,
                scale.z * 1.01
              )
            }
            
            // Actualizar el objeto en el estado
            onUpdate(object.id, {
              ...object,
              position: [newPos.x, newPos.y, newPos.z]
            })
          }
          // Si hay colisión, simplemente no mover el objeto
        }
      }
    }

    const handleGlobalPointerUp = (e) => {
      if (isDragging) {
        setIsDragging(false)
        setDragStart(null)
        
        // REHABILITAR los controles de la cámara
        if (controls) {
          controls.enabled = true
        }
      }
    }

    if (isDragging) {
      document.addEventListener('pointermove', handleGlobalPointerMove)
      document.addEventListener('pointerup', handleGlobalPointerUp)
      
      return () => {
        document.removeEventListener('pointermove', handleGlobalPointerMove)
        document.removeEventListener('pointerup', handleGlobalPointerUp)
      }
    }
  }, [isDragging, isSelected, dragOffset, camera, raycaster, gl, controls, object, onUpdate, allObjects])

  const renderGeometry = () => {
    switch (object.type) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />
      case 'sphere':
        return <sphereGeometry args={[0.5, 32, 32]} />
      case 'cylinder':
        return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />
      case 'cone':
        return <coneGeometry args={[0.5, 1, 32]} />
      default:
        return <boxGeometry args={[1, 1, 1]} />
    }
  }

  // Crear geometría de bordes para el wireframe
  const createEdgesGeometry = () => {
    let geometry
    switch (object.type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(1, 1, 1)
        break
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.5, 32, 32)
        break
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32)
        break
      case 'cone':
        geometry = new THREE.ConeGeometry(0.5, 1, 32)
        break
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1)
    }
    return new THREE.EdgesGeometry(geometry)
  }

  return (
    <group>
      {/* Objeto principal */}
      <mesh
        ref={meshRef}
        position={object.position}
        rotation={object.rotation}
        scale={object.scale}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        castShadow
        receiveShadow
      >
        {renderGeometry()}
        <meshStandardMaterial 
          color={object.color}
          transparent={false}
          opacity={1}
        />
      </mesh>
      
      {/* Outline de selección - líneas de bordes consistentes */}
      {isSelected && (
        <lineSegments
          ref={outlineRef}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale.map(s => s * 1.01)} // Escala ligeramente mayor para evitar z-fighting
          renderOrder={999} // Renderizar al final para asegurar visibilidad
        >
          <primitive object={createEdgesGeometry()} />
          <lineBasicMaterial 
            color="#fbbf24"
            linewidth={3}
            transparent={true}
            opacity={1}
            depthTest={true}
            depthWrite={false}
          />
        </lineSegments>
      )}
      
      {/* Líneas de medidas dinámicas */}
      <DimensionLines 
        object={object}
        allObjects={allObjects}
        isSelected={isSelected}
      />
    </group>
  )
}
