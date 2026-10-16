// Tap ripple — one delegated pointerdown listener for every tappable surface (cards, room tiles,
// chips, rows, icon buttons, CMS buttons). The ripple expands from the exact touch point and tints
// itself light on dark buttons and soft blue on light ones. Skipped when the user prefers reduced
// motion. `.action-btn` is deliberately excluded: the like button's heart burst needs to overflow.
const SELECTOR = '.post-card, .room-card, .pill-btn, .row-tap, .icon-btn, .cms-nav, .cms-tab, button.stat-card, .cms-main button, .btn-sm-primary, .tab-btn, .fab'

function isDark(color) {
  const m = color.match(/rgba?\(([^)]+)\)/)
  if (!m) return false
  const [r, g, b, a = 1] = m[1].split(',').map(parseFloat)
  if (a < 0.4) return false
  return (0.299 * r + 0.587 * g + 0.114 * b) < 150
}

export function installRipple() {
  if (typeof window === 'undefined' || window.__rippleInstalled) return
  window.__rippleInstalled = true
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')

  document.addEventListener('pointerdown', (e) => {
    if (reduce?.matches || e.button > 0) return
    const el = e.target.closest?.(SELECTOR)
    if (!el || el.disabled || el.closest('.splash')) return

    const cs = getComputedStyle(el)
    if (cs.position === 'static') el.style.position = 'relative'
    el.style.overflow = 'hidden' // contain the ripple inside the rounded shape

    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.1
    const span = document.createElement('span')
    span.className = 'ripple-wave'
    span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;background:${isDark(cs.backgroundColor) ? 'rgba(255,255,255,0.35)' : 'rgba(29,91,240,0.16)'}`
    el.appendChild(span)
    span.addEventListener('animationend', () => span.remove(), { once: true })
    setTimeout(() => span.remove(), 900) // safety net
  }, { passive: true })
}
