# Melbourne Impact Lab - Community Concierge Bot

An AI-powered WhatsApp concierge that helps newcomers and migrants settle into Melbourne. Built for the Melbourne Impact Lab hackathon.

Send a voice message in any language and get connected to community resources, groups, events, and local knowledge in your neighbourhood.

## Features

- **Multilingual voice support** -- send a voice note in any of 99 languages and get a response in English (or your language)
- **Melbourne community knowledge base** -- 50+ curated resources covering employment, housing, language support, health, legal, education, and social groups
- **Neighbourhood profiles** -- detailed guides for 10 key Melbourne areas including transport, services, and community character
- **Natural onboarding conversation** -- the bot learns your language, neighbourhood, and interests through conversation, not forms
- **User profile tracking** -- remembers your context across sessions so recommendations improve over time
- **Runs locally with Docker** -- no cloud deployment required, single container with everything included

## Architecture

```
WhatsApp (Baileys)  ──▶  Hermes Gateway  ──▶  Claude API (Anthropic)
                              │
                              ├──  faster-whisper (voice transcription)
                              ├──  skills/concierge (community knowledge)
                              ├──  skills/community-profiles (user profiles)
                              └──  /opt/data/data/ (community.json, neighbourhoods.json)
```

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- A phone with WhatsApp installed
- An Anthropic API key ([console.anthropic.com](https://console.anthropic.com))
- A dedicated phone number for the bot (prepaid SIM recommended)

## Quick start

1. Clone the repo and cd into `bot/`:

   ```bash
   git clone https://github.com/mblode/melb_impact_lab.git
   cd melb_impact_lab/bot
   ```

2. Copy `.env.example` to `.env` and add your Anthropic API key:

   ```bash
   cp .env.example .env
   # Edit .env and set ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Build the Docker image:

   ```bash
   docker build -t melb-concierge .
   ```

4. Run the container:

   ```bash
   docker run --rm -p 8642:8642 --env-file .env -v concierge-data:/opt/data melb-concierge
   ```

5. Scan the QR code that appears in the terminal:
   - Open WhatsApp on the bot's phone
   - Go to **Settings > Linked Devices > Link a Device**
   - Scan the QR code

6. Message the bot from another WhatsApp number and start chatting.

## Example conversations

**English newcomer asking about getting started:**

> **You:** Hi, I just moved to Melbourne from India. I don't really know where to start.
>
> **Bot:** Welcome to Melbourne! I'd love to help you get settled. A few quick questions so I can point you in the right direction -- which part of Melbourne are you living in, and what are the main things you need help with? Things like finding work, English classes, meeting people, or navigating services like Medicare and transport?

**Spanish speaker asking about community in Footscray:**

> **You:** Hola, vivo en Footscray y busco grupos de la comunidad latina.
>
> **Bot:** Footscray has a strong Latin American community. There are a few groups and services nearby that might be a good fit for you. The Footscray Community Arts Centre runs regular cultural events, and the Migrant Resource Centre in the west offers settlement support in Spanish. There's also a Latin American social group that meets monthly in Footscray. Would you like contact details for any of these?

**Voice note interaction:**

> **You:** *(sends a 15-second voice note in Mandarin asking about English classes)*
>
> **Bot:** There are several English language programs near you. AMES Australia runs free English classes for migrants at multiple locations across Melbourne, including CBD and western suburbs. The Neighbourhood Learning Centre also offers beginner-friendly conversation groups. Would you like me to find the closest options to where you live?

**Asking about transport:**

> **You:** How do I get around Melbourne? Is there a monthly pass?
>
> **Bot:** Melbourne uses the myki card for all public transport -- trains, trams, and buses. You can buy one at any train station or 7-Eleven. There's no monthly pass, but there's a daily cap so you never pay more than about $10 a day. Trams are free in the CBD zone. The PTV app is useful for route planning. Would you like tips for getting around your specific neighbourhood?

## WhatsApp safety

This bot uses [Baileys](https://github.com/WhiskeySockets/Baileys), an unofficial WhatsApp Web bridge. It is not endorsed by Meta. To reduce the risk of account restrictions:

- Use a **dedicated prepaid number**, not your personal WhatsApp
- **Warm up the number** by using it manually for a week before enabling the bot
- **Start slow** with a small number of conversations per day
- **Never run two bot instances** against the same WhatsApp session

## Tech stack

| Component | Role |
|---|---|
| [Hermes Agent](https://hermes-agent.nousresearch.com) | WhatsApp gateway, skill system, memory, session management |
| [Baileys](https://github.com/WhiskeySockets/Baileys) | WhatsApp Web bridge (built into Hermes) |
| [Claude Sonnet](https://www.anthropic.com) (Anthropic) | LLM for conversation and reasoning |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Voice note transcription (99 languages, built into Hermes) |
| [Docker](https://www.docker.com) | Container runtime |

## Hackathon context

This project was built for the [Melbourne Impact Lab](https://www.melbourneimpactlab.org/) hackathon. The problem: newcomers and migrants arriving in Melbourne face isolation, language barriers, and difficulty navigating unfamiliar systems -- housing, employment, healthcare, transport, and social connections.

Inspired by Shaun Tan's wordless graphic novel [*The Arrival*](https://www.shauntan.net/arrival-book) -- which depicts the disorientation, loneliness, and eventual human connection of an immigrant in a strange new city -- the concierge is designed to be that first small act of connection. Like the book's wordless format that transcends language, voice-first design means literacy and language are not barriers.

Our approach: meet people where they already are (WhatsApp) and in their own language (voice notes). Instead of building another website or app that requires discovery and downloads, the concierge bot is a single phone number that anyone can message. The community knowledge base is curated by locals and community organisations, not scraped from the internet.

## License

MIT
