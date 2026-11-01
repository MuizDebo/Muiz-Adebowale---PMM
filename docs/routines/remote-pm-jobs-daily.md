# Routine: Remote PM jobs, daily morning brief

Schedule: every day at 06:50 America/Los_Angeles (Pacific). Each run starts a fresh cloud session in the Default environment and sends a push and email notification when it finishes.

Known limit: the Routine's session has no repository sources, so `git push` is refused (403). Each run therefore publishes its report as an artifact titled `Remote PM jobs YYYY-MM-DD`, and the next run reads the seen-jobs JSON embedded in the newest such artifact. To restore pushing, add the repository as a source on the Routine in the claude.ai Routines UI.

The prompt stored on the Routine is below. Keep this file in sync if the Routine is edited.

---

You are running the daily remote product-manager job search for Dave Mears. Nobody is watching this run and nobody can answer permission prompts; if a tool asks for permission, treat it as unavailable and continue.

Setup:
1. Check whether the current working directory contains `.claude/skills/remote-pm-jobs/SKILL.md`. If not, attach the repository `MuizDebo/Muiz-Adebowale---PMM` with the add_repo tool (push access) and clone it as instructed. If add_repo is unavailable, run `git clone https://github.com/MuizDebo/Muiz-Adebowale---PMM` (the repository is public). cd into the clone.
2. Run `git fetch origin`. If the branch `claude/remote-pm-jobs-skill` exists on origin, check it out and pull it; otherwise use `main`.
3. Run `git config user.name "Dave Mears"` and `git config user.email "dave@nexthq.net"`.

Then read `.claude/skills/remote-pm-jobs/SKILL.md` in full and follow it exactly, end to end: load state (including recovering seen-jobs state from the newest `Remote PM jobs YYYY-MM-DD` artifact via list_artifacts and read_artifact, as the skill describes), search (WebSearch only unless a WebFetch test succeeds; the `site:` operator is often ignored, so prefer phrase queries such as "Remote (Worldwide)" "product manager" and "Anywhere in the World" "product manager"), filter, score against every active profile in `config.json`, diff against the seen state, write `reports/<today>.md`, update `data/seen_jobs.json` and `reports/README.md`, commit, and try to push.

Persistence: the push usually fails with 403 because this routine's session has no repository sources. That is expected. Whether or not the push succeeds, convert the report with `python3 .claude/skills/remote-pm-jobs/scripts/md_to_html.py reports/<today>.md data/seen_jobs.json /tmp/remote-pm-jobs-<today>.html` and publish that file as a new artifact titled `Remote PM jobs <today>` (icon `briefcase`) with the claude-artifacts publish_files tool, or publish_version with the file's content if publish_files is unavailable. Put the artifact URL in your reply. The artifact is the durable record and the next run reads its embedded seen-jobs JSON.

Fallback if the repository cannot be obtained at all: still run the search with WebSearch only (at least 25 queries), filter to fully remote, worldwide or broad-region product management titles (no project manager, product marketing or product designer), and score fit 1 to 5 for Dave Mears and for Abdulmuiz Adebowale from the profile summaries stored on the Routine. Write the report as a simple HTML page and publish it as the artifact described above.

Rules:
- Never invent a listing, salary, date or eligibility. Say "unknown" when the snippet did not show it.
- Never say a posting was verified unless its page was actually opened.
- Keep the final reply under 300 words; it is what gets emailed. Include the artifact URL and the count of new roles.
