// Adversarial frequency-domain noise injection
// Targets mid/high frequency bands used by deepfake encoders
// Noise is imperceptible (~8/255 per channel) but structured to corrupt feature maps

const NOISE_MAGNITUDE = 8       // max per-channel perturbation (0-255)
const BLOCK_SIZE = 8            // DCT-like block size (matches JPEG/encoder block grid)
const FREQ_BANDS = [3, 4, 5, 6] // mid-high frequency indices within each block to perturb

// Seeded PRNG from image content — every image gets a unique noise signature
function makeSeededRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

// Derive a seed from the image's own pixel statistics
function deriveImageSeed(data: Uint8ClampedArray): number {
  let seed = 0
  const step = Math.max(1, Math.floor(data.length / 1024))
  for (let i = 0; i < data.length; i += step) {
    seed = (seed * 31 + data[i]) >>> 0
  }
  return seed
}

// 1D DCT-II of length N (in-place on a Float32Array slice)
function dct1d(block: Float32Array): Float32Array {
  const N = block.length
  const out = new Float32Array(N)
  for (let k = 0; k < N; k++) {
    let sum = 0
    for (let n = 0; n < N; n++) {
      sum += block[n] * Math.cos((Math.PI / N) * (n + 0.5) * k)
    }
    out[k] = sum * (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N))
  }
  return out
}

// 1D IDCT-II
function idct1d(block: Float32Array): Float32Array {
  const N = block.length
  const out = new Float32Array(N)
  for (let n = 0; n < N; n++) {
    let sum = block[0] * Math.sqrt(1 / N)
    for (let k = 1; k < N; k++) {
      sum += block[k] * Math.sqrt(2 / N) * Math.cos((Math.PI / N) * (n + 0.5) * k)
    }
    out[n] = sum
  }
  return out
}

// 2D DCT on an 8x8 block (row then column)
function dct2d(block: Float32Array[]): Float32Array[] {
  const N = BLOCK_SIZE
  // DCT rows
  const rowDct = block.map(row => dct1d(row))
  // DCT columns
  const out: Float32Array[] = Array.from({ length: N }, () => new Float32Array(N))
  for (let col = 0; col < N; col++) {
    const colVec = new Float32Array(N)
    for (let row = 0; row < N; row++) colVec[row] = rowDct[row][col]
    const dctCol = dct1d(colVec)
    for (let row = 0; row < N; row++) out[row][col] = dctCol[row]
  }
  return out
}

// 2D IDCT on an 8x8 block
function idct2d(block: Float32Array[]): Float32Array[] {
  const N = BLOCK_SIZE
  // IDCT columns
  const colIdct: Float32Array[] = Array.from({ length: N }, () => new Float32Array(N))
  for (let col = 0; col < N; col++) {
    const colVec = new Float32Array(N)
    for (let row = 0; row < N; row++) colVec[row] = block[row][col]
    const inv = idct1d(colVec)
    for (let row = 0; row < N; row++) colIdct[row][col] = inv[row]
  }
  // IDCT rows
  return colIdct.map(row => idct1d(row))
}

// Perturb mid/high frequency coefficients in a single 8x8 block for one channel
function perturbBlock(
  pixels: Uint8ClampedArray,
  imgWidth: number,
  blockX: number,
  blockY: number,
  channel: number, // 0=R, 1=G, 2=B
  rng: () => number
) {
  const N = BLOCK_SIZE

  // Extract block pixels for this channel
  const block: Float32Array[] = Array.from({ length: N }, (_, row) => {
    const vec = new Float32Array(N)
    for (let col = 0; col < N; col++) {
      const px = (blockY * N + row) * imgWidth + (blockX * N + col)
      vec[col] = pixels[px * 4 + channel]
    }
    return vec
  })

  // Forward DCT
  const freq = dct2d(block)

  // Inject noise at targeted frequency bands
  // FREQ_BANDS defines which diagonal indices (u+v) to perturb
  for (let u = 0; u < N; u++) {
    for (let v = 0; v < N; v++) {
      if (FREQ_BANDS.includes(u + v)) {
        const noise = (rng() * 2 - 1) * NOISE_MAGNITUDE
        freq[u][v] += noise
      }
    }
  }

  // Inverse DCT back to spatial domain
  const perturbed = idct2d(freq)

  // Write back clamped values
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      const px = (blockY * N + row) * imgWidth + (blockX * N + col)
      pixels[px * 4 + channel] = Math.max(0, Math.min(255, Math.round(perturbed[row][col])))
    }
  }
}

export async function injectAdversarialNoise(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const pixels = imageData.data

        // Derive unique seed from this image's content
        const seed = deriveImageSeed(pixels)
        const rng = makeSeededRng(seed)

        const blocksX = Math.floor(canvas.width / BLOCK_SIZE)
        const blocksY = Math.floor(canvas.height / BLOCK_SIZE)

        // Perturb each 8x8 block across R, G, B channels
        for (let by = 0; by < blocksY; by++) {
          for (let bx = 0; bx < blocksX; bx++) {
            perturbBlock(pixels, canvas.width, bx, by, 0, rng) // R
            perturbBlock(pixels, canvas.width, bx, by, 1, rng) // G
            perturbBlock(pixels, canvas.width, bx, by, 2, rng) // B
          }
        }

        ctx.putImageData(imageData, 0, 0)

        canvas.toBlob(blob => {
          if (!blob) return reject(new Error('Canvas toBlob failed'))
          resolve(new File([blob], file.name, { type: 'image/png' }))
        }, 'image/png') // PNG to avoid JPEG re-compression washing out the noise
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = reject
    img.src = url
  })
}
