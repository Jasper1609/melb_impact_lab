# Melbourne Newcomer App — Open Data Catalogue

## Data source

All datasets are published by the **City of Melbourne** on their Open Data Portal under the **CC BY 4.0** licence.

| | |
|---|---|
| Portal | https://data.melbourne.vic.gov.au |
| Base API URL | `https://data.melbourne.vic.gov.au/api/v2/catalog/datasets` |
| Fetch records | `{base}/{dataset_id}/records?limit=100&offset=0` |
| Export (JSON) | `{base}/{dataset_id}/exports/json` |
| Export (CSV) | `{base}/{dataset_id}/exports/csv?delimiter=,` |
| Join key | Most datasets share `clue_small_area` as a common geographic key |

---

## Priority guide

| Priority | Meaning |
|---|---|
| 🔴 Critical | Fetch first — core app functionality depends on this |
| 🟠 High | Key features — fetch in second pass |
| 🟡 Medium | Enrichment — adds depth to the experience |
| ⚪ Low | Nice to have — surface when relevant |

---

## 🌏 Community & cultural identity

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 1 | `multicultural-community-profile-2016` | Multicultural Community Profile 2016 | ABS 2016 Census data aggregated by the top 12 countries of birth across Melbourne's small areas. Includes residents count, median age, income, language spoken at home, English proficiency, and year of arrival. | The centrepiece "find your people" dataset. Powers the diaspora heatmap showing where each nationality cluster lives across Melbourne's neighbourhoods. | 🔴 Critical |
| 2 | `residents-profiles-by-clue-small-area` | Residents Profiles by CLUE Small Area | ABS 2011 and 2016 Census demographic data aggregated to City of Melbourne small areas, covering household size, dwelling type, age distribution and population totals. | Provides neighbourhood-level context alongside the multicultural profile — helps users understand the overall character of an area before choosing where to settle. | 🟠 High |
| 3 | `social-indicators-for-city-of-melbourne-residents-2023` | Social Indicators for Residents 2023 | Annual resident survey results covering diversity, sense of belonging, food security, health, participation in activities and liveability — the most recent year in the series. | Powers a "neighbourhood welcoming score" — areas with high belonging and diversity ratings are surfaced as particularly immigrant-friendly. | 🟠 High |
| 4 | `city-of-melbourne-liveability-and-social-indicators` | Liveability & Social Indicators | ISO 37120-standardised city quality-of-life scores covering safety, community connection, health and city services, submitted annually to the World Council on City Data. | Gives users a standardised benchmark to compare Melbourne neighbourhoods on dimensions that matter most when starting a new life in a new city. | 🟡 Medium |
| 5 | `workers-profile-2016` | Workers Profile 2016 | ABS 2016 Census data on the working population of the City of Melbourne, including industry sector, occupation, income range and country of birth for workers by small area. | Helps immigrants understand which neighbourhoods have professional communities in their field — useful for networking and finding familiar professional culture. | 🟡 Medium |

---

## 🍜 Food, cafes & hospitality

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 6 | `cafes-and-restaurants-with-seating-capacity` | Café, restaurant & bistro seats | CLUE survey data (2002–2024) listing every café and restaurant with trading name, street address, geo coordinates, and indoor/outdoor seat count. | The ethnic food hub map. Claude classifies cuisine type from `trading_name`, then cross-joins with the multicultural profile to surface restaurants in areas where the matching diaspora actually lives. Seat count reveals community gathering capacity. | 🔴 Critical |
| 7 | `bars-and-pubs-with-patron-capacity` | Bar, tavern & pub patron capacity | CLUE survey data listing licensed bars, taverns and pubs with trading name, address, geo coordinates, and total patron capacity. | Surfaces social venues for immigrants seeking nightlife, sports-watching communities, or casual social connection. Patron capacity identifies large venues suitable for community events. | 🟡 Medium |

---

## 🏪 Local businesses & shops

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 8 | `business-establishments-with-address-and-industry-classification` | Business establishments — location & industry | Every registered business in the City of Melbourne with trading name, full address, geo coordinates, ANZSIC4 industry code and description, CLUE small area, and census year (2002–2024). | The local shops layer. Filter by ANZSIC4 code to extract specific business types: grocery stores (`4110`), pharmacies (`4231`), GPs (`8511`), hair & beauty (`9511`), religious organisations (`8601`), legal services (`6921`), travel agents (`7220`), community services (`8790`). | 🔴 Critical |
| 9 | `coworking-spaces` | Coworking spaces | Locations of coworking and shared office spaces within the City of Melbourne, with trading name and address. | Helps immigrant entrepreneurs, freelancers and remote workers find professional communities, reduce isolation and build networks in a new city. | 🟡 Medium |
| 10 | `childcare-centres` | Childcare centres | Locations of licensed childcare centres within the City of Melbourne with centre name and address. | Essential for immigrant families with young children — Australia's childcare subsidy system is complex and unfamiliar to newcomers, so knowing what's nearby is the first step. | 🟠 High |

