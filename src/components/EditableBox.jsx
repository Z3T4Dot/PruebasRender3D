
"use client"

import { useRef, useState, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { TransformControls } from "@react-three/drei"
import { RigidBody } from "@react-three/rapier"

export default function EditableBox({ selectedObject, setSelectedObject, physicsEnabled }) {
  const meshRef = useRef()
  const rigidBodyRef = useRef()
  const transformRef = useRef()
  const [selected, setSelected] = useState(false)
  const [transformMode, setTransformMode] = useState("translate")
  const [isDragging, setIsDragging] = useState(false)

  // Estados locales para las propiedades del objeto
  const [position, setPosition] = useState([0, 2, 0])
  const [rotation, setRotation] = useState([0, 0, 0])
  const [scale, setScale] = useState([1, 1, 1])

  const orbitControls = useThree((state) => state.controls)

  // Sincronizar selección con el estado global
  useEffect(() => {
    if (selectedObject && selectedObject.id === "editableBox") {
      setSelected(true)
      // SIEMPRE sincronizar desde selectedObject, sin importar isDragging
      setPosition(selectedObject.position || [0, 2, 0])
      setRotation(selectedObject.rotation || [0, 0, 0])
      setScale(selectedObject.scale || [1, 1, 1])
      setTransformMode(selectedObject.transformMode || "translate")
    } else {
      setSelected(false)
    }
  }, [selectedObject])

  // Actualizar el objeto seleccionado cuando cambien las propiedades locales
  useEffect(() => {
    if (selected && setSelectedObject) {
      setSelectedObject({
        position,
        rotation,
        scale,
        transformMode,
        id: "editableBox",
      })
    }
  }, [position, rotation, scale, transformMode, selected, setSelectedObject])

  const handleClick = (e) => {
    e.stopPropagation()
    setSelected(true)
    if (setSelectedObject) {
      setSelectedObject({
        position,
        rotation,
        scale,
        transformMode,
        id: "editableBox",
      })
    }
  }

  // Configurar event listeners para TransformControls
  useEffect(() => {
    const controls = transformRef.current
    const mesh = meshRef.current

    if (controls && mesh && selected) {
      const handleObjectChange = () => {
        if (!mesh || isDragging) return

        const newPosition = [mesh.position.x, mesh.position.y, mesh.position.z]
        const newRotation = [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]
        const newScale = [mesh.scale.x, mesh.scale.y, mesh.scale.z]

        setPosition(newPosition)
        setRotation(newRotation)
        setScale(newScale)
      }

      const handleDragStart = () => {
        setIsDragging(true)
        if (orbitControls) orbitControls.enabled = false
      }

      const handleDragEnd = () => {
        setIsDragging(false)
        if (orbitControls) orbitControls.enabled = true

        // Forzar actualización después del arrastre
        if (mesh) {
          const newPosition = [mesh.position.x, mesh.position.y, mesh.position.z]
          const newRotation = [mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]
          const newScale = [mesh.scale.x, mesh.scale.y, mesh.scale.z]

          setPosition(newPosition)
          setRotation(newRotation)
          setScale(newScale)
        }
      }

      // Event listeners
      controls.addEventListener("objectChange", handleObjectChange)
      controls.addEventListener("dragging-changed", (event) => {
        if (event.value) {
          handleDragStart()
        } else {
          handleDragEnd()
        }
      })

      return () => {
        if (controls) {
          controls.removeEventListener("objectChange", handleObjectChange)
          controls.removeEventListener("dragging-changed", handleDragStart)
          controls.removeEventListener("dragging-changed", handleDragEnd)
        }
      }
    }
  }, [selected, orbitControls, isDragging])

  // Aplicar transformaciones - MEJORADO
  useFrame(() => {
    if (meshRef.current) {
      // SIEMPRE aplicar las transformaciones del estado al mesh
      meshRef.current.position.set(...position)
      meshRef.current.rotation.set(...rotation)
      meshRef.current.scale.set(...scale)

      // Solo sincronizar con RigidBody si las físicas están activas y no estamos arrastrando
      if (physicsEnabled && rigidBodyRef.current && !isDragging) {
        try {
          const rbPos = rigidBodyRef.current.translation()
          if (rbPos) {
            // Solo actualizar si hay una diferencia significativa
            const diff = Math.abs(rbPos.y - position[1])
            if (diff > 0.1) {
              const newPos = [rbPos.x, rbPos.y, rbPos.z]
              setPosition(newPos)
            }
          }
        } catch (error) {
          // Ignorar errores de sincronización
        }
      }
    }
  })

  // Componente del mesh
  const meshComponent = (
    <mesh ref={meshRef} castShadow onClick={handleClick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={selected ? "#00ccff" : "#ff005b"} />
    </mesh>
  )

  // Renderizar según el estado de las físicas
  if (physicsEnabled) {
    return (
      <RigidBody
        ref={rigidBodyRef}
        position={position}
        type="dynamic"
        restitution={0.3}
        friction={0.7}
        key={`physics-${physicsEnabled}`} // Forzar re-render cuando cambian las físicas
      >
        {selected ? (
          <TransformControls
            ref={transformRef}
            mode={transformMode}
            showX
            showY
            showZ
            size={1.5}
            space="world"
            key={`transform-physics-${transformMode}`}
          >
            {meshComponent}
          </TransformControls>
        ) : (
          meshComponent
        )}
      </RigidBody>
    )
  } else {
    // Sin físicas: renderizado simple
    return selected ? (
      <TransformControls
        ref={transformRef}
        mode={transformMode}
        showX
        showY
        showZ
        size={1.5}
        space="world"
        key={`transform-no-physics-${transformMode}`}
      >
        {meshComponent}
      </TransformControls>
    ) : (
      meshComponent
    )
  }
}
