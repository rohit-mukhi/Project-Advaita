import { useState, useEffect } from 'react'
import Landing from './Landing'
import logo from './assets/Loading-Screen/aroha-logo.png'
import './LoadingScreen.css'

function LoadingScreen() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="loading-screen">
        <img src={logo} alt="Aroha Logo" className="loading-logo" />
        <h1 className="loading-title">Aroha</h1>
      </div>
    )
  }

  return <Landing />
}

export default LoadingScreen
