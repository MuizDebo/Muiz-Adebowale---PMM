// Build the compiled Remote PM jobs document (.docx + .md) from per-day JSON files.
// Usage: node build_compiled.js <out_dir> <json files...>
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, ExternalHyperlink,
  Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType,
} = require("docx");

const [outDir, ...inputs] = process.argv.slice(2);
const FROM = "2026-10-05", TO = "2026-10-31";

// ---- load and merge ----
const byUrl = new Map();
const excluded = [];
const perDay = {};
for (const f of inputs) {
  const d = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const r of d.roles) {
    const key = (r.url || (r.company + "|" + r.title)).replace(/[?#].*$/, "").replace(/\/$/, "").toLowerCase();
    perDay[r.date] = perDay[r.date] || { total: 0, new: 0 };
    perDay[r.date].total++;
    if (byUrl.has(key)) {
      const e = byUrl.get(key);
      e.dates.push(r.date);
      // keep the most recent facts but remember first seen
      Object.assign(e, r, { first_seen: e.first_seen, dates: e.dates });
    } else {
      perDay[r.date].new++;
      byUrl.set(key, { ...r, first_seen: r.date, dates: [r.date] });
    }
  }
  for (const x of d.excluded || []) excluded.push(x);
}
const roles = [...byUrl.values()];
roles.sort((a, b) => Math.max(b.D, b.M) - Math.max(a.D, a.M) || (b.D + b.M) - (a.D + a.M) || a.company.localeCompare(b.company));
const top = roles.filter(r => Math.max(r.D, r.M) >= 4);
const rest = roles.filter(r => Math.max(r.D, r.M) < 4);
const days = Object.keys(perDay).sort();

// ---- markdown ----
const md = [];
md.push(`# Remote Product Management Jobs: compiled list, ${FROM} to ${TO}`);
md.push("");
md.push(`Compiled ${TO}. ${roles.length} distinct roles from ${days.length} search days. Fit scores are 1 to 5 for Dave Mears (D) and Muiz Adebowale (M). Every entry came from web-search snippets; no posting page was opened, so check eligibility, salary and whether the role is still live before applying.`);
md.push("");
md.push("## Coverage by day");
md.push("");
md.push("| Day | Roles listed | New that day | Note |");
md.push("|---|---|---|---|");
const notes = {
  "2026-10-05": "First run, six search agents, about 100 queries.",
  "2026-10-31": "Daily routine run (5 roles, 16 queries) plus a fresh wide sweep the same day to close the gap.",
};
for (const d of days) md.push(`| ${d} | ${perDay[d].total} | ${perDay[d].new} | ${notes[d] || ""} |`);
md.push("");
md.push("**Gap, Oct 6 to Oct 30.** The daily routine ran every morning and emailed a brief, but it had no permission to push to this repository, so those briefs are not in this document. Forward those emails and they can be merged in.");
md.push("");

function block(r) {
  const out = [];
  out.push(`### ${r.title} at ${r.company}`);
  out.push(`- Link: [${r.url}](${r.url})`);
  out.push(`- Eligibility: ${r.elig} | Salary: ${r.salary} | Posted: ${r.posted} | Seniority: ${r.seniority} | Domain: ${r.domain}`);
  out.push(`- Fit: Dave ${r.D}/5, Muiz ${r.M}/5 | First seen: ${r.first_seen}${r.dates.length > 1 ? " | Seen again: " + r.dates.slice(1).join(", ") : ""}`);
  out.push(`- Why: ${r.why}`);
  out.push(`- Application angle: ${r.angle}`);
  out.push(`- How to apply: ${r.apply}`);
  out.push(`- Evidence: "${r.evidence}" (${r.source})`);
  out.push("");
  return out.join("\n");
}
md.push(`## Top picks (fit 4 or 5 for at least one profile): ${top.length}`);
md.push("");
for (const r of top) md.push(block(r));
md.push(`## All other roles: ${rest.length}`);
md.push("");
for (const r of rest) md.push(block(r));
md.push("## Excluded but notable");
md.push("");
for (const x of excluded) md.push(`- ${x.date}: ${x.name}: ${x.reason}${x.url ? ` [${x.url}](${x.url})` : ""}`);
md.push("");
md.push("## Method and caveats");
md.push("");
md.push("- Sources: We Work Remotely, Remotive, Himalayas, Working Nomads, RemoteOK, Jobicy, NoDesk, Dynamite Jobs, Greenhouse, Ashby, Lever, Workable, Wellfound, Hacker News Who is Hiring, and remote-first company career pages, all through web search.");
md.push("- Filter: product management titles only (no project manager, product marketing or product designer), fully remote, open worldwide or to a broad region.");
md.push("- Profiles: `.claude/skills/remote-pm-jobs/profiles/`. Dave's profile is provisional (no resume on file).");
fs.writeFileSync(path.join(outDir, `compiled-${FROM}-to-${TO}.md`), md.join("\n") + "\n");

// ---- docx ----
const font = "Calibri";
const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, font, size: 22, ...opts })], spacing: { after: 80 } });
const H = (text, level) => new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
const link = (url) => new ExternalHyperlink({ children: [new TextRun({ text: url, style: "Hyperlink", font, size: 22 })], link: url });
const labelled = (label, runs) => new Paragraph({ children: [new TextRun({ text: label + ": ", bold: true, font, size: 22 }), ...runs], spacing: { after: 60 } });

