import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Explore.css'

function Explore() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const exploreImages = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    image: `https://picsum.photos/400/400?random=${i + 10}`,
    likes: Math.floor(Math.random() * 1000) + 100
  }))

  return (
    <div className="explore-container">
      <header className="explore-header">
        <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '24px', marginRight: '10px' }}>←</span>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="explore-grid">
        {exploreImages.map((item) => (
          <div key={item.id} className="explore-item">
            <img src={item.image} alt="explore" />
            <div className="explore-overlay">
              <span>❤️ {item.likes}</span>
            </div>
          </div>
        ))}
      </div>

      <nav className="bottom-nav">
        <span onClick={() => navigate('/home')}>🏠</span>
        <span className="active">🔍</span>
        <span onClick={() => navigate('/create')}>➕</span>
        <span>🎬</span>
        <span>👤</span>
      </nav>
    </div>
  )
}

export default Explore
