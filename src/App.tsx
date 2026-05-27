import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import Home from './Home'
import Location from './Location'
import Map from './Map'
import CreatePost from './CreatePost'
import Explore from './Explore'
import Auth from './Auth'
import Reviews from './Reviews'
import BookRide from './BookRide'
import RideTracking from './RideTracking'
import Profile from './Profile'
import { ProtectedRoute } from './ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/location/:location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
        <Route path="/map/:location" element={<ProtectedRoute><Map /></ProtectedRoute>} />
        <Route path="/book-ride/:location" element={<ProtectedRoute><BookRide /></ProtectedRoute>} />
        <Route path="/ride-tracking/:location/:rideType" element={<ProtectedRoute><RideTracking /></ProtectedRoute>} />
        <Route path="/reviews/:location" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
