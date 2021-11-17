onmessage = async event => {
  const imageData = event.data
  const pixels = new Map()

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const base = 4 * (y * imageData.width + x)

      const r = imageData.data[base + 0]
      const g = imageData.data[base + 1]
      const b = imageData.data[base + 2]

      if (!pixels.has(r)) {
        pixels.set(r, new Map())
      }

      if (!pixels.get(r).has(g)) {
        pixels.get(r).set(g, new Map())
      }

      pixels.get(r).get(g).set(b, true)
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

  postMessage(uniquePixels)
}
