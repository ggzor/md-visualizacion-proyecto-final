import { useEffect, useMemo, useRef } from 'react'
import { Object3D } from 'three'

export function CubePlotter({ plotData }) {
  const colors = useMemo(
    () => new Float32Array(plotData.length),
    [plotData.length]
  )

  const meshRef = useRef()
  const colorsRef = useRef()

  useEffect(() => {
    const tempObject = new Object3D()

    let i = 0
    for (const { x, y, z, r, g, b } of plotData) {
      tempObject.position.set(x, y, z)
      tempObject.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObject.matrix)

      colors[3 * i + 0] = r
      colors[3 * i + 1] = g
      colors[3 * i + 2] = b

      i++
    }

    meshRef.current.instanceMatrix.needsUpdate = true
    colorsRef.current.needsUpdate = true
  }, [colors, plotData])

  return (
    <instancedMesh ref={meshRef} args={[null, null, plotData.length]}>
      <boxGeometry>
        <instancedBufferAttribute
          ref={colorsRef}
          attachObject={['attributes', 'color']}
          args={[colors, 3]}
        />
      </boxGeometry>
      <meshBasicMaterial vertexColors={true} />
    </instancedMesh>
  )
}
