import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import Home from './Home'
import Location from './Location'
import Map from './Map'
import CreatePost from './CreatePost'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/location/:location" element={<Location />} />
        <Route path="/map/:location" element={<Map />} />
        <Route path="/create" element={<CreatePost />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
