---
name: obsidian-vault
description: "Manages Matthew's Obsidian vault at /vault via terminal tools. Supports searching, reading, creating, editing, and compiling notes, following wikilinks, managing daily notes, and running ingest/query/lint workflows. Use when the user mentions notes, vault, wiki, search, daily note, inbox, ingest, or knowledge."
version: 1.0.0
author: mblode
license: MIT
metadata:
  hermes:
    category: productivity
    tags: [obsidian, vault, notes, knowledge-graph, wikilinks, daily-notes, git, wiki]
    platforms: [linux]
---

# Obsidian Vault

Manages a personal Obsidian vault checked out at `/vault`. The vault is a git working tree synced to GitHub.

## Reference files

| File | Read when |
|------|-----------|
| [`references/workflows.md`](./references/workflows.md) | Running a full ingest, query, or lint workflow |

## Setup

On first vault interaction in a session, read the vault's conventions:

```bash
git -C /vault pull --ff-only
cat /vault/AGENTS.md
```

This is the source of truth for naming, structure, frontmatter, index format, log format, and wikilinks.

## Search strategy

Start narrow, go deeper only when needed:

1. `index.md` — lightweight map of important notes
2. Folder notes and hub notes — collection overviews
3. `rg` content search — find specific notes by content
4. Full note reads — only when you need the detail
5. Raw inbox — only when exact evidence matters

## Searching

```bash
# Content search
rg -n "search phrase" /vault --glob '*.md'

# Filename search
rg --files /vault | rg -i "slug"

# Tag search (inline or frontmatter)
rg -l '#tag-name' /vault --glob '*.md'

# Search with context
rg -n -C 2 "search phrase" /vault --glob '*.md'

# Recent notes (last 7 days)
find /vault -name '*.md' -mtime -7 -exec ls -lt {} + | head -20

# Browse structure
find /vault -maxdepth 2 -type d | sort
ls /vault/inbox/
```

## Reading

```bash
# Read a note
cat /vault/path/to/note.md

# Read first 120 lines of a long note
sed -n '1,120p' /vault/path/to/note.md

# Find a note by name then read
rg --files /vault | rg -i "note-name"
```

## Links

```bash
# Forward links (outgoing wikilinks from a note)
rg -o '\[\[([^\]|]+)' /vault/path/to/note.md -r '$1'

# Backlinks (incoming wikilinks to a note)
rg -l '\[\[note-name\]\]' /vault --glob '*.md'
rg -l '\[\[note-name|' /vault --glob '*.md'
```

When asked "what's related to X", follow both forward and backlinks one hop and summarise the cluster.

## Daily notes

```bash
# Today's daily note
cat /vault/calendar/daily/$(date +%Y-%m-%d).md

# Create today's note if missing
cat > /vault/calendar/daily/$(date +%Y-%m-%d).md << 'DAILY'
---
created: $(date +%Y-%m-%d)
type: daily
---

# $(date +%Y-%m-%d)
DAILY

# Append to today's note
echo "\n- Item to add" >> /vault/calendar/daily/$(date +%Y-%m-%d).md
```

## Writing

Always pull before writing:

```bash
git -C /vault pull --ff-only
```

After any write, commit and push:

```bash
git -C /vault add <changed-files>
git -C /vault commit -m "short description of change"
git -C /vault push
```

### Creating a note

```bash
cat > /vault/knowledge/new-note.md << 'EOF'
---
created: YYYY-MM-DD
type: concept
status: active
---

# Note Title

One-sentence summary.

## Notes

Content with [[wikilinks]] to related pages.

## Source Map

- Where this came from
EOF
```

Match existing folder structure — look at sibling notes for conventions.

### Appending to a note

```bash
echo "\n## New Section\n\nAdditional content." >> /vault/path/to/note.md
```

### Setting frontmatter properties

```bash
sed -i 's/^status: raw$/status: compiled/' /vault/inbox/item.md
```

## Routing

| User says | Action |
|-----------|--------|
| "search my vault for X" | `rg -n "X" /vault --glob '*.md'` |
| "read note X" | Find with `rg --files`, then `cat` |
| "read my daily note" | `cat /vault/calendar/daily/$(date +%Y-%m-%d).md` |
| "add a task to today" | Append `- [ ] task` to daily note |
| "create a note about X" | Create in appropriate folder, commit, push |
| "add to note X" | Append content, commit, push |
| "ingest this" / "process inbox" | Load `references/workflows.md` |
| "what do I know about X" | Load `references/workflows.md` for query workflow |
| "lint the wiki" / "check health" | Load `references/workflows.md` for lint workflow |
| "what links to X" | Backlink search with `rg -l '\[\[X\]\]'` |

## Gotchas

- **Never delete inbox files** — mark `status: compiled` when done.
- **Never rename without checking wikilinks** — `rg -l '\[\[old-name\]\]' /vault` first.
- **Discover folder structure** — don't assume. Run `ls` to check before creating files.
- **Preserve user wording** — when compiling, keep the original phrasing when it carries meaning.
- **Archive is read-only** — don't modify `archive/` unless explicitly asked.
