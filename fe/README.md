# Tapestry

A mobile app that helps newly arrived residents connect with their local community. Built with React Native and Expo.

Tapestry walks users through onboarding, learns about their household and needs, then generates a personalized "settlement plan" with people to meet, events to attend, community groups to join, and resources to help them settle in.

## Demo Persona: Jesse

The app is currently built around Jesse's story. She recently moved from Hong Kong with her partner and two kids to Kensington. Moving to a new suburb has been challenging — she has to start from the ground up with no established contacts. The app demonstrates how Tapestry helps someone like Jesse find community, enrol her kids in school, and navigate settling into a new neighbourhood.

## How It Works (User Flow)

### 1. Welcome
The app opens with a rotating multilingual greeting (English, Chinese, Arabic, Vietnamese, Hindi, Spanish, Tagalog, Korean) and a "Get Started" button.

### 2. Onboarding (8 steps)
The user is guided through a sequential onboarding flow:

1. **Language** — Select a preferred language
2. **Name** — Enter their name
3. **Phone** — Enter phone number
4. **Email** — Enter email address
5. **Address** — Enter their new address
6. **Neighbourhood** — See local stats (population, households, median age, % born overseas)
7. **Interests** — Pick from: Find a friend, Events, Community Groups, Settling In
8. **Contacts** — Sync phone contacts to find people already in the network

### 3. Bio (Voice or Text)
User describes their situation — who they are, who moved with them, what they need help with. Supports voice recording or typing.

### 4. Processing
A loading screen shows three steps being processed: understanding the user's story, scanning the neighbourhood, and building a plan.

### 5. Household Profiles
Displays extracted household members (e.g. partner, children) parsed from the bio. Users confirm who is in their household.

### 6. Plan Reveal
An animated card-flip sequence reveals four categories:
- **People** — Neighbours and contacts worth reaching out to
- **Events** — Upcoming local events relevant to the user
- **Communities** — Facebook groups, WhatsApp groups, etc.
- **Requests** — Government resources, guides, step-by-step help

### 7. Dashboard
A home screen showing prioritized "next steps" (one per category) and cards to explore each category in depth.

### 8. Explore
Browse all items within a category, with search.

### 9. AI Concierge
A demo chat with the Tapestry AI assistant that shows how users can ask questions and get help (e.g. drafting an email to a school).

## Current State: Frontend Only

This is a **frontend prototype** — all data is hardcoded. There is no backend, no API calls, and no persistence. The app demonstrates the full user flow with dummy data.

## Getting Started

```bash
npm install
npx expo start
```

Then open in iOS Simulator, Android Emulator, or Expo Go.

## Tech Stack

- **React Native** + **Expo SDK 54**
- **Expo Router** (file-based routing)
- **TypeScript**
- React local state only (no state management library)
- No backend or database

## Project Structure

```
app/
├── _layout.tsx              # Root stack navigator
├── index.tsx                # Welcome screen
├── bio.tsx                  # Voice/text bio input
├── loading.tsx              # Processing animation
├── profiles.tsx             # Household members
├── dashboard.tsx            # Home screen with next steps
├── concierge.tsx            # AI chat demo
├── onboarding/
│   ├── language.tsx
│   ├── name.tsx
│   ├── phone.tsx
│   ├── email.tsx
│   ├── address.tsx
│   ├── neighbourhood.tsx
│   ├── interests.tsx
│   └── contacts.tsx
├── plan/
│   ├── index.tsx            # Animated card reveal
│   └── [id].tsx             # Category detail view
└── explore/
    └── [id].tsx             # Browse category with search

constants/
├── plan-data.ts             # All plan/category mock data
└── onboarding-styles.ts     # Shared theme, colors, fonts
```

---

## Dummy Data Inventory

Everything below is hardcoded and needs to be replaced with real data from the backend.

### `constants/plan-data.ts` — Plan categories and items (MAIN DATA FILE)

This is the primary mock data file. It defines 4 categories with all their items:

| Category | Dummy Items | Key Fields |
|----------|------------|------------|
| **People** (5) | Mei-Ling Chan, Sarah Chen, David Wong, Priya Sharma, Tom Wilson | `label`, `detail`, `isContact`, `email`, `emailSubject`, `emailBody` |
| **Events** (3) | Welcome Morning Tea, Kensington Primary Open Morning, Multicultural Families Picnic | `label`, `detail`, `source`, `eventUrl`, `date`, `location` |
| **Communities** (4) | HK Families Melbourne, Kensington Primary Parents, Kensington Neighbours, New to Melbourne | `label`, `detail`, `platform`, `groupUrl` |
| **Requests** (3) | School enrolment, Bank account, Public transport (Myki) | `label`, `detail`, `provider`, `resourceUrl` |

### `app/bio.tsx` — Dummy voice transcript

```
"I just moved to Kensington from Hong Kong with my partner and two kids.
We don't really know anyone here yet, so we're looking to meet people
in the area. I'd love to find a good school nearby and connect with
other families. We also need to set up a bank account and figure out
public transport."
```

Used as a fake transcription result when the user "records" a voice message.

### `app/profiles.tsx` — Extracted household members

