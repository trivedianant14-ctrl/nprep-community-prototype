import { useEffect, useState } from 'react'
import { RoomIcon } from './shared'

const MESSAGES = ['Warming up the rooms…', "Fetching today's Daily Dose…", 'Catching up on new posts…', 'Almost there…']
const ROOM_KINDS = ['daily_dose', 'subject_room', 'exam_room', 'webinar_threads', 'yt_lectures', 'recent_updates', 'nursing_jobs']

// Branded splash shown on first load. The logo floats inside
// two pulsing halos with an orbiting dot, the seven room icons bounce in sequence, and a progress
// bar sweeps while the status line cycles. When the data is ready the parent flips `leaving` and
// the whole screen scales up and fades out. `error` swaps the progress for a retry button.
//
// `inline` renders it inside the phone frame (covering just the app, not the whole page) — used
// when opening Community from Home — and `messages` swaps the status lines.
export default function LoadingScreen({ error, leaving, onRetry, inline = false, messages = MESSAGES }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setI(n => (n + 1) % messages.length), 1300)
    return () => clearInterval(t)
  }, [messages.length])

  return (
    <div className={`splash${inline ? ' inline' : ''}${leaving ? ' leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading NPrep Community">
      <div className="splash-logo-wrap">
        <span className="splash-halo" />
        <span className="splash-halo h2" />
        <span className="splash-orbit"><i /></span>
        <img src="/nprep-logo.jpg" alt="" className="splash-logo" />
      </div>

      <div className="splash-title">NPrep Community</div>

      <div className="splash-rooms" aria-hidden="true">
        {ROOM_KINDS.map((k, n) => <RoomIcon key={k} kind={k} size={inline ? 30 : 34} className="splash-room" style={{ '--i': n }} />)}
      </div>

      {error ? (
        <div className="splash-error">
          <div>Couldn't reach the backend: {error}</div>
          <button onClick={onRetry} className="btn-sm-primary" style={{ marginTop: 12 }}>Try again</button>
        </div>
      ) : (
        <>
          <div className="splash-bar"><span /></div>
          <div key={i} className="splash-msg">{messages[i % messages.length]}</div>
        </>
      )}
    </div>
  )
}
