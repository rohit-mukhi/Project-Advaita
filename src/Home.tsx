import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import 'aos/dist/aos.css'
import * as AOS from 'aos'
import { Squeeze as Hamburger } from 'hamburger-react'
import { supabase } from './lib/supabase'

type Post = {
  id: string
  user_name: string
  user_avatar_url: string | null
  image_url: string
  caption: string
  location: string
  likes: number
}

function Home() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<Post[]>([])
  const [loadedImages, setLoadedImages] = useState<{ [key: string]: boolean }>({})
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    AOS.init({ duration: 800, once: false })
  }, [])

  useEffect(() => {
    const today = new Date()
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()

    const seededRandom = (s: number) => {
      let t = s + 0x6D2B79F5
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    const shuffle = <T,>(arr: T[], s: number): T[] => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(s + i) * (i + 1));[a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }

    supabase
      .from('posts_with_user')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) setPosts(shuffle(data, seed))
      })
  }, [])

  const handleImageLoad = (postId: string) => {
    setLoadedImages(prev => ({ ...prev, [postId]: true }))
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Sueno</h1>
        <div className="header-icons">
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
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff', cursor: 'pointer' }} onClick={() => { setMenuOpen(false); navigate('/profile') }}>Profile</div>
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff' }}>Settings</div>
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff' }}>Saved Posts</div>
          <div className="menu-item" style={{ padding: '15px 20px', color: '#fff', cursor: 'pointer' }} onClick={async () => {
            await supabase.auth.signOut()
            navigate('/auth')
          }}>Logout</div>
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
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#555' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
            <p style={{ fontSize: '16px' }}>No posts yet. Be the first to share!</p>
          </div>
        )}
        {posts.map((post, index) => (
          <div key={post.id} className="post" data-aos="fade-up" data-aos-delay={index * 100}>
            <div className="post-header">
              <div className="post-user">
                {post.user_avatar_url
                  ? <img src={post.user_avatar_url} alt="avatar" className="post-avatar" style={{ borderRadius: '50%', width: '36px', height: '36px', objectFit: 'cover' }} />
                  : <div className="post-avatar" style={{ background: '#BB86FC' }}></div>
                }
                <div className="user-info">
                  <span className="user-name">{post.user_name}</span>
                  {post.location && (
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
                  )}
                </div>
              </div>
              <span className="post-menu">⋯</span>
            </div>
            <div className="post-image-container">
              {!loadedImages[post.id] && <div className="image-loader"></div>}
              <img
                src={post.image_url}
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
              <strong>{post.user_name}</strong> {post.caption}
            </div>
          </div>
        ))}
      </div>

      <nav className="bottom-nav">
        <span onClick={() => navigate('/home')}>🏠</span>
        <span onClick={() => navigate('/explore')}>🔍</span>
        <span onClick={() => navigate('/create')}>➕</span>
        <span>🎬</span>
        <span onClick={() => navigate('/profile')}>👤</span>
      </nav>
    </div>
  )
}

export default Home
