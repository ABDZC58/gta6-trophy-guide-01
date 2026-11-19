// Leonida Ledger boot: load the trophy data, wire the checklist, the guide
// detail pane, the filters, the spoiler setting and the roadmap views.
import { DEMO_EARNED, exportProgress, importProgressFile, loadProgress, loadSettings, saveProgress, saveSettings } from './store.js';
import { filterTrophies, isSpoilerMasked } from './filters.js';
import { renderMissables, renderRoadmap } from './roadmap.js';

const params = new URLSearchParams(location.search);
const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = loadProgress();
if (params.get('demo') === '13' && earned.size === 0) {
  earned = new Set(DEMO_EARNED);
  saveProgress(earned);
}
const settings = loadSettings();
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
let selectedId = Number(params.get('trophy') ?? '') || null;
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

function renderProgress() {
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

function renderChecklist() {
  const shown = filterTrophies(trophies, {
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
      saveProgress(earned);
      renderProgress();
      renderChecklist();
      renderDetail();
    });
    box.addEventListener('click', (e) => e.stopPropagation());
    const medal = document.createElement('span');
    medal.className = `medal ${t.grade}`;
    medal.title = gradeLabel(t);
    const body = document.createElement('div');
    const masked = isSpoilerMasked(t, spoilersEl.checked, earned);
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
    li.addEventListener('click', () => selectTrophy(t.id));
    li.append(box, medal, body, grade);
    listEl.append(li);
  }
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId) ?? null;
  detailEl.replaceChildren();
  if (!t) {
    const box = document.createElement('div');
    box.className = 'detail';
    const h = document.createElement('h2');
    h.textContent = 'Pick a trophy to see its guide';
    const p = document.createElement('p');
    p.textContent = 'Every guide is written for this entry in our own words, and names its sources — the official list (Exophase / PSNProfiles) plus PowerPyx’s trophy guide and GTABase’s 100% checklist where the facts come from them. A specific place or step with no source earns no credit, so the five trophies whose trigger is still unconfirmed at launch say so instead of guessing.';
    box.append(h, p);
    detailEl.append(box);
    return;
  }
  const masked = isSpoilerMasked(t, spoilersEl.checked, earned);
  const box = document.createElement('div');
  box.className = 'detail';
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
    box.append(guide, src);
  }
  detailEl.append(box);
}

function selectTrophy(id, scroll = true) {
  selectedId = id;
  renderChecklist();
  renderDetail();
  if (scroll) document.getElementById('detailCol').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showView(next) {
  view = next;
  document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === next));
  document.getElementById('view-checklist').hidden = next !== 'checklist';
  document.getElementById('view-roadmap').hidden = next !== 'roadmap';
  document.getElementById('view-missables').hidden = next !== 'missables';
  document.getElementById('controls').style.display = next === 'checklist' ? '' : 'none';
  document.getElementById('listMeta').style.display = next === 'checklist' ? '' : 'none';
  if (next === 'roadmap') renderRoadmap(document.getElementById('view-roadmap'), trophies, earned, (id) => { showView('checklist'); selectTrophy(id); });
  if (next === 'missables') renderMissables(document.getElementById('view-missables'), trophies, (id) => { showView('checklist'); selectTrophy(id); });
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
  renderChecklist();
});
searchEl.addEventListener('input', renderChecklist);
gradeEl.addEventListener('change', renderChecklist);
spoilersEl.addEventListener('change', () => {
  settings.spoilers = spoilersEl.checked;
  saveSettings(settings);
  renderChecklist();
  renderDetail();
});
hideEarnedEl.addEventListener('change', () => {
  settings.hideEarned = hideEarnedEl.checked;
  saveSettings(settings);
  renderChecklist();
});
document.getElementById('export').addEventListener('click', () => exportProgress(earned));
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    earned = await importProgressFile(file);
    saveProgress(earned);
    renderProgress();
    renderChecklist();
    renderDetail();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveProgress(earned);
    renderProgress();
    renderChecklist();
    renderDetail();
  }
});

renderProgress();
if (view !== 'checklist') showView(view);
renderChecklist();
if (selectedId) selectTrophy(selectedId, false);
else renderDetail();
