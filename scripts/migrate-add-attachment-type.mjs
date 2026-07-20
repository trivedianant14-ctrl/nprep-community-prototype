// Non-destructive migration: attachment_type ('image' | 'video' | 'pdf') on threads and
// replies, so the CMS can attach any media kind, not just PDFs.
// Run with: node --env-file=.env.local scripts/migrate-add-attachment-type.mjs
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Adding attachment_type to threads...')
  await sql.query(`ALTER TABLE threads ADD COLUMN IF NOT EXISTS attachment_type TEXT`)

  console.log('Adding attachment_type to replies...')
  await sql.query(`ALTER TABLE replies ADD COLUMN IF NOT EXISTS attachment_type TEXT`)

  console.log('Backfilling attachment_type = pdf for existing attachments...')
  await sql.query(`UPDATE threads SET attachment_type = 'pdf' WHERE attachment_url IS NOT NULL AND attachment_type IS NULL`)
  await sql.query(`UPDATE replies SET attachment_type = 'pdf' WHERE attachment_url IS NOT NULL AND attachment_type IS NULL`)

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
