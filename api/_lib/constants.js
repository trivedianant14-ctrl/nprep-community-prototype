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
// After this many days with no comment or post, the badge switches off and posting rights
// are revoked (the admin has to approve again). Approving also counts as activity.
export const CONTRIBUTOR_INACTIVITY_DAYS = 30
// Phase 1 — contributor-authored posts are limited to these two rooms (kind, not key, so
// it covers every exam_room_* row without listing each exam). Every such post is held as
// 'pending' until the NPrep team approves it.
export const CONTRIBUTOR_POST_ROOM_KINDS = ['subject_room', 'exam_room']

// Comment report reasons shown to the student.
export const REPORT_REASONS = ['Spam', 'Abusive or rude', 'Wrong information', 'Something else']

// PRD "Room Structure" — four room types shown to students. Exam Room is modeled as one
// row per exam (student auto-enrolls into the one matching their profile) but the UI
// groups all of them under a single "Exam Room" tile, matching the PRD's four-room layout.
//
// The exam list itself lives in the backend (the `exams` table, see _lib/exams.js); this
// is only the fallback used when that table is empty or not migrated yet.
export const DEFAULT_EXAMS = ['NORCET', 'AIIMS', 'DSSSB']

export const SUBJECT_TAGS = ['Medical Surgical Nursing', 'Community Health Nursing', 'Child Health Nursing', 'Mental Health Nursing', 'OBG Nursing']

export function examRoomKey(exam) {
  return 'exam_room_' + String(exam).toLowerCase().replace(/[^a-z0-9]+/g, '_')
}

const BEFORE_EXAM_ROOMS = [
  { key: 'daily_dose', label: 'Daily Dose', emoji: '🔥', purpose: 'Daily hook — QOTD extension from homepage', cadence: 'Daily', kind: 'daily_dose' },
  { key: 'subject_room', label: 'Subject Room', emoji: '📖', purpose: 'Academic discussion, concept clarity, exam tips', cadence: '3x per week', kind: 'subject_room' },
]
const AFTER_EXAM_ROOMS = [
  { key: 'webinar_threads', label: 'Webinars', emoji: '🎥', purpose: 'Live sessions — register, join, and discuss', cadence: 'Per webinar', kind: 'webinar_threads' },
  { key: 'yt_lectures', label: 'YT Lectures', emoji: '📺', purpose: 'Recorded lectures — watch, search, download notes', cadence: 'Weekly', kind: 'yt_lectures' },
  { key: 'recent_updates', label: 'Recent Updates', emoji: '📰', purpose: 'Announcements — photos and videos as they happen', cadence: 'As it happens', kind: 'recent_updates' },
  { key: 'nursing_jobs', label: 'Nursing Jobs', emoji: '💼', purpose: 'New openings for nursing officers and staff nurses', cadence: 'As posted', kind: 'nursing_jobs' },
]

export function buildRooms(exams) {
  return [
    ...BEFORE_EXAM_ROOMS,
    ...exams.map(exam => ({ key: examRoomKey(exam), label: `Exam Room · ${exam}`, emoji: '🎯', purpose: `${exam} — notifications, cutoffs, strategy`, cadence: '2x per week', kind: 'exam_room', exam })),
    ...AFTER_EXAM_ROOMS,
  ]
}

// A room "tile" as shown on the Community landing screen groups the exam_room rows
// into one card (student only ever sees their own matched exam's content inside it).
export function buildRoomTiles(exams) {
  return [
    ...BEFORE_EXAM_ROOMS,
    { key: 'exam_room', label: 'Exam Room', emoji: '🎯', purpose: `${exams.join(', ')} — notifications, cutoffs, strategy`, cadence: '2x per week', kind: 'exam_room' },
    ...AFTER_EXAM_ROOMS,
  ]
}
