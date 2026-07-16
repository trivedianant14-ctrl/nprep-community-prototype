// One-time setup: creates tables and seeds demo data.
// Run with: node --env-file=.env.local scripts/setup-db.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  student_key TEXT PRIMARY KEY,
  exam TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS enrollments (
  student_key TEXT NOT NULL,
  room_key TEXT NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (student_key, room_key)
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  free_tier BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS threads (
  id SERIAL PRIMARY KEY,
  room_key TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  subject_tag TEXT,
  question_id INTEGER REFERENCES questions(id),
  hidden BOOLEAN NOT NULL DEFAULT false,
  archive_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS poll_options (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  option_id INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  voted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (poll_id, student_key)
);

CREATE TABLE IF NOT EXISTS replies (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  student_key TEXT NOT NULL,
  kind TEXT NOT NULL,
  room_key TEXT,
  thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thread_likes (
  thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, student_key)
);

CREATE TABLE IF NOT EXISTS reply_likes (
  reply_id INTEGER NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  student_key TEXT NOT NULL,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (reply_id, student_key)
);
`

const now = Date.now()
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR
const at = (offsetMs) => new Date(now + offsetMs).toISOString()

const QUESTIONS = [
  { question: 'Which of the following levels of care includes super-specialty hospitals like AIIMS?', options: ['Primary Care', 'Secondary Care', 'Tertiary Care', 'Home Care'], correctIndex: 2, freeTier: true },
  { question: 'Which attribute is most likely to cause conflict in nursing administration?', options: ['Role ambiguity', 'Shift timing', 'Uniform code', 'Ward color'], correctIndex: 0, freeTier: true },
  { question: 'Normal fasting blood glucose range is approximately?', options: ['40-60 mg/dL', '70-100 mg/dL', '140-160 mg/dL', '200-220 mg/dL'], correctIndex: 1, freeTier: true },
  { question: 'Which nursing theory focuses on self-care deficit?', options: ['Orem', 'Roy', 'Peplau', 'Henderson'], correctIndex: 0, freeTier: true },
  { question: 'A paid-tier mock question used to demo the CMS filter — should NEVER be selectable for Daily Dose.', options: ['A', 'B', 'C', 'D'], correctIndex: 0, freeTier: false },
  { question: 'Another paid QBank question — filtered out of the free-tier picker.', options: ['A', 'B', 'C', 'D'], correctIndex: 1, freeTier: false },
]

async function main() {
  console.log('Creating schema...')
  for (const stmt of SCHEMA.split(';').map(s => s.trim()).filter(Boolean)) {
    await sql.query(stmt)
  }

  console.log('Clearing existing demo data...')
  await sql.query('TRUNCATE thread_likes, reply_likes, notifications, poll_votes, poll_options, polls, replies, threads, questions, enrollments, profiles RESTART IDENTITY CASCADE')

  console.log('Seeding questions...')
  const qIds = []
  for (const q of QUESTIONS) {
    const [row] = await sql`
      INSERT INTO questions (question, options, correct_index, free_tier)
      VALUES (${q.question}, ${JSON.stringify(q.options)}, ${q.correctIndex}, ${q.freeTier})
      RETURNING id
    `
    qIds.push(row.id)
  }

  console.log('Seeding threads...')

  // Daily Dose — linked to a free-tier question, a couple of replies including one from
  // the demo student (so the CMS "simulate peer reply" tool can demo the reply-notification rule).
  const [dailyDose] = await sql`
    INSERT INTO threads (room_key, title, body, question_id, created_at)
    VALUES ('daily_dose', 'Today''s Daily Dose 🔥', 'Today''s QOTD — drop your reasoning below, right or wrong. Tertiary care covers super-specialty institutes like AIIMS.', ${qIds[0]}, ${at(-3 * HOUR)})
    RETURNING id
  `
  await sql`INSERT INTO replies (thread_id, student_key, author_name, body, created_at) VALUES (${dailyDose.id}, 'peer-1', 'Priya S.', 'Got it right! Tertiary = super-specialty.', ${at(-2 * HOUR)})`
  await sql`INSERT INTO replies (thread_id, student_key, author_name, body, created_at) VALUES (${dailyDose.id}, 'demo', 'You', 'I picked Secondary Care first, makes sense now why it''s Tertiary.', ${at(-90 * MIN)})`
  await sql`INSERT INTO replies (thread_id, student_key, author_name, body, created_at) VALUES (${dailyDose.id}, 'peer-2', 'Rohit K.', 'Same mistake here 😅 thanks for the thread.', ${at(-40 * MIN)})`

  // Subject Room — one plain discussion thread, one with a poll.
  const [subj1] = await sql`
    INSERT INTO threads (room_key, title, body, subject_tag, created_at)
    VALUES ('subject_room', 'Quick way to remember cranial nerves?', 'Sharing mnemonics that actually stuck for you — drop yours below.', 'Medical Surgical Nursing', ${at(-1 * DAY)})
    RETURNING id
  `
  await sql`INSERT INTO replies (thread_id, student_key, author_name, body, created_at) VALUES (${subj1.id}, 'peer-3', 'Anjali M.', '"Oh Oh Oh To Touch And Feel Very Good Velvet AH" — never forgot it since.', ${at(-20 * HOUR)})`

  const [subj2] = await sql`
    INSERT INTO threads (room_key, title, body, subject_tag, created_at)
    VALUES ('subject_room', 'Which subject is eating most of your revision time right now?', 'Curious what everyone''s grinding through this week.', 'Community Health Nursing', ${at(-2 * DAY)})
    RETURNING id
  `
  const [subjPoll] = await sql`INSERT INTO polls (thread_id) VALUES (${subj2.id}) RETURNING id`
  const subjOptLabels = ['Medical Surgical', 'Community Health', 'OBG', 'Pediatrics']
  const subjOptIds = []
  for (let i = 0; i < subjOptLabels.length; i++) {
    const [o] = await sql`INSERT INTO poll_options (poll_id, label, position) VALUES (${subjPoll.id}, ${subjOptLabels[i]}, ${i}) RETURNING id`
    subjOptIds.push(o.id)
  }
  const seedVotes = [0, 0, 1, 0, 2, 3, 0, 1]
  for (let i = 0; i < seedVotes.length; i++) {
    await sql`INSERT INTO poll_votes (poll_id, student_key, option_id) VALUES (${subjPoll.id}, ${'peer-vote-' + i}, ${subjOptIds[seedVotes[i]]})`
  }

  // Exam Room — one thread per exam.
  const [examNorcet] = await sql`
    INSERT INTO threads (room_key, title, body, created_at)
    VALUES ('exam_room_norcet', 'NORCET 10 notification — expected timeline?', 'Sharing what we know so far, will keep this updated.', ${at(-6 * HOUR)})
    RETURNING id
  `
  await sql`INSERT INTO replies (thread_id, student_key, author_name, body, created_at) VALUES (${examNorcet.id}, 'peer-4', 'Kavya R.', 'Heard forms open next month, fingers crossed.', ${at(-5 * HOUR)})`

  await sql`
    INSERT INTO threads (room_key, title, body, created_at)
    VALUES ('exam_room_aiims', 'AIIMS cutoff trend — last 3 years', 'Posting the cutoff numbers we''ve tracked so far for AIIMS Nursing Officer.', ${at(-1 * DAY)})
  `

  // Webinar Threads — one still active, one auto-archived (48h past its session).
  await sql`
    INSERT INTO threads (room_key, title, body, archive_at, created_at)
    VALUES ('webinar_threads', 'Live now: MCQ Discussion — Community Health High-Yield', 'Drop your questions here during the session.', ${at(20 * HOUR)}, ${at(-4 * HOUR)})
  `
  await sql`
    INSERT INTO threads (room_key, title, body, archive_at, created_at)
    VALUES ('webinar_threads', 'Recap: Topper Journey session', 'Session wrapped — thanks for joining! This thread is now archived.', ${at(-1 * HOUR)}, ${at(-49 * HOUR)})
  `

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
