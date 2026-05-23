# Workflows

Detailed workflows for the three vault operations. Uses the search, read, and write commands from the parent SKILL.md.

## Ingest workflow

"Ingest" means: read an inbox item, extract knowledge into the appropriate folder, link with `[[wikilinks]]`.

```text
Ingest progress:
- [ ] git pull to get latest vault state
- [ ] Read AGENTS.md to learn current conventions
- [ ] Read the inbox file
- [ ] Identify extractable knowledge (concepts, people, tools, outputs, recipes)
- [ ] Create or update notes for each knowledge item
- [ ] Add [[wikilinks]] between related entries
- [ ] Mark inbox file with status: compiled
- [ ] Update index.md with new or changed entries
- [ ] Append entry to log.md
- [ ] Verify no broken links
- [ ] git commit and push
```

### Steps

1. **Sync**: `git -C /vault pull --ff-only`

2. **Read conventions**: `cat /vault/AGENTS.md`

3. **Read the inbox file**: `cat /vault/inbox/item-name.md`

4. **Identify knowledge**: Determine what concepts, people, tools, outputs, or recipes are in the source. Each becomes a note (or updates an existing one).

5. **Create or update notes**: Place in the correct folder (knowledge/, people/, projects/, etc). Use the create-note and append-to-note patterns from the skill.

6. **Mark inbox compiled**: `sed -i 's/^status: raw$/status: compiled/' /vault/inbox/item-name.md` — never delete the inbox file.

7. **Update index**: Read `cat /vault/index.md`, then append entries under the correct type heading. Each entry follows: `- [[slug-name|Display Name]] - one-line summary`

8. **Append to log**:
   ```bash
   echo "\n## YYYY-MM-DD - ingest | Source Title\n\nBrief description of what was extracted and which notes were created or updated." >> /vault/log.md
   ```

9. **Verify**: Check for broken wikilinks in a single pass:
   ```bash
   rg -oIN '\[\[([^\]|]+)' /vault --glob '*.md' -r '$1' | sort -u > /tmp/linked-targets
   find /vault -name '*.md' -not -path '*/.obsidian/*' -exec basename {} .md \; | sort -u > /tmp/existing-files
   comm -23 /tmp/linked-targets /tmp/existing-files
   ```

10. **Commit and push**:
    ```bash
    git -C /vault add -A
    git -C /vault commit -m "ingest | Source Title"
    git -C /vault push
    ```

### Stub handling

Inbox files with 10 lines or fewer and no extractable knowledge: set `status: compiled` with no extraction.

## Query workflow

Search the vault to answer a question. File valuable answers back as new notes.

```text
Query progress:
- [ ] git pull to get latest vault state
- [ ] Read AGENTS.md to learn conventions
- [ ] Read index.md to find relevant pages
- [ ] Search for additional matches
- [ ] Read identified notes
- [ ] Synthesize answer
- [ ] If valuable: create new note, update index, append to log
- [ ] git commit and push (if changes made)
```

### Steps

1. **Sync**: `git -C /vault pull --ff-only`

2. **Read conventions**: `cat /vault/AGENTS.md`

3. **Scan the index**: `cat /vault/index.md` — identify entries related to the question.

4. **Search for more**: `rg -n "topic" /vault --glob '*.md'` — find notes the index scan missed.

5. **Read notes**: `cat /vault/path/to/note.md` for each relevant note.

6. **Synthesise**: Cross-reference the notes and produce a coherent answer.

7. **File back** (if the answer is reusable or fills a gap): create a new note, update index.md, and append to log.md using the same patterns as ingest. Commit and push.

## Lint workflow

Health-check the vault for structural issues.

```text
Lint progress:
- [ ] git pull to get latest vault state
- [ ] Read AGENTS.md to learn conventions
- [ ] Check for orphan pages (no inbound links)
- [ ] Check for dead-end pages (no outbound links)
- [ ] Check for unresolved links
- [ ] Check index coverage
- [ ] Review tag distribution
- [ ] Report findings with suggested fixes
```

### Steps

1. **Sync**: `git -C /vault pull --ff-only`

2. **Read conventions**: `cat /vault/AGENTS.md`

3. **Build link indexes** (single pass, avoids per-file loops):
   ```bash
   rg -oIN '\[\[([^\]|]+)' /vault --glob '*.md' -r '$1' | sort -u > /tmp/link-targets
   find /vault -name '*.md' -not -path '*/.obsidian/*' -exec basename {} .md \; | sort -u > /tmp/all-files
   ```

4. **Orphans** (files never linked to):
   ```bash
   comm -23 /tmp/all-files /tmp/link-targets
   ```

5. **Dead ends** (files with no outgoing links):
   ```bash
   rg -L '\[\[' /vault --glob '*.md' --files-without-match
   ```

6. **Unresolved links** (links pointing to non-existent files):
   ```bash
   comm -23 /tmp/link-targets /tmp/all-files
   ```

7. **Index coverage**:
   ```bash
   find /vault/knowledge /vault/people /vault/projects -name '*.md' | while read f; do
     name=$(basename "$f" .md)
     rg -q "$name" /vault/index.md || echo "NOT IN INDEX: $f"
   done
   ```

8. **Tag review**: `rg -oh '#[a-zA-Z0-9_-]+' /vault --glob '*.md' | sort | uniq -c | sort -rn | head -20`

9. **Report**: Present findings grouped by severity:
   - **Error**: unresolved links, missing index entries for important notes
   - **Warning**: orphan pages, dead ends
   - **Info**: tag distribution, suggestions for new connections
