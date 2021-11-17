onmessage = async event => {
  const imageData = event.data
  const pixels = new Map()

  for (let image of imageData) {
    for (let { r, g, b } of image.pixels) {
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
