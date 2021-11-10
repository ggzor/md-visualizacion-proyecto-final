import { OrbitControls, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, Object3D } from 'three'

function* rgbCeiling() {
  for (let r = 0; r < 256; r++) {
    for (let g = 0; g < 256; g++) {
      for (let b = 0; b < 256; b++) {
        if ([r, g, b].filter(x => x === 0 || x === 255).length >= 2)
          yield { r, g, b }
      }
    }
  }
}

const temp = new Object3D()
const tempColor = new Color()

function BunchOfCubes({ cubes }) {
  const mesh = useRef()

  const colors = useMemo(
    () =>
      new Float32Array(
        cubes.flatMap(c =>
          tempColor
            .set(`rgb(${c.r}, ${c.g}, ${c.b})`)
            .convertSRGBToLinear()
            .toArray()
        )
      ),
    [cubes]
  )

  useEffect(() => {
    cubes.forEach(({ r, g, b }, i) => {
      temp.position.set(r, g, b)
      temp.updateMatrix()
      mesh.current.setMatrixAt(i, temp.matrix)
    })

    mesh.current.instanceMatrix.needsUpdate = true
  }, [cubes])

  return (
    <instancedMesh ref={mesh} args={[null, null, cubes.length]}>
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

const cubes = [...rgbCeiling()]

function App() {
  return (
    <Canvas
      camera={{ position: [400, 400, 400] }}
      onCreated={state => state.gl.setClearColor('black')}
      flat={true}
      frameloop="demand"
    >
      <BunchOfCubes cubes={cubes} />
      <OrbitControls target={[128, 128, 128]} />
      <Stats />
    </Canvas>
  )
}

export default App
