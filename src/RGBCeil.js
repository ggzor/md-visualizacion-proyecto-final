import { Cubes } from './Cubes'
import { fromRGBToLinearBuffer } from './utils'

function* generateRGBCeil() {
  for (let r = 0; r < 256; r++) {
    for (let g = 0; g < 256; g++) {
      for (let b = 0; b < 256; b++) {
        if ([r, g, b].filter(x => x === 0 || x === 255).length >= 2)
          yield { r, g, b, x: r, y: g, z: b }
      }
    }
  }
}

const [positions, colors] = (() => {
  const rgbCeil = [...generateRGBCeil()]

  return [
    rgbCeil.map(({ r: x, g: y, b: z }) => ({
      x,
      y,
      z,
    })),
    fromRGBToLinearBuffer(rgbCeil),
  ]
})()

export function RGBCeil() {
  return <Cubes positions={positions} colors={colors} />
}
