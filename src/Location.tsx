import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './Location.css'
import 'aos/dist/aos.css'
import * as AOS from 'aos'
import L from 'leaflet'

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const locationCoordinates: { [key: string]: [number, number] } = {
  'Lingaraj Temple': [20.2379, 85.8337],
  'Nandankanan Zoo': [20.3974, 85.8161],
  'Dhauli Giri': [20.1894, 85.8336],
  'Udayagiri Caves': [20.2644, 85.7711],
  'Rajarani Temple': [20.2547, 85.8514],
  'Ekamra Haat': [20.2961, 85.8245],
  'Nicco Park': [20.2961, 85.8245],
  'Esplanade One Mall': [20.2961, 85.8245],
}

function Location() {
  const { location } = useParams()
  const navigate = useNavigate()
  const locationName = decodeURIComponent(location || '')
  const coordinates = locationCoordinates[locationName] || [37.7749, -122.4194]

  useEffect(() => {
    AOS.init({ duration: 800, once: false })
  }, [])

  return (
    <div className="location-page">
      <header className="location-header">
        <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>{locationName}</h1>
        <div></div>
      </header>

      <div className="location-map-section">
        <div className="location-map-container">
          <MapContainer center={coordinates} zoom={13} scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coordinates}>
              <Popup>{locationName}</Popup>
            </Marker>
          </MapContainer>
        </div>
        <button 
          onClick={() => navigate(`/map/${location}`)}
          className="journey-button"
        >
          Plan Your Journey
        </button>
      </div>

      <footer className="location-footer">
        <div className="footer-icon" onClick={() => navigate(`/map/${location}`)}>
          <span>🗺️</span>
          <span className="footer-label">Visit</span>
        </div>
        <div className="footer-icon" onClick={() => navigate(`/reviews/${location}`)}>
          <span>⭐</span>
          <span className="footer-label">Reviews</span>
        </div>
      </footer>
    </div>
  )
}

export default Location
