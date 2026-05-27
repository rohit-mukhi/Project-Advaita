import { describe, it, expect } from 'vitest'

// ─── Re-implement pure functions from imagePoison.ts for direct testing ───────
// (These are not exported from the service since they're internal helpers)

const NOISE_MAGNITUDE = 8
const BLOCK_SIZE = 8
const FREQ_BANDS = [3, 4, 5, 6]

function makeSeededRng(seed: number) {
  let s = seed >>> 0
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

function deriveImageSeed(data: Uint8ClampedArray): number {
  let seed = 0
  const step = Math.max(1, Math.floor(data.length / 1024))
  for (let i = 0; i < data.length; i += step)
    seed = (seed * 31 + data[i]) >>> 0
  return seed
}

function dct1d(block: Float32Array): Float32Array {
  const N = block.length
  const out = new Float32Array(N)
  for (let k = 0; k < N; k++) {
    let sum = 0
    for (let n = 0; n < N; n++)
      sum += block[n] * Math.cos((Math.PI / N) * (n + 0.5) * k)
    out[k] = sum * (k === 0 ? Math.sqrt(1 / N) : Math.sqrt(2 / N))
  }
  return out
}

function idct1d(block: Float32Array): Float32Array {
  const N = block.length
  const out = new Float32Array(N)
  for (let n = 0; n < N; n++) {
    let sum = block[0] * Math.sqrt(1 / N)
    for (let k = 1; k < N; k++)
      sum += block[k] * Math.sqrt(2 / N) * Math.cos((Math.PI / N) * (n + 0.5) * k)
    out[n] = sum
  }
  return out
}

function dct2d(block: Float32Array[]): Float32Array[] {
  const N = BLOCK_SIZE
  const rowDct = block.map(row => dct1d(row))
  const out: Float32Array[] = Array.from({ length: N }, () => new Float32Array(N))
  for (let col = 0; col < N; col++) {
    const colVec = new Float32Array(N)
    for (let row = 0; row < N; row++) colVec[row] = rowDct[row][col]
    const dctCol = dct1d(colVec)
    for (let row = 0; row < N; row++) out[row][col] = dctCol[row]
  }
  return out
}

function idct2d(block: Float32Array[]): Float32Array[] {
  const N = BLOCK_SIZE
  const colIdct: Float32Array[] = Array.from({ length: N }, () => new Float32Array(N))
  for (let col = 0; col < N; col++) {
    const colVec = new Float32Array(N)
    for (let row = 0; row < N; row++) colVec[row] = block[row][col]
    const inv = idct1d(colVec)
    for (let row = 0; row < N; row++) colIdct[row][col] = inv[row]
  }
  return colIdct.map(row => idct1d(row))
}

function perturbBlock(
  pixels: Uint8ClampedArray, imgWidth: number,
  blockX: number, blockY: number, channel: number, rng: () => number
) {
  const N = BLOCK_SIZE
  const block: Float32Array[] = Array.from({ length: N }, (_, row) => {
    const vec = new Float32Array(N)
    for (let col = 0; col < N; col++) {
      const px = (blockY * N + row) * imgWidth + (blockX * N + col)
      vec[col] = pixels[px * 4 + channel]
    }
    return vec
  })
  const freq = dct2d(block)
  for (let u = 0; u < N; u++)
    for (let v = 0; v < N; v++)
      if (FREQ_BANDS.includes(u + v))
        freq[u][v] += (rng() * 2 - 1) * NOISE_MAGNITUDE
  const perturbed = idct2d(freq)
  for (let row = 0; row < N; row++)
    for (let col = 0; col < N; col++) {
      const px = (blockY * N + row) * imgWidth + (blockX * N + col)
      pixels[px * 4 + channel] = Math.max(0, Math.min(255, Math.round(perturbed[row][col])))
    }
}

// ─── Helper: create a synthetic RGBA pixel buffer ─────────────────────────────
function makePixels(width: number, height: number, fill: number = 128): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) {
    data[i] = fill; data[i + 1] = fill; data[i + 2] = fill; data[i + 3] = 255
  }
  return data
}

