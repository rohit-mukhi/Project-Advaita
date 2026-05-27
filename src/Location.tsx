import { useState, useEffect } from 'react'
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

function Location() {
  const { location } = useParams()
  const navigate = useNavigate()
  const locationName = decodeURIComponent(location || '')
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    AOS.init({ duration: 800, once: false })
  }, [])

  useEffect(() => {
    if (!locationName) return
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setCoordinates([parseFloat(data[0].lat), parseFloat(data[0].lon)])
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
  }, [locationName])

  return (
    <div className="location-page">
      <header className="location-header">
        <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>{locationName}</h1>
        <div></div>
      </header>

      <div className="location-map-section">
        <div className="location-map-container">
          {notFound ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>📍</span>
              <p>Location not found</p>
            </div>
          ) : !coordinates ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
              <p>Loading map...</p>
            </div>
          ) : (
            <MapContainer center={coordinates} zoom={13} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={coordinates}>
                <Popup>{locationName}</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
        <button
          onClick={() => navigate(`/map/${location}`)}
          className="journey-button"
          disabled={!coordinates}
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
