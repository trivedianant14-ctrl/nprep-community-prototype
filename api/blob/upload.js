import { handleUpload } from '@vercel/blob/client'

const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
]

// Issues short-lived client tokens for direct-to-Blob uploads (bypasses the function
// body-size limit a proxied upload would hit) — used by the CMS attachment field (any
// room) and the student reply composer in Webinar Threads. The client never sees
// BLOB_READ_WRITE_TOKEN.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED_CONTENT_TYPES,
        addRandomSuffix: true,
        maximumSizeInBytes: 100 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    })
    res.status(200).json(jsonResponse)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}
