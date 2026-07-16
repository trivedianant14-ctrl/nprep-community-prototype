import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ROOM_GRADIENT } from '../../shared'

// Gamified channel switcher: a "roulette wheel" bent into a semi-circle whose center sits
// just off the left edge of the screen. Only the slice near angle 0 pokes into view — the
// current channel sits there at full size, siblings curve away above/below and shrink/fade
// as they approach the vertical extremes, exactly like a rolodex or a slot-machine reel
// viewed edge-on. Swiping up/down along that curve (or a tap on a visible neighbor) rotates
// it and switches rooms — no popup, no leaving the screen you're on.
const ANGLE_STEP = 0.58 // radians between adjacent channel stops on the arc
const PX_PER_STEP = 60  // vertical drag distance (px) that rotates the wheel by one stop
const ICON = 42
const SNAP_MS = 240

function norm(i, n) { return ((i % n) + n) % n }

export default function ChannelWheel({ rooms, currentIndex, onSwitch }) {
  const containerRef = useRef(null)
  const [height, setHeight] = useState(560)
  const [wheelIndex, setWheelIndexState] = useState(currentIndex)
  const [dragging, setDragging] = useState(false)

  const wheelIndexRef = useRef(currentIndex)
  const dragRef = useRef(null)
  const lastMovedRef = useRef(0)
  const tweenRef = useRef(null)
  const wheelTimerRef = useRef(null)
  const latest = useRef({})
  latest.current = { rooms, currentIndex, onSwitch }

  const setWheelIndex = (v) => { wheelIndexRef.current = v; setWheelIndexState(v) }

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => setHeight(entries[0].contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // If navigation happened elsewhere (e.g. tapping a room tile from Community), re-sync.
  useEffect(() => {
    if (dragRef.current) return
    const n = latest.current.rooms.length
    if (norm(Math.round(wheelIndexRef.current), n) !== currentIndex) {
      if (tweenRef.current) cancelAnimationFrame(tweenRef.current)
      setWheelIndex(currentIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  const settleTo = (targetIndex) => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current)
    const n = latest.current.rooms.length
    const start = wheelIndexRef.current
    let delta = ((targetIndex - start) % n + n) % n
    if (delta > n / 2) delta -= n
    const end = start + delta
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min(1, (now - t0) / SNAP_MS)
      const eased = 1 - Math.pow(1 - t, 3)
      setWheelIndex(start + (end - start) * eased)
      if (t < 1) {
        tweenRef.current = requestAnimationFrame(step)
      } else {
        tweenRef.current = null
        const finalIndex = norm(Math.round(end), n)
        setWheelIndex(finalIndex)
        if (finalIndex !== latest.current.currentIndex) latest.current.onSwitch(latest.current.rooms[finalIndex])
      }
    }
    tweenRef.current = requestAnimationFrame(step)
  }

  const onPointerDown = (e) => {
    if (tweenRef.current) { cancelAnimationFrame(tweenRef.current); tweenRef.current = null }
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startIndex: wheelIndexRef.current, moved: 0 }
    setDragging(true)
  }
  const onPointerMove = (e) => {
    const d = dragRef.current
    if (!d) return
    const dy = e.clientY - d.startY
    d.moved = Math.max(d.moved, Math.abs(dy))
    setWheelIndex(d.startIndex + dy / PX_PER_STEP)
  }
  const endDrag = () => {
    const d = dragRef.current
    if (!d) return
    dragRef.current = null
    lastMovedRef.current = d.moved
    setDragging(false)
    if (d.moved < 4) return
    settleTo(norm(Math.round(wheelIndexRef.current), latest.current.rooms.length))
  }

  // Native (non-passive) wheel listener so a trackpad/mouse can rotate the wheel too,
  // without the page scrolling underneath it.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e) => {
      e.preventDefault()
      if (tweenRef.current) { cancelAnimationFrame(tweenRef.current); tweenRef.current = null }
      setWheelIndex(wheelIndexRef.current + e.deltaY / PX_PER_STEP)
      clearTimeout(wheelTimerRef.current)
      wheelTimerRef.current = setTimeout(() => {
        settleTo(norm(Math.round(wheelIndexRef.current), latest.current.rooms.length))
      }, 140)
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const jumpTo = (index) => {
    if (lastMovedRef.current > 4) { lastMovedRef.current = 0; return }
    settleTo(index)
  }

  const n = rooms.length
  const R = Math.min(200, Math.max(120, height * 0.4))
  const centerY = height / 2
  const restX = 4

  const nearest = norm(Math.round(wheelIndex), n)

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{ position: 'relative', width: 60, flexShrink: 0, height: '100%', touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none' }}
    >
      {rooms.map((room, i) => {
        let diff = (i - wheelIndex) % n
        if (diff > n / 2) diff -= n
        if (diff < -n / 2) diff += n
        const theta = diff * ANGLE_STEP
        const cos = Math.cos(theta), sin = Math.sin(theta)
        const x = restX + R * (cos - 1)
        const y = centerY + R * sin - ICON / 2
        const opacity = Math.max(0.1, Math.min(1, 0.12 + 0.88 * cos))
        const scale = Math.max(0.48, Math.min(1, 0.5 + 0.5 * cos))
        const isCurrent = i === nearest
        const grad = ROOM_GRADIENT[room.kind] || '#888'

        return (
          <button
            key={room.key}
            onClick={() => jumpTo(i)}
            title={room.label}
            style={{
              position: 'absolute', left: 0, top: 0,
              transform: `translate(${x}px, ${y}px) scale(${scale})`,
              opacity, zIndex: isCurrent ? 5 : Math.round(4 - Math.abs(diff)),
              width: ICON, height: ICON, borderRadius: '50%', border: isCurrent ? '2.5px solid white' : 'none',
              background: grad, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, cursor: 'pointer', padding: 0,
              boxShadow: isCurrent ? '0 3px 12px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)' : '0 2px 6px rgba(0,0,0,0.15)',
            }}
          >
            {room.emoji}
            {isCurrent && (
              <span style={{
                position: 'absolute', left: ICON + 8, top: '50%', transform: 'translateY(-50%)',
                whiteSpace: 'nowrap', fontSize: 10.5, fontWeight: 800, color: 'white', background: 'rgba(11,18,48,0.82)',
                padding: '4px 10px', borderRadius: 20, pointerEvents: 'none',
              }}>
                {room.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
