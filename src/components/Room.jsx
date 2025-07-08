"use client"
import { RigidBody } from "@react-three/rapier"

export default function Room({ roomSize, physicsEnabled }) {
  const [width, height, depth] = roomSize

  return (
    <group>
      {/* PISO COMPLETAMENTE PLANO */}
      {physicsEnabled ? (
        <RigidBody type="fixed" position={[0, 0, 0]} restitution={0} friction={1}>
          <mesh receiveShadow>
            <boxGeometry args={[width, 0.1, depth]} />
            <meshStandardMaterial color="#e8e8e8" />
          </mesh>
        </RigidBody>
      ) : (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color="#e8e8e8" />
        </mesh>
      )}

      {/* PAREDES */}
      {physicsEnabled ? (
        <>
          <RigidBody type="fixed" position={[0, 2, -depth / 2]} restitution={0} friction={1}>
            <mesh>
              <boxGeometry args={[width, 4, 0.2]} />
              <meshStandardMaterial color="#f0f0f0" />
            </mesh>
          </RigidBody>
          <RigidBody type="fixed" position={[-width / 2, 2, 0]} restitution={0} friction={1}>
            <mesh>
              <boxGeometry args={[0.2, 4, depth]} />
              <meshStandardMaterial color="#f2f2f2" />
            </mesh>
          </RigidBody>
          <RigidBody type="fixed" position={[width / 2, 2, 0]} restitution={0} friction={1}>
            <mesh>
              <boxGeometry args={[0.2, 4, depth]} />
              <meshStandardMaterial color="#f2f2f2" />
            </mesh>
          </RigidBody>
        </>
      ) : (
        <>
          <mesh position={[0, 2, -depth / 2]}>
            <boxGeometry args={[width, 4, 0.2]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <mesh position={[-width / 2, 2, 0]}>
            <boxGeometry args={[0.2, 4, depth]} />
            <meshStandardMaterial color="#f2f2f2" />
          </mesh>
          <mesh position={[width / 2, 2, 0]}>
            <boxGeometry args={[0.2, 4, depth]} />
            <meshStandardMaterial color="#f2f2f2" />
          </mesh>
        </>
      )}
    </group>
  )
}
