"use client"
import { RigidBody } from "@react-three/rapier"

export default function Plane({ size = [10, 10], physicsEnabled = false }) {
  if (physicsEnabled) {
    return (
      <RigidBody type="fixed" restitution={0.2} friction={0.8}>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={size} />
          <meshStandardMaterial color="#e0e0e0" transparent={false} opacity={1} />
        </mesh>
      </RigidBody>
    )
  } else {
    return (
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    )
  }
}
