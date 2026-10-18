# Voice and rules — every Cycles Arc email

This is the writer's sheet. The localiser (Opus) reads it too: everything here
survives translation. Where this sheet and a sequence file disagree, this sheet
wins; where this sheet and Erick's rulings disagree, Erick wins.

## 1. The shape of every outbound email

Four moves, in this order, and nothing else:

1. **Their thing.** One sentence about *their* project, bottle, publication or
   channel. Specific: a name, a place, a date, a product line. Never "I came
   across your company".
2. **What they get.** One or two sentences. What the file, the page, the proof
   or the programme gives them. Nouns, not adjectives.
3. **One fact that makes it credible.** A sourced number, the privacy sentence,
   the Stonehenge alignment, the ladder. One, not three.
4. **One ask.** A question they can answer in one line. Never two asks.

Lengths (body only, greeting and ask included):

| Email | Words, at most |
|---|---|
| First email | 120 |
| Follow-up | 90 |
| Close-out | 60 |
| Reply to an incoming email | 90, and the answer is the first sentence |
| Customer / transactional | 90 |

A follow-up **adds one new fact**. It never says "just following up",
"circling back", "bumping this" or "in case you missed it". If there is no new
fact, there is no email.

## 2. Voice

- One factual sentence per idea. Full stops, not semicolons.
- Second person for them, "we" for Cycles Arc. The sender signs as a person
  (the signature is added by the system; never type it).
- Plain words. Say what the thing *does*, never how it is built.
- No praise words: beautiful, stunning, amazing, incredible, world-class,
  cutting-edge, revolutionary, game-changing, seamless, powerful, unique.
- No sales words: leverage, synergy, solution, unlock, elevate, empower,
  journey, reach out, touch base, quick question, win-win.
- No openers: "I hope this finds you well", "Hope you're well", "My name is",
  "I wanted to", "I'm reaching out because".
- No exclamation marks. No emojis. No ALL CAPS. No bold inside a body.
- No urgency theatre: "limited time", "only a few left", "act now". The
  affiliate seats are limited in fact; say the number, not the pressure.
- Numbers carry their source or their uncertainty, or they stay out.
- "Never" and "always" only when true in fact.
- British spelling in the master (the frames are `en-GB`); the localiser sets
  the spelling per market (en-US for the United States and Canada).

## 3. Send-blocking rules (the lint, CA1–CA7, as words)

| Rule | Never | Say instead |
|---|---|---|
| CA1 | astrology, horoscope, zodiac, star sign, sun sign, birth chart, natal chart | Cycles Arc is astronomy: the real sky, sun and light over a place on a date. |
| CA2 | any price, currency amount, "from €…" | Priced per production / per brand / per imprint, by enquiry. |
| CA3 | coupon, promo code, discount, free trial, free month | (Line 1: the free scene is withdrawn; see the sequence file.) |
| CA4 | "we render", "we make your shots", "rendering service" | We give the light to the people who render. |
| CA5 | 100% accurate, perfectly accurate, zero error, error-free | Every value carries its source and its uncertainty. |
| CA6 | any engine, method, daemon or internal name | Say what the file gives them. |
| CA7 | any other Kairoi brand | Name only Cycles Arc. |

Three more, from the rulings and the sites:

| Rule | Never |
|---|---|
| CA8 | Name another customer, client or prospect. ("Never name another customer.") |
| CA9 | Promise a render, a result, a ranking, a sale. We sell data, pages, proofs and a programme. |
| CA10 | Attach a file on a first email. Link to cyclesarc.com; attach only when they ask. |

The localiser's lint lists (the same seven rules in each language) are in
`03_LOCALISATION_BRIEF_FOR_OPUS.md` §7.

## 4. Subject lines

- Sentence case. No colon tricks, no "Re:" on a first email, no "[Company]"
  brackets in English (Japanese is the exception, see the localisation brief).
- Specific to them. The pattern that works is *the thing over the place at
  the time*: "The sky over Göbekli Tepe, 9600 BC". "Every Waterlover bottle,
  reading the sun above it". "The Observer's almanac pages, computed".
- Under 60 characters where the language allows.
- Follow-ups keep the thread (reply in the same thread) so the subject stays.
  The close-out gets its own subject.
- A preheader (the first line the inbox shows) is the first sentence of the
  body; never write a separate teaser.

## 5. Greeting and sign-off (master, English)

- Greeting: `Dear {{first_name}},` when the person is named. When no person is
  named: `Dear {{organisation}} team,` — and the card says which role to ask
  for, so the first line asks to be passed on.
- Sign-off: `Kind regards,` then the system signature. No "Best", no "Cheers",
  no "Warmly".
- Replies to an incoming email: `Dear {{first_name}},` on the first reply,
  then `{{first_name}},` once they have used first names.

## 6. The first-email notice

Appears once, on the first email only, in the `{{notice}}` slot of the sales
frame. Master text:

> **Where we found your details.** Your name and work address are published at
> {{source_url_host}}. We write to you, business to business, about one thing we
> think fits your work. Unsubscribe below and we will not write again.

The localiser rewrites this per jurisdiction (brief §6). Customer and
affiliate emails use the customer frame, which has no notice.

## 7. Links and attachments

- Links go to cyclesarc.com or cyclesarc.shop only. No tracking parameters
  beyond what the system adds. No shortened links.
- One link per email at most, in the sentence it belongs to, as words, never
  as a bare URL.
- PDFs (the bottle dossier, the samples) are sent on request, as a reply, from
  `50_PRODUCT_SAMPLES/clean_to_send/` only. Never the `DO_NOT_SEND` folder.
- No images beyond the frame's logo. The Stonehenge contrast sheet is linked
  from cyclesarc.com once a page for it exists (open point, see README).

## 8. Service standard (what "great service" means in writing)

- Every incoming email gets a reply from a person within **one working day in
  the recipient's time zone**. Out-of-office replies are not incoming emails.
- The answer is the first sentence. The courtesy comes after.
- One question asked back at most.
- A "no" is thanked in one line and the record is closed with a date. A "not
  now" gets a date to write again, and we write on that date, not before.
- "Do not contact" is honoured in every brand, every line, every channel.
- We never argue with a refusal and never ask why.
- We never send a second email to the same person in the same week unless
  they wrote to us.
- Nothing goes out without Erick's yes (rule 1 of the standing rules). Drafts
  are free; sending is not.
