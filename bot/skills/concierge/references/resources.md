# Resource Search and Recommendation Guide

How to find, filter, and present community resources from the knowledge base.

## Data location

Community resources are stored in `/opt/data/data/community.json`. The file is a flat JSON array where each resource has fields like `name`, `description`, `category`, `neighbourhood`, `tags`, `languages`, `contact`, and `url`.

Neighbourhood info is in `/opt/data/data/neighbourhoods.json`, a JSON array of neighbourhood objects with fields like `name`, `description`, `vibe`, `transport`, `keySpots`, `communityGroups`, and `demographics`.

## Reading the data

```bash
# Count total resources
cat /opt/data/data/community.json | jq 'length'

# List all categories
cat /opt/data/data/community.json | jq '[.[].category] | unique'

# List all neighbourhoods covered
cat /opt/data/data/community.json | jq '[.[].neighbourhood] | unique'

# List all language options
cat /opt/data/data/community.json | jq '[.[].languages[]?] | unique'
```

## Filtering resources

### By category

```bash
cat /opt/data/data/community.json | jq '[.[] | select(.category == "community-group")]'
```

### By neighbourhood

```bash
cat /opt/data/data/community.json | jq '[.[] | select(.neighbourhood == "Footscray" or .neighbourhood == null)]'
```

### By language

```bash
cat /opt/data/data/community.json | jq '[.[] | select(.languages[]? == "ar")]'
```

### By tags (interests)

```bash
cat /opt/data/data/community.json | jq '[.[] | select(.tags[]? == "sports" or .tags[]? == "social")]'
```

### Combined filters

```bash
cat /opt/data/data/community.json | jq '[.[] | select(.neighbourhood == "Footscray" or .neighbourhood == null) | select(.category == "community-group")]'
```

## Category descriptions

| Category | What it covers |
|----------|---------------|
| `getting-started` | Practical essentials: Myki, bank accounts, Medicare, phone plans, tax file numbers |
| `community-group` | Ongoing groups people can join: cultural associations, sports clubs, social meetups, faith groups |
| `support-service` | Professional or structured support: legal aid, counselling, family services, housing help |
| `event` | One-off or recurring events: festivals, workshops, welcome dinners, language exchanges |
| `transport` | Getting around Melbourne: public transport, cycling, driving, ride-sharing |
| `education` | Language classes, TAFE, university pathways, recognition of qualifications |
| `employment` | Job search support, volunteering, resume help, industry connections |

## Formatting recommendations for WhatsApp

WhatsApp supports limited formatting. Use this structure:

```
*Resource Name*
One-line description of what they offer and who they serve
Contact: 03 XXXX XXXX / email@example.com
Website: example.com
Location: Suburb name
```

Rules:
- Use `*asterisks*` for bold (resource names).
- Use line breaks between resources.
- Don't use markdown headers, links, or bullet points — they won't render.
- Keep each message under 600 characters where possible. 1000 characters is the hard max. Split into multiple messages for longer lists.
- Group by category with a plain text heading when listing 4+ resources.
- Description is one sentence. No preamble before listings.

## How many to recommend

| Situation | How many |
|-----------|----------|
| User has a specific need ("English classes in Footscray") | 1-3 best matches |
| User is exploring ("what groups can I join") | 2-4, grouped by type |
| User is browsing ("what's available in my area") | Up to 5, across categories |
| User asks for everything | List by category, max 3 per category |

Always lead with the most relevant result. If you have a strong single match, present it first and offer to show more.

## When nothing matches

If no resources match the user's query:

1. Acknowledge honestly: "I don't have a specific resource for that in my database."
2. Suggest alternatives:
   - Their local council website (most councils have community directories)
   - Call 211 Victoria (community information and referral service)
   - Ask if a related category might help
3. Offer to help with something else.

Never make up resources or provide unverified contact details.
