import { T1, T2, T3, BD, BG2, PL, PB, PD, INK, Avatar, RoomPill, TagPill, LikeButton, CommentIcon, ShareIcon, ContributorBadge, contributorTier, AttachmentPreview, ResourceLink, LiveBadge, VerifiedIcon, JoinButton, roomGradient, CARD_BORDER, timeAgo, FS } from '../../shared'

// Feed card — the shared post unit for the Community feed and every room list. Layout follows
// the card feeds in Nextdoor / Lex / Reddit: author row on top, bold title, clamped body,
// tag chips, then one action row (like · comments · share) with the one primary CTA
// (Register / Join) pinned to the right.
export default function PostCard({ t, tile, roomLabel, showRoom = true, contributors = {}, joined = true, sharedId, index = 0, onOpen, onLike, onShare, onRegister, onJoin }) {
  const official = !t.authorName
  const author = official ? 'NPrep Team' : t.authorName
  const tier = official ? null : contributorTier(contributors[t.authorKey])
  const isWebinarUpcoming = t.roomKey === 'webinar_threads' && t.startsAt && !t.archived
  const hot = Date.now() - new Date(t.createdAt).getTime() < 3 * 60 * 60 * 1000 && !t.archived && !t.isLive

  return (
    <div role="button" tabIndex={0} className="post-card stagger"
      onClick={onOpen}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen()}
      style={{ '--i': Math.min(index, 8), background: tile ? roomGradient(tile.kind, 'soft') : 'white', borderRadius: 18, padding: '14px 14px 8px', margin: '0 12px 10px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(11,18,48,0.05)', border: `1px solid ${CARD_BORDER}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        {official
          ? <img src="/nprep-logo.jpg" alt="" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 1px rgba(0,0,0,0.06)' }} />
          : <Avatar name={author} size={34} />}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: FS.small + 0.5, fontWeight: 700, color: INK }}>{author}</span>
            {official && <VerifiedIcon size={13} />}
            <ContributorBadge tier={tier} />
          </div>
          <div style={{ fontSize: FS.meta, color: T3, marginTop: 1 }}>{timeAgo(t.createdAt)}{showRoom && roomLabel ? ` · ${roomLabel}` : ''}</div>
        </div>
        {t.isLive && <LiveBadge />}
        {hot && <span style={{ fontSize: FS.tag, fontWeight: 700, color: '#B9490A', background: '#FFF0E6', borderRadius: 20, padding: '3px 9px' }}>🔥 Hot</span>}
      </div>

      {t.approvalStatus === 'pending' && (
        <div style={{ alignSelf: 'flex-start' }}><TagPill tone="poll">⏳ Waiting for approval</TagPill></div>
      )}

      <div style={{ fontSize: FS.body + 1.5, fontWeight: 700, color: INK, lineHeight: 1.38 }}>{t.title}</div>
      {t.body && <div style={{ fontSize: FS.small + 0.5, color: T2, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{t.body}</div>}

      {(t.subjectTag || t.poll) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {showRoom && tile && <RoomPill kind={tile.kind} emoji={tile.emoji}>{roomLabel || tile.label}</RoomPill>}
          {t.subjectTag && <TagPill tone="subject">{t.subjectTag}</TagPill>}
          {t.poll && <TagPill tone="poll">📊 Poll · {t.poll.totalVotes} vote{t.poll.totalVotes === 1 ? '' : 's'}</TagPill>}
        </div>
      )}

      {t.attachmentUrl && <div onClick={e => e.stopPropagation()}><AttachmentPreview url={t.attachmentUrl} name={t.attachmentName} type={t.attachmentType} /></div>}
      {t.resourceUrl && <div onClick={e => e.stopPropagation()}><ResourceLink url={t.resourceUrl} name={t.resourceName} /></div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${BG2}`, marginTop: 2, paddingTop: 4 }}>
        <LikeButton liked={t.likedByMe} count={t.likeCount} onToggle={e => { e.stopPropagation(); onLike() }} size={16} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 4px' }}>
          <CommentIcon size={16} />
          <span style={{ fontSize: FS.meta, fontWeight: 600, color: T2 }}>{t.replyCount}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onShare() }} className="action-btn" aria-label="Share"
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', borderRadius: 8 }}>
          <span key={sharedId === t.id ? 'copied' : 'share'} className={sharedId === t.id ? 'pop-in' : undefined} style={{ display: 'inline-flex' }}><ShareIcon size={16} color={sharedId === t.id ? PD : T2} /></span>
          <span key={sharedId === t.id ? 'copied' : 'share'} className={sharedId === t.id ? 'reveal' : undefined} style={{ fontSize: FS.meta, fontWeight: 600, color: sharedId === t.id ? PD : T2 }}>{sharedId === t.id ? 'Link copied ✓' : 'Share'}</span>
        </button>
        {isWebinarUpcoming ? (
          <button onClick={e => { e.stopPropagation(); onRegister() }} className="pill-btn pop-on" data-on={!!t.registeredByMe}
            style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: t.registeredByMe ? T2 : 'white', background: t.registeredByMe ? BG2 : PD, border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer' }}>
            {t.registeredByMe ? 'Registered ✓' : 'Register'}
          </button>
        ) : !joined && onJoin ? (
          <span style={{ marginLeft: 'auto' }}><JoinButton joined={false} onToggle={onJoin} size="sm" /></span>
        ) : null}
      </div>
    </div>
  )
}
