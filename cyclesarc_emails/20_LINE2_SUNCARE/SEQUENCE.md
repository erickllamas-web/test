# Line 2 — sun-care brands: the bottle that reads the sun

**Who:** two tracks. **Enterprise:** 115 companies ranked per market (Asia 36,
Europe 31, US 27, Middle East 21), 480 named people with role and source;
L'Oréal Groupe is rank 1 in Europe with brand-level presidents named for
Biotherm (Waterlover sun line), Kiehl's and CeraVe. **Indie:** 81 founder-led
sunscreen brands (US 36, Korea 15, Australia 7, UK 5, Canada 4, Mexico 3,
others), most with a founder's published address.

**What:** a code on the bottle opens one page for the person holding it: the
UV where they stand, how long unprotected skin has before one sunburn dose,
and when to reapply. Computed for their place and that second, each figure
with its publisher. No app, no account, nothing typed. We store nothing about
the person; the brand receives a count of active users per print run per
month. One key per print run, expiring with the batch.

**What the emails never say:** a price (the per-bottle fee, the licence and
the exclusivity are for the room and the terms PDF); minutes ("one dose in
38 min" is not confirmed on the live card, README point 6); an accuracy
figure (the UV reading was ~30 % low on 2026-10-01 and no document says it
closed, README point 5); clouds either way (README point 4: the blueprint's
"no clouds" line may be out of date; R-CLOUDY carries both versions for
Erick to choose); any brand's name other than the recipient's.

**Sender (RULING NEEDED):** the pitch is Erick's. Recommended: enterprise
emails from Erick as founder, indie emails from Nicole. The signature is the
system's either way. Frame: `cyclesarc_sales.html`, notice on E1/I1 only.

**Variables:** `{{salutation}}` (the localiser's form of address),
`{{first_name}}`, `{{brand}}` (the brand the person owns), `{{company}}`,
`{{sun_line}}` (their sun product or line), `{{market}}`, `{{product_focus}}`
(indie card), `{{next_season}}`, `{{dossier_link}}`, `{{source_host}}`.

**Timing:** by hemisphere and market (funnel §2). Northern brands:
September–January. Southern: March–June. Gulf and South-East Asia: year-round,
outside Ramadan and the monsoon. Korea and mainland China: held for Erick's
ruling on consent (localisation brief §6).

---

## Enterprise sequence

### L2-E1 · the bottle, in three figures · day 0

**Subject:** Every {{sun_line}} bottle, reading the sun above it

Dear {{salutation}},

A code on the {{sun_line}} bottle opens one page for the person holding it:
the UV where they stand, how long unprotected skin has before one sunburn
dose, and when to reapply. Computed for their place and that second, each
figure with its publisher. No app, no account, nothing typed.

We keep nothing about your customers: no name, no position, no request. You
receive one count: how many people used the bottle, per print run, per
month.

The first sun-care brand with it owns the difference on the shelf. Would you
give twenty minutes to see it on your own phone?

Kind regards,

*Notice (first email only):* Where we found your details. Your name and role
are published at {{source_host}}. We write to you, business to business,
about one thing we think fits your brand. Unsubscribe below and we will not
write again.

### L2-E2 · the privacy sentence · day 5 · same thread

Dear {{salutation}},

One paragraph your legal team can read in a minute, on the {{sun_line}}
bottle.

The page stores nothing about the person who scans: no name, no account, no
position, no request contents. The bottle's code is one key per print run,
and it expires with the batch. What {{brand}} receives is a count of active
users per batch per month, and nothing that could identify one of them.

That paragraph goes into the contract as written. Who on your side should
read it first?

Kind regards,

### L2-E3 · the campaign that is already made · day 12 · same thread

Dear {{salutation}},

The code is not a feature on the pack. It is a campaign that is already
made: "scan the bottle" works on a poster, in a spot and on the shelf, and it
keeps working on every unit all season after the ads stop.

Year one is the launch and the campaign concept, built with your team. From
year two the page simply runs.

Which market would {{brand}} launch it in first?

Kind regards,

### L2-E4 · what it does not do · day 21 · same thread

Dear {{salutation}},

What the page will not do, said before anyone asks.

It reads for unprotected skin, and it says so. It does no SPF arithmetic:
"with SPF 50 you have four hours" is your claim, never our computation. It
gives no skin-type advice and makes no medical claim. The UV index and the
dose are WHO and ISO quantities, and the page names its sources.

Those lines are what lets a sun-care brand print it. The dossier is at
{{dossier_link}}.

Would you like it sent to {{legal_or_packaging_name}} as well?

Kind regards,

### L2-E5 · close-out · day 35 · new subject

**Subject:** Last note on the {{sun_line}} bottle

Dear {{salutation}},

This is my last email on the bottle. The dossier stays at {{dossier_link}},
and the offer stands for {{brand}}'s next season.

If the timing is wrong, tell me when to write again. If it belongs on
another desk, a name is enough. Thank you for your time.

Kind regards,

### L2-E6 · re-look · before their next season (silence only)

**Subject:** Before the {{next_season}} run

Dear {{salutation}},

Before {{brand}} fixes the {{next_season}} print run: {{new_fact}}. The
offer is unchanged: one page on every bottle, nothing stored about the
person, one count for you.

Is there a run in {{market}} the code could go on?

Kind regards,

---

## Indie sequence (founder-led brands)

### L2-I1 · the bottle, founder to founder · day 0

**Subject:** Your bottle, reading the sun

Dear {{first_name}},

You make {{product_focus}}, and you sell it to people who are standing in
the sun when they decide whether to reapply. A code on your bottle opens one
page: the UV where they stand, how long unprotected skin has before one
sunburn dose, and when to reapply. Computed for their place and that second,
each figure with its publisher. No app, nothing to install.

We keep nothing about your customers; you get a monthly count of people who
used the bottle.

Would you try it on your own phone? I will send you a code.

Kind regards,

*Notice: as L2-E1.*

*Open: the demo code for a prospect needs a route that issues a short-lived
key per prospect (README leaves the live code sheets out of this pack on
purpose). Until it exists, the ask is "twenty minutes on a video call, and I
will scan it on mine".*

### L2-I2 · the two things founders ask · day 5 · same thread

Dear {{first_name}},

Two things founders ask first.

What we store about your customers: nothing. No name, no position, no
request. You get a count of people who used the bottle, per print run, per
month.

How it ships: the code in your colours at your label sizes, proofs on your
label stock, one key per print run that expires with the batch. Weeks, not
quarters, and nothing runs on your side.

Which print run is next?

Kind regards,

### L2-I3 · close-out · day 12 · new subject

**Subject:** Last note on your bottle

Dear {{first_name}},

Last note from me. The offer stands for your next run: one page on every
bottle, nothing stored about the person, a count for you. If the timing is
wrong, tell me when to write again.

Thank you for reading.

Kind regards,

### L2-I4 · re-look · before their next season

As L2-E6, with `{{first_name}}`.

---

## Reply pipeline (R-)

### R-YES · "show me"

Dear {{salutation}},

Thank you. Two things make the twenty minutes worth it: a phone, and the
name of one product line with a print run coming. I will show the page live
on your phone and the dossier page for that line.

{{slot_1}} or {{slot_2}} in your time work for me. Which suits?

Kind regards,

### R-PRICE · "what does it cost?"

Dear {{salutation}},

It is priced on the run: a per-bottle fee on the print run, invoiced at the
batch, and a yearly licence per brand and market. Year one carries the
launch and the campaign concept; from year two it is the licence and the
per-bottle fee.

The one input the quote needs is the run size for the market you would
start in. What is it, roughly?

Kind regards,

### R-EXCLUSIVITY · "could we have it exclusively?"

Dear {{salutation}},

Yes, by category and by market. Exclusivity is a separate agreement from the
licence, priced from the market we would forgo in that country, and paid
once. It is not in the standard terms, and I would rather discuss it in the
room than in writing.

Which market are you thinking of?

Kind regards,

### R-LEGAL · "our legal team will have questions" / "what about health claims?"

Dear {{salutation}},

There are no health claims on the page. The UV index and the dose are WHO
and ISO quantities, the page names its sources, and the two lines it never
crosses, unprotected skin and no SPF arithmetic, are written into the
contract.

On data: the page stores nothing about the person who scans, and {{brand}}
receives a count per batch per month. The privacy notes are in the dossier,
and we will sit with your legal team for as long as they need.

Who should I send the dossier to?

Kind regards,

### R-CLOUDY · "what if it's cloudy?" (RULING NEEDED: one of the two)

*Version A, if the page reads clear sky:*

Dear {{salutation}},

The page says what it reads: the clear-sky number, which is the cautious
number for sunscreen. A cloudy morning can still burn, and the page errs on
the side a sun-care brand wants to be on.

Kind regards,

*Version B, if the live card reads the weather:*

Dear {{salutation}},

The page reads the sun through the sky as it is where the person stands,
and it says how sure it is. A cloudy morning can still burn, and the page
says so.

Kind regards,

### R-ACCURACY · "how accurate is the UV number?"

Dear {{salutation}},

Each figure names its publisher and its range. The UV index and the dose are
WHO and ISO quantities; the minimal dose is shown as the ISO range, not one
number per skin type. We never give a value without its range.

{{if cleared by Erick: If your team wants to test it against your own meter,
I will send a code.}}

Kind regards,

*Hold the test offer until the UV reading check (README point 5) is closed.*

### R-COPY · "can a competitor copy it?"

Dear {{salutation}},

The code, yes. The page behind it, no: the computation, its sources and its
exactness are ours, and a copy would be a code that sends people to a
website. The first brand in the category has the season's head start, and
the second is catching up on a feature the first one owns.

Kind regards,

### R-QR-TIRED · "QR codes are tired"

Dear {{salutation}},

Tired codes go to a website. This one pays out in one second with a number
about the sun above your head, for the place you are standing in.

Would you scan one and judge it that way?

Kind regards,

### R-NDA · "we need an NDA first" / "procurement will be in touch"

Dear {{salutation}},

Send the NDA and I will return it signed. For procurement: the per-bottle
line is audited to the unit at batch mint, and the data paragraph is one
paragraph. Both are in the dossier, and I will walk them through it.

Kind regards,

### R-HAVE-APP · "we have an app for that"

Dear {{salutation}},

Keep the app. The bottle page is for the person who will never install it:
no account, no download, one scan in the sun, on every unit you ship.

Kind regards,

### R-NOT-NOW · "the season is set"

Dear {{salutation}},

Thank you for telling me. I will write again on {{date}}, before the
{{next_season}} run is fixed, and not before.

Kind regards,

### R-REFER, R-NO, R-UNSUB, R-WHO-ELSE, R-HOW, R-ASTRO, R-SORRY

As Line 1, with `{{sun_line}}` for `{{project}}` and "the bottle" for "the
file". R-WHO-ELSE: "We do not name brands we work with."

---

## Customer pipeline

After the yes, Line 1's C1–C5 shape applies with the bottle's nouns:

- **C1 welcome:** what we need: the label sizes and stock, the brand colours,
  the print runs with their expiry, the market, who signs the legal pack.
- **C2 proofs:** the code baked at every size, the scan test on three phones,
  the print proof on their stock, the legal pack for signature.
- **C3 first report:** the first monthly count, per batch, with what it does
  and does not say.
- **C4 a correction:** as Line 1.
- **C5 next run:** before each batch mint, one question: the run size and
  the expiry.

---

## Open rulings on this line (Erick)

1. The sender for enterprise emails.
2. A demo route for prospects (a short-lived key per prospect) or the
   video-call fallback.
3. R-CLOUDY: version A or B.
4. The UV reading check closed, before any test offer.
5. Korea and mainland China: consent regime (brief §6). Default: no cold
   email; the published business form instead.
6. A public link for the dossier (`{{dossier_link}}`), or send on request
   from `50_PRODUCT_SAMPLES/clean_to_send/QR_OBJECT_bottle_dossier_white_label.pdf`.
7. For L'Oréal specifically: the people file marks the Middle East managers
   "NOT a target" and names the brand presidents (Biotherm, Kiehl's) and the
   open-innovation routes. Recommended first door: Biotherm, in French, the
   Waterlover line as `{{sun_line}}`. The fr-FR sample is written for it.
