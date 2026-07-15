export function serializeThread(t, replyCount, poll) {
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
  }
}

export function serializeReply(r) {
  return {
    id: r.id,
    threadId: r.thread_id,
    studentKey: r.student_key,
    authorName: r.hidden ? '' : r.author_name,
    body: r.hidden ? '' : r.body,
    hidden: r.hidden,
    createdAt: r.created_at,
  }
}
