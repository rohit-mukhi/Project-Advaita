import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import './Profile.css'

type Post = {
  id: string
  image_url: string
  caption: string
  location: string
  likes: number
  created_at: string
}

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) setPosts(data)
          })
      }
    })
  }, [])

  const name = user?.user_metadata?.full_name ?? 'Anonymous'
  const avatar = user?.user_metadata?.avatar_url ?? null
  const email = user?.email ?? ''
  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="profile-container">
      <header className="profile-header">
        <span onClick={() => navigate('/home')} className="profile-back">←</span>
        <h1>Profile</h1>
        <div></div>
      </header>

      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          {avatar
            ? <img src={avatar} alt="avatar" className="profile-avatar-img" />
            : <div className="profile-avatar-placeholder">{name.charAt(0)}</div>
          }
        </div>
        <h2 className="profile-name">{name}</h2>
        <p className="profile-email">{email}</p>
        <p className="profile-joined">Member since {joinedDate}</p>

        <div className="profile-stats">
          <div className="stat">
            <span className="stat-value">{posts.length}</span>
            <span className="stat-label">Posts</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">{posts.reduce((sum, p) => sum + p.likes, 0)}</span>
            <span className="stat-label">Likes</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value">{new Set(posts.map(p => p.location).filter(Boolean)).size}</span>
            <span className="stat-label">Places</span>
          </div>
        </div>
      </div>

      <div className="profile-section-title">My Posts</div>

      {posts.length === 0 ? (
        <div className="profile-empty">
          <span>📷</span>
          <p>No posts yet</p>
          <button onClick={() => navigate('/create')} className="profile-create-btn">Create your first post</button>
        </div>
      ) : (
        <div className="profile-grid">
          {posts.map(post => (
            <div key={post.id} className="profile-grid-item" onClick={() => setSelectedPost(post)}>
              <img src={post.image_url} alt="post" />
              <div className="profile-grid-overlay">
                <span>❤️ {post.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPost && (
        <div className="profile-modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="profile-modal" onClick={e => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setSelectedPost(null)}>✕</button>
            <img src={selectedPost.image_url} alt="post" className="profile-modal-img" />
            <div className="profile-modal-info">
              {selectedPost.caption && <p className="profile-modal-caption">{selectedPost.caption}</p>}
              {selectedPost.location && (
                <p
                  className="profile-modal-location"
                  onClick={() => {
                    setSelectedPost(null)
                    navigate(`/location/${encodeURIComponent(selectedPost.location)}`)
                  }}
                >
                  📍 {selectedPost.location}
                </p>
              )}
              <p className="profile-modal-date">
                {new Date(selectedPost.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <span onClick={() => navigate('/home')}>🏠</span>
        <span onClick={() => navigate('/explore')}>🔍</span>
        <span onClick={() => navigate('/create')}>➕</span>
        <span>🎬</span>
        <span className="active">👤</span>
      </nav>
    </div>
  )
}

export default Profile
