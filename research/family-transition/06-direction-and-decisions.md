# Direction & decisions — read this to get up to speed fast

*The decision history, what we ruled out and why, and the constraints we operate under. Purpose: anyone (human or new AI session) can read this + `00-problem-and-audience.md` and be fully oriented without re-litigating settled calls.*

---

## Current status (what's LOCKED)
- **Concept:** "Family Transition Tool" — a two-layer tool (transition plan + living community memory) for relocating families. Full detail in `00-problem-and-audience.md`.
- **Problem statement, hero persona (Priya, the trailing partner), segmentation, value layer, resilience framing, criteria fit:** all in `00`.
- **Evidence base:** `01`–`05` + `README.md` (all sourced, confidence-flagged, verified).
- **Not yet done:** the 3-minute demo flow; final build spec; verifying a couple of blocked primary sources before the deck.

## The original brief (verbatim — what we're judged against)
> **"Community and citizen initiatives."** Resilience built from the ground up by residents and communities. *"How might residents and communities drive their own solutions — from circular economy models to local resource sharing — that build resilience from the ground up?"*

## The judging criteria (the 5 axes every decision is weighed against)
1. **Problem & impact** — real, significant problem.
2. **Solution & feasibility: Uptake** — buildable AND people will actually adopt it. *(This is why a two-way marketplace is banned — see below.)*
3. **Resilience & livability** — does it *genuinely* increase the resilience of the people?
4. **Reusability** — not too "Melbourne-coded"; works elsewhere.
5. **Pitch quality.**

## Strategic anchor: EDS 2030 ("The Melbourne Advantage")
City of Melbourne's Economic Development Strategy 2030 — cite **Pillar 2: "A magnet for the world's brightest minds and best enterprises,"** which *verbatim* names *"supporting entrepreneurial activity within migrant and diverse communities… reinforce Melbourne as an inclusive city"* + international students. (The 5 pillars: 1 Innovation, 2 Magnet for brightest minds, 3 Alive with energy, 4 Competitiveness, 5 Liveability.) **Do NOT pitch "health tech / ageing"** — health tech is a Pillar 1 *innovation sector*, ageing isn't named, and our own data shows older residents are the *least* isolated. PDF: `.firecrawl/eds2030.pdf` (local, not in repo).

---

## Directions we CONSIDERED and RULED OUT (don't reopen without new info)
| Direction | Why we ruled it out |
|---|---|
| **Parking / "Know Your Rights" rights-engine** (the pre-existing `MORNING-BRIEF.md` recommendation) | Off-brief — it's individual-vs-institution, not community-led resilience. The morning brief predates the actual problem statement. **Ignore the morning brief.** |
| **Circular economy** (repair/waste/recycling) | City of Melbourne waste data is **stale/dead** (stops 2020; Degraves recycling 2016). Fails "use of real data"; weak. |
| **Community food resilience** | Strong & on-brief (validated: 1-in-3 food insecure), but less novel and council data is thin on the grassroots layer. A viable fallback, not the pick. |
| **Pure loneliness / "help people make friends"** | Drifts to individual *wellbeing*, not community *resilience* — fails criterion 3 unless reframed around collective capacity. |
| **"Wasted talent" / skilled-migrant economic angle** | Off-brief for *resilience* (it's economic participation/productivity); and "match talent ↔ employers" is a two-way marketplace. Great EDS story, wrong brief. |
| **Skilled worker / the person who moved FOR a job** | Not our user — they already have an entry point (colleagues, structure). The gap is the people *without* a pathway. |
| **Generic "relocation checklist" as the hero** | The most ChatGPT-able / crowded-startup-saturated framing. Keep the checklist as the *hook*, never the hero. |

## Hard constraints & principles (the rules every option must pass)
1. **No two-way marketplace.** Cold-start kills uptake and is undemoable. The tool must be **one-sided**: route people to *existing* supply (groups, services, contributors), never wait for a second-side user. (This is a firm Giorgio call.)
2. **Must genuinely increase resilience *of the people*** — connection as collective capacity, not just individual wellbeing. The trailing partner is the *least resilient* household member (whole world = one person); connecting them is real resilience.
3. **Reusable, not Melbourne-coded** — universal problem + a **swappable local "data pack."** Melbourne is data pack #1. (There is NO "use of city data" criterion — portability beats data-depth.)
4. **A defensible value layer beyond ChatGPT** = Grounding + Action + Continuity + community memory. Lived hyperlocal *cultural* knowledge is the moat (it's in no dataset). Don't ship "a chatbot that suggests Meetup."
5. **Insight-led pitch** — lead with the one thing we noticed ("you belong by *contributing*, not just receiving"; the people with no pathway are invisible), then the solution. Narrow to one visceral persona ("make it 100").
6. **Community contribution is the front door, not a bolt-on** — the give-to-get story mechanic fuses the two layers so they read as one product (answers the "does the community bit feel tacked on?" risk).

## How "from the ground up" is satisfied (the resilience answer)
The knowledge & connections come **from** residents and prior newcomers — not handed down top-down. Each arriving family becomes a contributor who strengthens the fabric for the next. That compounding connective tissue *is* the resilience. (Base layer = utility/hook; community living-memory layer = the ground-up payload.)

## Working techniques & where things live (for new sessions)
- **Project root (local, NOT in repo):** `/Users/giorgioliapakis/Dev/impact-hackathon` — has 212 CoM dataset CSVs in `data/`, `datasets_metadata.json`, plus the **outdated** `MORNING-BRIEF.md` / `DATASETS.md` (ignore those for direction).
- **Reddit access:** firecrawl & WebFetch are **blocked** on reddit.com. Only `curl "https://www.reddit.com/r/<sub>/comments/<id>.json?limit=50" -A "<custom-ua>"` works. firecrawl `search` (with `site:reddit.com/...`) is fine for *discovering* thread IDs.
- **CoM live API:** `https://data.melbourne.vic.gov.au/api/explore/v2.1/catalog/datasets/{id}/records?limit=1` returns `total_count`.
- **Repo:** https://github.com/Jasper1609/melb_impact_lab — research lives under `research/family-transition/` (PR #1, branch `research/family-transition`). `main` has the team's `fe/` frontend app.

## Open items / next steps
1. Spec the **3-minute demo flow** (Priya: share story → get plan → make a contribution → community memory visibly grows).
2. Build spec for the demo (what's real vs seeded; the give-to-get loop on screen).
3. Verify the 2–3 source figures flagged as blocked/secondary in `01` before the final deck.
