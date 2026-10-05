# Query bank

Run each line as a `WebSearch` query. Lines starting with `#` are groups, useful for splitting across subagents. Add the current month and year where `{month}` and `{year}` appear.

# Group A: remote job boards (search results return individual postings)
site:weworkremotely.com/remote-jobs "product manager"
site:weworkremotely.com "product manager" "Anywhere in the World"
site:weworkremotely.com "product owner" OR "head of product"
site:remotive.com/remote/jobs "product manager" worldwide
site:remotive.com/remote/jobs "product manager" {month} {year}
site:remotive.com/remote/jobs "AI product manager"
site:remotive.com/remote/jobs "product owner"
site:himalayas.app "product manager" worldwide
site:workingnomads.com/jobs "product manager"
site:remoteok.com "product manager" worldwide
site:jobicy.com "product manager" remote
site:dynamitejobs.com "product manager"
site:nodesk.co/remote-jobs "product manager"
site:realworkfromanywhere.com "product manager"
site:productjobsanywhere.com "product manager"
site:jobgether.com "product manager" worldwide

# Group B: applicant tracking systems (direct company postings)
site:job-boards.greenhouse.io "product manager" remote worldwide
site:boards.greenhouse.io "product manager" "remote - anywhere" OR "remote (worldwide)"
site:jobs.lever.co "product manager" remote anywhere OR worldwide
site:jobs.ashbyhq.com "product manager" remote worldwide OR anywhere
site:apply.workable.com "product manager" remote worldwide
site:jobs.smartrecruiters.com "product manager" remote global
site:wellfound.com "product manager" remote
site:ycombinator.com/companies "product manager" remote
site:linkedin.com/jobs "product manager" remote worldwide OR "work from anywhere"
site:hnhiring.com "product manager" remote {month} {year}
"Who is hiring" {month} {year} "product manager" REMOTE

# Group C: phrase searches and remote-first companies
"product manager" "remote - worldwide" {year}
"product manager" "work from anywhere" hiring {year}
"product owner" remote worldwide {year} hiring
"head of product" remote anywhere {year}
"AI product manager" remote anywhere {year}
"technical product manager" remote worldwide contractor
"growth product manager" remote global {year}
"product manager" remote "Americas" OR "EMEA" OR "LATAM" {year}
GitLab product manager jobs remote {year}
Automattic product manager hiring remote
Deel product manager remote {year}
Toggl product manager remote
Zapier product manager remote {year}
Kinsta product manager worldwide
Vercel product manager anywhere
Clerk OR Supabase OR PostHog product manager remote
Canonical product manager remote {year}
Crossover product manager remote
Toptal OR Contra OR Superside product manager remote
Invisible Technologies OR Mercor product manager remote
Oyster OR Remote.com OR SafetyWing product manager remote
