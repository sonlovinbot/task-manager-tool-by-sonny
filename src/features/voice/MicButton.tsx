import { useSpeechInput } from './useSpeechInput'

export function MicButton({ onText }: { onText(text: string): void }) {
  const { supported, listening, error, start, stop } = useSpeechInput(onText)
  if (!supported) return null
  return (
    <>
      <button
        type="button"
        className={listening ? 'mic listening' : 'mic'}
        aria-label="Nhập bằng giọng nói"
        aria-pressed={listening}
        onClick={listening ? stop : start}
      >
        🎤
      </button>
      {error && <span role="status">{error}</span>}
    </>
  )
}
