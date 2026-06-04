import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { injectAdversarialNoise } from './services/imagePoison'
import { cloakFace, pingSpace } from './services/fawkesClient'
import './CreatePost.css'

function CreatePost() {
  const navigate = useNavigate()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [uploading, setUploading] = useState(false)
  const [stage, setStage] = useState<'idle' | 'cloaking' | 'poisoning' | 'uploading'>('idle')

  // Wake the HF Space as soon as user opens this page
  useEffect(() => { pingSpace() }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const fileArray = Array.from(files)
    setSelectedFiles(fileArray)
    setPreviewUrls(fileArray.map(f => URL.createObjectURL(f)))
  }

  const handleShare = async () => {
    if (selectedFiles.length === 0) return
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Stage 1: Fawkes face cloaking (ArcFace embedding attack) + invisible watermark
      setStage('cloaking')
      const { file: cloakedFile, cloaked } = await cloakFace(selectedFiles[0], user.id)
      if (!cloaked) console.warn('No face detected — skipping Fawkes, applying DCT only')

      // Stage 2: DCT adversarial noise on top of cloaked image
      setStage('poisoning')
      const poisonedFile = await injectAdversarialNoise(cloakedFile)

      // Stage 3: Upload
      setStage('uploading')
      const path = `${user.id}/${Date.now()}.png`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(path, poisonedFile)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(path)

      const { error: insertError } = await supabase
        .from('posts')
        .insert({ user_id: user.id, image_url: publicUrl, caption, location })
      if (insertError) throw insertError

      navigate('/home')
    } catch (err: any) {
      console.error(err)
      const msg = err?.name === 'AbortError'
        ? 'Cloaking timed out (3 min). Try a smaller image or check if the Space is running.'
        : err?.message ?? JSON.stringify(err)
      alert(`Failed to share post:\n${msg}`)
    } finally {
      setUploading(false)
      setStage('idle')
    }
  }

  return (
    <div className="create-post-container">
      <header className="create-post-header">
        <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '24px' }}>✕</span>
        <h2>New Post</h2>
        <button className="share-btn" onClick={handleShare} disabled={uploading || selectedFiles.length === 0}>
          {stage === 'cloaking' ? '🧬 Cloaking face...' : stage === 'poisoning' ? '🛡️ Injecting noise...' : stage === 'uploading' ? '☁️ Uploading...' : 'Share'}
        </button>
      </header>

      <div className="create-post-content">
        {previewUrls.length === 0 ? (
          <div className="upload-section">
            <div className="upload-icon">📷</div>
            <h3>Select photos to share</h3>
            <label htmlFor="file-upload" className="upload-btn">
              Select from device
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <>
            <div className="image-preview">
              <img src={previewUrls[currentImageIndex]} alt="Selected" />
              {previewUrls.length > 1 && (
                <>
                  <button className="nav-arrow left" onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : previewUrls.length - 1)}>‹</button>
                  <button className="nav-arrow right" onClick={() => setCurrentImageIndex(prev => prev < previewUrls.length - 1 ? prev + 1 : 0)}>›</button>
                  <div className="image-counter">{currentImageIndex + 1}/{previewUrls.length}</div>
                </>
              )}
            </div>
            <div className="post-details">
              <div className="detail-row">
                <div className="user-avatar" style={{ background: '#BB86FC' }}></div>
                <textarea
                  placeholder="Write a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="caption-input"
                />
              </div>
              <div className="detail-row">
                <input
                  type="text"
                  placeholder="Add location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="location-input"
                />
                <span className="location-icon">📍</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CreatePost
