# Melbourne datasets — what powers the Family Transition Tool

*Verified against the actual CSVs in `/data` on 2026-05-23. Row counts and fields are real, not from the catalogue.*

## ⚠️ Read this first — the honest framing
City of Melbourne open data covers **only the City of Melbourne LGA** (~38 km², the CBD + a ring of inner suburbs: Carlton, Docklands, Kensington, Parkville, North/East/West Melbourne, Southbank). It is **CBD-centric and small** — childcare = 29 records, schools = a handful, etc. A real relocating family needs **metro-wide** coverage, which CoM data alone does **not** provide.

**What this means for us:**
- CoM data is a **credible demo seed** (real, geo-located, council-sourced) — perfect to *show* the base layer working in the inner city.
- For metro coverage you'd swap in **state/national + OpenStreetMap + community-contributed** data. This is exactly the **"swappable data pack"** architecture that scores on **reusability** — Melbourne is data pack #1.
- So in the pitch: *"grounded in real City of Melbourne data today; the engine takes any city's data pack tomorrow."* Don't over-claim citywide coverage from CoM data.

---

## Base layer — services a relocating family needs (all geo-located)
| Family need | Dataset | Rows | Geo | Notes / caveat |
|---|---|---|---|---|
| Childcare / daycare | `childcare-centres` | 29 | ✅ coords | Name, phone, URL. **CBD-only — thin**; needs external for metro |
| Schools | `landmarks…` (Education Centre) | ~13 | ✅ | Primary×4, Secondary×2, Tertiary×4 — *indicative only*, not a school directory |
| GP / hospitals | `landmarks…` (Health Services) | 11 | ✅ | 7 public + 3 private hospitals + 1 medical svc — **no GP/dentist directory** → external needed |
| Parks / playgrounds | `playgrounds` (45) + `landmarks` parks (37) | 82 | ✅ | Playgrounds incl. features; parks/gardens/reserves |
| Public transport | `bus-stops` (309), `bike-share-dock-locations` (50), tram stops | 350+ | ✅ | Static stop locations; **no live timetable** (would need PTV/GTFS) |
| Public toilets | `public-toilets` | 74 | ✅ | Has **wheelchair + baby-change** flags — great for families |
| Drinking fountains | `drinking-fountains` | 302 | ✅ | Dense, geo |
| BBQs | `public-barbecues` | 63 | ✅ | Family/picnic life |
| Cafés / restaurants | `cafes-and-restaurants-with-seating-capacity` | 66,356 | ✅ | **Huge & rich** — trading name, address, seats, cuisine code, precinct |
| Bars / pubs | `bars-and-pubs-with-patron-capacity` | 5,304 | ✅ | Capacity + precinct |
| Live music | `live-music-venues` | 227 | ✅ | Venue, type, website |
| Coworking | `coworking-spaces` | 64 | ✅ | For the partner who *can* work / freelance |
| Free/cheap support services | `free-and-cheap-support-services…` | 119 | ✅ | **Best-structured: hours per day, cost, categories** (Food, Health, Legal, Accommodation, Clothes, Showers/Laundry). Incl. multicultural orgs (The Couch Int'l Student Centre, Travellers Aid) |
| Community venues (bookable) | `venues-for-event-bookings` | 206 | ✅ | Bookable halls/rooms — where a community group could *meet/host* |
| Self-guided walks | `self-guided-walks` | 34 | ✅ | Orientation / "get to know the area" |

## Community / context layer — personalisation + the "who's arriving" story
| Use | Dataset | Rows | Notes |
|---|---|---|---|
| **Who's arriving (diversity)** | `multicultural-community-profile-2016` | 2,374 | Country of birth, **Language spoken at home**, **Proficiency in English**, **Year of arrival**. Top origins: **India**, China (Mandarin), Thailand, Italy, Philippines, Sri Lanka (**Tamil**), Brazil (Portuguese), Korea. **Grounds the persona** (Priya from India/Tamil is realistic — India is the #1 detailed country of birth). *Caveat: 2016 census.* |
| Evidence of need | `social-indicators…2023` | 594 | "Satisfaction with feeling part of your community", food security, volunteering, safety — by suburb/year. **Fresh (2023).** Targeting + proof. |
| Family demographics | `families-with-children-profile-2016` | 671 | Context on families with 0–12yo |
| Local area profiles | `residents-profiles-by-clue-small-area` | 10,776 | Per-small-area resident breakdowns |

## What CoM data does NOT give us (→ external / community-contributed)
- A real **GP / dentist / specialist** directory (only hospitals) → HealthDirect / external.
- **Daycare/schools at metro scale** (only a CBD handful) → ACECQA / Vic Dept of Education.
- **Live public transport** → PTV / GTFS.
- **Housing / rentals** → not in CoM data.
- **The lived cultural knowledge** (how self-checkout works, what's rude to say, what the library offers) → **this is the community-contributed layer — and it's the moat.** It exists in *no* dataset; that's why it's defensible vs ChatGPT.

## How it maps to the two layers
- **Layer 1 (transition plan):** the base-layer service datasets above (demo on CoM data, generalise via data pack) + external feeds for full coverage.
- **Layer 2 (living community memory):** seeded from the multicultural/social-indicator context + **community-contributed** lived knowledge and stories (the part that meets the "ground up" prompt and beats a generic LLM).

## Bottom line
CoM data is a **strong, real, geo-located demo foundation for the inner city**, and the `cafes/restaurants` (66k) and `free-and-cheap-support-services` (structured hours/cost/category) sets are genuinely good. But the tool's *coverage* and its *defensibility* both come from **external + community-contributed data** — which is on-strategy: it's what makes the tool reusable (data pack) and ChatGPT-proof (lived local knowledge).
