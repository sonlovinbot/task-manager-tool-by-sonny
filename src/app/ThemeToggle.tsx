import { CircleHalf } from '@phosphor-icons/react'

const KEY = 'tm-theme'

export function applyStoredTheme(): void {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') document.documentElement.setAttribute('data-theme', saved)
  } catch {
    // storage unavailable: follow the system theme
  }
}

function isDark(): boolean {
  const attr = document.documentElement.getAttribute('data-theme')
  if (attr) return attr === 'dark'
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeToggle() {
  const toggle = () => {
    const next = isDark() ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // not persisted; still applies for this visit
    }
  }
  return (
    <button className="btn icon ghost" type="button" aria-label="Đổi giao diện sáng tối" onClick={toggle}>
      <CircleHalf size={20} aria-hidden />
    </button>
  )
}
