# Catholic Leaders in Action — public fact verification

Verified: 2026-08-14 (America/Los_Angeles)

## Scope and source standard

This note rechecks only the public, time-sensitive facts needed for the website build. Claims come from first-party sources: the Catholic Leaders in Action (CLA) website, the Archdiocese of San Francisco, and the supplied destination pages. Agent Reach was used for its required web/Instagram routing. Its Instagram OpenCLI backend was not connected and the read command did not return profile or post data, so this note makes no claims about Instagram content.

## Current official website state

- The [official CLA landing page](https://catholicleadersinaction.org/) still labels **“Called to Lead”** as **“NEXT EVENT”** and gives **June 2, 2026, 7–9 PM, St. Philip Catholic Church Hall, San Francisco**, with Ryan Mayer as speaker and a Luma RSVP link.
- The page also displays **“Formation · Action · Prayer”** and the positioning **“A community of young Catholics rooted in Christ, leading with conviction.”**
- The live page responded with HTTP 200 on August 14, 2026. Its HTTP `Last-Modified` value was June 4, 2026, consistent with the stale event content.
- Because June 2 is in the past, the page's “NEXT EVENT” label is stale and must not be reproduced as an upcoming event.

Source: [Catholic Leaders in Action official website](https://catholicleadersinaction.org/)

## Future-event determination

**Finding: no future CLA gathering date was verified in the accessible first-party sources as of August 14, 2026.**

The date trail is:

1. The June 4 Archdiocese article announced July 7 as the next CLA event.
2. The July 15 Archdiocese follow-up reported the July 7 gathering and announced **August 5** as the next CLA event, titled **“Called to Serve: Option for the Poor & Vulnerable,”** at St. Paul’s Catholic Church.
3. Both announced dates had passed by the verification date, while the official CLA landing page still showed June 2.
4. A first-party search of the Archdiocese domain found no later dated CLA gathering. It did find a July 31 Archdiocese event page that listed CLA as a sponsorship contact, but that page explicitly says the event has passed and does not establish a future CLA gathering.
5. Instagram post content could not be read through Agent Reach's required Instagram route in this environment, so an inaccessible Instagram announcement cannot be ruled out.

Implementation implication: use **“The next gathering will be announced soon.”** Link to Instagram and WhatsApp, and publish a future event only after the organization provides or publishes a verifiable date and logistics.

Primary sources: [Archdiocese launch article](https://sfarch.org/catholic-leaders-in-action-young-adults-group-launches-social-teaching-series/), [Archdiocese July follow-up](https://sfarch.org/catholic-lobbyist-calls-for-civic-involvement-at-young-adult-gathering/), [past July 31 Archdiocese event](https://sfarch.org/event/who-is-the-man-of-the-shroud/)

## Exact claims in the Archdiocese launch article

The [June 4 Archdiocese article](https://sfarch.org/catholic-leaders-in-action-young-adults-group-launches-social-teaching-series/) directly supports these statements:

- It calls CLA a **new Bay Area young adults’ group**.
- It says the inaugural gathering brought **about 50 young adults** to St. Phillip Church’s parish hall in Noe Valley on June 2.
- The program included a **social hour and lecture**, a moderated panel discussion, **audience Q&A**, and an opening prayer by Father Tom Martin, whom the article identifies as CLA chaplain.
- It describes the launch event as the first of **seven monthly Catholic Social Teaching events**. The July follow-up more specifically says there would be **seven consecutive monthly meetings**, one for each theme of Catholic Social Teaching.
- Saul Perez says the goal is to bring young adults together to build leaders and community.
- The exact short quotation verified in the article is: **“We want to bring people’s faith into action.” — Saul Perez, quoted by the Archdiocese of San Francisco.**
- The article says each lecture/social event was designed to be paired with a direct ministry action. It gives examples such as legislative advocacy, accompanying immigrants in court, and helping homeless ministries. These are described program intentions/examples, not proof that every action already occurred.

Primary sources: [Archdiocese launch article](https://sfarch.org/catholic-leaders-in-action-young-adults-group-launches-social-teaching-series/), [Archdiocese July follow-up](https://sfarch.org/catholic-lobbyist-calls-for-civic-involvement-at-young-adult-gathering/)

## Instagram access result

- The supplied profile URL, [@catholicleadersinaction](https://www.instagram.com/catholicleadersinaction), responded with HTTP 200.
- Agent Reach's required Instagram backend reported that the OpenCLI browser extension was not connected. A read attempt returned no profile/post payload and was stopped after waiting for the backend.
- Therefore, the URL is verified as resolving, but the profile biography, post dates, event announcements, follower counts, and other Instagram content are **not verified** here.

## Supplied destination checks

Read-only HTTP checks performed August 14, 2026:

| Destination | Result | Final destination / note |
| --- | --- | --- |
| [Official website](https://catholicleadersinaction.org/) | HTTP 200 | Resolved without redirect |
| [Instagram](https://www.instagram.com/catholicleadersinaction) | HTTP 200 | URL resolves; content not verified through the required Instagram backend |
| [Archdiocese feature](https://sfarch.org/catholic-leaders-in-action-young-adults-group-launches-social-teaching-series/) | HTTP 200 | Resolved without redirect |
| [Venmo](https://www.venmo.com/u/CatholicLeaders) | HTTP 200 | Redirected canonically to `https://venmo.com/u/CatholicLeaders` |
| [Membership form](https://tally.so/r/81jEDl) | HTTP 200 | Resolved without redirect |
| [WhatsApp community](https://chat.whatsapp.com/IhLDT5eUZpvBVCXAjBjC0i?mode=hqctcli) | HTTP 200 | Resolved without redirect |

An HTTP 200 confirms that a destination answered during verification; it does not prove ownership, endorsement, legal status, or that a logged-in user can complete every downstream action. The site should not infer tax deductibility, a particular corporate status, or formal Archdiocesan ownership from these link checks.

## Content guardrails for the build

- Do not publish June 2, July 7, July 31, or August 5 as upcoming.
- Do not infer the next date from the reported monthly cadence.
- Do not use Instagram-derived facts until the organization or an accessible first-party post verifies them.
- Attribute the attendance figure and Perez quotation to the Archdiocese.
- Describe ministry actions as planned examples unless completion is separately documented.
- Use “Featured by the Archdiocese of San Francisco” rather than inventing an office-level or legal affiliation.
