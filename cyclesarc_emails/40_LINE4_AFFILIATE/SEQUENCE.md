# Line 4 — the partner programme: recruitment and the lifecycle

**Who:** creators, astrophotographers, bloggers, astronomy societies, science
educators, planner and stationery reviewers. No lead file in the pack; the
earlier creator shards exist in the CRM (the production file shows a
reclassified creator card).

**What:** the Cycles Arc partner programme as the shop page states it: 10 %
to start, 15 % and 20 % in a month where referred sales pass the rungs, 33 %
for life for the first hundred partners who reach the top rung in any single
month; a 90-day window from the click; paid monthly in euros once a balance
clears a small minimum; every book can be sampled free before purchase; no
cost to join; every application read by hand.

**Which page is the authority (RULING NEEDED, README point 8):** the shop
page (`CURRENT_shop_affiliates.html`) and the portal. The older cyclesarc.com
page (10/12/15 %, 30-day cookie, €72 minimum, bank transfer) contradicts it
and is still linked from the .com contact page. These emails follow the shop
page.

**What the emails never say:** the rung thresholds as euro amounts (the CA2
lint blocks any currency amount; the ladder is linked, not quoted); the
degree labels (360°, 720°, 1,000°; README point 10); the payout minimum (not
stated anywhere; README point 9); which payout channel (merchant of record
vs PayPal or Wise, README point 9: `{{method}}` until ruled); "every digital
product" vs "whatever your link sells" (README point 11: the emails say "on
what your link sells").

**Hold on recruitment:** nothing checks out on the shop today. Recruitment
(E1–E3) waits for the first sellable product. The lifecycle emails (A-) are
needed now: the application form is live and the privacy policy still says
"the programme is not open yet" while the shop page says "now open" (a
contradiction to fix on the sites).

