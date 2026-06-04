const HF_SPACE_URL = import.meta.env.VITE_FAWKES_URL as string
const TIMEOUT_MS = 3 * 60 * 1000 // 3 minutes

function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer))
}

// Returns cloaked file, or original if no face detected (422) or Space unreachable
export async function cloakFace(file: File): Promise<{ file: File; cloaked: boolean }> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetchWithTimeout(`${HF_SPACE_URL}/cloak`, {
    method: 'POST',
    body: formData,
  })

  // 422 = no face detected — return original, still apply DCT layer
  if (res.status === 422) {
    return { file, cloaked: false }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? 'Fawkes cloaking failed')
  }

  const blob = await res.blob()
  return {
    file: new File([blob], file.name, { type: 'image/png' }),
    cloaked: true,
  }
}

export async function pingSpace(): Promise<void> {
  await fetch(`${HF_SPACE_URL}/ping`).catch(() => {})
}
