import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useState } from 'react'

import { RGBCeil } from './RGBCeil'
import { Cubes } from './Cubes'
import { loadImages } from './imageData'
import { fromRGBToLinearBuffer } from './utils'

function Invalidator({ deps }) {
  const three = useThree()

  useEffect(() => {
    three.invalidate()
  }, [deps, three])

  return null
}

function App() {
  const [state, setState] = useState({
    type: 'progress',
    message: 'Starting image load...',
  })
  const [selectedImage, setSelectedImage] = useState(0)
  const [showClusters, setShowClusters] = useState(false)

  useEffect(() => {
    let cancel = false

    async function loadData() {
      try {
        for await (let update of loadImages()) {
          if (cancel) break
          setState(update)

          if (update.type === 'result') {
            setSelectedImage(0)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadData()

    return () => (cancel = true)
  }, [])

  let header
  switch (state.type) {
    case 'progress':
      header = <p>{state.message}</p>
      break

    case 'result':
      header = (
        <>
          <div className="flex space-x-2 items-baseline">
            <input
              id="showClusters"
              type="checkbox"
              checked={showClusters}
              onChange={() => setShowClusters(v => !v)}
            />
            <label htmlFor="showClusters">Show clusters</label>
          </div>
          <select
            className="p-2 dark:bg-gray-700"
            value={selectedImage}
            onChange={select => setSelectedImage(select.target.value)}
          >
            {state.images.map((img, i) => (
              <option key={img.name} value={i}>
                {img.name}
              </option>
            ))}
          </select>
        </>
      )
      break

    default:
      header = null
  }

  const buffers = useMemo(() => {
    if (state.type === 'result') {
      return state.images.map(im =>
        Object.fromEntries(
          Object.entries(im.colorSchemas).map(([key, data]) => [
            key,
            fromRGBToLinearBuffer(data),
          ])
        )
      )
    }
  }, [state])

  return (
    <div className="h-full grid grid-cols-main-details">
      <div
        className="flex flex-col p-4 w-96
                   dark:bg-gray-800 dark:text-white
                   justify-center items-center space-y-8
                   shadow-2xl"
      >
        {header}
        {state.type === 'result' && (
          <img
            className="w-4/5"
            src={state.images[selectedImage].name}
            height="200"
            alt="Fire or forest"
          />
        )}
      </div>
      <Canvas
        camera={{ position: [400, 400, 400] }}
        onCreated={state => state.gl.setClearColor('black')}
        flat={true}
        frameloop="demand"
      >
        <RGBCeil />

        {state.type === 'result' && (
          <Cubes
            positions={state.images[selectedImage].positions}
            colors={buffers[selectedImage][showClusters ? 'cluster' : 'rgb']}
          />
        )}

        <Invalidator deps={[state, selectedImage]} />

        <OrbitControls target={[128, 128, 128]} />
      </Canvas>
    </div>
  )
}

export default App
