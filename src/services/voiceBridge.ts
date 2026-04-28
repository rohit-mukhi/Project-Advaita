import { detectDistress, initDistressModel } from './distressDetection'

interface ISpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition
    webkitSpeechRecognition: new () => ISpeechRecognition
  }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognitionAPI()
let isRunning = false

recognition.continuous = true
recognition.interimResults = false
recognition.lang = 'en-US'
recognition.maxAlternatives = 1

export const startSafetyMonitor = async (onAlert: () => void) => {
  try {
    console.log('Initializing distress detection model...')
    await initDistressModel()
    console.log('Model initialized successfully')

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1][0].transcript
      console.log('Speech detected:', transcript)
      
      try {
        const isDistress = await detectDistress(transcript)
        console.log('Distress analysis result:', isDistress)
        
        if (isDistress) {
          console.log('🚨 DISTRESS DETECTED!')
          onAlert()
        }
      } catch (error) {
        console.error('Error analyzing speech:', error)
      }
    }

    recognition.onerror = (err: any) => {
      const errorType = err.error || err
      console.error('Speech Recognition Error:', errorType)
      
      if (errorType === 'network') {
        console.error('Network error - Speech recognition requires internet connection')
        console.error('Please check:')
        console.error('1. Internet connection is active')
        console.error('2. Using Chrome/Edge browser')
        console.error('3. Not behind a firewall blocking Google services')
        console.error('4. Running on HTTPS or localhost')
        isRunning = false
      } else if (errorType === 'no-speech') {
        console.log('No speech detected, continuing to listen...')
      } else if (errorType === 'aborted') {
        console.log('Speech recognition aborted')
        isRunning = false
      } else if (errorType === 'not-allowed') {
        console.error('Microphone permission denied')
        isRunning = false
      }
    }
    
    recognition.onend = () => {
      console.log('Speech recognition ended')
      if (isRunning) {
        console.log('Restarting speech recognition...')
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            console.error('Failed to restart recognition:', e)
          }
        }, 1000)
      }
    }

    recognition.onstart = () => {
      console.log('Speech recognition started successfully')
      console.log('Speak clearly into your microphone...')
    }

    isRunning = true
    recognition.start()
  } catch (error) {
    console.error('Failed to start safety monitor:', error)
    isRunning = false
    throw error
  }
}

export const stopSafetyMonitor = () => {
  console.log('Stopping safety monitor')
  isRunning = false
  try {
    recognition.stop()
  } catch (e) {
    console.error('Error stopping recognition:', e)
  }
}