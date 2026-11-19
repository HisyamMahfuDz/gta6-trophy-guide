// SPDX-License-Identifier: MIT
// roadmap.js — the road to the Platinum and the missable-trophy view.
// The stages are built from the official trophy descriptions: which story
// chapters and missions, which collectibles and counts, in what order.
// Only one trophy is flagged missable (Positive Mental Attitude), following
// the launch guides that name it the single possibly-missable trophy.
export const ROADMAP_STAGES = [
  {
    title: 'Play the story — Chapters 1–4 and the finale',
    blurb:
      'Finish the campaign first. Every chapter and named mission trophy lands here, and most of the map and side content opens up as you go.',
    trophyIds: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    tip: 'Keep a manual save at the start of every chapter — the game has no mission replay. Before you leave Chapter 1, meditate at Lucia\u2019s balcony spot (Positive Mental Attitude).',
  },
  {
    title: 'Side characters & strangers',
    blurb:
      'After the story opens up, work through the people of Leonida: five named characters with a final mission each, Bret\u2019s hunt, and eight stranger strands.',
    trophyIds: [22, 23, 24, 25, 26, 27, 29],
    tip: 'Stranger strands appear as you explore, so do this stage while you are out in the world anyway. There are more than 8 strands — finish the eight you enjoy most.',
  },
  {
    title: 'Leonida on foot — collectibles & exploration',
    blurb:
      'The big scavenger stage: meditation spots, card sets, WAiNK photos, vehicles, garages and every corner of the map. Do it as one long road trip.',
    trophyIds: [28, 30, 31, 35, 42, 54, 55],
    tip: 'Sweep one region at a time and combine the jobs: photograph WAiNK spots while you explore new areas, and drive a different car to each one.',
  },
  {
    title: 'Activities & skills',
    blurb:
      'The repeatable fun: stunts, the shooting range, drone races, races, fishing, arcade games, bowling and the challenge list. The two hardest trophies live here.',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 32, 46],
    tip: 'The Shootist (gold in all 42 Shooting Range challenges) and Cunning Stunts (250 stunts) take the longest — start them early and chip away between other stages.',
  },
  {
    title: 'Heat, heists & cleanup',
    blurb:
      'Partner jobs, robberies, combat moments and the money game — then 100% completion, and the Platinum pops.',
    trophyIds: [33, 34, 36, 37, 38, 39, 40, 41, 43, 44, 45, 47, 48, 49, 50, 51, 52, 53, 14, 1],
    tip: 'Bank vaults open in Chapters 3–4. Launder Marked Bills as you rob ($250,000 total) and spend as you go ($100,000 total) so neither money trophy needs a grind at the end.',
  },
];

// Render the roadmap stages into the given list element. Each stage shows its
// trophies as chips with their grade, and how many of them are already earned.
export function renderRoadmap(listEl, trophies, earned, onSelect) {
  const byId = new Map(trophies.map((t) => [t.id, t]));
  listEl.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const item = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    let done = 0;
    for (const id of stage.trophyIds) {
      const trophy = byId.get(id);
      if (!trophy) continue;
      if (earned.has(trophy.name)) done += 1;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `badge ${trophy.grade}`;
      chip.textContent = `${earned.has(trophy.name) ? '\u2713 ' : ''}${trophy.name}`;
      chip.addEventListener('click', () => onSelect(trophy));
      chips.append(chip);
    }
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = `${done} of ${stage.trophyIds.length} earned in this stage`;
    const tip = document.createElement('p');
    tip.className = 'stage-tip';
    tip.textContent = `Tip: ${stage.tip}`;
    item.append(heading, blurb, chips, count, tip);
    listEl.append(item);
  }
}

// Render the missable view: the one flagged trophy in full, plus the
// reassurance that the other 54 cannot be missed.
export function renderMissable(listEl, trophies, earned, onSelect) {
  const missable = trophies.filter((t) => t.missable);
  listEl.replaceChildren();
  for (const trophy of missable) {
    const card = document.createElement('article');
    card.className = 'missable-card';
    const heading = document.createElement('h3');
    heading.textContent = `\u26A0 ${trophy.name} — the one trophy to watch`;
    const desc = document.createElement('p');
    desc.textContent = trophy.description;
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'tab';
    open.textContent = 'Read the full guide';
    open.addEventListener('click', () => onSelect(trophy));
    const state = document.createElement('p');
    state.textContent = earned.has(trophy.name)
      ? 'Earned — the danger has passed.'
      : 'Not earned yet — do the Chapter 1 balcony meditation before finishing Chapter 1.';
    card.append(heading, desc, guide, open, state);
    listEl.append(card);
  }
  const ok = document.createElement('article');
  ok.className = 'missable-ok';
  const okHeading = document.createElement('h3');
  okHeading.textContent = 'Everything else: safe';
  const okText = document.createElement('p');
  okText.textContent =
    'The other 54 trophies cannot be missed: story trophies unlock by playing the missions, and every activity, collectible and robbery stays available in free roam after the story ends. Launch guides name Positive Mental Attitude as the only possibly-missable trophy, because one of its 18 meditation spots is tied to Chapter 1.';
  ok.append(okHeading, okText);
  listEl.append(ok);
}
