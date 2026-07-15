import { neon } from '@neondatabase/serverless'

// Lazy init so a missing DATABASE_URL only throws when a request actually needs the
// DB, not at module-load/build time.
let _sql = null
export function sql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL)
  return _sql
}