| Name | Relation | Detail |
|------|----------|--------|
| Jesse | Primary | Recently moved from Hong Kong, looking for community |
| Partner | Partner | Moving together, settling into Kensington |
| Child 1 | Child | Needs primary school enrolment |
| Child 2 | Child | Needs primary school enrolment |

### `app/onboarding/contacts.tsx` — Synced contacts

| Name | Detail |
|------|--------|
| Mei-Ling Chan | Mobile |
| Sarah Chen | Mobile |
| Priya Sharma | Mobile, Email |

### `app/onboarding/neighbourhood.tsx` — Local demographics (Kensington)

| Stat | Value |
|------|-------|
| People nearby | 10,830 |
| Households | 5,240 |
| Median age | 33 |
| Born overseas | 38% |

### `app/dashboard.tsx` — Next steps

4 hardcoded next-step cards (one per category): "Reach out to Mei-Ling Chan", "Attend Welcome Morning Tea", "Join HK Families Melbourne", "Start school enrolment".

### `app/concierge.tsx` — Demo chat messages

4 hardcoded messages simulating a conversation about school enrolment at Kensington Primary, including a drafted email mentioning the move from Hong Kong.

### `app/onboarding/phone.tsx` — Default phone number

Pre-filled with `+61 400 000 000`.

### `app/onboarding/interests.tsx` — Interest options

4 hardcoded options: Find a friend, Events, Community Groups, Settling In.

### `app/index.tsx` — Multilingual greetings

8 language greetings rotating on a timer (likely stays hardcoded — no backend needed).

### `app/onboarding/language.tsx` — Language list

8 supported languages (likely stays hardcoded — no backend needed).

---

## Backend API: Required Endpoints

The following endpoints are what the frontend will need to connect with the backend. These are our best guesses based on the current UI — backend team should validate and adjust.

### Auth & User Management

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/api/users` | Create a new user during onboarding | `{ name, phone, email, address, language, interests[] }` | `{ userId, token }` |
| `GET` | `/api/users/:id` | Get user profile | — | `{ name, phone, email, address, language, interests[], householdMembers[] }` |
| `PUT` | `/api/users/:id` | Update user profile | Any user fields | Updated user object |

### Onboarding & Bio Processing

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/api/users/:id/bio` | Submit bio text or voice transcript | `{ text: string }` or audio file upload | `{ bioId, status: "processing" }` |
| `POST` | `/api/users/:id/bio/transcribe` | Transcribe voice recording to text | Audio file (multipart) | `{ transcript: string }` |
| `GET` | `/api/users/:id/household` | Get extracted household members | — | `{ members: [{ name, relation, detail }] }` |
| `PUT` | `/api/users/:id/household` | Confirm/edit household members | `{ members: [{ name, relation, detail }] }` | Updated members |

### Neighbourhood Data

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/api/neighbourhood?address=...` | Get demographics for an address | — | `{ stats: [{ label, value }], suburb, postcode }` |

### Plan Generation

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/api/users/:id/plan` | Trigger plan generation | — | `{ planId, status: "generating" }` |
| `GET` | `/api/users/:id/plan` | Get the generated plan | — | `{ categories: PlanCategory[] }` — same shape as `constants/plan-data.ts` |
| `GET` | `/api/users/:id/plan/status` | Poll plan generation progress | — | `{ status: "generating" \| "ready", step: 1\|2\|3 }` |

The plan response should match the `PlanCategory[]` type defined in `constants/plan-data.ts`:

```typescript
interface PlanItem {
  label: string;
  detail: string;
  isContact?: boolean;
  email?: string;
  emailSubject?: string;
  emailBody?: string;
  source?: string;
  eventUrl?: string;
  date?: string;
  location?: string;
  platform?: string;
  groupUrl?: string;
  provider?: string;
  resourceUrl?: string;
}

interface PlanCategory {
  id: 'people' | 'events' | 'communities' | 'requests';
  icon: string;
  title: string;
  scanLabel: string;
  summary: string;
  items: PlanItem[];
  actionLabel: string;
}
```

### Contacts

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/api/users/:id/contacts` | Upload synced contacts for matching | `{ contacts: [{ name, phone?, email? }] }` | `{ matched: [{ name, detail }] }` |

### Explore / Search

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/api/explore/:category?q=...` | Search within a category | Query param `q` | `{ items: PlanItem[] }` |
| `GET` | `/api/explore/:category/discover` | Get more items beyond the plan | — | `{ items: PlanItem[] }` |

### AI Concierge

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `POST` | `/api/concierge` | Send a message to the AI assistant | `{ userId, message, conversationId? }` | `{ reply: string, conversationId }` |

### Dashboard

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|-------------|----------|
| `GET` | `/api/users/:id/next-steps` | Get prioritized next actions | — | `{ steps: [{ icon, label, detail, categoryId }] }` |

---

## What Stays Hardcoded (No Backend Needed)

These are UI constants that don't need backend data:

- **Multilingual greetings** (`app/index.tsx`) — static welcome text
- **Supported languages** (`app/onboarding/language.tsx`) — static list
- **Interest options** (`app/onboarding/interests.tsx`) — static categories
- **Search hint text** (`app/explore/[id].tsx`) — static placeholder strings
- **Theme/colors/fonts** (`constants/onboarding-styles.ts`) — design tokens
