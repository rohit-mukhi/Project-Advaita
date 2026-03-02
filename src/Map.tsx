import { useParams, useNavigate } from 'react-router-dom'
import './Home.css'
import './Map.css'

function Map() {
  const { location } = useParams()
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <header className="home-header">
        <span onClick={() => navigate(`/location/${location}`)} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>{decodeURIComponent(location || '')}</h1>
        <div></div>
      </header>

      <div className="map-container">
        <div className="map-placeholder">
          <div className="map-pin">📍</div>
          <p className="map-location-text">{decodeURIComponent(location || '')}</p>
        </div>
      </div>

      <div className="button-container">
        <button className="plan-journey-btn">Plan Your Journey</button>
      </div>
    </div>
  )
}

export default Map
