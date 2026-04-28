import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'
import './BookRide.css'

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

function RoutingMachine({ userLocation, destination }: { userLocation: [number, number], destination: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    let routingControl: any = null

    try {
      routingControl = (L as any).Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(destination[0], destination[1])
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        lineOptions: {
          styles: [
            { color: '#BB86FC', opacity: 0.9, weight: 6 }
          ]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        router: (L as any).Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        })
      }).addTo(map)
    } catch (error) {
      console.error('Routing error:', error)
    }

    return () => {
      if (routingControl && map) {
        try {
          map.removeControl(routingControl)
        } catch (error) {
          console.error('Error removing routing control:', error)
        }
      }
    }
  }, [map, userLocation, destination])

  return null
}

function BookRide() {
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number]>([20.3489, 85.8172])
  const navigate = useNavigate()
  const { location } = useParams()

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

    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="book-ride-container">
        <div className="loading-content">
          <div className="spinner"></div>
          <h2>Finding cabs for you...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="book-ride-container">
      <header className="ride-header">
        <span onClick={() => navigate(`/map/${location}`)} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>Available Rides</h1>
        <div></div>
      </header>

      <div className="route-map">
        <MapContainer 
          center={userLocation} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userLocation}>
            <Popup>Your Location</Popup>
          </Marker>
          <Marker position={destination}>
            <Popup>{locationName}</Popup>
          </Marker>
          <RoutingMachine userLocation={userLocation} destination={destination} />
        </MapContainer>
      </div>

      <div className="ride-details">
        <div className="ride-card">
          <div className="ride-info">
            <div className="ride-type">
              <span className="car-icon">🚗</span>
              <div>
                <h3>Mini</h3>
                <p>2 mins away</p>
              </div>
            </div>
            <div className="ride-price">
              <h3>₹120</h3>
              <p>4 seats</p>
            </div>
          </div>
          <button className="select-ride-btn" onClick={() => navigate(`/ride-tracking/${location}/Mini`)}>Select Mini</button>
        </div>

        <div className="ride-card">
          <div className="ride-info">
            <div className="ride-type">
              <span className="car-icon">🚙</span>
              <div>
                <h3>Sedan</h3>
                <p>5 mins away</p>
              </div>
            </div>
            <div className="ride-price">
              <h3>₹180</h3>
              <p>4 seats</p>
            </div>
          </div>
          <button className="select-ride-btn" onClick={() => navigate(`/ride-tracking/${location}/Sedan`)}>Select Sedan</button>
        </div>

        <div className="ride-card">
          <div className="ride-info">
            <div className="ride-type">
              <span className="car-icon">🚐</span>
              <div>
                <h3>SUV</h3>
                <p>8 mins away</p>
              </div>
            </div>
            <div className="ride-price">
              <h3>₹250</h3>
              <p>6 seats</p>
            </div>
          </div>
          <button className="select-ride-btn" onClick={() => navigate(`/ride-tracking/${location}/SUV`)}>Select SUV</button>
        </div>
      </div>

      <div className="ride-info-section">
        <h3>Ride Details</h3>
        <div className="info-item">
          <span>📍 Pickup</span>
          <span>Your Location</span>
        </div>
        <div className="info-item">
          <span>📍 Drop</span>
          <span>{decodeURIComponent(location || '')}</span>
        </div>
        <div className="info-item">
          <span>💳 Payment</span>
          <span>Cash / UPI</span>
        </div>
      </div>
    </div>
  )
}

export default BookRide
