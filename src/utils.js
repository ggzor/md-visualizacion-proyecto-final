import { Color } from 'three'

export const toLinearConverter = () => {
  const tempColor = new Color()

  return ({ r, g, b }) => {
    tempColor.set(`rgb(${r}, ${g}, ${b})`)
    return tempColor.convertSRGBToLinear().toArray()
  }
}

export function fromRGBToLinearBuffer(rgbArray) {
  const converter = toLinearConverter()

  return new Float32Array(rgbArray.flatMap(color => converter(color)))
}

export async function* promiseRace(promises) {
  while (promises.length > 0) {
    const [result] = await Promise.race(promises.map(p => p.then(_ => [p])))

    promises.splice(promises.indexOf(result), 1)

    yield await result
  }
}

export function callWorker(workerUrl, params) {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(workerUrl)
      worker.onerror = reject
      worker.onmessage = event => {
        worker.terminate()
        resolve(event.data)
      }
      worker.postMessage(params)
    } catch (err) {
      reject(err)
    }
  })
}
