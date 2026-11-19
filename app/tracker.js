// SPDX-License-Identifier: MIT
// tracker.js — the trophy checklist: rendering, filters, spoiler mode and
// the detail panel with each trophy's guide, steps and sources.
export const KIND_LABELS = {
  story: 'Story',
  side: 'Side',
  collectibles: 'Collectibles',
  activities: 'Activities',
  combat: 'Combat',
  exploration: 'Exploration',
  money: 'Money',
  completion: '100% completion',
  platinum: 'Platinum',
  online: 'Online',
};

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

// A trophy is hidden from a spoiler-free reader when PlayStation hides it
// and it has not been earned yet.
export function isSpoiled(trophy, earned, spoilerOn) {
  return Boolean(spoilerOn && trophy.hidden && !earned.has(trophy.name));
}

// Apply the toolbar filters and the search text to the trophy list.
export function filterTrophies(trophies, earned, filters) {
  const query = filters.query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (filters.kind === 'missable' && !t.missable) return false;
    if (filters.kind === 'online') return false;
    if (filters.kind !== 'all' && filters.kind !== 'missable' && t.kind !== filters.kind) return false;
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.status === 'earned' && !earned.has(t.name)) return false;
    if (filters.status === 'unearned' && earned.has(t.name)) return false;
    if (query) {
      const haystack = `${t.name} ${t.description} ${t.guide} ${KIND_LABELS[t.kind] ?? ''}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// Render the checklist rows into the list element.
export function renderList(listEl, trophies, earned, spoilerOn, selected, onToggle, onSelect) {
  listEl.replaceChildren();
  for (const trophy of trophies) {
    const item = document.createElement('li');
    item.className = 'trophy-card';
    if (earned.has(trophy.name)) item.classList.add('earned');
    if (selected && selected.name === trophy.name) item.classList.add('selected');
    const spoiled = isSpoiled(trophy, earned, spoilerOn);
    if (spoiled) item.classList.add('spoiled');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${spoiled ? 'hidden trophy' : trophy.name} as earned`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      onToggle(trophy, box.checked);
    });

    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = spoiled ? 'Hidden trophy — earn it to reveal' : trophy.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = spoiled ? 'Hidden until earned. Spoiler mode is on.' : trophy.description;

    const tags = document.createElement('span');
    tags.className = 'trophy-tags';
    const grade = document.createElement('span');
    grade.className = `badge ${trophy.grade}`;
    grade.textContent = trophy.grade;
    tags.append(grade);
    const kind = document.createElement('span');
    kind.className = 'tag';
    kind.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
    tags.append(kind);
    if (trophy.missable) {
      const miss = document.createElement('span');
      miss.className = 'tag missable';
      miss.textContent = '⚠ Missable';
      tags.append(miss);
    }
    if (trophy.hidden) {
      const hid = document.createElement('span');
      hid.className = 'tag hidden-t';
      hid.textContent = 'Hidden on PSN';
      tags.append(hid);
    }
    if (earned.has(trophy.name)) {
      const got = document.createElement('span');
      got.className = 'tag earned-t';
      got.textContent = '✓ Earned';
      tags.append(got);
    }

    item.append(box, name, desc, tags);
    if (trophy.count) {
      const count = document.createElement('span');
      count.className = 'trophy-count';
      count.textContent = `× ${trophy.count.toLocaleString('en-US')}`;
      item.append(count);
    }
    item.addEventListener('click', (event) => {
      if (event.target === box) return;
      onSelect(trophy);
    });
    listEl.append(item);
  }
}

// Render the detail panel for one trophy: official text, guide, steps,
// missable warning and the sources the guide cites.
export function renderDetail(panelEl, trophy, earned, spoilerOn, onToggle) {
  panelEl.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy on the left to read its guide, steps and sources.';
    panelEl.append(empty);
    return;
  }
  const spoiled = isSpoiled(trophy, earned, spoilerOn);
  const heading = document.createElement('h3');
  heading.textContent = spoiled ? 'Hidden trophy' : trophy.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = spoiled
    ? 'Hidden on PlayStation until earned — turn spoiler mode off, or earn it, to reveal this trophy.'
    : `“${trophy.description}” — official description, ${trophy.grade}.`;
  panelEl.append(heading, official);
  if (spoiled) return;

  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  panelEl.append(guide);

  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.innerHTML = '<strong>Missable — read first.</strong> ';
    warn.append(
      document.createTextNode(
        'This is the one trophy launch guides flag as possibly missable. See the Missable & Save Strategy tab for the save habit that protects it.',
      ),
    );
    panelEl.append(warn);
  }

  const stepsHeading = document.createElement('h4');
  stepsHeading.textContent = 'How to earn it';
  const steps = document.createElement('ol');
  steps.className = 'steps';
  for (const step of trophy.steps ?? []) {
    const li = document.createElement('li');
    li.textContent = step;
    steps.append(li);
  }
  panelEl.append(stepsHeading, steps);

  const sourcesHeading = document.createElement('h4');
  sourcesHeading.textContent = 'Sources';
  const sources = document.createElement('ul');
  sources.className = 'sources';
  const officialSource = document.createElement('li');
  officialSource.textContent = 'Official trophy name, description and grade — PlayStation trophy list (via Exophase / PSNProfiles).';
  sources.append(officialSource);
  for (const source of trophy.sources ?? []) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    li.append(link);
    sources.append(li);
  }
  panelEl.append(sourcesHeading, sources);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = earned.has(trophy.name) ? '✓ Earned — unmark' : 'Mark as earned';
  toggle.addEventListener('click', () => onToggle(trophy, !earned.has(trophy.name)));
  actions.append(toggle);
  panelEl.append(actions);
}
