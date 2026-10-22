// Bulk demo content, so the prototype can be seen at scale: ~800 comments across the rooms,
// deep reply chains, likes, NPrep Team endorsements (contributor badges), open reports for the
// CMS moderation queue, bigger poll tallies and webinar registrations.
// Fully deterministic (seeded PRNG) — every first load, and every browser, sees the same data.

const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR
const iso = (ms) => new Date(ms).toISOString()

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Same persona-key rule as the "Simulate peer reply" action in store.js, so a simulated reply
// from "Priya S." accumulates under the same identity as her seeded comments.
export const personaKey = (name) => `peer-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

const FIRST = ['Priya', 'Rohit', 'Anjali', 'Kavya', 'Suresh', 'Deepak', 'Sneha', 'Meera', 'Aditi', 'Karan', 'Neha', 'Amit', 'Pallavi', 'Rajesh', 'Swati', 'Manish', 'Ritu', 'Vivek', 'Shruti', 'Nikhil', 'Jyoti', 'Sandeep', 'Komal', 'Ankit', 'Tanvi', 'Gaurav', 'Bhavna', 'Mohit', 'Simran', 'Tarun', 'Shweta', 'Abhishek', 'Radha', 'Yash', 'Preeti', 'Harsh', 'Sana', 'Imran', 'Mansi', 'Ravi']
const INITIALS = 'ABCDGJKMNPRSTV'.split('')

// Students whose comments NPrep Team likes a lot → badge tiers. Targets are the number of
// NPrep-liked comments each one ends up with: 15+ = eligible to post, 10+ = active badge.
const CONTRIBUTORS = [
  { name: 'Nandini P.', liked: 18, approved: true },   // already approved — has a post waiting in CMS
  { name: 'Divya K.', liked: 16 },                     // eligible, waiting for admin approval
  { name: 'Arjun T.', liked: 15 },                     // eligible, waiting for admin approval
  { name: 'Faizan A.', liked: 12 },
  { name: 'Pooja D.', liked: 11 },
  { name: 'Vikram S.', liked: 10 },
  { name: 'Lakshmi N.', liked: 7 },
  { name: 'Harpreet K.', liked: 4 },
]

const OPENERS = ['Honestly, ', 'I think ', 'Just my two cents — ', 'From what I remember, ', 'Pretty sure ', 'As per my notes, ', 'Quick tip: ', 'Adding to this: ', 'Personally, ']
const CLOSERS = [' 🙌', ' 😊', ' Hope this helps.', ' Just saying.', ' 💯', ' 🙏', ' 📌']

const REACTIONS = [
  'Exactly this 👆', 'Same here 😅', 'This is so helpful, thank you!', 'Saving this for revision 📌', 'Needed this today 🙏',
  'Can confirm, I got this in a mock test.', "Wish I'd seen this a week ago.", 'Bookmarked ✅', 'Well explained!', 'Thanks for sharing 🙌',
  '100% agree.', 'Haha relatable 😂', 'Following this thread.', 'Great point, hadn\'t thought about it that way.',
  'Thank you so much, this really clears it up.', '👏👏', 'Is there a source for this?', 'Can you share the page number?',
  'Which book is this from?', 'Any more tips like this?', 'Making a note of this in my diary.', 'Yes!! This is the one.',
  'Came here to say the same thing.', 'This community is the best 💙', 'Noted, thanks!', 'Underrated comment right here.',
  'Mind blown, I never knew this.', 'Lol I did exactly this in the mock 😭', 'Thanks! Sharing this with my study group.', 'Perfect, that\'s what I needed.',
]
const QUESTIONS = [
  'Is anyone else preparing from the NPrep notes for this?', 'Can someone share a quick way to remember this?',
  'How many marks does this usually carry in the exam?', 'Is this topic really repeated every year?',
  'Any good video on this topic?', 'Can someone explain this in simple words?', 'Is this still in the latest syllabus?',
]

// Topic banks: `core` = top-level comments, `replies` = topic-specific replies.
const TOPICS = {
  qotd: {
    core: [
      'Tertiary care for sure — AIIMS, PGI and NIMHANS are all super-specialty institutes.',
      "Marked Secondary in yesterday's mock and lost the mark 😭 never again.",
      'Easy way to remember: Primary = PHC/sub-centre, Secondary = district hospital, Tertiary = medical college and super-specialty.',
      "This came in NORCET almost word for word, so don't skip the health care delivery chapter.",
      'Can someone explain why CHC is secondary and not primary?',
      'The pyramid in my head: Sub-centre → PHC → CHC → District hospital → Tertiary institutes.',
      "Park's has a neat table for this in the health care delivery chapter.",
      "Primary is first contact, secondary is the first referral level, tertiary is highly specialised care. That's the whole trick.",
      "Option D is a trap — Home care isn't one of the three levels.",
      'I confused secondary with tertiary because district hospitals also have specialists.',
      'Got it right but only because of the AIIMS hint in the question 😅',
      'Sub-centre covers 5000 population in plains and 3000 in hilly areas. Asked this last time!',
      'PHC = 30,000 population (20,000 in hilly/tribal areas). Finally mugged these numbers up.',
      'CHC covers 1,20,000 population (80,000 hilly) with 30 beds and 4 specialists.',
      "The words 'super-specialty' in the question are the giveaway — always tertiary.",
      'Please keep posting these, the Daily Dose is the only reason I open the app every morning.',
      'Streak day 42 and counting 🔥',
      'Our teacher said medical college hospitals are tertiary too — can anyone confirm?',
      'I solved this in under 10 seconds, the pattern is always the same.',
      'Attempting this before breakfast has become my daily ritual ☕',
      'Wrote the three levels on a sticky note and put it on my study table.',
      "Anything with 'referral' in it is secondary or above, that's how I filter options.",
      'Anyone else feel the options are getting trickier each week?',
    ],
    replies: [
      'Yes, medical college hospitals are tertiary referral centres too.',
      "CHC is the first referral unit for the PHCs below it — that's why it's secondary.",
      "Out of syllabus for now, stick to the three levels.",
      "Nice mnemonic, I'm stealing it.",
      "It's in the health care delivery chapter, look for the table of population norms.",
      "Same trap got me last month. Now I read the options twice.",
    ],
  },
  cranial: {
    core: [
      '"Oh Oh Oh To Touch And Feel Very Good Velvet AH" for the names — never forgot it since.',
      "For sensory/motor/both: 'Some Say Marry Money But My Brother Says Big Brains Matter More'.",
      'I draw the brainstem and place each nerve where it exits. Visual memory works better for me than rhymes.',
      'Olfactory, optic and vestibulocochlear are purely sensory — only three to remember.',
      'Pure motor nerves: oculomotor, trochlear, abducens, accessory, hypoglossal.',
      'Mixed nerves are trigeminal, facial, glossopharyngeal and vagus.',
      'Trochlear is the only one that exits from the dorsal brainstem — came as an MCQ.',
      'Vagus is the longest cranial nerve and supplies most of the thoracic and abdominal viscera.',
      "Bell's palsy = LMN type, so the whole half of the face is affected, including the forehead.",
      "Oculomotor palsy gives the classic 'down and out' eye.",
      'Abducens palsy = cannot abduct, so diplopia on looking outward.',
      'Trigeminal has three divisions — V1 ophthalmic, V2 maxillary, V3 mandibular. Only V3 has a motor component.',
      'Corneal reflex: afferent trigeminal, efferent facial. Examiners love this one.',
      'Gag reflex: afferent glossopharyngeal, efferent vagus.',
      'Made flashcards for all twelve, with the foramen each one passes through.',
      'Hypoglossal palsy → tongue deviates toward the side of the lesion.',
      'Accessory nerve supplies sternocleidomastoid and trapezius — shoulder shrug test.',
      'Can someone share a mnemonic for the foramina they pass through?',
      'The Anki deck for this is a lifesaver, happy to share mine if anyone wants.',
      "The 'Velvet AH' ending is the only way I remember vestibulocochlear and glossopharyngeal.",
      'Nursing angle: cranial nerve checks are a head-to-toe assessment favourite, not just anatomy.',
      'Optic nerve damage → visual field defects. Know the pattern for chiasm vs tract.',
    ],
    replies: [
      "Careful — Bell's palsy affects the forehead too, unlike a stroke (UMN).",
      'Yes! Only V3 carries the motor fibres.',
      'Please share the Anki deck 🙏',
      'Superior orbital fissure for III, IV, V1 and VI.',
      'That mnemonic is a classic, still works after all these years.',
      'Drawing it out is the best advice here.',
    ],
  },
  revision: {
    core: [
      'Medical Surgical, hands down. The syllabus never ends.',
      'OBG for me — so many scoring systems and drugs to remember.',
      'Community Health, because of the national programmes and their targets.',
      'Pediatrics: growth milestones and the immunisation schedule keep slipping out of my head.',
      'Mental health is underrated — easy marks if you revise the drugs and Acts.',
      'Half my time goes on Med-Surg and the other half regretting I ignored Community Health 😅',
      "I'm doing 2 hours Med-Surg and 1 hour of the rest, daily.",
      'Nutrition and microbiology are sneaky time sinks too.',
      'Pharmacology keeps leaking into every subject, honestly.',
      'Voted OBG — the Bishop score, APGAR and partograph all need constant revision.',
      'National health programmes need a separate notebook of their own.',
      'Switching subjects every two days is helping me avoid burnout.',
      'Anyone have a weekly timetable that actually works?',
      'I follow 50 minutes study, 10 minutes break. Simple but it works.',
      'Mock tests every Sunday show me which subject to push next.',
      'Short notes in the last week saved me last time.',
    ],
    replies: [
      'Try grouping programmes by year and target, it halves the revision time.',
      'Same, Pediatrics milestones keep slipping.',
      'My timetable: 3 subjects a week, rotating, and one full revision on Sunday.',
      "Flashcards for the national programmes — it's the only thing that worked for me.",
    ],
  },
  norcet: {
    core: [
      'Official notice says forms will open soon, no exact date yet.',
      'Last cycle the notification came out early in the month, so expect something similar.',
      'Keep your documents ready: council registration, photo, signature, category certificate.',
      'Age limit is 18-30 years, with relaxations as per government norms.',
      'Eligibility is B.Sc Nursing, or GNM with experience, plus nursing council registration.',
      "Please don't trust random Telegram dates, only the official AIIMS website.",
      'Heard the vacancies might go up this year 🤞',
      'Anyone know the expected number of vacancies?',
      'Syllabus should remain the same as the last cycle.',
      'Negative marking is there, so be careful with wild guesses.',
      'Checking the AIIMS site every morning like it\'s a ritual 😂',
      'The form window is usually short, so keep the fee ready in advance.',
      'Admit card normally comes about a week before the exam.',
      'Starting a study group for NORCET aspirants, comment if you\'re interested.',
      'Previous year papers are the best prep — do at least the last five years.',
      "Don't stress, the exam is always a couple of months after the form window closes.",
      'What was the cutoff last year in the general category?',
      'Is the exam centre choice first-come first-served?',
      'Revising Community Health first because it carries the most weightage.',
      'Joined a test series, the pattern matches the real paper closely.',
    ],
    replies: [
      'Yes, check only the official AIIMS exams website.',
      'Interested in the study group!',
      'Please add me to the study group too 🙏',
      'Cutoffs differ by category and shift, I will post what I have.',
      'Keep scanned copies of everything in one folder, it saves so much time.',
    ],
  },
  aiims: {
    core: [
      'Cutoff has been going up steadily, so aim well above last year\'s number.',
      'The cutoff depends a lot on shift difficulty, so normalisation matters.',
      'OBC and EWS cutoffs sit a few marks below general.',
      'Missed it by 3 marks last year 😔 trying again.',
      'Last three years show a dip when the paper was tough, then a jump.',
      'Cutoff alone does not tell the full story — the number of vacancies matters more.',
      'Aim for 85% accuracy in mocks, that has been safe in previous cycles.',
      'Could someone post the category-wise numbers as a table?',
      'Thanks for tracking this, so useful!',
      'Medical Surgical and Community Health carry the highest weightage.',
      "Don't attempt questions you're unsure about — negative marking hurts.",
      "I'm tracking cutoffs in a Google sheet, will share the link.",
    ],
    replies: [
      'Thanks! Posting the three-year averages in a table soon.',
      'Agree, accuracy matters more than attempts.',
      'Please do share the sheet 🙌',
    ],
  },
  webinarLive: {
    core: [
      'Joining from my phone, audio is clear 👍',
      'Can the host repeat the last question? Missed the options.',
      'Great session so far — the Community Health MCQs are tricky.',
      'Please share the PDF of today\'s MCQs after the session.',
      'Is the recording going to be available?',
      "The 'except' type questions are the ones I keep missing.",
      'Anyone else getting a buffering issue?',
      'Attendance marked ✅',
      'Loving the elimination technique shown for options B and D.',
      'Mic mute please, there is background noise.',
      'Thank you for explaining the reasoning, not just the answer.',
      'Which chapter should we revise for these questions?',
      "30 minutes in and I've already filled a page of notes.",
      'Replay please for the vaccine cold chain question.',
      'Please do a similar session for OBG next!',
      'Can we have the immunisation schedule revisited at the end?',
    ],
    replies: [
      'Notes are attached in the thread above 👆',
      'Recording will be added after the session.',
      'Try refreshing, it worked for me.',
      'Yes please, OBG would be great!',
    ],
  },
  webinarRecap: {
    core: [
      'Thank you for the Topper Journey session, so motivating!',
      'My biggest takeaway: consistency beats long hours.',
      'Loved the point about analysing mock tests instead of just giving them.',
      'The study plan slide was gold — can we get it as a PDF?',
      'Wish this was longer 😍',
      'Did anyone catch the book list she mentioned?',
      'She said revise previous year papers at least twice, noted.',
      "I'm restarting my prep with this timetable from tomorrow.",
      'Please bring more topper sessions, these are the best.',
    ],
    replies: ['Same here, restarting from tomorrow!', 'I took screenshots of the study plan slide.', 'The book list is in the recap PDF above.'],
  },
  affairs: {
    core: [
      'So the new curriculum will be competency-based — good change.',
      'Any word on when the existing batches will be affected?',
      'Will NORCET really reference the updated syllabus this soon?',
      'Newspapers say the rollout starts with selected colleges first.',
      'Important for the Current Affairs section, noting it.',
      'Source link please? Want to read the original circular.',
      'More emphasis on community health and mental health, it seems.',
      'Keep these updates coming, they are easy marks.',
      'Which notification is this from?',
    ],
    replies: ['Check the ministry website, the circular is on the nursing division page.', 'Same question, hoping someone has the link.'],
  },
  jobs: {
    core: [
      'Applied already! Fingers crossed 🤞',
      "What's the pay level for this post?",
      'Is experience required, or can freshers apply?',
      "Last date is close — don't wait for the final day when the site crashes.",
      'Anyone from the same state here? Let\'s connect.',
      'Is there any domicile requirement?',
      'Thanks for posting, this is why I joined this room.',
      'Documents list: registration certificate, marksheets, ID proof, passport photo.',
      'Does the posting involve rotating night shifts?',
      'Heard the previous recruitment took long to finalise, anyone know?',
      'Please add salary details next time, saves a lot of searching.',
      'Shared this with my whole batch 📲',
    ],
    replies: ['Freshers can apply, check the eligibility section of the notice.', 'Pay level is mentioned in the notice, page 2.', 'Thanks, applying tonight!'],
  },
  updates: {
    core: [
      'Downloaded mine! Centre is 40 km away 😩',
      'Check your name, photo and signature carefully — errors need fixing fast.',
      'Carry your original photo ID, not just a photocopy.',
      'Is anyone else getting a server error on the site?',
      'Reporting time is usually well before the exam — reach early.',
      'Keep two passport photos handy.',
      'All the best everyone! 🍀',
      'Mock test on the exam pattern tonight, anyone joining?',
      'Centre allotted is far, can I request a change?',
    ],
    replies: ['Server is slow, try again after some time.', 'Joining the mock tonight!', 'Changes are usually not allowed, check the notice.'],
  },
  lecture: {
    core: [
      'Best revision video for autonomic drugs, thank you!',
      'The cholinergic vs adrenergic table is gold.',
      'Beta blockers explained so simply, finally clicked.',
      "Mnemonic for anticholinergic side effects: 'dry as a bone, red as a beet, mad as a hatter'.",
      'Can we get the notes PDF?',
      'Please do the next one on cardiac drugs.',
      'Playback at 1.5x and still learning 😂',
      'Rewatching this before the exam.',
      'An atropine uses and contraindications recap would help.',
    ],
    replies: ['Notes are in the description, check the link.', 'Cardiac drugs next, I heard it is coming soon!'],
  },
  dsssb: {
    core: [
      'Raising an objection for one question — the official key seems wrong.',
      'Objection fee is charged per question, so be sure before submitting.',
      'Cross-checked with two standard books and the key looks right, I would not object.',
      'Expected cutoff is lower this year as the paper was lengthy.',
      'Who else got option C for the question on the national programme?',
      'Anyone calculated the normalised score yet?',
      'Result usually takes a few weeks after the final key.',
      'Last date to submit objections is close, don\'t miss it.',
    ],
    replies: ['I got option C too.', 'Fee is refunded if the objection is accepted, I believe.'],
  },
  upcoming: {
    core: [
      'Registered ✅ cannot wait!',
      'Will there be a Q&A at the end?',
      'Is this session free for everyone?',
      'Reminder set on my phone 📲',
      'Please cover time management for the paper.',
      'Can we send our questions beforehand?',
      'Will the recording be shared if I miss it?',
      'Invited three friends from my batch.',
      'Topic request: how to approach elimination in tough MCQs.',
    ],
    replies: ['Yes, there is a live Q&A at the end.', 'Recording gets posted in this thread afterwards.'],
  },
  dose: {
    core: [
      'Dose = (Desired ÷ Available) × Quantity. Never forget the units.',
      'IV drip rate: (Volume × Drop factor) ÷ Time in minutes.',
      'Macro drip is 15-20 drops/mL, micro drip is 60 drops/mL.',
      'Convert everything to the same unit first — most mistakes are mg vs mcg.',
      'Pediatric dose: use mg/kg and always double-check against the maximum dose.',
      'Practise 10 problems daily, speed comes automatically.',
      'Cross-multiplication saves me every single time.',
      '1 g = 1000 mg, 1 mg = 1000 mcg. Write it at the top of your page.',
      'Dimensional analysis helped me more than any formula.',
      'Calculators are usually not allowed, so learn the shortcuts anyway.',
    ],
    replies: ['Writing the conversions on top of the page is such a good habit.', 'Dimensional analysis made it click for me too.'],
  },
  obgBook: {
    core: [
      "For nursing exams I stick with Dutta's textbook for obstetrics and gynecology.",
      'Lowdermilk is great for maternity nursing concepts and care plans.',
      "Don't buy both, pick one and revise it three times.",
      'The NPrep notes plus one standard book was enough for me.',
      'For MCQ practice, previous year papers beat any book.',
      'Dutta is bulky; use it as a reference and make short notes.',
      'Ask your seniors, they know what is high-yield for the exam.',
      "I'd go with Lowdermilk for nursing-specific questions.",
      'Check the library first, both are usually available there.',
    ],
    replies: ['Agree, one book three times beats three books once.', 'Library copy worked for me too.'],
  },
}

const BAD_COMMENTS = [
  { body: 'Free NORCET PDFs + answer key on my Telegram channel, DM now 📲📲', reasons: ['Spam', 'Spam', 'Spam'] },
  { body: 'Join my coaching, 100% selection guarantee!!! WhatsApp me for fees', reasons: ['Spam', 'Spam'] },
  { body: 'Buy my notes at half price, limited seats only, message me', reasons: ['Spam'] },
  { body: "You people ask such stupid questions, go study instead of posting here", reasons: ['Abusive or rude', 'Abusive or rude', 'Abusive or rude', 'Something else'] },
  { body: 'Whoever wrote this has no clue. Absolute rubbish.', reasons: ['Abusive or rude', 'Wrong information'] },
  { body: 'Normal fasting blood glucose is 140-160 mg/dL, please update your notes.', reasons: ['Wrong information', 'Wrong information', 'Wrong information'] },
  { body: 'Tertiary care is the level that includes PHCs. Remember this.', reasons: ['Wrong information', 'Wrong information'] },
  { body: 'Vagus is the shortest cranial nerve, everyone knows that.', reasons: ['Wrong information'] },
  { body: 'This whole thread is a waste of time lol', reasons: ['Something else'] },
  { body: 'Result already leaked, check my profile for the link 🔗', reasons: ['Spam', 'Wrong information'] },
  { body: 'Idiots, the key is obviously wrong and you are all too dumb to see it', reasons: ['Abusive or rude', 'Abusive or rude'] },
  { body: 'First aid kit contents are the same everywhere, no need to study this.', reasons: ['Wrong information'] },
]

export function seedVolume({ db, now, addThread, addReply, topThreads }) {
  const rng = mulberry32(20261022)
  const rnd = (n) => Math.floor(rng() * n)
  const pick = (arr) => arr[rnd(arr.length)]

  // Peer pool: names drawn with a power-law activity curve (a few very active students).
  const contributorNames = new Set(CONTRIBUTORS.map(c => c.name))
  const pool = []
  while (pool.length < 70) {
    const name = `${pick(FIRST)} ${pick(INITIALS)}.`
    if (!pool.includes(name) && !contributorNames.has(name)) pool.push(name)
  }
  const randomPeer = () => pool[Math.floor(pool.length * Math.pow(rng(), 1.8))]

  const contributorComments = new Map(CONTRIBUTORS.map(c => [c.name, []]))
  const allComments = []

  const lowerFirst = (s) => (/^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s)
  function compose(list, used) {
    const fresh = list.map((_, i) => i).filter(i => !used.has(i))
    const idx = fresh.length ? fresh[rnd(fresh.length)] : rnd(list.length)
    const repeated = used.has(idx)
    used.add(idx)
    let text = list[idx]
    if (repeated || rng() < 0.12) text = pick(OPENERS) + lowerFirst(text)
    if (repeated ? rng() < 0.7 : rng() < 0.12) text += pick(CLOSERS)
    return text
  }

  function authorFor() {
    if (rng() < 0.2) {
      const weights = [3, 3, 3, 2, 2, 2, 1, 1]
      let r = rnd(weights.reduce((a, b) => a + b, 0))
      let i = 0
      while (r >= weights[i]) { r -= weights[i]; i++ }
      return CONTRIBUTORS[i].name
    }
    return randomPeer()
  }

  // Fill one thread with `total` comments: ~45% top-level, the rest nested replies chosen by
  // preferential attachment (busy comments attract more replies → realistic deep branches).
  function fill(thread, total, topic) {
    const bank = TOPICS[topic]
    const start = new Date(thread.createdAt).getTime()
    const end = now - 3 * MIN
    const span = Math.max(end - start, 10 * MIN)
    const used = new Set()
    const usedReply = new Set()
    const topN = Math.max(3, Math.round(total * 0.45))
    const made = []

    const topTimes = Array.from({ length: topN }, () => start + 2 * MIN + span * Math.pow(rng(), 1.6)).sort((a, b) => a - b)
    for (const t of topTimes) {
      const roll = rng()
      const body = roll < 0.86 ? compose(bank.core, used) : roll < 0.95 ? pick(QUESTIONS) : pick(REACTIONS)
      const name = authorFor()
      const row = addReply(thread.id, personaKey(name), name, body, iso(Math.min(t, end)), null)
      made.push({ row, t: Math.min(t, end), depth: 0, kids: 0 })
    }

    for (let i = topN; i < total; i++) {
      let eligible = made.filter(m => m.depth < 6 && m.t < end - 2 * MIN)
      if (!eligible.length) eligible = made
      const weights = eligible.map(m => 1 + m.kids * 2 + (m.depth === 0 ? 1 : 4))
      let r = rng() * weights.reduce((a, b) => a + b, 0)
      let parent = eligible[0]
      for (let k = 0; k < eligible.length; k++) { r -= weights[k]; if (r <= 0) { parent = eligible[k]; break } }
      const t = Math.min(end, parent.t + 60 * 1000 + Math.floor(-Math.log(1 - rng()) * 35 * MIN))
      const roll = rng()
      const body = roll < 0.4 ? compose(bank.replies, usedReply) : roll < 0.78 ? pick(REACTIONS) : compose(bank.core, used)
      let name = authorFor()
      if (name === parent.row.authorName) name = randomPeer()
      const row = addReply(thread.id, personaKey(name), name, body, iso(t), parent.row.id)
      parent.kids++
      made.push({ row, t, depth: parent.depth + 1, kids: 0 })
    }

    for (const m of made) {
      allComments.push({ ...m, thread })
      if (contributorComments.has(m.row.authorName)) contributorComments.get(m.row.authorName).push(m.row)
    }
    return made
  }

  const likesFor = () => {
    const r = rng()
    return r < 0.34 ? 0 : r < 0.74 ? 1 + rnd(5) : r < 0.95 ? 6 + rnd(20) : 26 + rnd(95)
  }
  const addThreadLikes = (thread, n) => { for (let k = 0; k < n; k++) db.threadLikes.push({ threadId: thread.id, studentKey: `u${k}` }) }
  const addRegistrations = (thread, n) => { for (let k = 0; k < n; k++) db.registrations.push({ threadId: thread.id, studentKey: `u${k}` }) }
  const addPoll = (thread, labels, votes) => {
    const poll = { id: ++db.seq.poll, threadId: thread.id }
    db.polls.push(poll)
    const ids = labels.map((label, position) => {
      const o = { id: ++db.seq.option, pollId: poll.id, label, position }
      db.pollOptions.push(o)
      return o.id
    })
    return { poll, ids, spread: (n, weights) => {
      const total = weights.reduce((a, b) => a + b, 0)
      for (let k = 0; k < n; k++) {
        let r = rng() * total, i = 0
        while (r >= weights[i]) { r -= weights[i]; i++ }
        db.pollVotes.push({ pollId: poll.id, studentKey: `pv-${poll.id}-${k}`, optionId: ids[i] })
      }
    } }
  }

  // ---- Existing seed threads get a lot of extra conversation ---------------------------
  const { dailyDose, subj1, subj2, norcet, aiims, webinarLive, webinarRecap, affairs } = topThreads
  fill(dailyDose, 120, 'qotd')
  fill(subj1, 70, 'cranial')
  fill(subj2, 55, 'revision')
  fill(norcet, 95, 'norcet')
  fill(aiims, 40, 'aiims')
  fill(webinarLive, 80, 'webinarLive')
  fill(webinarRecap, 30, 'webinarRecap')
  fill(affairs, 35, 'affairs')

  // More votes on the existing revision poll.
  const existingPollOpts = db.pollOptions.filter(o => o.pollId === db.polls.find(p => p.threadId === subj2.id).id)
  const existingPoll = db.polls.find(p => p.threadId === subj2.id)
  const w = [42, 24, 20, 14]
  for (let k = 0; k < 230; k++) {
    let r = rng() * 100, i = 0
    while (r >= w[i]) { r -= w[i]; i++ }
    db.pollVotes.push({ pollId: existingPoll.id, studentKey: `pv-${existingPoll.id}-${k}`, optionId: existingPollOpts[i].id })
  }

  // ---- New threads so every room has content -------------------------------------------
  const newThreads = [
    { room: 'exam_room_norcet', title: 'When do you think NORCET 10 forms will open?', body: 'Vote below and tell us what you have been hearing.', ago: 14 * HOUR, count: 60, topic: 'norcet', likes: 140,
      poll: { labels: ['This month', 'Next month', 'In 2–3 months', 'No idea 😅'], weights: [20, 38, 22, 20], votes: 260 } },
    { room: 'exam_room_dsssb', title: 'DSSSB Staff Nurse answer key out — objections thread', body: 'Share your questions and answers before the objection window closes.', ago: 20 * HOUR, count: 45, topic: 'dsssb', likes: 90 },
    { room: 'subject_room', title: 'Drug dose calculation shortcuts?', body: 'Which methods do you use to avoid silly mistakes in dose calculation questions?', tag: 'Medical Surgical Nursing', ago: 2 * DAY + 3 * HOUR, count: 55, topic: 'dose', likes: 120 },
    { room: 'subject_room', title: 'Which book for OBG — Dutta or Lowdermilk?', body: 'Confused between the two. What worked for you?', tag: 'OBG Nursing', ago: 3 * DAY, count: 45, topic: 'obgBook', likes: 85 },
    { room: 'nursing_jobs', title: 'AIIMS Raipur: Nursing Officer vacancies open', body: 'Applications are open on the official portal. Read the full notice before applying and keep your documents ready.', ago: 1 * DAY + 5 * HOUR, count: 50, topic: 'jobs', likes: 210 },
    { room: 'nursing_jobs', title: 'Staff Nurse posts in Delhi government hospitals', body: 'New openings announced. Check eligibility and last date on the official notice.', ago: 3 * DAY + 6 * HOUR, count: 30, topic: 'jobs', likes: 95 },
    { room: 'recent_updates', title: 'NORCET admit card released ✅', body: 'Download it from the official website and verify every detail.', ago: 9 * HOUR, count: 55, topic: 'updates', likes: 175 },
    { room: 'yt_lectures', title: 'New lecture: Pharmacology in 60 minutes — Autonomic drugs', body: 'Watch the full lecture and drop your doubts below.', ago: 2 * DAY, count: 40, topic: 'lecture', likes: 130 },
    { room: 'webinar_threads', title: 'Upcoming: NORCET Strategy Masterclass', body: 'Live session on how to plan your last 60 days. Register to get a reminder.', ago: 6 * HOUR, count: 25, topic: 'upcoming', likes: 70,
      startsAt: now + 2 * DAY, archiveAt: now + 4 * DAY, registrations: 240 },
  ]
  const created = []
  for (const t of newThreads) {
    const thread = addThread({
      roomKey: t.room, title: t.title, body: t.body, subjectTag: t.tag, createdAt: iso(now - t.ago),
      startsAt: t.startsAt ? iso(t.startsAt) : null, archiveAt: t.archiveAt ? iso(t.archiveAt) : null,
    })
    created.push(thread)
    fill(thread, t.count, t.topic)
    addThreadLikes(thread, t.likes)
    if (t.registrations) addRegistrations(thread, t.registrations)
    if (t.poll) addPoll(thread, t.poll.labels, t.poll.votes).spread(t.poll.votes, t.poll.weights)
  }

  // Existing threads' likes / registrations.
  const likeCounts = new Map([[dailyDose, 185], [subj1, 96], [subj2, 74], [norcet, 160], [aiims, 58], [webinarLive, 110], [webinarRecap, 64], [affairs, 71]])
  for (const [thread, n] of likeCounts) addThreadLikes(thread, n)
  addRegistrations(webinarLive, 120)
  addRegistrations(webinarRecap, 85)

  // ---- Comment likes (heavy-tailed) ----------------------------------------------------
  for (const m of allComments) {
    const n = likesFor()
    for (let k = 0; k < n; k++) db.replyLikes.push({ replyId: m.row.id, studentKey: `u${k}` })
  }

  // ---- Contributor tiers: NPrep Team likes a target number of each contributor's comments
  const NPREP = 'nprep_team'
  for (const c of CONTRIBUTORS) {
    const mine = contributorComments.get(c.name)
    // Spread across threads: shuffle, then like the first `liked` of them.
    const shuffled = [...mine].sort(() => rng() - 0.5)
    for (const r of shuffled.slice(0, c.liked)) db.replyLikes.push({ replyId: r.id, studentKey: NPREP })
    // Not enough comments to hit the target → top up with extra comments in the busiest thread.
    for (let i = shuffled.length; i < c.liked; i++) {
      const extra = addReply(dailyDose.id, personaKey(c.name), c.name, pick(TOPICS.qotd.core), iso(now - (5 + rnd(100)) * MIN), null)
      db.replyLikes.push({ replyId: extra.id, studentKey: NPREP })
    }
    if (c.approved) db.contributors[personaKey(c.name)] = { approvedToPost: true, approvedAt: iso(now - 3 * DAY), expiredAt: null }
  }
  // A scattering of NPrep Team likes on other students' comments (never enough to cross 10).
  const perStudent = {}
  for (const m of [...allComments].sort(() => rng() - 0.5)) {
    const k = m.row.studentKey
    if (contributorComments.has(m.row.authorName) || (perStudent[k] || 0) >= 2) continue
    if (rng() < 0.08) { db.replyLikes.push({ replyId: m.row.id, studentKey: NPREP }); perStudent[k] = (perStudent[k] || 0) + 1 }
  }

  // ---- Pinned comments on a few threads (an NPrep-liked top-level comment) --------------
  for (const thread of [dailyDose, norcet, subj1, webinarLive]) {
    const candidate = db.replies.find(r => r.threadId === thread.id && !r.parentReplyId && db.replyLikes.some(l => l.replyId === r.id && l.studentKey === NPREP))
    if (candidate) candidate.pinnedAt = iso(now - 20 * MIN)
  }

  // ---- A pending contributor post for the CMS approval queue ---------------------------
  addThread({
    roomKey: 'subject_room', title: 'My 5-step method to finish Community Health in 10 days',
    body: 'Step 1: national programmes table. Step 2: vital statistics formulas. Step 3: health care delivery levels. Step 4: epidemiology terms. Step 5: two mock tests. Happy to share my notes if this is useful.',
    subjectTag: 'Community Health Nursing', createdAt: iso(now - 40 * MIN),
    authorKey: personaKey('Nandini P.'), authorName: 'Nandini P.', approvalStatus: 'pending',
  })

  // ---- Reported and hidden comments for the CMS moderation queue -----------------------
  const hosts = [dailyDose, norcet, subj1, webinarLive, aiims, affairs, ...created.slice(0, 6)]
  BAD_COMMENTS.forEach((bad, i) => {
    const thread = hosts[i % hosts.length]
    const name = pick(pool)
    const row = addReply(thread.id, personaKey(name), name, bad.body, iso(now - (15 + rnd(300)) * MIN), null)
    bad.reasons.forEach((reason, k) => db.replyReports.push({ replyId: row.id, studentKey: `reporter-${k}`, reason, status: 'open', reportedAt: iso(now - (5 + rnd(60)) * MIN) }))
    if (i === 3 || i === 10) row.hidden = true // already removed by a moderator
  })
}
