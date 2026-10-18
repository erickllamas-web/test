# The funnel and the pipeline — how the four lines run

One process, four lines. Each line has its own sequence file; this is the
machine they all run in. It is written to the CRM that exists (pipeline
`pl_cyclesarc`, the card, the call script, the 15-day check-in) and to the
standing rule that nothing is sent without Erick's yes.

## 1. The stages

| Stage | What it means | Enters when | Leaves when |
|---|---|---|---|
| **Lead** | On the card, not yet written to. | Import. | The first email is approved. |
| **Written** | The first email is out. The sequence is running. | E1 sent. | A reply arrives, or the sequence ends. |
| **In conversation** | A person at the organisation has replied with something other than no. | Any reply. | A call is booked, a scene/proof is agreed, or they say no. |
| **Scoping** | We know the place and date (L1), the run size and market (L2), the object and span (L3), the channel (L4). | Discovery done. | Terms are sent. |
| **Terms out** | Terms sent, by enquiry, never in the first email. | Terms sent. | Yes or no. |
| **Won** | They said yes. Customer emails take over. | Signed / first order. | Never (it stays a customer record). |
| **Not now** | They asked us to write later. | A date is given. | That date. Re-enters at Written with a new fact. |
| **Closed** | They said no, or the sequence ended with silence. | "No", unsubscribe, or 30 days after the last email. | A re-look date (90 days, silence only). "No" has no re-look. |
| **Do not contact** | They asked not to be written or called. | Their words. | Never. |

Silence is not a stage. Silence is the sequence still running.

## 2. The order of the emails, per line

Day counts are from the first send, working days, in the recipient's time
zone. Every send waits for the local window (brief §5). Nothing is sent on a
local public holiday or at a weekend.

### Line 1 — production companies (historical sky and light)

| Day | Email | The one new fact | The ask |
|---|---|---|---|
| 0 | E1 · the first email | Their project; what the file holds; the Stonehenge alignment | Place and date for one scene |
| 0 +1 h | **The call** (call script, DRAFT) | — | Book the scoping call |
| 3 | E2 · the four days | Same camera, same sun height, only the solstice lies on the axis | 20 minutes |
| 8 | E3 · what the file holds | The contents list, in plain words, for their renderer | Which renderer |
| 15 | E4 · the wrong sky | Titanic's sky; today's patched-together way | Who owns the sky on the project |
| 30 | E5 · close-out | None. The door. | A date, or a name |
| +90 | E6 · re-look | A new proof case or a new product fact | Place and date |

### Line 2 — sun-care brands (the bottle)

Two tracks. **Enterprise** (115 firms, 480 named people: brand presidents,
packaging, marketing, innovation). **Indie** (81 founder-led brands).

| Day | Enterprise | Indie |
|---|---|---|
| 0 | E1 · the bottle, in three figures | I1 · the bottle, founder to founder |
| 5 | E2 · the privacy sentence | I2 · the privacy sentence and the ship plan |
| 12 | E3 · the campaign that is already made | I3 · close-out |
| 21 | E4 · what it does not do | — |
| 35 | E5 · close-out | — |
| +120 | E6 · re-look, before their next season | I4 · re-look |

Enterprise is slow on purpose: senior people, long cycles, a procurement
step. Indie is three emails: a founder decides in one reading or not at all.

**Timing by hemisphere and market (this matters more than the day count):**
a sun-care brand plans its season six to nine months ahead. Northern
hemisphere: write September to January for the next summer. Australia, New
Zealand, Brazil, South Africa: write March to June. Gulf and South-East Asia:
year-round, with Ramadan and the monsoon avoided. The localiser sets this
per lead (brief §5).

### Line 3 — organisations, under their name

| Day | Email | The one new fact | The ask |
|---|---|---|---|
| 0 | E1 · the first email (one of eight desk hooks) | What can carry their name, for their desk | What they publish, in a paragraph |
| 4 | E2 · the swap | The same page under another masthead; the proof step | A place and a span for the proof |
| 10 | E3 · the other direction | Your data, our press | One page they already publish |
| 20 | E4 · close-out | None | A date, or a name |
| +90 | E5 · re-look | A new object in the catalogue | — |

### Line 4 — affiliates (creators, astrophotographers, societies, bloggers)

| Day | Email | The one new fact | The ask |
|---|---|---|---|
| 0 | E1 · the programme, for their channel | The ladder, the 90 days, euros | Apply (link) |
| 5 | E2 · the hundred seats | Lifetime 33%, claimed in order | Apply |
| 14 | E3 · close-out | None | — |

Then the lifecycle emails take over (received, approved, declined, first
sale, statement, payout, payout method, rate change, seat claimed, inactive).

