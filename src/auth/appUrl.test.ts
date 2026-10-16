import { appUrl } from './authService'

describe('appUrl', () => {
  it('keeps the GitHub Pages sub-path so email links do not land on the bare domain', () => {
    expect(appUrl('https://sonlovinbot.github.io', '/task-manager-tool-by-sonny/')).toBe(
      'https://sonlovinbot.github.io/task-manager-tool-by-sonny/',
    )
  })
  it('is just the origin plus a slash at the site root', () => {
    expect(appUrl('http://localhost:5173', '/')).toBe('http://localhost:5173/')
  })
  it('tolerates stray slashes', () => {
    expect(appUrl('http://localhost:5173/', '/')).toBe('http://localhost:5173/')
    expect(appUrl('https://a.dev', 'app/')).toBe('https://a.dev/app/')
  })
})
