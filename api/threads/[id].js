import { sql } from '../_lib/db.js'
import { DEMO_STUDENT_KEY } from '../_lib/constants.js'

// Moderator hide/unhide a whole thread from student view without deleting it (PRD P0 #7).
// Also handles the demo student's like toggle and webinar register toggle (POST) — folded
// in here, rather than their own files, to stay under the Hobby-plan serverless function count.
export default async function handler(req, res) {
  const { id } = req.query
  const db = sql()

  if (req.method === 'PATCH') {
    const { hidden, approval } = req.body || {}

    // Admin decision on a contributor's post. Only 'pending' posts can be decided; the
    // author is told either way, and an approved post also notifies students enrolled in
    // its room (the new-thread notification is held back while a post is pending).
    if (approval !== undefined) {
      if (!['approved', 'rejected'].includes(approval)) return res.status(400).json({ error: 'Invalid decision' })
      const [thread] = await db`UPDATE threads SET approval_status = ${approval} WHERE id = ${id} AND approval_status = 'pending' RETURNING title, room_key, author_key`
      if (!thread) return res.status(409).json({ error: 'This post is not waiting for approval' })

      if (thread.author_key === DEMO_STUDENT_KEY) {
        await db`
          INSERT INTO notifications (student_key, kind, room_key, thread_id, title, body)
          VALUES (${DEMO_STUDENT_KEY}, 'post_status', ${thread.room_key}, ${id},
                  ${approval === 'approved' ? 'Your post was approved' : "Your post wasn't approved"}, ${thread.title})
        `
      }
      if (approval === 'approved' && thread.author_key !== DEMO_STUDENT_KEY) {
        const [enrolled] = await db`SELECT 1 FROM enrollments WHERE student_key = ${DEMO_STUDENT_KEY} AND room_key = ${thread.room_key}`
        if (enrolled) {
          await db`
            INSERT INTO notifications (student_key, kind, room_key, thread_id, title, body)
            VALUES (${DEMO_STUDENT_KEY}, 'room', ${thread.room_key}, ${id}, 'New thread posted', ${thread.title})
          `
        }
      }
      return res.status(200).json({ ok: true })
    }

    // Only touch `hidden` when it was actually sent, so a decision above never un-hides a post.
    if (hidden !== undefined) await db`UPDATE threads SET hidden = ${!!hidden} WHERE id = ${id}`
    return res.status(200).json({ ok: true })
  }

  if (req.method === 'POST') {
    const { action } = req.body || {}

    if (action === 'register') {
      // RSVP for a specific webinar session (distinct from joining the Webinars room —
      // joining gets you every new-thread notification, registering is a per-session commitment).
      const [existing] = await db`SELECT 1 FROM webinar_registrations WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
      if (existing) {
        await db`DELETE FROM webinar_registrations WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
      } else {
        await db`INSERT INTO webinar_registrations (thread_id, student_key) VALUES (${id}, ${DEMO_STUDENT_KEY}) ON CONFLICT DO NOTHING`
      }
      return res.status(200).json({ registered: !existing })
    }

    // Instagram-style single heart, not a Reddit up/down vote. Liking a post you haven't
    // joined auto-joins its room (engagement -> instant membership) — unliking never un-joins.
    const [existing] = await db`SELECT 1 FROM thread_likes WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
    if (existing) {
      await db`DELETE FROM thread_likes WHERE thread_id = ${id} AND student_key = ${DEMO_STUDENT_KEY}`
    } else {
      await db`INSERT INTO thread_likes (thread_id, student_key) VALUES (${id}, ${DEMO_STUDENT_KEY}) ON CONFLICT DO NOTHING`
      const [thread] = await db`SELECT room_key FROM threads WHERE id = ${id}`
      if (thread) {
        await db`INSERT INTO enrollments (student_key, room_key) VALUES (${DEMO_STUDENT_KEY}, ${thread.room_key}) ON CONFLICT DO NOTHING`
      }
    }
    return res.status(200).json({ liked: !existing })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
