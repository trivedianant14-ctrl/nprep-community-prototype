import { sql } from '../../_lib/db.js'
import { DEMO_STUDENT_KEY, DEMO_STUDENT_NAME } from '../../_lib/constants.js'

const PEER_NAMES = ['Priya S.', 'Rohit K.', 'Anjali M.', 'Kavya R.', 'Suresh M.', 'Deepak V.', 'Sneha R.', 'Meera J.']

// PRD P0 #3 (student reply, flat + chronological) and the "Simulate peer reply" CMS
// action, which also demonstrates P0 #6's reply-notification rule: a peer reply only
// notifies the demo student if they'd previously replied in that same thread.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { id } = req.query
  const { body, asPeer, parentReplyId, attachmentUrl, attachmentName, attachmentType } = req.body || {}
  if (!body || !body.trim()) return res.status(400).json({ error: 'Reply body required' })
  const db = sql()

  // Related-content attachments (PDF/image/video) are a Webinar Threads reply feature —
  // ignore an attachment on any other room.
  const [thread] = await db`SELECT title, room_key FROM threads WHERE id = ${id}`
  const isWebinar = thread?.room_key === 'webinar_threads'

  const authorName = asPeer ? PEER_NAMES[Math.floor(Math.random() * PEER_NAMES.length)] : DEMO_STUDENT_NAME
  // Deterministic per-persona key (not a fresh random one per call) so repeated "Simulate
  // peer reply" clicks that land on the same name accumulate under one identity — otherwise
  // NPrep-Team-like counts could never cross the contributor thresholds for anyone but demo.
  const studentKey = asPeer ? `peer-${authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : DEMO_STUDENT_KEY

  // Reddit-style arbitrary-depth nesting — a reply's parent can be any existing reply in
  // this thread, at any depth. Just verify it actually belongs to this thread.
  let parentId = null
  if (parentReplyId) {
    const [parent] = await db`SELECT id FROM replies WHERE id = ${parentReplyId} AND thread_id = ${id}`
    if (parent) parentId = parent.id
  }

  const [reply] = await db`
    INSERT INTO replies (thread_id, student_key, author_name, body, parent_reply_id, attachment_url, attachment_name, attachment_type)
    VALUES (${id}, ${studentKey}, ${authorName}, ${body.trim()}, ${parentId}, ${isWebinar ? attachmentUrl || null : null}, ${isWebinar ? attachmentName || null : null}, ${isWebinar ? attachmentType || null : null})
    RETURNING *
  `

  if (asPeer) {
    const [priorReply] = await db`SELECT 1 FROM replies WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY} AND id != ${reply.id} LIMIT 1`
    if (priorReply) {
      await db`
        INSERT INTO notifications (student_key, kind, room_key, thread_id, title, body)
        VALUES (${DEMO_STUDENT_KEY}, 'reply', ${thread.room_key}, ${id}, ${authorName + ' replied in a thread you joined'}, ${thread.title})
      `
    }
  }

  res.status(201).json({ id: reply.id })
}