**Hold:** nothing checks out on the shop today (no prices, no cart). Line 4
recruitment waits until a product sells. The lifecycle emails are needed the
day the first application arrives, which is already true. See README point 11.

## 3. The reply pipeline — what comes back, and what goes out

Every incoming email is classified into one of these, by a person (or by
Opus with a person approving). Each has a ready reply in the sequence files
(`R-` ids). The reply goes out within one working day, local time.

| Class | What they wrote | What we do | Reply |
|---|---|---|---|
| **YES** | "Send it", "let's talk", "book a call" | Book, or ask for the one thing we need | R-YES |
| **ASK** | A question | Answer in the first sentence; one question back | R-ASK-* per line |
| **INFO** | "Send more information" | The dossier / the sample list, by link | R-INFO |
| **NOT-NOW** | "Not this year", "we start in spring" | Thank; set the date; write on it | R-NOT-NOW |
| **WRONG-PERSON** | "Try X" or "not my area" | Thank; write to X with "Y suggested I write" | R-REFER |
| **HAVE-IT** | "We have a consultant / a tool / an agency" | One sentence on the difference; the ask stands | R-HAVE |
| **NO** | "Not interested" | Thank in one line; close with a date; no re-look | R-NO |
| **UNSUB** | "Remove me" / unsubscribe link | Suppress everywhere; one-line confirmation if they wrote it in words | R-UNSUB |
| **DNC** | "Do not contact us again" | Suppress; mark do-not-contact; **no reply** | — |
| **OOO** | Auto-reply | Nothing. Re-queue the next email for their return date | — |
| **BOUNCE** | Delivery failure | Mark; find the published address again; one retry | — |
| **HOSTILE** | Anger | No reply the same day. Erick reads it. One line, if any, the next day | R-SORRY |
| **ASTROLOGY** | They think we do horoscopes | Correct in one line; the ask stands | R-ASTRO |
| **HOW** | "How does it work inside?" | Say what they get; never how | R-HOW |
| **WHO-ELSE** | "Who else uses it?" | We do not name customers; the proof stands | R-WHO |
| **PRICE** | "What does it cost?" | By enquiry; the one input the quote needs | R-PRICE per line |

Rules of the pipeline:

1. The reply goes in the same thread.
2. The sequence stops the moment any human reply arrives. It never resumes
   on its own; a person decides the next email.
3. A reply that answers a question gets its own class (ASK) even if it also
   says yes. Answer first, then book.
4. Two unanswered replies from us is the limit. The third contact is a close.

## 4. The call, in its place

The CRM's own rule: email first, call one hour later, in their local
working hours, to the person on the card. The call script is DRAFT and is
Erick's to settle with Nicole. The sequence assumes the call happens on day 0
for tier-1 leads and not at all for tiers 2–3 unless they reply.

## 5. After the yes — the customer pipeline (Line 1 is written out; 2 and 3 reuse it)

| When | Email | What it does |
|---|---|---|
| Day 0 | C1 · welcome | What we need from them (place, date, shots, renderer, delivery) |
| On delivery | C2 · the file | What is in it, the method note, where the uncertainties are, who to write to |
| Day 15 | C3 · check-in | The three CRM questions: how it is working, how their people feel, what friction |
| On a report | C4 · a correction | Acknowledge in the first line; what we checked; what changed; the corrected file |
| Before the next project | C5 · next production | One question: what is next, and when |

The 15-day check-in is a call in the CRM (`checkin_questions`); C3 is the
email that books it or stands in for it.

## 6. Tone across the funnel

| Stage | Register |
|---|---|
| E1 | Formal, exact, short. We are strangers. |
| Follow-ups | The same register. One new fact each. Never warmer than they are. |
| Replies | Match their register one step more formal. If they write "Hi Nicole", we write "Dear Alex" once, then "Alex". |
| Customer | Plain and warm. First names. Still no praise words. |
| Close-out | Courteous and final. No guilt, no "last chance". |

## 7. What we measure

Per line, per market, per subject line, per sender: sent, delivered, replied,
reply class, booked, scoped, terms, won; unsubscribes and do-not-contacts.
Nothing per person beyond what the CRM already keeps. A market whose reply
rate is under a third of the median after 40 sends gets its localisation
re-read before anything else is changed.

## 8. The approval gate

Every send is a draft until Erick says yes for that item. The practical shape:

1. Opus localises a batch (brief §8) and returns each email with its checks.
2. The lint runs in the target language.
3. Nicole (or the line's sender) reads the batch and marks each one ready.
4. Erick approves the batch. The approval covers those emails, that day.
5. The system sends in each recipient's window.

A reply (R-*) follows the same gate. The ready replies exist so that the gate
is a yes, not a writing session.
