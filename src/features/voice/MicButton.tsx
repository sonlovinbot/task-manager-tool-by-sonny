import { Microphone } from '@phosphor-icons/react'
import { useSpeechInput } from './useSpeechInput'

export function MicButton({ onText }: { onText(text: string): void }) {
  const { supported, listening, error, start, stop } = useSpeechInput(onText)
  if (!supported) return null
  return (
    <>
      <button
        type="button"
        className={`btn icon mic${listening ? ' listening' : ''}`}
        aria-label="Nhập bằng giọng nói"
        aria-pressed={listening}
        onClick={listening ? stop : start}
      >
        <Microphone size={20} weight={listening ? 'fill' : 'regular'} aria-hidden />
      </button>
      {error && (
        <span role="status" className="t-small">
          {error}
        </span>
      )}
    </>
  )
}
