// Leonida Ledger boot: load the trophy data, wire the checklist, the guide
// panel, the filters, the spoiler setting and the roadmap views. Every view
// keeps the right-hand panel filled with real content — a trophy guide, the
// platinum card plus a roadmap step, or the missable trophy's full guide.
import { DEMO_EARNED, downloadProgress, parseProgressFile, readProgress, readSettings, writeProgress, writeSettings } from './store.js';
import { spoilerMasked, visibleTrophies } from './filters.js';
import { ROADMAP_STAGES, renderMissables, renderPlatinumCard, renderRoadmap, renderStepDetail } from './roadmap.js';

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = (id) => trophies.find((t) => t.id === id) ?? null;

let earned = readProgress();
if (params.get('demo') === '13' && earned.size === 0) {
  earned = new Set(DEMO_EARNED);
  writeProgress(earned);
}
const settings = readSettings();
if (params.get('spoilers') === 'off') settings.spoilers = false;
if (params.get('spoilers') === 'on') settings.spoilers = true;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilersEl = document.getElementById('spoilers');
const hideEarnedEl = document.getElementById('hideEarned');
const kindChips = document.getElementById('kindChips');
const progressText = document.getElementById('progressText');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeCounts = document.getElementById('gradeCounts');
const listMeta = document.getElementById('listMeta');

