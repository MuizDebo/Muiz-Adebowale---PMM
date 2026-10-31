#!/usr/bin/env python3
"""Convert a remote-pm-jobs report (limited markdown) to a standalone HTML page.

Usage: md_to_html.py <report.md> <seen_jobs.json> <out.html>

The seen-jobs JSON is embedded as <script id="seen-jobs" type="application/json">
so a later run can recover dedup state from the published artifact when the
repository could not be pushed.
"""
import html, json, re, sys

src, seen_path, out = sys.argv[1:4]
lines = open(src, encoding="utf-8").read().splitlines()
seen = open(seen_path, encoding="utf-8").read()
json.loads(seen)  # validate

LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")
BOLD = re.compile(r"\*\*([^*]+)\*\*")

def inline(s):
    s = html.escape(s, quote=False)
    s = LINK.sub(lambda m: f'<a href="{m.group(2)}" target="_blank" rel="noopener">{m.group(1)}</a>', s)
    s = BOLD.sub(r"<strong>\1</strong>", s)
    return s

body, in_list, in_table, title = [], False, False, "Remote PM jobs"
def close_list():
    global in_list
    if in_list:
        body.append("</ul>"); in_list = False
def close_table():
    global in_table
    if in_table:
        body.append("</table>"); in_table = False

for raw in lines:
    line = raw.rstrip()
    if line.startswith("|"):
        close_list()
        cells = [c.strip() for c in line.strip("|").split("|")]
        if all(re.fullmatch(r":?-{3,}:?", c) for c in cells):
            continue
        if not in_table:
            body.append("<table>"); in_table = True
            body.append("<tr>" + "".join(f"<th>{inline(c)}</th>" for c in cells) + "</tr>")
        else:
            body.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in cells) + "</tr>")
        continue
    close_table()
    m = re.match(r"^(#{1,3})\s+(.*)", line)
    if m:
        close_list()
        level = len(m.group(1))
        if level == 1 and title == "Remote PM jobs":
            title = m.group(2)
        body.append(f"<h{level}>{inline(m.group(2))}</h{level}>")
    elif line.startswith("- "):
        if not in_list:
            body.append("<ul>"); in_list = True
        body.append(f"<li>{inline(line[2:])}</li>")
    elif line.strip() == "":
        close_list()
    else:
        close_list()
        body.append(f"<p>{inline(line)}</p>")
close_list(); close_table()

page = f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<style>
:root{{--bg:#ffffff;--fg:#1b1f24;--muted:#5b6470;--line:#e3e7ec;--accent:#1f5fbf;--card:#f6f8fa}}
@media (prefers-color-scheme: dark){{:root:not([data-theme="light"]){{--bg:#0f1216;--fg:#e6e9ee;--muted:#9aa4b1;--line:#2a3039;--accent:#7fb0ff;--card:#161b22}}}}
:root[data-theme="dark"]{{--bg:#0f1216;--fg:#e6e9ee;--muted:#9aa4b1;--line:#2a3039;--accent:#7fb0ff;--card:#161b22}}
body{{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}}
main{{max-width:860px;margin:0 auto;padding:24px 16px 64px}}
h1{{font-size:1.7rem;margin:.2em 0 .4em}} h2{{font-size:1.25rem;margin:1.6em 0 .5em;padding-top:.6em;border-top:1px solid var(--line)}}
h3{{font-size:1.05rem;margin:1.2em 0 .3em;background:var(--card);padding:.5em .7em;border-radius:8px}}
ul{{margin:.2em 0 .6em 1.1em;padding:0}} li{{margin:.15em 0}} a{{color:var(--accent);word-break:break-all}}
p{{margin:.4em 0}} table{{border-collapse:collapse;width:100%;margin:.6em 0;font-size:.95em}} th,td{{border:1px solid var(--line);padding:.35em .5em;text-align:left;vertical-align:top}}
th{{background:var(--card)}}
</style></head><body><main>
{chr(10).join(body)}
</main>
<script id="seen-jobs" type="application/json">{seen}</script>
</body></html>
"""
open(out, "w", encoding="utf-8").write(page)
print(out, len(page))