---

## 🏛️ Community facilities & services

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 11 | `landmarks-and-places-of-interest-including-schools-theatres-health-services-spor` | Landmarks & places of interest | Geo-coded point dataset covering schools, theatres, health services, sports facilities, places of worship, galleries and museums across the City of Melbourne. | The community infrastructure layer. Filtering by `feature_class` surfaces places of worship, community centres, hospitals and libraries — the institutions immigrants seek out first when building a new life. | 🔴 Critical |
| 12 | `free-and-cheap-support-services-with-opening-hours-public-transport-and-parking-` | Free & cheap support services (Helping Out) | Directory of free and low-cost support services including food relief, shelter, welfare assistance and legal aid, with opening hours and public transport access information. | Critical safety net for vulnerable new arrivals — surfaces the closest food, housing and welfare support with practical transport information for people who may not yet own a car. | 🟠 High |
| 13 | `venues-for-event-bookings` | Venues for event bookings | Council-managed venues available for community booking, with location, capacity and booking information. | Enables immigrant community groups to find and book affordable spaces for cultural celebrations, language classes, religious gatherings and new-arrival meetups. | 🟡 Medium |

---

## 🌳 Parks, outdoors & public spaces

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 14 | `playgrounds` | Playgrounds | Locations and equipment details for all playgrounds within the City of Melbourne. | Families with young children use playgrounds as natural first social spaces. Showing nearby playgrounds helps immigrant parents find their initial local community organically. | 🟠 High |
| 15 | `public-barbecues` | Public barbecues | Locations of council-maintained public barbecue facilities in Melbourne parks and open spaces. | A uniquely Australian social tradition unfamiliar to most immigrants. Surfacing free BBQ facilities encourages community gatherings without any cost barrier — a hidden gem for newcomers. | 🟡 Medium |
| 16 | `public-toilets` | Public toilets | Locations, accessibility features and opening hours of public toilet facilities across the City of Melbourne. | Practical orientation data for people unfamiliar with the city, especially families with young children navigating new areas for the first time. | ⚪ Low |
| 17 | `trees-with-species-and-dimensions-urban-forest` | Trees & urban forest | Individual tree data across the City of Melbourne including species, location, canopy size and dimension — part of Melbourne's Urban Forest strategy. | Green space and canopy density acts as a proxy for park quality and outdoor liveability — immigrants from tropical or green climates can find areas that feel most like home. | ⚪ Low |

---

## 🎭 Arts, culture & events

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 18 | `outdoor-artworks` | Outdoor artworks | Point locations of public sculptures, murals and street artworks across the City of Melbourne with title, artist and artwork type. | Cultural orientation for newcomers discovering Melbourne's identity. Combined with self-guided walks, creates a rich "discover your new city" experience beyond tourist attractions. | 🟡 Medium |
| 19 | `public-artworks-fountains-and-monuments` | Public artworks, fountains & monuments | Geo-coded dataset of public artworks, fountains, memorials and monuments with title, artist and type. | Landmarks and memorials tell the story of Melbourne's multicultural history — building this into a self-guided walk helps immigrants feel connected to the city's narrative. | 🟡 Medium |
| 20 | `live-music-venues` | Live music venues | Locations of licensed live music venues across the City of Melbourne including bars, hotels, clubs and dedicated music spaces. | Music is one of the most powerful cultural connectors. Helps immigrants find live music scenes — from jazz to world music to electronic — that resonate with their background. | 🟡 Medium |
| 21 | `self-guided-walks` | Self guided walks | Official City of Melbourne curated walking itineraries with route descriptions, distances and points of interest. | Low-barrier, free orientation tool for the first weeks after arrival. Gives newcomers a structured, safe way to explore the city and discover public spaces independently. | 🟡 Medium |
| 22 | `event-permits-2014-2018-including-film-shoots-photo-shoots-weddings-christmas-pa` | Event permits 2014–2018 | Historical record of event permits issued across the City of Melbourne including festivals, fun runs, cultural celebrations and public events, with organiser and location. | Reveals Melbourne's multicultural festival calendar and community event culture — helps immigrants understand what kinds of gatherings happen in their neighbourhood and how to get involved. | ⚪ Low |

