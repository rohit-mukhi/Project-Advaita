import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import 'aos/dist/aos.css'
import * as AOS from 'aos'
import { Squeeze as Hamburger } from 'hamburger-react'

function Home() {
  const navigate = useNavigate()
  const [posts] = useState([
    { id: 1, user: 'Sarah Johnson', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=1', likes: 234, caption: 'Beautiful sunset today! 🌅', location: 'Malibu Beach, CA' },
    { id: 2, user: 'Emma Davis', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=2', likes: 189, caption: 'Coffee and good vibes ☕', location: 'Brooklyn, NY' },
    { id: 3, user: 'Lisa Chen', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=3', likes: 456, caption: 'Weekend adventures 🏔️', location: 'Yosemite National Park' },
    { id: 4, user: 'Maya Patel', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=4', likes: 312, caption: 'Living my best life 💫', location: 'Miami, FL' },
    { id: 5, user: 'Anna Williams', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=5', likes: 567, caption: 'Nature therapy 🌿', location: 'Portland, OR' },
    { id: 6, user: 'Sophie Martin', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=6', likes: 423, caption: 'Good times with friends 🎉', location: 'Austin, TX' },
    { id: 7, user: 'Rachel Green', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=7', likes: 289, caption: 'Exploring new places 🗺️', location: 'Seattle, WA' },
    { id: 8, user: 'Jessica Lee', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=8', likes: 501, caption: 'Peaceful moments 🧘‍♀️', location: 'San Francisco, CA' },
  ])

  const [loadedImages, setLoadedImages] = useState<{[key: number]: boolean}>({})
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    AOS.init({ duration: 800, once: false })
  }, [])

  const handleImageLoad = (postId: number) => {
    setLoadedImages(prev => ({ ...prev, [postId]: true }))
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Aroha</h1>
        <div className="header-icons">
          <span>➕</span>
          <span>❤️</span>
          <div className="hamburger-wrapper">
            <Hamburger toggled={menuOpen} toggle={setMenuOpen} size={24} color="#BB86FC" />
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="dropdown-menu" style={{ 
          position: 'fixed', 
          top: '60px', 
          right: '20px', 
          background: '#1a1a1a',
          border: '1px solid #262626',
          borderRadius: '8px',
          zIndex: 9999,
          minWidth: '180px',
          display: 'block'
        }}>
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff' }}>Profile</div>
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff' }}>Settings</div>
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff' }}>Saved Posts</div>
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff' }}>Logout</div>
        </div>
      )}

      <div className="stories-section">
        {['Your Story', 'Sarah', 'Emma', 'Lisa', 'Maya', 'Anna'].map((name, i) => (
          <div key={i} className="story">
            <div className="story-avatar" style={{ background: i % 2 === 0 ? '#BB86FC' : '#3700B3' }}></div>
            <span>{name}</span>
          </div>
        ))}
      </div>

      <div className="feed">
        {posts.map((post, index) => (
          <div key={post.id} className="post" data-aos="fade-up" data-aos-delay={index * 100}>
            <div className="post-header">
              <div className="post-user">
                <div className="post-avatar" style={{ background: post.avatar }}></div>
                <div className="user-info">
                  <span className="user-name">{post.user}</span>
                  <a 
                    href="#" 
                    className="post-location" 
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(`/location/${encodeURIComponent(post.location)}`)
                    }}
                  >
                    {post.location}
                  </a>
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

      <nav className="bottom-nav">
        <span onClick={() => navigate('/home')}>🏠</span>
        <span onClick={() => navigate('/explore')}>🔍</span>
        <span onClick={() => navigate('/create')}>➕</span>
        <span>🎬</span>
        <span>👤</span>
      </nav>
    </div>
  )
}

export default Home
