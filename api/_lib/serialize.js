export function serializeThread(t, replyCount, poll, likeCount = 0, likedByMe = false, registeredCount = 0, registeredByMe = false) {
  const now = new Date()
  const startsAt = t.starts_at ? new Date(t.starts_at) : null
  const archiveAt = t.archive_at ? new Date(t.archive_at) : null
  return {
    id: t.id,
    roomKey: t.room_key,
    title: t.title,
    body: t.body,
    subjectTag: t.subject_tag,
    hidden: t.hidden,
    createdAt: t.created_at,
    archiveAt: t.archive_at,
    archived: archiveAt ? archiveAt < now : false,
    replyCount,
    poll,
    questionId: t.question_id,
    likeCount,
    likedByMe,
    authorKey: t.author_key,
    authorName: t.author_name,
    attachmentUrl: t.attachment_url,
    attachmentName: t.attachment_name,
    attachmentType: t.attachment_type,
    resourceUrl: t.resource_url,
    resourceName: t.resource_name,
    // Webinar scheduling — a thread with a future starts_at is "upcoming" (shows Register),
    // once startsAt has passed and it isn't archived yet it's "live" (shows the LIVE badge).
    startsAt: t.starts_at,
    isUpcoming: !!startsAt && startsAt > now,
    isLive: !!startsAt && startsAt <= now && (!archiveAt || archiveAt > now),
    registeredCount,
    registeredByMe,
  }
}

export function serializeReply(r, likeCount = 0, likedByMe = false, replyingToName = null, likedByNPrepTeam = false) {
  return {
    id: r.id,
    threadId: r.thread_id,
    studentKey: r.student_key,
    authorName: r.hidden ? '' : r.author_name,
    body: r.hidden ? '' : r.body,
    hidden: r.hidden,
    createdAt: r.created_at,
    likeCount: r.hidden ? 0 : likeCount,
    likedByMe: r.hidden ? false : likedByMe,
    parentReplyId: r.parent_reply_id,
    replyingToName: r.hidden ? null : replyingToName,
    pinned: !!r.pinned_at,
    likedByNPrepTeam: r.hidden ? false : likedByNPrepTeam,
    attachmentUrl: r.hidden ? null : r.attachment_url,
    attachmentName: r.hidden ? null : r.attachment_name,
    attachmentType: r.hidden ? null : r.attachment_type,
  }
}
