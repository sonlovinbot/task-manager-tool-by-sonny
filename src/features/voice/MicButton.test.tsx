import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MicButton } from './MicButton'

type Handler = ((e: any) => void) | null
let instance: FakeRecognition

class FakeRecognition {
  lang = ''
  interimResults = true
  onresult: Handler = null
  onerror: Handler = null
  onend: (() => void) | null = null
  started = false
  constructor() {
    instance = this
  }
  start() {
    this.started = true
  }
  stop() {
    this.onend?.()
  }
}

afterEach(() => {
  delete (window as any).SpeechRecognition
  delete (window as any).webkitSpeechRecognition
})

describe('MicButton', () => {
  it('renders nothing when unsupported', () => {
    const { container } = render(<MicButton onText={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('uses lang vi-VN and passes the result text to onText', async () => {
    ;(window as any).webkitSpeechRecognition = FakeRecognition
    const onText = vi.fn()
    render(<MicButton onText={onText} />)
    await userEvent.click(screen.getByRole('button', { name: 'Nhập bằng giọng nói' }))
    expect(instance.lang).toBe('vi-VN')
    expect(instance.started).toBe(true)
    act(() => instance.onresult?.({ results: [[{ transcript: 'Mai nộp báo cáo' }]] }))
    expect(onText).toHaveBeenCalledWith('Mai nộp báo cáo')
  })

  it('not-allowed error shows a short message', async () => {
    ;(window as any).SpeechRecognition = FakeRecognition
    render(<MicButton onText={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Nhập bằng giọng nói' }))
    act(() => instance.onerror?.({ error: 'not-allowed' }))
    expect(screen.getByRole('status')).toHaveTextContent('Chưa cấp quyền dùng micro.')
    expect(screen.getByRole('button', { name: 'Nhập bằng giọng nói' })).toBeInTheDocument()
  })
})
