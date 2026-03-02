import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import Home from './Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
