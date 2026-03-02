import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import Home from './Home'
import Location from './Location'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/location/:location" element={<Location />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
