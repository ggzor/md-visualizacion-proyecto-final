import { useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'

export function Cubes({ positions, colors }) {
  const tempObject = useMemo(() => new Object3D(), [])

  const cubeCount = positions.length
  const mesh = useRef()

  useEffect(() => {
    positions.forEach(({ x, y, z }, i) => {
      tempObject.position.set(x, y, z)
      tempObject.updateMatrix()
      mesh.current.setMatrixAt(i, tempObject.matrix)
    })

    mesh.current.instanceMatrix.needsUpdate = true
  }, [positions, tempObject])

  return (
    <instancedMesh ref={mesh} args={[null, null, cubeCount]}>
      <boxGeometry>
        <instancedBufferAttribute
          attachObject={['attributes', 'color']}
          args={[colors, 3]}
        />
      </boxGeometry>
      <meshBasicMaterial vertexColors={true} />
    </instancedMesh>
  )
}