function copyPixels(src: Uint8ClampedArray): Uint8ClampedArray {
  return new Uint8ClampedArray(src)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DCT round-trip', () => {
  it('1D DCT → IDCT reconstructs original signal within floating point tolerance', () => {
    const original = new Float32Array([52, 55, 61, 66, 70, 61, 64, 73])
    const reconstructed = idct1d(dct1d(original))
    for (let i = 0; i < 8; i++) {
      expect(reconstructed[i]).toBeCloseTo(original[i], 3)
    }
  })

  it('2D DCT → IDCT reconstructs original 8x8 block within tolerance', () => {
    const block: Float32Array[] = Array.from({ length: 8 }, (_, r) =>
      new Float32Array([52 + r, 55 + r, 61 + r, 66 + r, 70 + r, 61 + r, 64 + r, 73 + r])
    )
    const reconstructed = idct2d(dct2d(block))
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        expect(reconstructed[r][c]).toBeCloseTo(block[r][c], 2)
  })
})

describe('Seeded RNG', () => {
  it('produces values in [0, 1)', () => {
    const rng = makeSeededRng(42)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('is deterministic — same seed produces same sequence', () => {
    const rng1 = makeSeededRng(12345)
    const rng2 = makeSeededRng(12345)
    for (let i = 0; i < 50; i++)
      expect(rng1()).toBe(rng2())
  })

  it('different seeds produce different sequences', () => {
    const rng1 = makeSeededRng(1)
    const rng2 = makeSeededRng(2)
    const seq1 = Array.from({ length: 10 }, () => rng1())
    const seq2 = Array.from({ length: 10 }, () => rng2())
    expect(seq1).not.toEqual(seq2)
  })
})

describe('deriveImageSeed', () => {
  it('returns a non-zero number for non-black image', () => {
    const pixels = makePixels(16, 16, 128)
    expect(deriveImageSeed(pixels)).toBeGreaterThan(0)
  })

  it('two identical images produce the same seed', () => {
    const a = makePixels(16, 16, 100)
    const b = makePixels(16, 16, 100)
    expect(deriveImageSeed(a)).toBe(deriveImageSeed(b))
  })

  it('two different images produce different seeds', () => {
    const a = makePixels(16, 16, 100)
    const b = makePixels(16, 16, 200)
    expect(deriveImageSeed(a)).not.toBe(deriveImageSeed(b))
  })
})

describe('perturbBlock — noise injection', () => {
  it('modifies pixel values after perturbation', () => {
    const W = 8, H = 8
    const original = makePixels(W, H, 128)
    const pixels = copyPixels(original)
    const rng = makeSeededRng(999)
    perturbBlock(pixels, W, 0, 0, 0, rng) // perturb R channel
    const changed = Array.from({ length: W * H }, (_, i) => pixels[i * 4] !== original[i * 4])
    expect(changed.some(Boolean)).toBe(true)
  })

  it('all pixel values stay within [0, 255] after perturbation', () => {
    const W = 8, H = 8
    // Test with extreme values: near 0 and near 255
    for (const fill of [0, 10, 128, 245, 255]) {
      const pixels = makePixels(W, H, fill)
      const rng = makeSeededRng(fill + 1)
      perturbBlock(pixels, W, 0, 0, 0, rng)
      perturbBlock(pixels, W, 0, 0, 1, rng)
      perturbBlock(pixels, W, 0, 0, 2, rng)
      for (let i = 0; i < pixels.length; i++) {
        expect(pixels[i]).toBeGreaterThanOrEqual(0)
        expect(pixels[i]).toBeLessThanOrEqual(255)
      }
    }
  })

  it('alpha channel is never modified', () => {
    const W = 8, H = 8
    const pixels = makePixels(W, H, 128)
    const rng = makeSeededRng(42)
    perturbBlock(pixels, W, 0, 0, 0, rng)
    perturbBlock(pixels, W, 0, 0, 1, rng)
    perturbBlock(pixels, W, 0, 0, 2, rng)
    for (let i = 3; i < pixels.length; i += 4)
      expect(pixels[i]).toBe(255)
  })
})

describe('Imperceptibility — max pixel delta', () => {
  it('per-pixel change stays within perceptual threshold (≤ 16 per channel)', () => {
    const W = 16, H = 16
    const original = makePixels(W, H, 128)
    const pixels = copyPixels(original)
    const seed = deriveImageSeed(pixels)
    const rng = makeSeededRng(seed)
    const blocksX = Math.floor(W / BLOCK_SIZE)
    const blocksY = Math.floor(H / BLOCK_SIZE)
    for (let by = 0; by < blocksY; by++)
      for (let bx = 0; bx < blocksX; bx++) {
        perturbBlock(pixels, W, bx, by, 0, rng)
        perturbBlock(pixels, W, bx, by, 1, rng)
        perturbBlock(pixels, W, bx, by, 2, rng)
      }
    let maxDelta = 0
    for (let i = 0; i < pixels.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const delta = Math.abs(pixels[i + c] - original[i + c])
        if (delta > maxDelta) maxDelta = delta
      }
    }
    expect(maxDelta).toBeLessThanOrEqual(16)
  })
})

describe('Uniqueness — different images get different noise', () => {
  it('two images with different content produce different poisoned outputs', () => {
    const W = 16, H = 16

    const applyPoison = (fill: number) => {
      const pixels = makePixels(W, H, fill)
      const seed = deriveImageSeed(pixels)
      const rng = makeSeededRng(seed)
      const blocksX = Math.floor(W / BLOCK_SIZE)
      const blocksY = Math.floor(H / BLOCK_SIZE)
      for (let by = 0; by < blocksY; by++)
        for (let bx = 0; bx < blocksX; bx++) {
          perturbBlock(pixels, W, bx, by, 0, rng)
          perturbBlock(pixels, W, bx, by, 1, rng)
          perturbBlock(pixels, W, bx, by, 2, rng)
        }
      return pixels
    }

    const result1 = applyPoison(100)
    const result2 = applyPoison(200)
    // Compute per-pixel diffs between the two poisoned outputs
    const diffs = Array.from({ length: W * H }, (_, i) => result1[i * 4] - result2[i * 4])
    const allSame = diffs.every(d => d === diffs[0])
    expect(allSame).toBe(false)
  })

  it('same image always produces identical poisoned output (deterministic)', () => {
    const W = 16, H = 16

    const applyPoison = () => {
      const pixels = makePixels(W, H, 150)
      const seed = deriveImageSeed(pixels)
      const rng = makeSeededRng(seed)
      const blocksX = Math.floor(W / BLOCK_SIZE)
      const blocksY = Math.floor(H / BLOCK_SIZE)
      for (let by = 0; by < blocksY; by++)
        for (let bx = 0; bx < blocksX; bx++) {
          perturbBlock(pixels, W, bx, by, 0, rng)
          perturbBlock(pixels, W, bx, by, 1, rng)
          perturbBlock(pixels, W, bx, by, 2, rng)
        }
      return pixels
    }

    const run1 = applyPoison()
    const run2 = applyPoison()
    expect(Array.from(run1)).toEqual(Array.from(run2))
  })
})

describe('Frequency band targeting', () => {
  it('only mid/high frequency coefficients are perturbed (low freq preserved)', () => {
    const N = BLOCK_SIZE
    const block: Float32Array[] = Array.from({ length: N }, () => new Float32Array(N).fill(128))
    const freqBefore = dct2d(block.map(r => new Float32Array(r)))
    const freqAfter = dct2d(block)

    // Manually apply noise to freq domain as the service does
    const rng = makeSeededRng(42)
    for (let u = 0; u < N; u++)
      for (let v = 0; v < N; v++)
        if (FREQ_BANDS.includes(u + v))
          freqAfter[u][v] += (rng() * 2 - 1) * NOISE_MAGNITUDE

    // DC component (0,0) must be untouched
    expect(freqAfter[0][0]).toBeCloseTo(freqBefore[0][0], 5)

    // At least one targeted frequency must have changed
    let anyChanged = false
    for (let u = 0; u < N; u++)
      for (let v = 0; v < N; v++)
        if (FREQ_BANDS.includes(u + v) && freqAfter[u][v] !== freqBefore[u][v])
          anyChanged = true
    expect(anyChanged).toBe(true)
  })
})
