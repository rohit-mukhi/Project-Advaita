import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './Home.css'
import 'aos/dist/aos.css'
import * as AOS from 'aos'

function Location() {
  const { location } = useParams()
  const navigate = useNavigate()
  
  const allPosts = [
    { id: 1, user: 'Sarah Johnson', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=1', likes: 234, caption: 'Beautiful sunset today! 🌅', location: 'Malibu Beach, CA' },
    { id: 2, user: 'Emma Davis', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=2', likes: 189, caption: 'Coffee and good vibes ☕', location: 'Brooklyn, NY' },
    { id: 3, user: 'Lisa Chen', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=3', likes: 456, caption: 'Weekend adventures 🏔️', location: 'Yosemite National Park' },
    { id: 4, user: 'Maya Patel', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=4', likes: 312, caption: 'Living my best life 💫', location: 'Miami, FL' },
    { id: 5, user: 'Anna Williams', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=5', likes: 567, caption: 'Nature therapy 🌿', location: 'Portland, OR' },
    { id: 6, user: 'Sophie Martin', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=6', likes: 423, caption: 'Good times with friends 🎉', location: 'Austin, TX' },
    { id: 7, user: 'Rachel Green', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=7', likes: 289, caption: 'Exploring new places 🗺️', location: 'Seattle, WA' },
    { id: 8, user: 'Jessica Lee', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=8', likes: 501, caption: 'Peaceful moments 🧘♀️', location: 'San Francisco, CA' },
  ]

  const filteredPosts = allPosts.filter(post => post.location === decodeURIComponent(location || ''))
  const [loadedImages, setLoadedImages] = useState<{[key: number]: boolean}>({})

  useEffect(() => {
    AOS.init({ duration: 800, once: false })
  }, [])

  const handleImageLoad = (postId: number) => {
    setLoadedImages(prev => ({ ...prev, [postId]: true }))
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>{decodeURIComponent(location || '')}</h1>
        <div></div>
      </header>

      <div className="feed">
        {filteredPosts.map((post, index) => (
          <div key={post.id} className="post" data-aos="fade-up" data-aos-delay={index * 100}>
            <div className="post-header">
              <div className="post-user">
                <div className="post-avatar" style={{ background: post.avatar }}></div>
                <div className="user-info">
                  <span className="user-name">{post.user}</span>
                  <span className="post-location">{post.location}</span>
                </div>
              </div>
              <span className="post-menu">⋯</span>
            </div>
            <div className="post-image-container">
              {!loadedImages[post.id] && <div className="image-loader"></div>}
              <img 
                src={post.image} 
                alt="post" 
                className={`post-image ${loadedImages[post.id] ? 'loaded' : ''}`}
                onLoad={() => handleImageLoad(post.id)}
              />
            </div>
            <div className="post-actions">
              <div className="action-left">
                <span>❤️</span>
                <span>💬</span>
                <span>📤</span>
              </div>
              <span>🔖</span>
            </div>
            <div className="post-likes">{post.likes} likes</div>
            <div className="post-caption">
              <strong>{post.user}</strong> {post.caption}
            </div>
          </div>
        ))}
      </div>

      <footer className="location-footer">
        <div className="footer-icon" onClick={() => navigate(`/map/${location}`)}>
          <span>🗺️</span>
          <span className="footer-label">Visit</span>
        </div>
        <div className="footer-icon">
          <span>⭐</span>
          <span className="footer-label">Reviews</span>
        </div>
      </footer>
    </div>
  )
}

export default Location
