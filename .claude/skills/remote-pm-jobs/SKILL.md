---
name: remote-pm-jobs
description: Daily hunt for fully remote, worldwide-eligible product management roles (Product Manager, Product Owner, Head of Product, AI/Technical/Growth PM). Scores each role against the candidate profiles in profiles/, dedupes against data/seen_jobs.json, writes reports/YYYY-MM-DD.md, commits it, and replies with a morning brief. Use when asked to "find remote PM jobs", "run the job search", "morning job report", or when the daily routine fires.
---

# Remote PM Jobs: daily search and morning brief

## What this skill does
1. Searches the web for product management roles that are **fully remote** and open **worldwide or across a broad region**.
2. Filters out project management, product marketing, product design and single-country roles.
3. Scores every role for fit against each profile in `profiles/` (see `config.json` for which profiles are active).
4. Dedupes against `data/seen_jobs.json` so the brief leads with what is **new since yesterday**.
5. Writes `reports/YYYY-MM-DD.md`, updates `data/seen_jobs.json`, commits and pushes.
6. Replies with a short morning brief: top picks, how to apply, what changed.

## Environment constraints (read first)
- **Direct HTTP is blocked.** `curl`, Python requests and the `WebFetch` tool all return `EGRESS_BLOCKED` for job boards and applicant-tracking hosts in this cloud environment. Do not loop on them. Try `WebFetch` once at the start of a run on one known URL (for example a weworkremotely.com posting). If it works, use it to verify postings. If it fails, run the whole search on `WebSearch` only.
- `WebSearch` works and returns individual posting URLs with snippets. That is the primary data source. Snippets are evidence; never state a salary, date or eligibility that the snippet did not show. Write `unknown` instead.
- Nobody can answer permission prompts during a scheduled run. If a tool asks for permission, treat it as unavailable and continue with the rest.

## Procedure

### Step 0: load state
```
cat .claude/skills/remote-pm-jobs/config.json
cat .claude/skills/remote-pm-jobs/profiles/*.md
cat .claude/skills/remote-pm-jobs/queries.md
cat data/seen_jobs.json
ls reports/
```
Note today's date in the timezone from `config.json`.

### Step 1: search
Run every query in `queries.md` with `WebSearch`. If the `Agent` tool is available, split the query bank across 2 to 3 subagents (boards, ATS hosts, company careers) and tell each one: **WebSearch only, WebFetch is blocked, return a JSON array, only URLs you actually saw, mark unknowns as unknown, never invent.** Add 3 to 5 ad-hoc queries of your own for the day (for example a trending company name, "Who is hiring" thread for the current month).

### Step 2: normalise and filter
For each result build: `title, company, url, location_eligibility, salary, posted, seniority, domain, how_to_apply, evidence, source`.

Keep a role only if **all** hold:
- Title is product management: contains Product Manager, Product Owner, Head of Product, Product Lead, Director of Product, Group PM, Principal PM, AI PM, Technical PM, Growth PM, Platform PM. Exclude Project Manager, Product Marketing, Product Designer, Product Engineer, Product Analyst, Product Support, Product Operations (unless the snippet makes it a PM role).
- Work setting is fully remote (snippet or URL says remote, work from anywhere, distributed, fully remote).
- Eligibility is worldwide, anywhere, global, or a broad multi-country region (Americas, EMEA, LATAM, Europe, APAC, "US/EU/LATAM"). Keep "remote, location unspecified" with the tag `eligibility: unverified`. Drop roles that name a single country or state ("Remote - US only", "UK residents").
- Not clearly stale: drop if the snippet shows a date older than 45 days or says closed / expired.

Dedupe by normalised URL (strip tracking parameters) and by `company + title` when URLs differ.

### Step 3: score fit
For each active profile give a fit score 1 to 5 using `profiles/<name>.md` (each profile ends with its own scoring hints):
- 5: domain, seniority and eligibility all match; the candidate's shipped work maps directly to the job's first three responsibilities.
- 4: strong match on two of the three.
- 3: plausible with a targeted application angle.
- 2: long shot (seniority or domain gap).
- 1: eligibility or seniority rules it out in practice.
Write one line of **why** per score and one line **application angle** (what to lead with). Keep it concrete and tied to the profile.

### Step 4: diff against seen state
`data/seen_jobs.json` maps `url -> {title, company, first_seen, last_seen, best_fit}`.
- New today: url not in the file.
- Still open: seen before, surfaced again today (update `last_seen`).
- Not surfaced today: leave the entry alone. Prune entries whose `last_seen` is older than 60 days.

### Step 5: write the report
Write `reports/YYYY-MM-DD.md` using `report-template.md`. Order: Top picks (new, fit >= 4) first, then Other new roles, then Still open worth a look (fit >= 3), then Excluded but notable (one line each with the reason), then Sources and coverage (which queries ran, what failed). Keep each role to a compact block. Include every URL as a markdown link.

Also update `reports/README.md` index line for the day.

### Step 6: commit and push
```
git add reports data
git commit -m "Remote PM jobs report YYYY-MM-DD"
git push -u origin <current branch>
```
If the push is refused, say so in the reply and keep the report content in the reply.

### Step 7: reply (the morning brief)
Reply in this shape, under 300 words:
- One line: how many roles found, how many new, which sources were reachable.
- Top 5 new roles: title, company, eligibility, salary if known, fit per active profile, link, and the one-line application angle.
- Anything that needs a human decision (for example a role that closes soon).
- Path to the full report.
Never claim a role was verified unless its page was actually opened.

## Manual use
`/remote-pm-jobs` runs the full procedure. `/remote-pm-jobs quick` runs the first 10 queries only and skips the commit.

## Changing who the search is for
Edit `config.json` `active_profiles`. Add or edit files in `profiles/`. The profile file is the only place fit scoring reads from, so paste a resume or LinkedIn export there to improve matching.