**Sender:** recruitment from Nicole (sales frame, notice on E1). Lifecycle
from `affiliates@cyclesarc.com` (customer frame, no notice, signed "Cycles
Arc partner programme").

**Variables:** `{{first_name}}`, `{{channel}}` (their channel, blog, society,
podcast), `{{channel_hook}}`, `{{platform}}`, `{{audience_size}}`,
`{{apply_link}}` = cyclesarc.shop/affiliates.html, `{{portal}}` =
cyclesarc.shop/affiliate/, `{{seats_claimed}}`.

---

## Recruitment sequence

### L4-E1 · the programme, for their channel · day 0

**Subject:** Cycles Arc partner programme, for {{channel}}

Dear {{first_name}},

{{channel_hook}}

Cycles Arc makes prints, agendas, planners and maps computed from the real
sky for one place and one date; every book can be sampled free before anyone
buys. The partner programme pays you on what your link sells: 10 % to start,
climbing with what you refer in a month, and 33 % for life for the first
hundred partners who reach the top rung. Anyone who buys within 90 days of
clicking your link is yours. Paid monthly in euros. It costs nothing to
join.

The ladder and the form are at {{apply_link}}. We read every application by
hand.

Kind regards,

*Notice (first email only):* as Line 1.

*Channel hooks (examples):*
- "Your {{platform}} channel shows the night sky to {{audience_size}} people, and the plates they ask about are the kind we make."
- "Your society's members buy a planner every year. One with the real sky on every page, for {{city}}, exists."
- "Your blog reviews dated planners. Ours carries sunrise, sunset, the twilight bands and the moon on every day page."

### L4-E2 · the hundred seats · day 5 · same thread

Dear {{first_name}},

One fact I left out. The top of the ladder is a permanent seat: reach the
top rung in any single month and you keep 33 % on what your link sells for
as long as you are a partner. There are one hundred seats, claimed in order,
and {{seats_claimed}} are claimed so far.

The application takes two minutes: {{apply_link}}.

Kind regards,

### L4-E3 · close-out · day 14 · new subject

**Subject:** Last note on the partner programme

Dear {{first_name}},

Last note from me. The page stays where it is, {{apply_link}}, and the
hundred seats are claimed in order. If it is not for {{channel}}, no reply
is needed.

Kind regards,

---

## Reply pipeline (R-)

### R-COMMISSION · "how does the rate work?"

Dear {{first_name}},

Your rate is set by your referred sales in a calendar month, and the higher
rate applies to the whole month, including the sales before you crossed the
rung. Each commission keeps the rate it was earned at; a later month never
rewrites it. The rungs are on the page, {{apply_link}}.

Kind regards,

### R-WINDOW · "how long does the cookie last?"

Dear {{first_name}},

Ninety days from the click. Anyone who buys within that window is credited
to you, not only the first visit.

Kind regards,

### R-PAYOUT · "how and when am I paid?"

Dear {{first_name}},

Monthly, in euros. Commission confirms once the buyer's return window
closes, balances are tallied at month end, and a payout goes out once the
balance clears a small minimum, by {{method}}. You set your payout method in
the portal after approval.

Kind regards,

*`{{method}}` and the minimum: README point 9, Erick to rule.*

### R-WHAT-EARNS · "does it pay on everything?"

Dear {{first_name}},

On what your link sells in the shop. Prints are shown in the shop but do not
sell yet; the books and feeds do. {{update when prints sell}}

Kind regards,

### R-RESELL · "can I sell your books myself?"

Dear {{first_name}},

No. The programme is a right to refer, not a right to resell: your link
sends people to the shop and you earn on what they buy there. Copying,
bundling or selling the files is not part of it, for partners as for anyone.

Kind regards,

### R-AUDIENCE-SMALL · "my audience is small"

Dear {{first_name}},

There is no minimum. Applications are read for where you share and whether
the people there would want a plate or a planner of the real sky, not for
the size of the number.

Kind regards,

### R-NO, R-UNSUB, R-ASTRO, R-SORRY

As Line 1.

---

## Lifecycle (A-) · customer frame · from affiliates@cyclesarc.com

The six that exist for the sister brand are rebranded on the server
(received, approved, declined, sale, payout, payout method). These are the
Cycles Arc versions in full, plus the six that do not exist yet (first sale,
statement, rate change, seat claimed, inactive, incomplete). Amounts appear
in these by design; the CA2 lint must exempt the affiliate transactional
templates, as it does for the sister brand's.

### L4-A1 · application received

**Subject:** Your application to the Cycles Arc partner programme

Dear {{name}},

Thank you. We read every application by hand and reply by email, usually
within {{review_days}} working days. Applying subscribes you to nothing.

Cycles Arc partner programme

### L4-A2 · approved

**Subject:** You're in: your Cycles Arc partner link

Dear {{name}},

Welcome to the programme. Your link is {{referral_link}}.

Your portal is at {{portal}}. Sign in with this address and we email you a
one-time link; there is no password.

Your rate starts at 10 % and climbs with what you refer in a calendar month;
the ladder is on the page. Anyone who buys within 90 days of clicking your
link is credited to you.

Before your first payout, set your payout method in the portal.

Cycles Arc partner programme

### L4-A3 · declined

**Subject:** About your application

Dear {{name}},

Thank you for applying. We are not taking the programme further with
{{channel}} right now. You are welcome to apply again later; we keep what
you sent for twelve months and then delete it.

Cycles Arc partner programme

### L4-A4 · application incomplete

**Subject:** One thing missing from your application

Dear {{name}},

Your application is missing {{field}}. Reply with it and we continue the
review from there.

Cycles Arc partner programme

### L4-A5 · first referred sale (once)

**Subject:** Your first referred sale

Dear {{name}},

Your link made its first sale. Order {{order_id}}, {{sale_amount}}; your
commission {{commission}} at {{rate}} %. It confirms once the buyer's return
window closes on {{confirm_date}}, and then it counts toward your payout.

Your earnings are in the portal, {{portal}}.

Cycles Arc partner programme

### L4-A6 · a sale (each)

**Subject:** A sale through your link, order {{order_id}}

Dear {{name}},

Order {{order_id}}. Sale {{sale_amount}}. Your commission {{commission}} at
{{rate}} %. Confirms on {{confirm_date}}.

Earnings: {{portal}}.

Cycles Arc partner programme

### L4-A7 · monthly statement

**Subject:** Your {{month}} statement

Dear {{name}},

{{month}}: {{n_sales}} referred sales, {{referred_total}} in sales, your
rate {{rate}} % for the month, {{commission_total}} earned, {{confirmed}}
confirmed, {{balance}} owed.

{{payout_line: "A payout of {{amount}} goes out on {{date}}." or "Your
balance is below the payout minimum and carries over."}}

The statement is in your portal, {{portal}}.

Cycles Arc partner programme

### L4-A8 · payout sent

**Subject:** Payout sent, {{period}}

Dear {{name}},

We sent {{amount}} for {{period}} by {{method}} on {{date}}. It usually
arrives within {{arrival_days}} working days. The statement is in your
portal.

Cycles Arc partner programme

### L4-A9 · payout method needed

**Subject:** One thing before we can pay you

Dear {{name}},

You have {{balance}} owed and no payout method on file. Set one in your
portal, {{portal}}, and the next payout run includes you.

Cycles Arc partner programme

### L4-A10 · rate change (rise or peak)

**Subject:** Your rate this month: {{rate}} %

Dear {{name}},

Your referred sales in {{month}} passed the {{rung_name}} rung. Your rate
for the whole of {{month}} is {{rate}} %, applied to every sale in the
month, including the ones before you crossed it.

Cycles Arc partner programme

### L4-A11 · seat claimed

**Subject:** Seat {{seat_number}} of one hundred is yours

Dear {{name}},

In {{month}} your referred sales reached the top rung. Seat {{seat_number}}
of the hundred is yours: 33 % on what your link sells, for as long as you
are a partner, whatever later months bring.

Cycles Arc partner programme

### L4-A12 · inactive (sixty days without a click)

**Subject:** Your link is quiet

Dear {{name}},

Your link has had no clicks for sixty days. Nothing has changed on our
side; your rate and your seat, if you have one, stay as they are.

If something would help, a page to point to or a sample to show, write back
and tell us what.

Cycles Arc partner programme

### L4-A13 · payout failed (the transfer bounced)

**Subject:** Your payout came back

Dear {{name}},

The payout of {{amount}} for {{period}} came back from {{method}}. The
amount is owed to you again and goes out in the next run. Please check the
payout details in your portal, {{portal}}.

Cycles Arc partner programme

### L4-A14 · sign-in link (exists; wording only)

**Subject:** Your sign-in link

Dear {{name}},

Here is your one-time sign-in link: {{magic_link}}. It works once and for
fifteen minutes. If you did not ask for it, ignore this email.

Cycles Arc partner programme

---

## Open rulings on this line (Erick)

1. The shop page as the authority; the .com page retired and the .com
   contact link repointed.
2. The payout channel and the minimum (`{{method}}`, "a small minimum").
3. What earns commission while prints do not sell.
4. The degree labels on the rungs (not used in any email; a ruling still
   closes the question on the page).
5. The privacy policy's "not open yet" line against the page's "now open".
6. Recruitment waits for the first sellable product.
