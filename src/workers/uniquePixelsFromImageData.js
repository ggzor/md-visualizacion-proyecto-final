onmessage = ({ data: imageData }) => {
  const pixels = new Map()

  for (let image of imageData) {
    for (let y = 0; y < image.height; y++) {
      for (let x = 0; x < image.width; x++) {
        const base = 4 * (y * image.width + x)

        const r = image.data[base + 0]
        const g = image.data[base + 1]
        const b = image.data[base + 2]

        if (!pixels.has(r)) {
          pixels.set(r, new Map())
        }

        if (!pixels.get(r).has(g)) {
          pixels.get(r).set(g, new Map())
        }

        pixels.get(r).get(g).set(b, true)
      }
    }
  }

  const uniquePixels = []

  pixels.forEach((rmap, r) =>
    rmap.forEach((gmap, g) =>
      gmap.forEach((_, b) => {
        uniquePixels.push({ r, g, b })
      })
    )
  )

  uniquePixels.sort((p1, p2) => {
    if (p1.r === p2.r) {
      if (p1.g === p2.g) {
        return p1.b - p2.b
      } else {
        return p1.g - p2.g
      }
    } else {
      return p1.r - p2.r
    }
  })

  postMessage(uniquePixels)
}
