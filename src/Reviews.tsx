import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import 'aos/dist/aos.css'
import * as AOS from 'aos'
import './Reviews.css'

function Reviews() {
  const { location } = useParams()
  const navigate = useNavigate()
  const locationName = decodeURIComponent(location || '')

  const reviews = [
    { id: 1, user: 'Sarah Johnson', avatar: '#BB86FC', rating: 5, comment: 'Absolutely stunning place! The views are breathtaking and the atmosphere is perfect.', date: '2 days ago' },
    { id: 2, user: 'Emma Davis', avatar: '#3700B3', rating: 4, comment: 'Great experience overall. Would definitely recommend visiting during sunset.', date: '5 days ago' },
    { id: 3, user: 'Lisa Chen', avatar: '#BB86FC', rating: 5, comment: 'One of the best places I\'ve ever visited. The natural beauty is unmatched!', date: '1 week ago' },
    { id: 4, user: 'Maya Patel', avatar: '#3700B3', rating: 4, comment: 'Beautiful location with lots of activities. Perfect for a weekend getaway.', date: '1 week ago' },
    { id: 5, user: 'Anna Williams', avatar: '#BB86FC', rating: 5, comment: 'Amazing place! Very peaceful and relaxing. Will visit again soon.', date: '2 weeks ago' },
    { id: 6, user: 'Sophie Martin', avatar: '#3700B3', rating: 5, comment: 'Exceeded all expectations. The scenery is incredible and people are friendly.', date: '2 weeks ago' },
  ]

  useEffect(() => {
    AOS.init({ duration: 600, once: false })
  }, [])

  return (
    <div className="reviews-container">
      <header className="reviews-header">
        <span onClick={() => navigate(`/location/${location}`)} style={{ cursor: 'pointer', fontSize: '24px' }}>←</span>
        <h1>Reviews</h1>
        <div></div>
      </header>

      <div className="location-title">
        <h2>{locationName}</h2>
        <div className="rating-summary">
          <span className="stars">⭐⭐⭐⭐⭐</span>
          <span className="rating-text">4.8 ({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.map((review, index) => (
          <div key={review.id} className="review-card" data-aos="fade-up" data-aos-delay={index * 100}>
            <div className="review-header">
              <div className="review-user">
                <div className="review-avatar" style={{ background: review.avatar }}></div>
                <div className="review-info">
                  <span className="review-name">{review.user}</span>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
              <div className="review-rating">
                {'⭐'.repeat(review.rating)}
              </div>
            </div>
            <p className="review-comment">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Reviews
