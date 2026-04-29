import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useEffect } from 'react'

function Auth() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/home')
      }
    })
  }, [navigate])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`
      }
    })
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#121212'
    }}>
      <div style={{ 
        textAlign: 'center',
        padding: '40px',
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #262626'
      }}>
        <h2 style={{ color: '#BB86FC', marginBottom: '30px' }}>Welcome to Sueno</h2>
        <button 
          onClick={handleGoogleLogin}
          style={{ 
            padding: '12px 30px',
            background: '#BB86FC',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '0 auto'
          }}
        >
          <span>🔐</span>
          Continue with Google
        </button>
      </div>
    </div>
  )
}

export default Auth
