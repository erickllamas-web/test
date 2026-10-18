# Line 3 — organisations: under your name

**Who:** the eight desks the organisations page names: publishers and
newspapers; stationery and planner brands; planetariums, museums and dark-sky
parks; tourism boards and event organisers; sleep clinics, airlines,
hospitals, mines; architects, solar installers, growers; schools and
universities; software and media products. No lead file for this line is in
the pack; the cards come from the CRM when mined.

**What:** everything Cycles Arc publishes under its own name, published under
theirs: almanacs and calendars, planners, agendas and journals, plates and
infographics, maps, circadian reports, calendar feeds; or the numbers
themselves, by API, at volume. Set to their place and dates, their type and
palette, delivered print-ready or as a live feed. Sources named on the page;
the method note stays ours. No astrology. Nothing retained.

**The proof step is live site copy** ("We set a proof: a real page for your
place and dates, in your mark and colours. You see the actual thing before
anything is agreed."). It is kept in these emails. If Erick's "no demo"
ruling (README point 1) extends to this line, the proof lines in E1, E2 and
R-YES become "we send a page from our own press with your masthead
illustrated on it" and the ask becomes the paragraph about what they publish.

**Sender:** Nicole Falla. Replies land at `enterprise@cyclesarc.com` (the
address the site prints). Frame: `cyclesarc_sales.html`, notice on E1 only.

**Variables:** `{{first_name}}`, `{{organisation}}`, `{{desk}}` (one of the
eight), `{{desk_hook}}` (below), `{{publication_or_line}}`, `{{city}}`,
`{{venue}}`, `{{event}}`, `{{place}}`, `{{date}}`, `{{year}}`, `{{month}}`,
`{{campus}}`, `{{source_host}}`.

---

## Outbound sequence

### L3-E1 · the first email · day 0

**Subject:** {{publication_or_line}}, with the real sky in it

Dear {{first_name}},

{{desk_hook}}

Everything Cycles Arc publishes under its own name can be published under
yours: set to your place and dates, in your type and your colours, delivered
print-ready or as a live feed. Every page names its sources, and the method
note at the foot is the only thing that stays ours.

Before anything is agreed, we set a proof: a real page for your place and
dates, in your mark. You see the thing itself.

What do you publish, and for whom? A paragraph is enough to start.

Kind regards,

*Notice (first email only):* as Line 1.

**The eight desk hooks** (one goes in `{{desk_hook}}`; the localiser keeps the
fact and the desk's own trade words):

1. *Publishers and newspapers.* Your year-end edition carries an almanac page.
   Ours would carry every eclipse, moon and meteor peak of {{year}} over
   {{city}}, computed for the place, not copied from a table.
2. *Stationery and planner brands.* Your dated line goes to print in
   {{month}}. A planner with the real sky on every day page, sunrise, sunset,
   the twilight bands and the moon for one place, exists today at 456 pages,
   and it can ship as yours.
3. *Planetariums, museums, dark-sky parks.* Visitors to {{venue}} ask what is
   up tonight. A visitor guide or a teaching plate set for {{venue}}'s own
   horizon answers it, under {{venue}}'s name.
4. *Tourism boards and event organisers.* The {{event}} over {{place}} on
   {{date}} has one set of true numbers: when, where in the sky, how high,
   for that place. A page or a feed under your name gives them to every
   visitor.
5. *Sleep clinics, airlines, hospitals, mines.* Your {{crews_or_patients}}
   work against the clock. A shift rotation, a jet-lag plan for a route or a
   light schedule for a latitude, every window traced to named research, can
   carry your name.
6. *Architects, solar installers, growers.* Your proposals carry a sun path.
   Ours is computed for the site and the year, with the daylight curve and
   the insolation through the seasons, drawn in your house style.
7. *Schools and universities.* The sky over {{campus}} this term is not a
   stock diagram. A plate or a feed set for the campus horizon can go out
   under the department's name.
8. *Software and media products.* Your product shows dates for the sky, the
   body clock, the earth or the weather. The same numbers are available at
   volume, by API, with named sources and nothing retained. Sky and Body are
   live today; Earth and Weather follow.

### L3-E2 · the swap · day 4 · same thread

Dear {{first_name}},

The same page under another masthead: nothing about the computation changes
when the name on the sheet does. The eclipse table on our organisations page
is a real page from our own press. With your masthead it is your page, set
to your place, your dates and your type.

Give me one place and one span and we set the proof: a real page, in your
mark, before anything is agreed.

Which place, and which span?

Kind regards,

### L3-E3 · the other direction · day 10 · same thread

Dear {{first_name}},

You do not need our numbers to use our press. Bring the tables, schedules or
calendar you already publish and we typeset them to the standard of our own
catalogue, print-ready, in your mark, on your schedule. Where our computed
data would improve a page we say so and show it beside yours; where it would
not, we leave your numbers alone.

Which page of yours would you want to see set first?

Kind regards,

### L3-E4 · close-out · day 20 · new subject

**Subject:** Last note on {{publication_or_line}}

Dear {{first_name}},

This is my last email on this. The offer stays where it is, on
cyclesarc.com under "For organisations", and the proof is still the first
step whenever you want it.

If the timing is wrong, tell me when to write again. If it is the wrong
desk, a name is enough. Thank you for your time.

Kind regards,

### L3-E5 · re-look · day 110 (silence only)

**Subject:** A new object for {{publication_or_line}}

Dear {{first_name}},

Three months ago I wrote about {{publication_or_line}}. Since then
{{new_fact}}: {{new_object_in_one_line}}.

The first step is unchanged: one place and one span, and we set a proof.

Is there an edition this year it could go into?

Kind regards,

---

## Reply pipeline (R-)

### R-YES · "tell me more" / "let's do a proof"

Dear {{first_name}},

Thank you. For the proof I need five things, a line each: the object (an
almanac page, a planner, a plate, a map, a schedule, a feed), the place or
places, the span, the audience, and roughly how many.

With those we set a real page in your mark within {{proof_lead_time}} and
send it with the method note drafted. Nothing is agreed until you have seen
it.

Kind regards,

### R-PRICE · "what does it cost?" / "send a price list"

Dear {{first_name}},

There is no list. Each imprint is priced on the object, the span and the
volume, so the number for a yearly almanac insert and the number for a
planner line are different numbers. The proof comes first; the terms follow
it within a week, written for what you actually publish.

What is the object, and roughly how many?

Kind regards,

### R-SAMPLES · "can I see examples?"

Dear {{first_name}},

Yes. The finished pages are on the shop, cyclesarc.shop, where every book
can be sampled, and the organisations page shows the eclipse table under an
illustrative masthead. If a PDF is easier, I will send a yearly planner, an
agenda and a plate.

Which of them is closest to what you publish?

Kind regards,

*Send only from `50_PRODUCT_SAMPLES/clean_to_send/`.*

### R-RESELL · "can we resell your books?" / "do you do wholesale?"

Dear {{first_name}},

Two different things, and the second is the one for you. The shop's own
files are sold for personal use and cannot be resold. Publishing under your
name is a different agreement: the object is set for your place and dates,
carries your mark, and you publish it as yours. The terms are written per
imprint.

What would you publish, and to whom?

Kind regards,

### R-MINIMUM · "is there a minimum run?"

Dear {{first_name}},

Not for the proof. The terms scale with the volume, and a one-off edition
and a monthly insert are both normal.

Kind regards,

### R-API · "we want the data, not the pages"

Dear {{first_name}},

Then take the numbers. Four families, Sky and Body live today, Earth and
Weather following; one request each, plain JSON, named sources, nothing
retained. Access is per account rather than self-serve: tell me which
families and roughly what volume, and we come back with a key and terms.

Kind regards,

### R-DATA-OURS · "we have our own data; we just need it typeset"

Dear {{first_name}},

That is the other direction, and we do it: your tables, our press, to the
standard of our own catalogue, in your mark. Send one page you already
publish and we set it.

Kind regards,

### R-NOT-NOW, R-REFER, R-NO, R-UNSUB, R-WHO-ELSE, R-HOW, R-ASTRO, R-SORRY

As Line 1, with `{{publication_or_line}}` for `{{project}}` and "the proof"
for "the file".

---

## Customer pipeline

After the yes, Line 1's shape with the press's nouns:

- **C1 welcome:** the five things (object, places, span, audience, volume)
  plus the mark files, the type and the palette, and the delivery schedule.
- **C2 the proof delivered:** the page, the method note, what is still
  illustrative on it.
- **C3 after the first edition:** the three questions.
- **C4 a correction or a reprint:** acknowledged in the first line; the
  corrected file; the method note updated.
- **C5 the next edition:** one question, before the next deadline.

---

## Open rulings on this line (Erick)

1. Whether the proof step stands (site copy) or the "no demo" ruling
   applies here too.
2. There is no white-label price list, tiers or partner agreement
   (README point 7). R-PRICE promises terms "within a week"; someone has to
   be able to write them.
3. `{{proof_lead_time}}`.
4. The lead file for this line.
