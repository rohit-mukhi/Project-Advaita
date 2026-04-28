import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { startSafetyMonitor, stopSafetyMonitor } from './services/voiceBridge'
import 'leaflet/dist/leaflet.css'
import './RideTracking.css'

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

function LocationUpdater({ setCenter }: { setCenter: (pos: [number, number]) => void }) {
  const map = useMap()

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPos: [number, number] = [position.coords.latitude, position.coords.longitude]
        setCenter(newPos)
        map.setView(newPos, map.getZoom())
      },
      (error) => {
        console.error('Location tracking error:', error.code, error.message)
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [map, setCenter])

  return null
}

function RideTracking() {
  const [userLocation, setUserLocation] = useState<[number, number]>([20.3489, 85.8172])
  const [distressActive, setDistressActive] = useState(false)
  const [distressAlert, setDistressAlert] = useState(false)
  const navigate = useNavigate()
  const { location, rideType } = useParams()

  const locationName = decodeURIComponent(location || '')
  const destination = locationCoordinates[locationName] || [37.7749, -122.4194]

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        () => {
          setUserLocation([20.3489, 85.8172])
        }
      )
    }
  }, [])

  const toggleDistressDetection = async () => {
    if (!distressActive) {
      try {
        await startSafetyMonitor(() => {
          setDistressAlert(true)
          alert('🚨 DISTRESS DETECTED! Emergency contacts will be notified.')
        })
        setDistressActive(true)
        console.log('Distress detection activated')
      } catch (error) {
        console.error('Failed to start distress detection:', error)
        alert('Failed to start distress detection.\n\nPlease ensure:\n1. You have internet connection\n2. Using Chrome/Edge browser\n3. Microphone permission granted\n\nCheck console for details.')
      }
    } else {
      stopSafetyMonitor()
      setDistressActive(false)
      setDistressAlert(false)
      console.log('Distress detection deactivated')
    }
  }

  return (
    <div className="ride-tracking-container">
      <header className="tracking-header">
        <span onClick={() => navigate(`/book-ride/${location}`)} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>Ride in Progress</h1>
        <div></div>
      </header>

      <div className="tracking-map">
        <MapContainer 
          center={userLocation} 
          zoom={15} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userLocation}>
            <Popup>Your Current Location</Popup>
          </Marker>
          <Marker position={destination}>
            <Popup>{locationName}</Popup>
          </Marker>
          <LocationUpdater setCenter={setUserLocation} />
        </MapContainer>
      </div>

      <div className="tracking-info">
        <div className="ride-status">
          <h2>🚗 {rideType || 'Mini'} - On the way</h2>
          <p>Destination: {locationName}</p>
        </div>

        <div className="safety-section">
          <h3>Safety Features</h3>
          <button 
            className={`distress-btn ${distressActive ? 'active' : ''}`}
            onClick={toggleDistressDetection}
          >
            {distressActive ? '🛑 Stop Distress Detection' : '🔒 Enable Distress Detection'}
          </button>
          {distressActive && (
            <>
              <p className="safety-note">
                🎤 Voice monitoring active. Say keywords like "help" or "emergency" to trigger alert.
              </p>
              <div className="listening-indicator">
                <span className="pulse-dot"></span>
                Listening...
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                <p>Test the model manually:</p>
                <button 
                  onClick={async () => {
                    const testPhrase = prompt('Enter a phrase to test (e.g., "help me", "I am fine")');
                    if (testPhrase) {
                      const { detectDistress } = await import('./services/distressDetection');
                      const result = await detectDistress(testPhrase);
                      alert(`Phrase: "${testPhrase}"\nDistress detected: ${result}`);
                    }
                  }}
                  style={{ padding: '8px 16px', background: '#333', color: '#03DAC6', border: '1px solid #03DAC6', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Test Model Manually
                </button>
              </div>
            </>
          )}
          {distressAlert && (
            <div className="alert-banner">
              🚨 Emergency alert sent to contacts!
            </div>
          )}
        </div>

        <div className="ride-actions">
          <button className="action-btn emergency">Emergency SOS</button>
          <button className="action-btn share">Share Live Location</button>
        </div>
      </div>
    </div>
  )
}

export default RideTracking
