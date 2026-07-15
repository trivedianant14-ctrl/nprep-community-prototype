// No real auth in this prototype — every visitor is this one demo student.
export const DEMO_STUDENT_KEY = 'demo'
export const DEMO_STUDENT_NAME = 'You'

// PRD "Room Structure" — four room types shown to students. Exam Room is modeled as one
// row per exam (student auto-enrolls into the one matching their profile) but the UI
// groups all three under a single "Exam Room" tile, matching the PRD's four-room layout.
export const EXAMS = ['NORCET', 'AIIMS', 'DSSSB']

export const ROOMS = [
  { key: 'daily_dose', label: 'Daily Dose', emoji: '🔥', purpose: 'Daily hook — QOTD extension from homepage', cadence: 'Daily', kind: 'daily_dose' },
  { key: 'subject_room', label: 'Subject Room', emoji: '📖', purpose: 'Academic discussion, concept clarity, exam tips', cadence: '3x per week', kind: 'subject_room' },
  ...EXAMS.map(exam => ({ key: `exam_room_${exam.toLowerCase()}`, label: `Exam Room · ${exam}`, emoji: '🎯', purpose: `${exam} — notifications, cutoffs, strategy`, cadence: '2x per week', kind: 'exam_room', exam })),
  { key: 'webinar_threads', label: 'Webinar Threads', emoji: '🎥', purpose: 'Pre and post-session discussion', cadence: 'Per webinar', kind: 'webinar_threads' },
]

export const SUBJECT_TAGS = ['Medical Surgical Nursing', 'Community Health Nursing', 'Child Health Nursing', 'Mental Health Nursing', 'OBG Nursing']

export function roomByKey(key) {
  return ROOMS.find(r => r.key === key)
}

// A room "tile" as shown on the Community landing screen groups the 3 exam_room rows
// into one card (student only ever sees their own matched exam's content inside it).
export const ROOM_TILES = [
  ROOMS[0],
  ROOMS[1],
  { key: 'exam_room', label: 'Exam Room', emoji: '🎯', purpose: 'NORCET, AIIMS, DSSSB — notifications, cutoffs, strategy', cadence: '2x per week', kind: 'exam_room' },
  ROOMS[ROOMS.length - 1],
]
