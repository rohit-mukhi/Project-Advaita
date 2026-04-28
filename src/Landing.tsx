import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import 'aos/dist/aos.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as AOS from 'aos'
import socialMediaImg from './assets/Home-Page/social-media.png'
import womenCentricImg from './assets/Home-Page/women-centric.png'
import legalRightsImg from './assets/Home-Page/legal-rights-analyzer.png'
import cryptographicNoiseImg from './assets/Home-Page/cryptographic-noise.png'

function Landing() {
  const navigate = useNavigate()
  const features = [
    {
      title: "New Social Media",
      description: "Connect safely with people worldwide through our empowering platform",
      number: "1",
      image: socialMediaImg
    },
    {
      title: "Safety Features",
      description: "Real-time distress detection and emergency response for women's protection",
      number: "2",
      image: womenCentricImg
    },
    {
      title: "Legal Rights Analyzer",
      description: "AI-powered legal guidance using RAG technology for women's rights",
      number: "3",
      image: legalRightsImg
    },
    {
      title: "Safe Photos",
      description: "Cryptographic noise injection protects your photos from deepfake abuse",
      number: "4",
      image: cryptographicNoiseImg
    }
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleSwipe = () => {
    if (touchStart - touchEnd > 50) {
      handleNext()
    }
    if (touchStart - touchEnd < -50) {
      handlePrev()
    }
  }

  const handleNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % features.length)
        setIsTransitioning(false)
      }, 500)
    }
  }

  const handlePrev = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIndex((prev) => (prev - 1 + features.length) % features.length)
        setIsTransitioning(false)
      }, 500)
    }
  }

  useEffect(() => {
    AOS.init({ duration: 800, once: false })
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % features.length)
        setIsTransitioning(false)
      }, 500)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const nextIndex = (activeIndex + 1) % features.length

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-name">Sueno</div>
        <div className="profile-pic"></div>
      </header>

      <main className="carousel-container">
        <div 
          className="carousel-wrapper"
          onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
          onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
          onTouchEnd={handleSwipe}
        >
          <div className={`feature-card ${isTransitioning ? 'leaving' : 'active'}`}>
            <div className="earth-model"></div>
            <div className="card-content">
              {features[activeIndex].image && (
                <img src={features[activeIndex].image} alt={features[activeIndex].title} className="feature-image" />
              )}
              <h2>{features[activeIndex].title}</h2>
              <p>{features[activeIndex].description}</p>
            </div>
          </div>
          {isTransitioning && (
            <div className="feature-card entering">
              <div className="earth-model"></div>
              <div className="card-content">
                {features[nextIndex].image && (
                  <img src={features[nextIndex].image} alt={features[nextIndex].title} className="feature-image" />
                )}
                <h2>{features[nextIndex].title}</h2>
                <p>{features[nextIndex].description}</p>
            </div>
            </div>
          )}
        </div>
      </main>

      <div className="button-container">
        <button className="get-started-btn" onClick={() => navigate('/auth')}>Get Started</button>
      </div>

      <footer className="app-footer">
        <div className="avatars">
          <div className="avatar"></div>
          <div className="avatar"></div>
          <div className="avatar"></div>
        </div>
        <p>Joey, Linn and 8 friends are online</p>
      </footer>
    </div>
  )
}

export default Landing
