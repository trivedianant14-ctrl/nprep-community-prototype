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
  }
}

export function serializeReply(r, likeCount = 0, likedByMe = false) {
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
  }
}
