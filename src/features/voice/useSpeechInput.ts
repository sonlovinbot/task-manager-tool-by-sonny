import { useCallback, useRef, useState } from 'react'

interface RecognitionLike {
  lang: string
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

type RecognitionCtor = new () => RecognitionLike

function getCtor(): RecognitionCtor | undefined {
  const w = window as unknown as Record<string, RecognitionCtor | undefined>
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}

const ERRORS: Record<string, string> = {
  'not-allowed': 'Chưa cấp quyền dùng micro.',
  'service-not-allowed': 'Chưa cấp quyền dùng micro.',
  'no-speech': 'Không nghe thấy giọng nói.',
}

export function useSpeechInput(onText: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string>()
  const recRef = useRef<RecognitionLike | null>(null)
  const onTextRef = useRef(onText)
  onTextRef.current = onText
  const supported = typeof window !== 'undefined' && !!getCtor()

  const start = useCallback(() => {
    const Ctor = getCtor()
    if (!Ctor) return
    setError(undefined)
    const rec = new Ctor()
    rec.lang = 'vi-VN'
    rec.interimResults = false
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript?.trim()
      if (text) onTextRef.current(text)
    }
    rec.onerror = (e) => {
      setError(ERRORS[e.error] ?? 'Không nhận dạng được giọng nói.')
      setListening(false)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }, [])

  const stop = useCallback(() => recRef.current?.stop(), [])

  return { supported, listening, error, start, stop }
}