let kind = params.get('kind') ?? 'all';
let view = params.get('view') ?? 'checklist';
let selectedId = Number(params.get('trophy') ?? '') || 1;
let selectedStep = Number(params.get('step') ?? '') || 2;
if (selectedStep < 1 || selectedStep > ROADMAP_STAGES.length) selectedStep = 2;
if (params.get('kind')) {
  kindChips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.kind === kind));
}
spoilersEl.checked = settings.spoilers === true;
hideEarnedEl.checked = settings.hideEarned === true;
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('q')) searchEl.value = params.get('q');

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function paintProgress() {
  const total = trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  progressText.textContent = `${earned.size} of ${total} earned`;
  progressPct.textContent = `${pct}%`;
  progressFill.style.width = `${pct}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const have = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    const all = trophies.filter((t) => t.grade === g).length;
    return `${gradeLabel({ grade: g })} ${have}/${all}`;
  });
  gradeCounts.textContent = counts.join(' · ');
}

function paintChecklist() {
  const shown = visibleTrophies(trophies, {
    kind,
    grade: gradeEl.value,
    query: searchEl.value,
    hideEarned: hideEarnedEl.checked,
    earned,
  });
  listMeta.textContent = `Showing ${shown.length} of ${trophies.length} trophies — click one to open its guide. ${earned.size} earned so far.`;
  listEl.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'Nothing matches — try another filter or search.';
    listEl.append(empty);
    return;
  }
  for (const t of shown) {
    const li = document.createElement('li');
    if (earned.has(t.id)) li.classList.add('earned');
    if (selectedId === t.id) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      writeProgress(earned);
      paintProgress();
      paintChecklist();
      paintGuide();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const medal = document.createElement('span');
    medal.className = `medal ${t.grade}`;
    medal.title = gradeLabel(t);
    const body = document.createElement('div');
    const masked = spoilerMasked(t, spoilersEl.checked, earned);
    const name = document.createElement('div');
    name.className = 'tname';
    name.textContent = masked ? 'Hidden trophy — earn it to reveal' : t.name;
    const desc = document.createElement('div');
    desc.className = 'tdesc';
    desc.textContent = masked ? 'Story trophy, hidden until earned.' : t.description;
    const tags = document.createElement('div');
    tags.className = 'tags';
    for (const k of t.kinds) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = k;
      tags.append(tag);
    }
    if (t.hidden && !masked) {
      const tag = document.createElement('span');
      tag.className = 'tag hidden-t';
      tag.textContent = 'hidden';
      tags.append(tag);
    }
    if (t.missable) {
      const tag = document.createElement('span');
      tag.className = 'tag miss';
      tag.textContent = '⚠ missable';
      tags.append(tag);
    }
    if (t.count !== undefined) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = `target ${t.count.toLocaleString()}`;
      tags.append(tag);
    }
    body.append(name, desc, tags);
    const grade = document.createElement('span');
    grade.className = 'grade-badge';
    grade.textContent = gradeLabel(t);
    li.addEventListener('click', () => pickTrophy(t.id));
    li.append(box, medal, body, grade);
    listEl.append(li);
  }
}

// One shared guide panel, used by the checklist and by the missables view:
// name, official description, numbered steps, where/when facts, sources.
function guidePanel(t) {
  const box = document.createElement('div');
  box.className = 'detail';
  const masked = spoilerMasked(t, spoilersEl.checked, earned);
  const h = document.createElement('h2');
  h.textContent = masked ? 'Hidden trophy' : t.name;
  const meta = document.createElement('p');
  meta.className = 'meta-line';
  meta.textContent = `${gradeLabel(t)} · ${earned.has(t.id) ? 'Earned ✓' : 'Not earned yet'}${t.missable ? ' · ⚠ Possibly missable' : ''}${t.hidden ? ' · Hidden on PlayStation until earned' : ''}`;
  const odesc = document.createElement('p');
  odesc.className = 'odesc';
  odesc.textContent = masked ? 'Earn this trophy to reveal its official name and description.' : `Official description: “${t.description}”`;
  box.append(h, meta, odesc);
  if (t.missable && t.missable_note) {
    const warn = document.createElement('div');
    warn.className = 'warn';
    warn.textContent = t.missable_note;
    box.append(warn);
  }
  if (!masked) {
    const guide = document.createElement('div');
    guide.className = 'guide';
    for (const para of t.guide.split('\n')) {
      const p = document.createElement('p');
      p.textContent = para;
      guide.append(p);
    }
    box.append(guide);
    if (Array.isArray(t.steps) && t.steps.length) {
      const sh = document.createElement('h3');
      sh.textContent = 'How to do it';
      const ol = document.createElement('ol');
      ol.className = 'steps';
      for (const step of t.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        ol.append(li);
      }
      box.append(sh, ol);
    }
    const facts = document.createElement('table');
    facts.className = 'facts';
    const rows = [['Chapter', t.chapter], ['Where', t.where], ['When', t.when], ['Time', t.time]];
    for (const [label, value] of rows) {
      if (!value) continue;
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.textContent = label;
      const td = document.createElement('td');
      td.textContent = value;
      tr.append(th, td);
      facts.append(tr);
    }
    box.append(facts);
    const src = document.createElement('div');
    src.className = 'sources';
    const sh = document.createElement('h3');
    sh.textContent = 'Sources for this guide';
    const ul = document.createElement('ul');
    for (const s of t.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = s.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = s.name;
      li.append(a);
      ul.append(li);
    }
    src.append(sh, ul);
    box.append(src);
  }
  return box;
}

function paintGuide() {
  const t = byId(selectedId) ?? trophies[0];
  detailEl.replaceChildren();
  detailEl.append(guidePanel(t));
}

function paintRoadmapSide() {
  const stage = ROADMAP_STAGES.find((s) => s.step === selectedStep) ?? ROADMAP_STAGES[1];
  detailEl.replaceChildren();
  renderPlatinumCard(detailEl, trophies, earned);
  renderStepDetail(detailEl, trophies, earned, stage, (id) => {
    showView('checklist');
    pickTrophy(id);
  });
}

function paintMissablesSide() {
  const t = byId(28);
  detailEl.replaceChildren();
  detailEl.append(guidePanel(t));
}

function pickTrophy(id, scroll = true) {
  selectedId = id;
  paintChecklist();
  paintGuide();
  if (scroll) document.getElementById('detailCol').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function pickStep(step) {
  selectedStep = step;
  renderRoadmap(document.getElementById('view-roadmap'), trophies, earned, (id) => {
    showView('checklist');
    pickTrophy(id);
  }, selectedStep, pickStep);
  paintRoadmapSide();
}

function showView(next) {
  view = next;
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === next));
  document.getElementById('view-checklist').hidden = next !== 'checklist';
  document.getElementById('view-roadmap').hidden = next !== 'roadmap';
  document.getElementById('view-missables').hidden = next !== 'missables';
  document.getElementById('controls').style.display = next === 'checklist' ? '' : 'none';
  document.getElementById('listMeta').style.display = next === 'checklist' ? '' : 'none';
  if (next === 'roadmap') {
    listMeta.textContent = '';
    renderRoadmap(document.getElementById('view-roadmap'), trophies, earned, (id) => {
      showView('checklist');
      pickTrophy(id);
    }, selectedStep, pickStep);
    paintRoadmapSide();
  } else if (next === 'missables') {
    listMeta.textContent = '';
    renderMissables(document.getElementById('view-missables'), trophies, (id) => {
      showView('checklist');
      pickTrophy(id);
    });
    paintMissablesSide();
  } else {
    paintChecklist();
    paintGuide();
  }
}

document.getElementById('tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-view]');
  if (btn) showView(btn.dataset.view);
});
kindChips.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  kind = chip.dataset.kind;
  kindChips.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
  paintChecklist();
});
searchEl.addEventListener('input', paintChecklist);
gradeEl.addEventListener('change', paintChecklist);
spoilersEl.addEventListener('change', () => {
  settings.spoilers = spoilersEl.checked;
  writeSettings(settings);
  paintChecklist();
  paintGuide();
});
hideEarnedEl.addEventListener('change', () => {
  settings.hideEarned = hideEarnedEl.checked;
  writeSettings(settings);
  paintChecklist();
});
document.getElementById('export').addEventListener('click', () => downloadProgress(earned));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await parseProgressFile(file);
    writeProgress(earned);
    paintProgress();
    paintChecklist();
    paintGuide();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    writeProgress(earned);
    paintProgress();
    paintChecklist();
    paintGuide();
  }
});

paintProgress();
if (view !== 'checklist') showView(view);
else {
  paintChecklist();
  pickTrophy(selectedId, false);
}
