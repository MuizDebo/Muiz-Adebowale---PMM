# Routine: Remote PM jobs, daily morning brief

Schedule: every day at 06:50 America/Los_Angeles (Pacific). Each run starts a fresh cloud session in the Default environment and sends a push and email notification when it finishes.

The prompt stored on the Routine is below. Keep this file in sync if the Routine is edited.

---

You are running the daily remote product-manager job search for Dave Mears. Nobody is watching this run and nobody can answer permission prompts; if a tool asks for permission, treat it as unavailable and continue.

Setup:
1. Check whether the current working directory contains `.claude/skills/remote-pm-jobs/SKILL.md`. If not, attach the repository `MuizDebo/Muiz-Adebowale---PMM` with the add_repo tool (push access), clone it as instructed, and cd into it.
2. Run `git fetch origin`. If the branch `claude/remote-pm-jobs-skill` exists on origin, check it out and pull it; otherwise use `main`.
3. Run `git config user.name "Dave Mears"` and `git config user.email "dave@nexthq.net"`.

Then read `.claude/skills/remote-pm-jobs/SKILL.md` in full and follow it exactly, end to end: load state, search (WebSearch only unless a WebFetch test succeeds), filter, score against every active profile in `config.json`, diff against `data/seen_jobs.json`, write `reports/<today>.md`, update `data/seen_jobs.json` and `reports/README.md`, commit, push to the branch you checked out, and finish with the morning brief in the shape the skill specifies.

Rules:
- Never invent a listing, salary, date or eligibility. Say "unknown" when the snippet did not show it.
- Never say a posting was verified unless its page was actually opened.
- If the push fails, include the full brief in your reply anyway and say the push failed.
- Keep the final reply under 300 words; it is what gets emailed.
