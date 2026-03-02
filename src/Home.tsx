import { useState } from 'react'
import './Home.css'

function Home() {
  const [posts] = useState([
    { id: 1, user: 'Sarah Johnson', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=1', likes: 234, caption: 'Beautiful sunset today! 🌅' },
    { id: 2, user: 'Emma Davis', avatar: '#3700B3', image: 'https://picsum.photos/400/400?random=2', likes: 189, caption: 'Coffee and good vibes ☕' },
    { id: 3, user: 'Lisa Chen', avatar: '#BB86FC', image: 'https://picsum.photos/400/400?random=3', likes: 456, caption: 'Weekend adventures 🏔️' },
  ])

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Aroha</h1>
        <div className="header-icons">
          <span>➕</span>
          <span>❤️</span>
          <span>💬</span>
        </div>
      </header>

      <div className="stories-section">
        {['Your Story', 'Sarah', 'Emma', 'Lisa', 'Maya', 'Anna'].map((name, i) => (
          <div key={i} className="story">
            <div className="story-avatar" style={{ background: i % 2 === 0 ? '#BB86FC' : '#3700B3' }}></div>
            <span>{name}</span>
          </div>
        ))}
      </div>

      <div className="feed">
        {posts.map(post => (
          <div key={post.id} className="post">
            <div className="post-header">
              <div className="post-user">
                <div className="post-avatar" style={{ background: post.avatar }}></div>
                <span>{post.user}</span>
              </div>
              <span className="post-menu">⋯</span>
            </div>
            <img src={post.image} alt="post" className="post-image" />
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
        <span>🏠</span>
        <span>🔍</span>
        <span>➕</span>
        <span>🎬</span>
        <span>👤</span>
      </nav>
    </div>
  )
}

export default Home
