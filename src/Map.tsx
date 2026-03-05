import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'
import './Home.css'
import './Map.css'

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
        routeWhileDragging: true,
        showAlternatives: true,
        altLineOptions: {
          styles: [
            { color: '#888', opacity: 0.6, weight: 4 }
          ]
        },
        lineOptions: {
          styles: [
            { color: '#BB86FC', opacity: 0.8, weight: 6 }
          ]
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true
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

function Map() {
  const { location } = useParams()
  const navigate = useNavigate()
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [error, setError] = useState<string>('')
  
  const locationName = decodeURIComponent(location || '')
  const destination = locationCoordinates[locationName] || [37.7749, -122.4194]

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude])
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Fallback to ITER Main Gate, Jagamara coordinates
          setUserLocation([20.3489, 85.8172])
          setError('')
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      // Fallback to ITER Main Gate, Jagamara coordinates
      setUserLocation([20.3489, 85.8172])
    }
  }, [])

  if (error) {
    return (
      <div className="home-container">
        <header className="home-header">
          <span onClick={() => navigate(`/location/${location}`)} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
          <h1>{locationName}</h1>
          <div></div>
        </header>
        <div style={{ padding: '20px', textAlign: 'center', color: '#BB86FC' }}>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!userLocation) {
    return (
      <div className="home-container">
        <header className="home-header">
          <span onClick={() => navigate(`/location/${location}`)} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
          <h1>{locationName}</h1>
          <div></div>
        </header>
        <div style={{ padding: '20px', textAlign: 'center', color: '#BB86FC' }}>
          <p>Detecting your location...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <span onClick={() => navigate(`/location/${location}`)} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>{locationName}</h1>
        <div></div>
      </header>

      <div className="map-container" style={{ height: '500px', width: '100%' }}>
        <MapContainer 
          center={userLocation} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
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

      <div className="button-container">
        <button className="book-ride-btn">Book a Ride</button>
      </div>
    </div>
  )
}

export default Map
