import { CONTRIBUTOR_INACTIVITY_DAYS } from './constants.js'

// Contributor expiry: if a student has had no activity (comment, post, or an admin
// approval) for CONTRIBUTOR_INACTIVITY_DAYS, their posting rights are revoked and the admin
// has to approve them again. The badge tier is switched off separately, on read, in state.js.
// There is no cron in this prototype, so this runs lazily on /api/state and before a
// contributor post is accepted.
export async function expireInactiveContributors(db) {
  try {
    await db`
      UPDATE contributors c
      SET approved_to_post = false, expired_at = now()
      WHERE c.approved_to_post AND GREATEST(
        COALESCE(c.approved_at, 'epoch'::timestamptz),
        COALESCE((SELECT max(r.created_at) FROM replies r WHERE r.student_key = c.student_key), 'epoch'::timestamptz),
        COALESCE((SELECT max(t.created_at) FROM threads t WHERE t.author_key = c.student_key), 'epoch'::timestamptz)
      ) < now() - (${CONTRIBUTOR_INACTIVITY_DAYS} * interval '1 day')
    `
  } catch {
    // expired_at column not migrated yet — skip expiry rather than break the app
  }
}