function roleDocx(r) {
  return [
    H(`${r.title} at ${r.company}`, HeadingLevel.HEADING_3),
    labelled("Link", [link(r.url)]),
    labelled("Eligibility", [new TextRun({ text: r.elig, font, size: 22 })]),
    labelled("Salary", [new TextRun({ text: `${r.salary}    Posted: ${r.posted}    Seniority: ${r.seniority}    Domain: ${r.domain}`, font, size: 22 })]),
    labelled("Fit", [new TextRun({ text: `Dave ${r.D}/5, Muiz ${r.M}/5    First seen: ${r.first_seen}${r.dates.length > 1 ? "    Seen again: " + r.dates.slice(1).join(", ") : ""}`, font, size: 22 })]),
    labelled("Why", [new TextRun({ text: r.why, font, size: 22 })]),
    labelled("Application angle", [new TextRun({ text: r.angle, font, size: 22 })]),
    labelled("How to apply", [new TextRun({ text: r.apply, font, size: 22 })]),
    labelled("Evidence", [new TextRun({ text: `"${r.evidence}" (${r.source})`, italics: true, font, size: 20, color: "555555" })]),
  ];
}

const cell = (t, bold = false, shade) => new TableCell({
  children: [new Paragraph({ children: [new TextRun({ text: t, bold, font, size: 20 })] })],
  shading: shade ? { type: ShadingType.CLEAR, fill: shade } : undefined,
});
const coverage = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: ["Day", "Roles listed", "New that day", "Note"].map(t => cell(t, true, "E8EEF7")) }),
    ...days.map(d => new TableRow({ children: [cell(d), cell(String(perDay[d].total)), cell(String(perDay[d].new)), cell(notes[d] || "")] })),
  ],
});

// Summary table of top picks
const summary = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({ children: ["Role", "Company", "Eligibility", "Salary", "Dave", "Muiz"].map(t => cell(t, true, "E8EEF7")) }),
    ...top.map(r => new TableRow({ children: [cell(r.title), cell(r.company), cell(r.elig.length > 60 ? r.elig.slice(0, 57) + "..." : r.elig), cell(r.salary.length > 40 ? r.salary.slice(0, 37) + "..." : r.salary), cell(String(r.D)), cell(String(r.M))] })),
  ],
});

const children = [
  new Paragraph({ children: [new TextRun({ text: "Remote Product Management Jobs", bold: true, font, size: 44 })], spacing: { after: 60 } }),
  new Paragraph({ children: [new TextRun({ text: `Compiled list, ${FROM} to ${TO}`, font, size: 28, color: "444444" })], spacing: { after: 200 } }),
  P(`Compiled ${TO}. ${roles.length} distinct roles from ${days.length} search days. Fit scores run 1 to 5 for Dave Mears (D) and Muiz Adebowale (M). Every entry came from web-search snippets; no posting page was opened, so check eligibility, salary and whether the role is still live before applying.`),
  H("Coverage by day", HeadingLevel.HEADING_1),
  coverage,
  P(""),
  P("Gap, Oct 6 to Oct 30: the daily routine ran every morning and emailed a brief, but it had no permission to push to the repository, so those briefs are not in this document. Forward those emails and they can be merged in.", { italics: true }),
  H(`Top picks at a glance (${top.length})`, HeadingLevel.HEADING_1),
  summary,
  H(`Top picks in detail`, HeadingLevel.HEADING_1),
  ...top.flatMap(roleDocx),
  H(`All other roles (${rest.length})`, HeadingLevel.HEADING_1),
  ...rest.flatMap(roleDocx),
  H("Excluded but notable", HeadingLevel.HEADING_1),
  ...excluded.map(x => new Paragraph({ children: [new TextRun({ text: `${x.date}: ${x.name}: ${x.reason} `, font, size: 22 }), ...(x.url ? [link(x.url)] : [])], bullet: { level: 0 }, spacing: { after: 60 } })),
  H("Method and caveats", HeadingLevel.HEADING_1),
  P("Sources: We Work Remotely, Remotive, Himalayas, Working Nomads, RemoteOK, Jobicy, NoDesk, Dynamite Jobs, Greenhouse, Ashby, Lever, Workable, Wellfound, Hacker News Who is Hiring, and remote-first company career pages, all through web search."),
  P("Filter: product management titles only (no project manager, product marketing or product designer), fully remote, open worldwide or to a broad region."),
  P("Profiles: Dave Mears (provisional, no resume on file) and Muiz Adebowale (from his application page). Scores are a reading aid, not a verdict."),
];

const doc = new Document({
  styles: { default: { document: { run: { font, size: 22 } } } },
  sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }],
});
Packer.toBuffer(doc).then(buf => {
  const out = path.join(outDir, `Remote-PM-Jobs-Compiled-${FROM}-to-${TO}.docx`);
  fs.writeFileSync(out, buf);
  console.log(JSON.stringify({ roles: roles.length, top: top.length, rest: rest.length, excluded: excluded.length, days: perDay, out }));
});
