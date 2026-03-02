import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CreatePost.css'

function CreatePost() {
  const navigate = useNavigate()
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      fileArray.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  return (
    <div className="create-post-container">
      <header className="create-post-header">
        <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '24px' }}>✕</span>
        <h2>New Post</h2>
        <button className="share-btn" onClick={() => navigate('/home')}>Share</button>
      </header>

      <div className="create-post-content">
        {selectedImages.length === 0 ? (
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
              <img src={selectedImages[currentImageIndex]} alt="Selected" />
              {selectedImages.length > 1 && (
                <>
                  <button className="nav-arrow left" onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : selectedImages.length - 1)}>‹</button>
                  <button className="nav-arrow right" onClick={() => setCurrentImageIndex(prev => prev < selectedImages.length - 1 ? prev + 1 : 0)}>›</button>
                  <div className="image-counter">{currentImageIndex + 1}/{selectedImages.length}</div>
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
