import * as tf from '@tensorflow/tfjs'

let model: tf.LayersModel | null = null
let vocab: { [key: string]: number } = {}

const MAX_LEN = 20
const THRESHOLD = 0.85

export const initDistressModel = async () => {
  if (model) return

  const [m, v] = await Promise.all([
    tf.loadLayersModel('/model/model.json'),
    fetch('/model/vocab.json').then(res => res.json())
  ])

  model = m
  vocab = v
}

export const detectDistress = async (text: string): Promise<boolean> => {
  if (!model) await initDistressModel()

  const tokens = text
    .toLowerCase()
    .split(/\s+/)
    .map(w => vocab[w] || vocab['<OOV>'] || 0)

  const padded = new Float32Array(MAX_LEN)
  tokens.slice(0, MAX_LEN).forEach((t, i) => padded[i] = t)

  const input = tf.tensor2d([Array.from(padded)], [1, MAX_LEN])
  const prediction = model!.predict(input) as tf.Tensor
  const [score] = await prediction.data()

  tf.dispose([input, prediction])

  return score > THRESHOLD
}