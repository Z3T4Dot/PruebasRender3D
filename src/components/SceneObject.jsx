import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export default function SceneObject({ 
  object, 
  onUpdate, 
  isSelected, 
  onSelect, 
  sceneWalls, 
  controls 
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
      
      // Actualizar outline también
      if (outlineRef.current) {
        outlineRef.current.position.set(...object.position)
        outlineRef.current.rotation.set(...object.rotation)
        outlineRef.current.scale.set(...object.scale)
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
    if (isSelected) {
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
    }
  }

  // Efecto de seguridad para asegurar que los controles se rehabiliten
  useEffect(() => {
    if (!isDragging && controls) {
      // Pequeño delay para asegurar que los controles se rehabiliten
      const timer = setTimeout(() => {
        controls.enabled = true
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [isDragging, controls])

  // Rehabilitar controles cuando el objeto se deselecciona
  useEffect(() => {
    if (!isSelected && controls) {
      controls.enabled = true
    }
  }, [isSelected, controls])

  const handlePointerMove = (e) => {
    if (isDragging && isSelected && meshRef.current) {
      e.stopPropagation()
      
      // Crear un plano invisible en Y=0 para el arrastre
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersection = new THREE.Vector3()
      
      // Convertir coordenadas del mouse a coordenadas del mundo
      const mouseCoords = new THREE.Vector2()
      mouseCoords.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseCoords.y = -(e.clientY / window.innerHeight) * 2 + 1
      
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
        
        // Actualizar posición del mesh
        meshRef.current.position.copy(newPos)
        
        // Actualizar outline
        if (outlineRef.current) {
          outlineRef.current.position.copy(newPos)
        }
        
        // Actualizar el objeto en el estado
        onUpdate(object.id, {
          ...object,
          position: [newPos.x, newPos.y, newPos.z]
        })
      }
    }
  }

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
        onPointerMove={handlePointerMove}
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
      
      {/* Outline de selección - wireframe que rodea completamente el objeto */}
      {isSelected && (
        <mesh
          ref={outlineRef}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          renderOrder={1}
        >
          {renderGeometry()}
          <meshBasicMaterial 
            color="#fbbf24"
            wireframe={true}
            transparent={true}
            opacity={0.8}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  )
}
