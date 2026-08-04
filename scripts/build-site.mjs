import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const clean = (value = '') => value
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^>\s?/gm, '')
  .trim();

function readSection(markdown, heading) {
  const safe = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = markdown.match(new RegExp(`^## ${safe}\\s*$([\\s\\S]*?)(?=^## |^# |(?![\\s\\S]))`, 'm'));
  return clean(match?.[1] || '');
}

function readAnySection(markdown, heading) {
  return readSection(markdown, heading) || (() => {
    const safe = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = markdown.match(new RegExp(`^# ${safe}\\s*$([\\s\\S]*?)(?=^# |(?![\\s\\S]))`, 'm'));
    return clean(match?.[1] || '');
  })();
}

function asItems(value = '') {
  const items = [...value.matchAll(/^[-*] (.+)$/gm)].map(match => clean(match[1]));
  if (items.length) return items;
  const tableRows = clean(value).split(/\n+/)
    .filter(line => /^\|.+\|$/.test(line) && !/^\|?\s*:?-+/.test(line) && !/\|\s*Error\s*\|/i.test(line))
    .map(line => line.split('|').map(cell => cell.trim()).filter(Boolean).join(': '));
  return tableRows.length ? tableRows : clean(value).split(/\n+/).filter(Boolean);
}

function prose(value = '') {
  return clean(value)
    .replace(/^[-*] /gm, '')
    .replace(/^###? .+$/gm, '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .join(' ');
}

function parseSubsections(body) {
  const parts = [...body.matchAll(/^### (.+)\s*$([\s\S]*?)(?=^### |(?![\s\S]))/gm)];
  return Object.fromEntries(parts.map(match => [match[1].trim(), clean(match[2])]));
}

function parseDetailedSequence(markdown) {
  const region = markdown.match(/^# Class sequence\s*$([\s\S]*?)(?=^# (?!Class sequence)|(?![\s\S]))/m)?.[1] || '';
  return [...region.matchAll(/^## (\d+[^:]*minutes): (.+)\s*$([\s\S]*?)(?=^## |(?![\s\S]))/gm)].map(match => {
    const sections = parseSubsections(match[3]);
    return {
      time: match[1].replace(' minutes', ' min'),
      title: clean(match[2]),
      purpose: prose(sections.Purpose),
      leader: asItems(sections['Leader-role teacher actions']),
      follower: asItems(sections['Follower-role teacher actions']),
      task: asItems(sections['Student task']),
      success: prose(sections['Success signal']),
      errors: asItems(sections['Common errors and corrections']),
      safety: asItems(sections['Safety and consent cue'] || sections['Safety or consent cue']),
      rotation: prose(sections['Partner rotation']),
      transition: prose(sections.Transition)
    };
  });
}

function parseOpenNightSequence(markdown) {
  const blocks = [...markdown.matchAll(/^### (\d+ to \d+ minutes): (.+)\s*$([\s\S]*?)(?=^### \d+ to \d+ minutes:|^## |(?![\s\S]))/gm)];
  return blocks.map(match => {
    const body = match[3];
    const part = label => clean(body.match(new RegExp(`^${label}:\\s*$([\\s\\S]*?)(?=^[A-Z][^\\n]+:\\s*$|(?![\\s\\S]))`, 'm'))?.[1] || '');
    const teacher = asItems(part('Teacher actions'));
    return {
      time: match[1].replace(' to ', '–').replace(' minutes', ' min'),
      title: clean(match[2]),
      purpose: prose(part('Purpose')),
      leader: teacher,
      follower: ['Demonstrate the follower role from a clear second angle.', 'Observe balance, anticipation, comfort, and connection range.'],
      task: asItems(part('Student task')),
      success: prose(part('Success signal')),
      errors: [],
      safety: [],
      rotation: teacher.find(item => /rotate/i.test(item)) || '',
      transition: ''
    };
  });
}

function generatedSequence(lesson) {
  const movement = lesson.movement.join(', ');
  const foundation = lesson.foundation.join(', ');
  const core = lesson.core.join(' ');
  const entries = lesson.entries.join(' ');
  const exits = lesson.exits.join(' ');
  const progression = lesson.progressing.join(' ');
  const challenge = lesson.challenge.join(' ');
  const social = lesson.social.join(' ');
  const safety = lesson.safety;
  const errors = lesson.errors;
  const common = {
    leader: [`Demonstrate ${movement} with compact, readable movement.`, `Watch timing, preparation, direction, and floorcraft.`],
    follower: [`Demonstrate the follower experience from a second viewing angle.`, `Watch balance, anticipation, connection, and range.`],
    errors,
    safety,
    rotation: 'Rotate after the partner task. Students may remain with a partner or opt out of a rotation.',
  };
  return [
    { time: '0–5 min', title: 'Goal, readiness, and recap', purpose: lesson.promise, task: ['Listen to the class goal.', 'Review the prerequisite movement in place.'], success: 'Students understand the objective and show the starting skill without teacher correction.', transition: `Connect the recap to ${foundation}.` },
    { time: '5–12 min', title: 'Technical foundation', purpose: `Establish ${foundation} before adding the headline movement.`, task: [`Practise ${foundation} individually.`, 'Stop on request and confirm personal balance.'], success: 'Most students remain balanced and complete each weight transfer.', transition: 'Keep the same quality while adding the core movement.' },
    { time: '12–22 min', title: 'Core movement individually', purpose: `Make the essential shape and timing of ${movement} clear before partner work.`, task: lesson.core, success: `Most students complete the core version of ${movement} without rushing.`, transition: 'Form partnerships in open hold and repeat the essential version.' },
    { time: '22–34 min', title: 'Core movement with a partner', purpose: `Transfer ${movement} into partner connection without losing individual balance.`, task: [core, 'Repeat at a smaller range with a new partner.'], success: 'Couples complete the movement through body communication rather than arm force.', transition: 'Keep the core version, then add one prepared entry.' },
    { time: '34–43 min', title: 'Entry, exit, and recovery', purpose: 'Make the movement reusable in social dance rather than dependent on a fixed sequence.', task: [`Entry options: ${entries}`, `Exit options: ${exits}`, 'Return to the safest familiar movement when the signal is unclear.'], success: 'Couples enter, complete, and exit without stopping or forcing the pathway.', transition: 'Offer one controlled progression while the core version remains available.' },
    { time: '43–51 min', title: 'Progression and challenge', purpose: 'Increase control and decision-making for faster students without adding unrelated figures.', task: [progression, challenge], success: 'Students choose a suitable version and preserve timing, balance, and range.', transition: 'Remove teacher counting and move into the social-dance task.' },
    { time: '51–58 min', title: 'Guided social dance', purpose: 'Test whether students use the material as a choice inside continuous dancing.', task: [social, 'Use the stated recovery whenever the movement becomes unclear.'], success: 'Most couples dance continuously and use the weekly material without waiting for a teacher cue.', transition: 'Return to Marca or a comfortable neutral position for review.' },
    { time: '58–60 min', title: 'Review and next-week link', purpose: 'Name the transferable skill and prepare students for the next class.', task: ['Repeat the core version once.', `Connect the skill to ${lesson.next}.`], success: 'Students name the foundation, safe range, and recovery option.', transition: 'Record test points after class.' }
  ].map(block => ({ ...common, ...block, generated: true }));
}

function parseLesson(level, week) {
  const path = join(root, 'classes', `level-${level}`, `week-${String(week).padStart(2, '0')}.md`);
  const markdown = readFileSync(path, 'utf8');
  const titleMatch = markdown.match(/^# Level \d+, Week \d+: (.+)$/m);
  const connection = readSection(markdown, 'Connection to the course') || readSection(markdown, 'Connection to the programme');
  const connectionItems = asItems(connection);
  const lesson = {
    id: `l${level}w${week}`,
    level,
    week,
    title: clean(titleMatch?.[1] || `Week ${week}`),
    status: clean(markdown.match(/^Status:\s*(.+)$/m)?.[1] || 'Draft'),
    promise: prose(readSection(markdown, 'Student-facing promise')),
    movement: asItems(readSection(markdown, 'Headline movement family') || parseSubsections(readSection(markdown, 'Movement scope'))['Fully taught'] || readSection(markdown, 'Movement scope')),
    foundation: asItems(readSection(markdown, 'Technical foundation') || readSection(markdown, 'Technical foundations')),
    prerequisites: asItems(readSection(markdown, 'Prerequisites') || readSection(markdown, 'Starting conditions')),
    core: asItems(readSection(markdown, 'Core version')),
    progressing: asItems(readSection(markdown, 'Progressing version')),
    challenge: asItems(readSection(markdown, 'Challenge version')),
    entries: asItems(readSection(markdown, 'Entry options')),
    exits: asItems(readSection(markdown, 'Exit options')),
    social: asItems(readSection(markdown, 'Social-dance task')),
    errors: asItems(readAnySection(markdown, 'Common errors') || readAnySection(markdown, 'Common errors and correction cues')),
    safety: asItems(readAnySection(markdown, 'Safety notes') || readAnySection(markdown, 'Safety and consent')),
    questions: asItems(readAnySection(markdown, 'Open questions') || readAnySection(markdown, 'Open questions and test points')),
    previous: connectionItems.find(item => /^Previous/i.test(item))?.replace(/^Previous (week|class):?\s*/i, '') || (week > 1 ? `Level ${level}, Week ${week - 1}` : level === 2 ? 'Level 1 completion' : 'Open Night'),
    next: connectionItems.find(item => /^Next/i.test(item))?.replace(/^Next (week|class):?\s*/i, '') || (week < 8 ? `Level ${level}, Week ${week + 1}` : level === 1 ? 'Level 2 readiness' : 'Cycle review'),
    detailed: false,
  };
  const detailed = parseDetailedSequence(markdown);
  lesson.detailed = detailed.length > 0;
  lesson.sequence = detailed.length ? detailed : generatedSequence(lesson);
  return lesson;
}

const levels = [1, 2].map(level => ({
  id: `level-${level}`,
  level,
  name: level === 1 ? 'Foundations and Social Flow' : 'Fusion Techniques and Musicality',
  descriptor: level === 1 ? 'Build reliable movement, connection, and recovery.' : 'Develop controlled Fusion technique, preparation, and safe exits.',
  readiness: level === 1 ? 'No previous Kizomba experience required.' : 'Requires reliable Level 1 weight transfer, stops, Saídas, and open connection.',
  lessons: Array.from({ length: 8 }, (_, index) => parseLesson(level, index + 1))
}));

const openMarkdown = readFileSync(join(root, 'classes/open-night/kizomba-open-night.md'), 'utf8');
const openLesson = {
  id: 'open-night',
  level: 0,
  week: 0,
  title: 'Kizomba Open Night',
  status: clean(openMarkdown.match(/^Status:\s*(.+)$/m)?.[1] || 'Draft'),
  promise: prose(readSection(openMarkdown, 'Student-facing promise')),
  movement: ['Natural walking', 'Basic 2', 'Basic 1', 'Quarter-turn', 'Timing contrast'],
  foundation: ['Pulse', 'Complete weight transfer', 'Personal balance', 'Light connection'],
  prerequisites: ['Complete beginners welcome'],
  core: [], progressing: [], challenge: [], entries: [], exits: [],
  social: asItems(readSection(openMarkdown, 'Social-dance task')),
  errors: asItems(readSection(openMarkdown, 'Common errors and corrections') || readSection(openMarkdown, 'Common errors')),
  safety: asItems(readSection(openMarkdown, 'Safety and consent')),
  questions: asItems(readSection(openMarkdown, 'Open questions and test points')),
  previous: 'Standalone introduction',
  next: 'Level 1, Week 1',
  detailed: true,
  sequence: parseOpenNightSequence(openMarkdown),
};

const programme = [{ id: 'open-night', level: 0, label: 'Open Night', name: 'Open Night', descriptor: 'A 60-minute first Kizomba experience.', readiness: 'Complete beginners welcome.', lessons: [openLesson] }, ...levels];
const lessonCount = programme.reduce((total, level) => total + level.lessons.length, 0);
if (lessonCount !== 17) throw new Error(`Expected 17 classes, found ${lessonCount}.`);
for (const lesson of programme.flatMap(level => level.lessons)) {
  if (lesson.sequence.length < 8) throw new Error(`${lesson.id} has an incomplete teaching sequence.`);
  if (!lesson.title || !lesson.promise) throw new Error(`${lesson.id} is missing its title or student promise.`);
}
const data = JSON.stringify(programme).replace(/</g, '\\u003c');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f7f4f1">
<title>The Tribe Kizomba Teaching Guide</title>
<script>try{document.documentElement.dataset.theme=localStorage.getItem('tribe-kizomba-theme')||'light'}catch(error){document.documentElement.dataset.theme='light'}</script>
<style>
:root{--bg:#0e0c11;--surface:#17141b;--surface2:#211d27;--line:#36303e;--text:#f8f3ef;--muted:#b8afbc;--accent:#f2a360;--accent-soft:#3b291f;--ok:#76d2ae;--danger:#ee7c7c;--shadow:0 24px 70px #05040666}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 75% -10%,#42223c 0,transparent 34rem),var(--bg);color:var(--text);font:15px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}button,input{font:inherit}button{color:inherit}.app{min-height:100vh}.topbar{position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:16px;min-height:68px;padding:10px 22px;border-bottom:1px solid var(--line);background:#0e0c11e8;backdrop-filter:blur(18px)}.brand{display:flex;align-items:center;gap:11px;min-width:230px}.mark{width:42px;height:42px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(145deg,#d66f91,var(--accent));color:#160f15;font-weight:950;font-size:1.1rem}.brand-copy{display:grid;line-height:1.15}.brand-copy b{font-size:.94rem}.brand-copy span{color:var(--muted);font-size:.73rem}.level-tabs{display:flex;gap:4px;margin:auto;padding:4px;border:1px solid var(--line);border-radius:13px;background:var(--surface)}.level-tabs button,.ghost,.primary,.week-button,.notes-button{border:0;border-radius:10px;cursor:pointer}.level-tabs button{padding:8px 13px;background:transparent;color:var(--muted)}.level-tabs button.active{background:var(--surface2);color:var(--text);box-shadow:inset 0 0 0 1px var(--line)}.top-actions{display:flex;gap:7px}.ghost{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;padding:8px 12px;border:1px solid var(--line);background:var(--surface)}.ghost:hover,.notes-button:hover{border-color:var(--accent);color:var(--accent)}.layout{display:grid;grid-template-columns:290px minmax(0,1fr);max-width:1440px;margin:auto}.sidebar{position:sticky;top:68px;height:calc(100vh - 68px);padding:28px 18px;border-right:1px solid var(--line);overflow:auto}.sidebar h2{margin:0 8px 6px;font-size:1.25rem}.sidebar>p{margin:0 8px 18px;color:var(--muted)}.readiness{margin:0 8px 18px;padding:12px;border:1px solid color-mix(in srgb,var(--accent) 45%,var(--line));border-radius:12px;background:var(--accent-soft);color:#eaded6;font-size:.82rem}.week-list{display:grid;gap:6px}.week-button{display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:10px;width:100%;padding:10px;background:transparent;text-align:left}.week-button:hover{background:var(--surface)}.week-button.active{background:var(--surface2);box-shadow:inset 3px 0 var(--accent)}.week-number{width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:var(--surface);color:var(--accent);font-weight:900}.week-button.active .week-number{background:var(--accent-soft)}.week-copy{min-width:0}.week-copy b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.87rem}.week-copy span{color:var(--muted);font-size:.72rem}.done-dot{width:9px;height:9px;border-radius:50%;border:1px solid var(--line)}.done .done-dot{border-color:var(--ok);background:var(--ok)}.main{min-width:0;padding:34px clamp(22px,5vw,74px) 80px}.lesson{max-width:980px;margin:auto}.breadcrumbs{display:flex;gap:7px;color:var(--muted);font-size:.76rem;text-transform:uppercase;letter-spacing:.1em;font-weight:800}.hero{padding:22px 0 30px;border-bottom:1px solid var(--line)}.hero-row{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}.hero h1{max-width:760px;margin:9px 0 12px;font-size:clamp(2.35rem,5.5vw,5.2rem);line-height:.94;letter-spacing:-.055em}.promise{max-width:780px;margin:0;color:#d8cfd9;font-size:1.12rem}.primary{flex:none;padding:11px 15px;background:var(--accent);color:#1b1210;font-weight:850}.primary.taught{background:var(--ok);color:#0b2018}.badges{display:flex;gap:8px;flex-wrap:wrap;margin-top:20px}.badge{padding:6px 10px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--muted);font-size:.75rem}.badge.strong{border-color:color-mix(in srgb,var(--accent) 55%,var(--line));color:var(--accent)}.overview{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:22px 0 34px}.info-card{padding:17px;border:1px solid var(--line);border-radius:16px;background:var(--surface)}.eyebrow{display:block;margin-bottom:7px;color:var(--accent);font-size:.69rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.info-card p,.info-card ul{margin:0;color:#d3cad5}.info-card ul{padding-left:17px}.section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin:34px 0 13px}.section-head h2{margin:0;font-size:1.55rem}.section-head p{margin:0;color:var(--muted);font-size:.82rem}.timeline{display:grid;gap:9px}.timeline-card{border:1px solid var(--line);border-radius:16px;background:var(--surface);overflow:hidden}.timeline-summary{display:grid;grid-template-columns:80px 1fr auto;align-items:center;gap:15px;padding:14px 16px;cursor:pointer;list-style:none}.timeline-summary::-webkit-details-marker{display:none}.time{align-self:start;padding:8px;border-radius:10px;background:var(--accent-soft);color:var(--accent);font-size:.75rem;font-weight:900;text-align:center}.timeline-summary h3{margin:0;font-size:1rem}.timeline-summary p{margin:3px 0 0;color:var(--muted);font-size:.82rem}.chevron{transition:transform .2s}.timeline-card[open] .chevron{transform:rotate(180deg)}.timeline-body{padding:0 16px 16px 111px;border-top:1px solid var(--line)}.timeline-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:10px;padding-top:14px}.mini{padding:13px;border-radius:12px;background:var(--surface2)}.mini p,.mini ul{margin:0;color:#d8cfd9}.mini ul{padding-left:17px}.notes-button{margin-top:11px;padding:9px 12px;border:1px solid var(--line);background:transparent;color:var(--text);font-weight:760}.detail-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:14px}.detail-card{padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--surface)}.detail-card h3{margin:0 0 9px;font-size:1rem}.detail-card ul{margin:0;padding-left:18px;color:#d7ced9}.detail-card.full{grid-column:1/-1}.bottom-nav{display:flex;justify-content:space-between;gap:12px;margin-top:40px;padding-top:24px;border-top:1px solid var(--line)}.bottom-nav button{max-width:48%;text-align:left}.bottom-nav button:last-child{text-align:right;margin-left:auto}.sheet-backdrop{position:fixed;inset:0;z-index:50;background:#050406a8;opacity:0;pointer-events:none;transition:opacity .2s}.sheet-backdrop.open{opacity:1;pointer-events:auto}.sheet{position:absolute;inset:0 0 0 auto;width:min(520px,100%);padding:24px;background:#151219;border-left:1px solid var(--line);box-shadow:var(--shadow);overflow:auto;transform:translateX(100%);transition:transform .24s}.open .sheet{transform:none}.sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;padding-bottom:18px;border-bottom:1px solid var(--line)}.sheet-head h2{margin:4px 0 0;font-size:1.5rem}.sheet-close{width:40px;height:40px;padding:0}.note-section{padding:18px 0;border-bottom:1px solid var(--line)}.note-section h3{margin:0 0 8px;font-size:.9rem}.note-section p,.note-section ul{margin:0;color:#d4cbd6}.note-section ul{padding-left:18px}.mobile-menu{display:none}.search-wrap{position:fixed;inset:0;z-index:70;display:none;place-items:start center;padding-top:12vh;background:#050406c4}.search-wrap.open{display:grid}.search-box{width:min(620px,calc(100% - 28px));padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--surface);box-shadow:var(--shadow)}.search-box input{width:100%;padding:12px 13px;border:1px solid var(--line);border-radius:11px;background:var(--surface2);color:var(--text);outline:0}.results{display:grid;gap:5px;margin-top:10px;max-height:55vh;overflow:auto}.result{display:grid;gap:2px;padding:11px;border:0;border-radius:10px;background:transparent;color:var(--text);text-align:left;cursor:pointer}.result:hover,.result.active{background:var(--surface2)}.result span{color:var(--muted);font-size:.77rem}.empty{padding:18px;color:var(--muted);text-align:center}body.level-2{--accent:#b892ff;--accent-soft:#2d2445}body.open-night{--accent:#e8799e;--accent-soft:#3b2030}@media(max-width:900px){.brand{min-width:0}.brand-copy{display:none}.level-tabs{margin-left:auto}.top-actions .search-label{display:none}.layout{grid-template-columns:1fr}.sidebar{position:fixed;inset:68px auto 0 0;z-index:40;width:min(320px,88vw);height:auto;background:var(--bg);transform:translateX(-102%);transition:transform .22s;box-shadow:var(--shadow)}.sidebar.open{transform:none}.mobile-menu{display:inline-flex}.main{padding-inline:20px}.overview{grid-template-columns:1fr}.hero-row{display:block}.hero .primary{margin-top:20px}.detail-grid{grid-template-columns:1fr}.detail-card.full{grid-column:auto}}@media(max-width:620px){.topbar{gap:8px;padding-inline:12px}.level-tabs button{padding:7px 9px;font-size:.76rem}.top-actions .print{display:none}.main{padding:24px 14px 60px}.hero h1{font-size:2.55rem}.timeline-summary{grid-template-columns:66px 1fr;gap:10px;padding:12px}.timeline-summary .chevron{display:none}.timeline-body{padding:0 12px 12px}.timeline-grid{grid-template-columns:1fr}.section-head{display:block}.section-head p{margin-top:4px}.bottom-nav .ghost{font-size:.75rem}}@media print{.topbar,.sidebar,.primary,.notes-button,.bottom-nav{display:none!important}.layout{display:block}.main{padding:0}.timeline-card{break-inside:avoid}.timeline-card .timeline-body{display:block}.sheet-backdrop{display:none}}
:root{color-scheme:dark;--bg-glow:#42223c;--topbar:#0e0c11e8;--sheet:#151219;--content:#d8cfd9;--backdrop:#050406a8}html[data-theme="light"]{color-scheme:light;--bg:#f7f4f1;--bg-glow:#efd6e3;--surface:#fff;--surface2:#f1ece8;--line:#d9d0cb;--text:#241b21;--muted:#6f646c;--accent:#a75321;--accent-soft:#f7e1d2;--ok:#25795e;--danger:#b84242;--topbar:#f7f4f1e8;--sheet:#fff;--content:#4e434b;--backdrop:#241b2166;--shadow:0 24px 70px #49383f1f}body{background:radial-gradient(circle at 75% -10%,var(--bg-glow) 0,transparent 34rem),var(--bg)}.topbar{background:var(--topbar)}.readiness,.promise,.info-card p,.info-card ul,.mini p,.mini ul,.detail-card ul,.note-section p,.note-section ul{color:var(--content)}.sheet-backdrop{background:var(--backdrop)}.sheet{background:var(--sheet)}.search-wrap{background:var(--backdrop)}html[data-theme="light"] .primary,html[data-theme="light"] .primary.taught{color:#fff}html[data-theme="light"] body.level-2{--accent:#7048b8;--accent-soft:#eee6ff}html[data-theme="light"] body.open-night{--accent:#b34069;--accent-soft:#f9e0e9}.theme-icon{font-size:1rem;line-height:1}@media(max-width:620px){.theme-label{display:none}.theme-toggle{width:40px;padding-inline:0}}@media(max-width:360px){.brand{display:none}}
</style>
</head>
<body>
<div class="app">
  <header class="topbar">
    <button class="ghost mobile-menu" id="menuButton" aria-label="Open class navigation">☰</button>
    <div class="brand"><span class="mark">T</span><span class="brand-copy"><b>The Tribe</b><span>Kizomba teaching guide</span></span></div>
    <nav class="level-tabs" id="levelTabs" aria-label="Programme level"></nav>
    <div class="top-actions"><button class="ghost search-label" id="searchButton">⌕ Search</button><button class="ghost theme-toggle" id="themeButton" type="button"></button><button class="ghost print" onclick="window.print()">Print</button></div>
  </header>
  <div class="layout">
    <aside class="sidebar" id="sidebar"></aside>
    <main class="main"><div class="lesson" id="lesson"></div></main>
  </div>
</div>
<div class="sheet-backdrop" id="sheetBackdrop"><aside class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Teaching notes"></aside></div>
<div class="search-wrap" id="searchWrap"><div class="search-box"><input id="searchInput" type="search" placeholder="Search classes, moves, and foundations" aria-label="Search curriculum"><div class="results" id="results"></div></div></div>
<script>
const programme=${data};
const state={level:0,lesson:'open-night'};
let storage;try{storage=window.localStorage;storage.getItem('tribe-kizomba-storage-test')}catch(error){storage={getItem:()=>null,setItem:()=>{}}}const progress=JSON.parse(storage.getItem('tribe-kizomba-taught')||'{}');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=items=>items?.length?'<ul>'+items.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>Not specified in the current plan.</p>';
const activeLevel=()=>programme.find(x=>x.level===state.level||state.level===0&&x.id==='open-night');
const allLessons=()=>programme.flatMap(level=>level.lessons.map(lesson=>({...lesson,levelName:level.name})));
const currentLesson=()=>allLessons().find(x=>x.id===state.lesson);
function renderTabs(){document.querySelector('#levelTabs').innerHTML=programme.map(level=>'<button class="'+(level.level===state.level?'active':'')+'" data-level="'+level.level+'">'+(level.label||'Level '+level.level)+'</button>').join('');document.querySelectorAll('[data-level]').forEach(button=>button.onclick=()=>selectLevel(Number(button.dataset.level)));}
function renderSidebar(){const level=activeLevel();document.querySelector('#sidebar').innerHTML='<h2>'+esc(level.name)+'</h2><p>'+esc(level.descriptor)+'</p><div class="readiness"><span class="eyebrow">Readiness</span>'+esc(level.readiness)+'</div><div class="week-list">'+level.lessons.map(lesson=>'<button class="week-button '+(lesson.id===state.lesson?'active ':'')+(progress[lesson.id]?'done':'')+'" data-lesson="'+lesson.id+'"><span class="week-number">'+(lesson.week||'ON')+'</span><span class="week-copy"><b>'+esc(lesson.title)+'</b><span>'+esc(lesson.detailed?'Detailed 60-minute plan':'Structured class plan')+'</span></span><span class="done-dot" aria-label="'+(progress[lesson.id]?'Taught':'Not taught')+'"></span></button>').join('')+'</div>';document.querySelectorAll('[data-lesson]').forEach(button=>button.onclick=()=>selectLesson(button.dataset.lesson));}
function infoCard(label,content){return '<article class="info-card"><span class="eyebrow">'+label+'</span>'+list(content)+'</article>'}
function renderTimeline(lesson){return lesson.sequence.map((block,index)=>'<details class="timeline-card" '+(index===0?'open':'')+'><summary class="timeline-summary"><span class="time">'+esc(block.time)+'</span><span><h3>'+esc(block.title)+'</h3><p>'+esc(block.task?.[0]||block.purpose)+'</p></span><span class="chevron">⌄</span></summary><div class="timeline-body"><div class="timeline-grid"><div class="mini"><span class="eyebrow">Student task</span>'+list(block.task)+'</div><div class="mini"><span class="eyebrow">Success signal</span><p>'+esc(block.success)+'</p></div></div><button class="notes-button" data-note="'+index+'">View teaching notes →</button></div></details>').join('');}
function detailCard(title,items,extra=''){return '<article class="detail-card '+extra+'"><h3>'+esc(title)+'</h3>'+list(items)+'</article>'}
function renderLesson(){const lesson=currentLesson();document.body.className=state.level===2?'level-2':state.level===0?'open-night':'';const taught=!!progress[lesson.id];document.querySelector('#lesson').innerHTML='<div class="breadcrumbs"><span>'+(state.level===0?'Open Night':'Level '+state.level)+'</span><span>›</span><span>'+(lesson.week?'Week '+lesson.week:'Introduction')+'</span></div><section class="hero"><div class="hero-row"><div><h1>'+esc(lesson.title)+'</h1><p class="promise">'+esc(lesson.promise)+'</p></div><button class="primary '+(taught?'taught':'')+'" id="taughtButton">'+(taught?'✓ Taught':'Mark as taught')+'</button></div><div class="badges"><span class="badge strong">60 minutes</span><span class="badge">'+esc(lesson.status)+'</span><span class="badge">'+(lesson.detailed?'Detailed source plan':'Structured from curriculum outline')+'</span></div></section><section class="overview">'+infoCard('Headline movement',lesson.movement)+infoCard('Technical foundation',lesson.foundation)+infoCard('Prerequisites',lesson.prerequisites)+'</section><div class="section-head"><div><span class="eyebrow">Teaching sequence</span><h2>60-minute class flow</h2></div><p>Open a section, then view role-specific teaching notes.</p></div><section class="timeline">'+renderTimeline(lesson)+'</section><div class="section-head"><div><span class="eyebrow">Class toolkit</span><h2>Options, safety, and review</h2></div></div><section class="detail-grid">'+detailCard('Core version',lesson.core)+detailCard('Progressing version',lesson.progressing)+detailCard('Challenge version',lesson.challenge)+detailCard('Entry options',lesson.entries)+detailCard('Exit options',lesson.exits)+detailCard('Common errors',lesson.errors)+detailCard('Safety and consent',lesson.safety,'full')+detailCard('Social-dance task',lesson.social,'full')+detailCard('Open questions and test points',lesson.questions,'full')+'</section><nav class="bottom-nav" id="bottomNav"></nav>';
document.querySelector('#taughtButton').onclick=()=>{progress[lesson.id]=!progress[lesson.id];storage.setItem('tribe-kizomba-taught',JSON.stringify(progress));renderSidebar();renderLesson()};
document.querySelectorAll('[data-note]').forEach(button=>button.onclick=()=>openNotes(lesson.sequence[Number(button.dataset.note)]));renderBottomNav();}
function renderBottomNav(){const lessons=allLessons();const index=lessons.findIndex(x=>x.id===state.lesson);const previous=lessons[index-1],next=lessons[index+1];document.querySelector('#bottomNav').innerHTML=(previous?'<button class="ghost" data-jump="'+previous.id+'">← '+esc(previous.title)+'</button>':'')+(next?'<button class="ghost" data-jump="'+next.id+'">'+esc(next.title)+' →</button>':'');document.querySelectorAll('[data-jump]').forEach(button=>button.onclick=()=>jumpTo(button.dataset.jump));}
function noteSection(title,content,isList=true){if(!content||Array.isArray(content)&&!content.length)return'';return '<section class="note-section"><h3>'+esc(title)+'</h3>'+(isList?list(content):'<p>'+esc(content)+'</p>')+'</section>'}
function openNotes(block){document.querySelector('#sheet').innerHTML='<div class="sheet-head"><div><span class="eyebrow">'+esc(block.time)+'</span><h2>'+esc(block.title)+'</h2></div><button class="ghost sheet-close" id="sheetClose" aria-label="Close teaching notes">×</button></div>'+noteSection('Purpose',block.purpose,false)+noteSection('Leader-role teacher actions',block.leader)+noteSection('Follower-role teacher actions',block.follower)+noteSection('Student task',block.task)+noteSection('Success signal',block.success,false)+noteSection('Common errors and correction cues',block.errors)+noteSection('Safety and consent',block.safety)+noteSection('Partner rotation',block.rotation,false)+noteSection('Transition',block.transition,false);document.querySelector('#sheetBackdrop').classList.add('open');document.querySelector('#sheetClose').onclick=closeNotes;document.querySelector('#sheetClose').focus();}
function closeNotes(){document.querySelector('#sheetBackdrop').classList.remove('open')}
function selectLevel(level){state.level=level;const target=activeLevel().lessons[0];state.lesson=target.id;history.replaceState(null,'','#'+target.id);render();}
function selectLesson(id){state.lesson=id;history.replaceState(null,'','#'+id);renderSidebar();renderLesson();document.querySelector('#sidebar').classList.remove('open');window.scrollTo({top:0,behavior:'smooth'});}
function jumpTo(id){const lesson=allLessons().find(x=>x.id===id);state.level=lesson.level;state.lesson=id;history.replaceState(null,'','#'+id);render();window.scrollTo({top:0,behavior:'smooth'});}
function renderSearch(query=''){const q=query.trim().toLowerCase();const matches=allLessons().filter(lesson=>!q||[lesson.title,lesson.promise,...lesson.movement,...lesson.foundation].join(' ').toLowerCase().includes(q));document.querySelector('#results').innerHTML=matches.length?matches.map(lesson=>'<button class="result" data-result="'+lesson.id+'"><b>'+esc(lesson.title)+'</b><span>'+(lesson.level?'Level '+lesson.level+', Week '+lesson.week:'Open Night')+' · '+esc(lesson.movement.join(', '))+'</span></button>').join(''):'<div class="empty">No matching classes</div>';document.querySelectorAll('[data-result]').forEach(button=>button.onclick=()=>{closeSearch();jumpTo(button.dataset.result)});}
function openSearch(){document.querySelector('#searchWrap').classList.add('open');renderSearch();setTimeout(()=>document.querySelector('#searchInput').focus(),0)}function closeSearch(){document.querySelector('#searchWrap').classList.remove('open');document.querySelector('#searchInput').value=''}
function applyTheme(theme,persist=false){const next=theme==='light'?'light':'dark';document.documentElement.dataset.theme=next;document.querySelector('meta[name="theme-color"]').setAttribute('content',next==='light'?'#f7f4f1':'#0d0b10');const button=document.querySelector('#themeButton');const target=next==='dark'?'light':'dark';button.innerHTML='<span class="theme-icon" aria-hidden="true">'+(next==='dark'?'☀':'☾')+'</span><span class="theme-label">'+(next==='dark'?'Light':'Dark')+'</span>';button.setAttribute('aria-label','Switch to '+target+' theme');button.title='Switch to '+target+' theme';button.setAttribute('aria-pressed',String(next==='light'));if(persist)storage.setItem('tribe-kizomba-theme',next)}
function toggleTheme(){applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark',true)}
function render(){renderTabs();renderSidebar();renderLesson()}
document.querySelector('#menuButton').onclick=()=>document.querySelector('#sidebar').classList.toggle('open');document.querySelector('#searchButton').onclick=openSearch;document.querySelector('#themeButton').onclick=toggleTheme;document.querySelector('#searchInput').oninput=e=>renderSearch(e.target.value);document.querySelector('#sheetBackdrop').onclick=e=>{if(e.target.id==='sheetBackdrop')closeNotes()};document.querySelector('#searchWrap').onclick=e=>{if(e.target.id==='searchWrap')closeSearch()};document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape'){closeNotes();closeSearch()}});
const hash=location.hash.slice(1);const initial=allLessons().find(x=>x.id===hash);if(initial){state.level=initial.level;state.lesson=initial.id}render();
applyTheme(document.documentElement.dataset.theme);
</script>
</body>
</html>`;

writeFileSync(join(root, 'index.html'), `${html}\n`);
console.log(`Built index.html with ${programme.reduce((total, level) => total + level.lessons.length, 0)} classes.`);
