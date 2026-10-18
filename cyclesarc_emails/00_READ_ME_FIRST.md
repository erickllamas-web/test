# Cycles Arc — the outreach email programme

Written 2026-10-18 from the briefing pack (`cyclesarc_emails_fable_2026-10-18`).
Everything here is a draft for Erick: nothing is sent until he says yes for
that item. Every claim traces to a file in the pack; where the pack is
silent, the sequence file says RULING NEEDED and names the default written in.

## What is here

| File | What it is |
|---|---|
| `01_FUNNEL_AND_PIPELINE.md` | The stages, the order and day counts of the emails per line, the reply pipeline (what comes back → which ready reply), the customer pipeline after the yes, the tone per stage, the approval gate. |
| `02_VOICE_AND_RULES.md` | The writer's sheet: the four moves of every email, lengths, the voice, the ten send-blocking rules, subject lines, the first-email notice, links, the service standard. |
| `03_LOCALISATION_BRIEF_FOR_OPUS.md` | The standing instruction for Opus: the twelve layers that change, what never changes, market notes for every country in the lead files, the glossary, the legal notice per jurisdiction, the lint per language, the prompt and the output contract, the reviewer's pass. |
| `10_LINE1_PRODUCTION/SEQUENCE.md` | Production companies: E1–E6, the call, 15 replies, C1–C5 customer emails. |
| `20_LINE2_SUNCARE/SEQUENCE.md` | Sun-care brands: enterprise E1–E6, indie I1–I4, 11 replies, the customer shape. |
| `30_LINE3_WHITE_LABEL/SEQUENCE.md` | Organisations, under their name: E1 with eight desk hooks, E2–E5, 7 replies, the customer shape. |
| `40_LINE4_AFFILIATE/SEQUENCE.md` | The partner programme: recruitment E1–E3, 6 replies, 14 lifecycle emails A1–A14. |
| `50_LOCALISED_SAMPLES/` | Five worked localisations with the master, the localised email and every change explained: de-DE, fr-FR (Biotherm), ja-JP, es-MX, en-US. The standard for the rest. |
| `60_RENDERED/` | Four emails rendered in the live frames (sales and customer): L1-E1 English, L1-E1 Japanese, L2-E1 French, L4-A2. Open in a browser. |
| `manifest.json` | Every email id with line, kind, day, thread, frame, notice flag and file. 82 emails. |

**Count:** 24 outbound emails, 39 ready replies, 5 customer emails, 14
lifecycle emails; 82 in all, plus 5 localised samples.

## How it runs, in one paragraph

A card comes off the CRM. Opus localises the line's E1 for that person and
market (brief §8) and returns the email with its checks and the send window.
The lint runs in the target language. Nicole marks it ready; Erick approves
the batch; the system sends in the window and the call follows an hour later
for tier 1. The follow-ups go on the day counts unless a reply arrives;
any human reply stops the sequence and a person picks the ready reply
(funnel §3), localised the same way. A yes moves to scoping, then terms,
then the customer emails. Silence ends at the close-out and a re-look three
months on, with a new fact or not at all.

## What Erick rules before the first send

The pack's eleven open points, and where each is handled:

| # | Point | Where |
|---|---|---|
| 1 | Line 1: the free scene is withdrawn; what replaces it | L1 sequence, "The offer line". Default written: scope and terms on request. |
| 2 | Line 1: the call script is DRAFT, four "free scene" lines | L1 sequence, "The call" and open ruling 6. |
| 3 | Line 2: pricing shape | No price in any email. R-PRICE says the shape (per bottle on the run, a yearly licence, year one carries the campaign) without an amount. |
| 4 | Line 2: clouds | R-CLOUDY, versions A and B; no email mentions clouds otherwise. |
| 5 | Line 2: UV accuracy | No accuracy claim anywhere; the test offer in R-ACCURACY is held. |
| 6 | Line 2: "one dose in 38 min" | No minutes quoted anywhere. |
| 7 | Line 3: no price list, tiers or agreement | R-PRICE promises terms within a week; L3 open ruling 2. |
| 8 | Line 4: two pages contradict | The shop page is followed; L4 open ruling 1. |
| 9 | Line 4: payout channel and minimum | `{{method}}` and "a small minimum"; L4 open ruling 2. |
| 10 | Line 4: the degree labels | Not used in any email. |
| 11 | Line 4: what earns commission | "On what your link sells"; R-WHAT-EARNS; recruitment held until a product sells. |

And four more that the writing raised:

| # | Point | Where |
|---|---|---|
| 12 | The sender per line (Nicole for 1, 3, 4; the founder for enterprise sun-care is recommended) | Each sequence file, "Sender". |
| 13 | Korea and mainland China: consent for commercial email | Brief §6. Default: no cold email; the published business form. |
| 14 | A public page for the Stonehenge record, and whether the four-day contrast sheets are clean | L1 open rulings 3–4. |
| 15 | The CA3 lint ("referral") and CA2 (amounts) must exempt the Line 4 lifecycle templates, as they do for the sister brand's | L4 sequence, "Lifecycle". |

## Checks run on this folder

- The CA1–CA7 lint (the regexes from the CRM excerpt) and the voice sheet's
  banned words, over every email body: 0 hits.
- Every email: four moves, one ask, within its length.
- No price, no astrology word, no other brand, no engine word, no customer
  name, no "100 %", no exclamation mark, in any language written here.

## What is not here

- A lead file for Lines 3 and 4 (the CRM holds the creator shards; Line 3
  is to be mined).
- The localisations for the other 25 markets: the brief tells Opus how; the
  five samples are the standard.
- The signature blocks (the system adds them) and the unsubscribe mechanics
  (the frame carries them).
- The frames' own footer line ("A business email from Cycles Arc, sent to
  your work address.") and the word "Unsubscribe" are English in every
  render; localising them is a frame change, not a copy change (see the
  Japanese render).
- Anything about how the engine works. On purpose.
