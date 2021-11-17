import { promiseRace, callWorker } from './utils'
import { sortBy } from 'lodash-es'

const Progress = message => ({ type: 'progress', message })

const LISTING_PATH = 'datasets/dataset_270k/listing.txt'
const CLUSTER_PATH = 'datasets/clusters.json'

const FILENUM_RE = /\d+\.jpg$/
const CATEGORY_RE = /\/(Bosque|Fuego|Humo)\//

export async function* loadImages() {
  yield Progress('Getting cluster data...')
  const clusters = await getClusterData()

  yield Progress('Getting image listing...')
  const listing = await getListing()

  let loadedImages = []
  const ImageProgress = () =>
    Progress(`Reading images ${loadedImages.length} / ${listing.length}`)

  yield ImageProgress()

  const imagePromises = listing.map(p =>
    getImageItemFromURL(p).then(async result => ({
      ...result,
      colorSchemas: {
        ...result.colorSchemas,
        cluster: result.colorSchemas.rgb.map(({ r, g, b }) =>
          getClusterColor(clusters?.[r]?.[g]?.[b] ?? -1)
        ),
      },
    }))
  )

  for await (const nextImage of promiseRace(imagePromises)) {
    loadedImages.push(nextImage)
    yield ImageProgress()
  }

  loadedImages = sortBy(loadedImages, [
    im => im.name.match(CATEGORY_RE),
    im => parseInt(im.name.match(FILENUM_RE)),
  ])

  yield Progress('Merging in full image...')

  const fullPixels = await getUniquePixelsFromImageData(
    loadedImages.map(img => img.imageData)
  )

  loadedImages.push({
    name: 'Full',
    imageData: null,
    positions: fullPixels.map(({ r, g, b }) => ({ x: r, y: g, z: b })),
    colorSchemas: {
      rgb: fullPixels,
      cluster: fullPixels.map(({ r, g, b }) => {
        const color = clusters[r]?.[g]?.[b] ?? -1
        return getClusterColor(color)
      }),
    },
  })

  yield { type: 'result', images: loadedImages }
}

async function getListing() {
  const req = await fetch(LISTING_PATH)
  const text = await req.text()

  return text
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

async function getImageData(url) {
  const tempCanvas = document.createElement('canvas')
  const tempImage = document.createElement('img')

  tempImage.src = url
  await new Promise((resolve, reject) => {
    tempImage.onerror = reject
    tempImage.onload = resolve
  })

  tempCanvas.width = tempImage.naturalWidth
  tempCanvas.height = tempImage.naturalHeight

  const context = tempCanvas.getContext('2d')
  context.drawImage(tempImage, 0, 0)

  return context.getImageData(
    0,
    0,
    tempImage.naturalWidth,
    tempImage.naturalHeight
  )
}

const PIXEL_DATA_WORKER = 'workers/uniquePixelsFromImageData.js'
async function getUniquePixelsFromImageData(imageData) {
  return await callWorker(PIXEL_DATA_WORKER, imageData)
}

async function getImageItemFromURL(url) {
  url = `datasets/${url}`

  const imageData = await getImageData(url)
  const rgb = await getUniquePixelsFromImageData([imageData])

  return {
    name: url,
    imageData,
    positions: rgb.map(({ r, g, b }) => ({ x: r, y: g, z: b })),
    colorSchemas: {
      rgb,
    },
  }
}

async function getClusterData() {
  const req = await fetch(CLUSTER_PATH)
  return await req.json()
}

const clusterColors = [
  { r: 240, g: 163, b: 255 },
  { r: 0, g: 117, b: 220 },
  { r: 153, g: 63, b: 0 },
  { r: 76, g: 0, b: 92 },
  { r: 25, g: 25, b: 25 },
  { r: 0, g: 92, b: 49 },
  { r: 43, g: 206, b: 72 },
  { r: 255, g: 204, b: 153 },
  { r: 128, g: 128, b: 128 },
  { r: 148, g: 255, b: 181 },
  { r: 143, g: 124, b: 0 },
  { r: 157, g: 204, b: 0 },
  { r: 194, g: 0, b: 136 },
  { r: 0, g: 51, b: 128 },
  { r: 255, g: 164, b: 5 },
  { r: 255, g: 168, b: 187 },
  { r: 66, g: 102, b: 0 },
  { r: 255, g: 0, b: 16 },
  { r: 94, g: 241, b: 242 },
  { r: 0, g: 153, b: 143 },
  { r: 224, g: 255, b: 102 },
  { r: 116, g: 10, b: 255 },
  { r: 153, g: 0, b: 0 },
  { r: 255, g: 255, b: 128 },
  { r: 255, g: 255, b: 0 },
  { r: 255, g: 80, b: 5 },
]

function getClusterColor(index) {
  if (index >= 0 && index < clusterColors.length) return clusterColors[index]

  return { r: 255, g: 255, b: 255 }
}
