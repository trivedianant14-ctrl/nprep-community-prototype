// No real auth in this prototype — every visitor is this one demo student.
export const DEMO_STUDENT_KEY = 'demo'
export const DEMO_STUDENT_NAME = 'You'

// A like from this identity is an NPrep Team endorsement, not a peer like — stored in the
// same thread_likes/reply_likes tables as any other liker, just a reserved student_key.
export const NPREP_TEAM_KEY = 'nprep_team'
export const NPREP_TEAM_NAME = 'NPrep Team'

// Contributor tiers, based on how many of a student's distinct comments NPrep Team has
// liked. 10+ is a visible badge; 15+ makes them eligible to request posting rights in
// Subject Room / Exam Room (still gated behind admin approval in contributors.approved_to_post).
export const ACTIVE_CONTRIBUTOR_THRESHOLD = 10
export const ELIGIBLE_TO_POST_THRESHOLD = 15
// Phase 1 — contributor-authored posts are limited to these two rooms (kind, not key, so
// it covers every exam_room_* row without listing each exam).
export const CONTRIBUTOR_POST_ROOM_KINDS = ['subject_room', 'exam_room']

// PRD "Room Structure" — four room types shown to students. Exam Room is modeled as one
// row per exam (student auto-enrolls into the one matching their profile) but the UI
// groups all three under a single "Exam Room" tile, matching the PRD's four-room layout.
export const EXAMS = ['NORCET', 'AIIMS', 'DSSSB']

export const ROOMS = [
  { key: 'daily_dose', label: 'Daily Dose', emoji: '🔥', purpose: 'Daily hook — QOTD extension from homepage', cadence: 'Daily', kind: 'daily_dose' },
  { key: 'subject_room', label: 'Subject Room', emoji: '📖', purpose: 'Academic discussion, concept clarity, exam tips', cadence: '3x per week', kind: 'subject_room' },
  ...EXAMS.map(exam => ({ key: `exam_room_${exam.toLowerCase()}`, label: `Exam Room · ${exam}`, emoji: '🎯', purpose: `${exam} — notifications, cutoffs, strategy`, cadence: '2x per week', kind: 'exam_room', exam })),
  { key: 'webinar_threads', label: 'Webinars', emoji: '🎥', purpose: 'Live sessions — register, join, and discuss', cadence: 'Per webinar', kind: 'webinar_threads' },
  { key: 'yt_lectures', label: 'YT Lectures', emoji: '📺', purpose: 'Recorded lectures — watch, search, download notes', cadence: 'Weekly', kind: 'yt_lectures' },
  { key: 'recent_updates', label: 'Recent Updates', emoji: '📰', purpose: 'Announcements — photos and videos as they happen', cadence: 'As it happens', kind: 'recent_updates' },
  { key: 'nursing_jobs', label: 'Nursing Jobs', emoji: '💼', purpose: 'New openings for nursing officers and staff nurses', cadence: 'As posted', kind: 'nursing_jobs' },
]

export const SUBJECT_TAGS = ['Medical Surgical Nursing', 'Community Health Nursing', 'Child Health Nursing', 'Mental Health Nursing', 'OBG Nursing']

export function roomByKey(key) {
  return ROOMS.find(r => r.key === key)
}

// A room "tile" as shown on the Community landing screen groups the 3 exam_room rows
// into one card (student only ever sees their own matched exam's content inside it).
export const ROOM_TILES = [
  roomByKey('daily_dose'),
  roomByKey('subject_room'),
  { key: 'exam_room', label: 'Exam Room', emoji: '🎯', purpose: 'NORCET, AIIMS, DSSSB — notifications, cutoffs, strategy', cadence: '2x per week', kind: 'exam_room' },
  roomByKey('webinar_threads'),
  roomByKey('yt_lectures'),
  roomByKey('recent_updates'),
  roomByKey('nursing_jobs'),
]