---

## 🚌 Transport & navigation

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 23 | `bus-stops` | Bus stops | Locations and route information for all bus stops within the City of Melbourne. | Public transport is the primary mode for city newcomers who haven't yet purchased a car or obtained a licence. Bus stop proximity is a key factor in neighbourhood selection. | 🟡 Medium |
| 24 | `bicycle-routes-including-informal-on-road-and-off-road-routes` | Bicycle routes | All bicycle routes across the City of Melbourne including informal, on-road and off-road paths with surface type and route classification. | Cycling is an affordable and social way to discover a new city. Helps immigrants find safe routes and connects them with Melbourne's strong cycling community culture. | ⚪ Low |
| 25 | `pedestrian-counting-system-monthly-counts-per-hour` | Pedestrian counting system (hourly) | Hourly pedestrian counts from sensors across the City of Melbourne by location and time of day, updated monthly. | Foot traffic data shows which areas are lively and at what times — helps newcomers find active, safe areas to explore and understand the rhythm of their neighbourhood. | ⚪ Low |
| 26 | `footpaths` | Footpaths | Footpath network across the City of Melbourne with surface type, width and condition information. | Walkability and accessibility data — useful for users with mobility needs or prams, and for generating pedestrian-friendly route recommendations. | ⚪ Low |

---

## 🏠 Housing & property

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 27 | `residential-dwellings` | Residential dwellings | CLUE survey data (2002–2024) counting residential dwellings by type (separate house, apartment, etc.) and CLUE small area. | Helps immigrants understand the density and housing character of different neighbourhoods before deciding where to rent or buy. | 🟡 Medium |
| 28 | `house-prices-by-small-area-sale-year` | House prices by small area | Median property sale prices broken down by City of Melbourne small area and sale year. | Essential financial context for immigrants making housing decisions — lets users compare affordability across neighbourhoods at a glance. | 🟡 Medium |

---

## 👨‍👩‍👧 Demographic profiles

| # | Dataset ID | Title | Description | How it's used | Priority |
|---|---|---|---|---|---|
| 29 | `families-with-children-profile-2016-aged-0-12-years` | Families with Children Profile 2016 | ABS 2016 Census data profiling families with children aged 0–12 by small area, covering family type, income and country of birth. | Helps immigrant families identify child-friendly neighbourhoods with strong family infrastructure — schools, playgrounds, childcare — and communities of similar families. | 🟡 Medium |
| 30 | `tertiary-students-profile-2019` | Tertiary Students Profile 2019 | Demographic profile of tertiary students in the City of Melbourne from the 2016 ABS Census, covering institution, country of origin, age group and living arrangement. | International students represent the single largest immigrant cohort. This dataset profiles their geographic distribution and supports features targeting student-specific needs like affordable housing and social connection. | 🟠 High |

---

## How datasets connect

Most datasets share `clue_small_area` as a common geographic key, enabling an agent to build a full neighbourhood profile from a single area name.

```
multicultural-community-profile-2016          ─┐
residents-profiles-by-clue-small-area          │
social-indicators-for-city-of-melbourne-*      ├── join on clue_small_area
business-establishments-with-address-*         │
cafes-and-restaurants-with-seating-capacity    │
landmarks-and-places-of-interest-*             │
residential-dwellings                          │
house-prices-by-small-area-sale-year          ─┘

free-and-cheap-support-services-*             ── geo proximity (lat/lng)
public-barbecues                              ── geo proximity (lat/lng)
playgrounds                                   ── geo proximity (lat/lng)
self-guided-walks                             ── standalone routes
```

---

## Recommended fetch order for an AI agent

1. **Fetch critical datasets first** — `multicultural-community-profile-2016`, `business-establishments-with-address-and-industry-classification`, `cafes-and-restaurants-with-seating-capacity`, `landmarks-and-places-of-interest-*`
2. **Filter business establishments by ANZSIC4 code** rather than pulling all records — the dataset is large; targeted queries by industry code are far more efficient
3. **Join everything on `clue_small_area`** to build unified neighbourhood profiles
4. **Use Claude API to enrich `cafes-and-restaurants`** — classify cuisine type from `trading_name` before mapping

---

*Data sourced from the City of Melbourne Open Data Portal · CC BY 4.0 · https://data.melbourne.vic.gov.au*
