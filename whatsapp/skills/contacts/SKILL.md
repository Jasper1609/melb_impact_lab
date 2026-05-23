---
name: contacts
description: "Looks up people by name using the vault's people/ directory. Cross-references with meeting history and email context. Use when the user asks about a contact, phone number, email address, or wants to look someone up."
version: 2.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [contacts, people, address-book, vault]
    platforms: [linux]
---

# Contacts

Looks up contact information from the vault's `people/` directory.

## Looking up a contact

Search vault people notes by name:

```bash
rg -l "query" /vault/people/ --glob '*.md'
```

Read matching notes for contact details: name, email, phone, company, role, and relationship context.

If multiple notes match, present the most relevant one. If no notes match, tell the user the contact was not found in the vault.

## Cross-referencing

When looking up a person, combine sources:

1. Search the vault's `people/` folder for structured contact details and context notes
2. Search recent daily notes and meeting notes for mentions of the person
3. Check Gmail for recent email threads with that person (see google skill)

## Routing

| User says | Action |
|-----------|--------|
| "what's [name]'s number" / "email for [name]" | Search vault people/ notes |
| "who is [name]" | Check vault people notes + recent interactions |
| "how do I reach [name]" | Contact details from vault |

## Gotchas

- Vault people notes are manually maintained. If a contact is missing, suggest the user add a note.
- Contact details in vault notes may be outdated. When in doubt, mention the source.
- For richer contact data, a Google People API MCP server could be added in the future.
