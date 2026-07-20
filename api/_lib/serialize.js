export function serializeThread(t, replyCount, poll, likeCount = 0, likedByMe = false) {
  return {
    id: t.id,
    roomKey: t.room_key,
    title: t.title,
    body: t.body,
    subjectTag: t.subject_tag,
    hidden: t.hidden,
    createdAt: t.created_at,
    archiveAt: t.archive_at,
    archived: t.archive_at ? new Date(t.archive_at) < new Date() : false,
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
