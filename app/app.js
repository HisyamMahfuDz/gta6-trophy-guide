// SPDX-License-Identifier: MIT
// app.js — boots the Leonida Trophy Guide: loads the trophy data, wires the
// toolbar and the tabs, keeps progress, and renders the tracker, the roadmap
// and the missable view. The app fetches only its own data/trophies.json and
// works with the network off once loaded.
import { loadEarned, saveEarned, buildExportPayload, parseImportPayload, downloadText } from './storage.js';
import { filterTrophies, renderList, renderDetail, GRADE_ORDER } from './tracker.js';
import { renderRoadmap, renderMissable } from './roadmap.js';

const params = new URLSearchParams(location.search);
// Demo states for screenshots (?demo=cover|tracker|roadmap|spoiler): they set
// an in-memory checklist and never write to localStorage.
const DEMO_EARNED = {
  cover: [],
  tracker: [
    'Just Like Paradise', 'Paradise Lost', 'Trust', 'Cunning Stunts', 'Master of None',
    'Earn Cash, Not Kudos', 'Stick Fiddler', 'Positive Mental Attitude', 'Whip It Good',
    'The Goodtime State', 'Let\u2019s Go Bowling', 'Dime on the Dollar', 'Treat Yo Self',
  ],
  roadmap: ['Just Like Paradise', 'Paradise Lost', 'Trust', 'Break the Bank', 'Family Matters'],
  spoiler: ['Just Like Paradise', 'Paradise Lost'],
};
const demoName = params.get('demo');
const demoMode = Object.hasOwn(DEMO_EARNED, demoName ?? '');

const response = await fetch('data/trophies.json');
const doc = await response.json();
const trophies = [...doc.trophies].sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
const knownNames = trophies.map((t) => t.name);

let earned = demoMode ? new Set(DEMO_EARNED[demoName]) : loadEarned();
let selected = null;
let currentView = 'tracker';

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const detailEl = $('detailPanel');
const progressText = $('progressText');
const progressFill = $('progressFill');
const gradeCounts = $('gradeCounts');
const pointsLine = $('pointsLine');
const listCount = $('listCount');
const filterNote = $('filterNote');
const sourceList = $('sourceList');

const filters = { query: '', kind: 'all', grade: 'all', status: 'all' };
let spoilerOn = false;

function readFilters() {
  filters.query = $('search').value;
  filters.kind = $('filterKind').value;
  filters.grade = $('filterGrade').value;
  filters.status = $('filterStatus').value;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const percent = Math.round((done / total) * 100);
  progressText.textContent = `${done} of ${total} earned · ${percent}%`;
  progressFill.style.width = `${percent}%`;
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] ?? [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.name)) byGrade[t.grade][0] += 1;
  }
  gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`)
    .join(' · ');
  pointsLine.textContent =
    done >= total
      ? 'Platinum earned — you are a Leonida Legend.'
      : `${total - done} to go until the Platinum.`;
}

function renderAll() {
  readFilters();
  const visible = filterTrophies(trophies, earned, filters);
  renderList(listEl, visible, earned, spoilerOn, selected, toggleEarned, selectTrophy);
  renderDetail(detailEl, selected, earned, spoilerOn, toggleEarned);
  listCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  filterNote.textContent =
    filters.kind === 'online'
      ? 'No online trophies: all 55 unlock in single player, so this filter is empty by design.'
      : filters.kind === 'missable'
        ? 'Only 1 trophy is flagged missable — Positive Mental Attitude. See the Missable & Save Strategy tab.'
        : '';
  renderProgress();
}

function toggleEarned(trophy, checked) {
  if (checked) earned.add(trophy.name);
  else earned.delete(trophy.name);
  saveEarned(earned, demoMode);
  renderAll();
}

function selectTrophy(trophy) {
  selected = trophy;
  showView('tracker');
  renderAll();
  detailEl.scrollIntoView({ block: 'nearest' });
}

function showView(view) {
  currentView = view;
  for (const name of ['tracker', 'roadmap', 'missable']) {
    document.getElementById(`view${name[0].toUpperCase()}${name.slice(1)}`).hidden = name !== view;
    document.getElementById(`tab${name[0].toUpperCase()}${name.slice(1)}`).classList.toggle('active', name === view);
  }
  if (view === 'roadmap') renderRoadmap($('roadmapStages'), trophies, earned, selectTrophy);
  if (view === 'missable') renderMissable($('missableList'), trophies, earned, selectTrophy);
}

// Tabs.
for (const name of ['tracker', 'roadmap', 'missable']) {
  document.getElementById(`tab${name[0].toUpperCase()}${name.slice(1)}`).addEventListener('click', () => {
    showView(name);
  });
}

// Toolbar.
$('search').addEventListener('input', renderAll);
$('filterKind').addEventListener('change', renderAll);
$('filterGrade').addEventListener('change', renderAll);
$('filterStatus').addEventListener('change', renderAll);
$('spoiler').addEventListener('change', (event) => {
  spoilerOn = event.target.checked;
  renderAll();
});

// Export / import / reset.
$('exportBtn').addEventListener('click', () => {
  downloadText('gta6-trophy-progress.json', buildExportPayload(earned));
});
$('importFile').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const imported = parseImportPayload(await file.text(), knownNames);
  if (!imported) {
    filterNote.textContent = 'That file is not a progress export from this guide — nothing was changed.';
    event.target.value = '';
    return;
  }
  earned = imported;
  saveEarned(earned, demoMode);
  filterNote.textContent = `Imported ${imported.size} earned trophies.`;
  event.target.value = '';
  renderAll();
});
$('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies? This cannot be undone.')) return;
  earned = new Set();
  saveEarned(earned, demoMode);
  renderAll();
});

// Sources footer.
for (const source of doc.list_sources ?? []) {
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = source.name;
  li.append(link);
  sourceList.append(li);
}

// Deep links: ?view=roadmap|missable opens that tab; ?demo=... stages a
// screenshot state (in-memory only, never saved).
if (demoName === 'tracker') {
  selected = trophies.find((t) => t.name === 'Cunning Stunts') ?? null;
  $('filterStatus').value = 'earned';
} else if (demoName === 'cover') {
  selected = trophies.find((t) => t.name === 'Vice Got a Price!') ?? null;
} else if (demoName === 'spoiler') {
  spoilerOn = true;
  $('spoiler').checked = true;
}
const viewParam = params.get('view');
if (viewParam === 'roadmap' || viewParam === 'missable') showView(viewParam);
else if (demoName === 'roadmap') {
  showView('roadmap');
  document.body.classList.add('demo-roadmap');
}

renderAll();
