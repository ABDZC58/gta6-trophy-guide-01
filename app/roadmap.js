// Platinum roadmap and missables, built from the official descriptions:
// which chapters and missions, which collectibles and counts, in what order.
// Hours and the 100% checklist figures come from PowerPyx and GTABase.
export const ROADMAP_STAGES = [
  {
    step: 1,
    title: 'Play the story — Chapters 1–2',
    hours: '30–40 hours',
    text: 'Finish Gone Fishing, then Chapter 1 and Chapter 2, doing the named missions (Breakfast Run) as they come. Scan vehicles with WAiNK and study animals with binoculars as you travel — both count toward the 100% checklist later. Do the one possibly missable thing now: Lucia’s balcony meditation in Chapter 1 (see Positive Mental Attitude). Keep a manual save at the start of each chapter — there is no mission replay and no New Game+.',
    trophyIds: [2, 3, 4, 8, 28],
  },
  {
    step: 2,
    title: 'Finish the story — Chapters 3–5 and the finale',
    hours: '30–40 hours',
    text: 'Chapters 3, 4 and 5, then the final mission. The named mission trophies land here: The Cartel Heist, Child’s Play, Headliners, VCIA Takedown and Operation Savage Glory. Bank jobs open after Credit Check (Chapter 3) and jewelry stores after Yasmani’s Jewelry Jobs — take both introductions when they appear, since bank vaults and jewelry heists feed the robbery trophies. When the credits roll, the 100% checklist appears under Progress > Stats > 100% Completion.',
    trophyIds: [5, 6, 7, 9, 10, 11, 12, 13],
  },
  {
    step: 3,
    title: 'Stranger strands — Andy, Kenton, Billy, Randy, Tyrone, Bret',
    hours: '10 hours',
    text: 'Finish the six optional questlines that carry their own trophies, plus the 8 stranger strands for Strangers & Freaks. All of them stay available in free-roam after the story, and none is missable — but start them when they unlock so their introductions (a call or text) do not sit unread. Kirk, Kyle, Yago and Pilot Pete count toward Strangers & Freaks; Moses, Tyrone, Yasmani, Andy, Billy and Eddie do not — they have their own trophies.',
    trophyIds: [22, 23, 24, 25, 26, 27, 29],
  },
  {
    step: 4,
    title: 'Collectibles, activities and robberies',
    hours: '60–80 hours',
    text: 'The big cleanup: 250 stunts (300 for 100%), gold in all 42 shooting range challenges, a drone race win at all 14 Top Fun locations, 20 different race wins, 50 challenges (70 for 100%), 100 WAiNK scans, 3 card sets, 100 vehicles discovered, all 52 areas explored, one illegal operation for each of the 9 gangs, 5 bank vaults, an armored truck, a silent jewelry robbery, the tank, the airliner, 500 profile actions and the money trophies ($250,000 laundered, $100,000 spent, 8 garages, 10 vehicles registered). Most of these overlap with the 100% checklist, so work them together.',
    trophyIds: [15, 16, 17, 18, 19, 20, 21, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
  },
  {
    step: 5,
    title: '100% completion, then the platinum',
    hours: 'about 200 hours total',
    text: 'Finish the 35-item 100% checklist (see the table below). Only then does A Long Road pop — and with it, the platinum. The checklist is lenient: most lines need only part of a set, and nothing on it is missable. Do not use cheats on this save: PowerPyx reports cheats disable trophies and saving.',
    trophyIds: [14, 1],
  },
];

// The 35 requirements of the 100% checklist (PowerPyx / GTABase / Rock Paper
// Shotgun via The Gamers Hub), grouped as the game groups them.
export const CHECKLIST_100 = [
  { group: 'Story & Tasks (12)', item: 'Finish the story — all main missions', need: 'All' },
  { group: 'Story & Tasks (12)', item: 'Optional tasks', need: '100' },
  { group: 'Story & Tasks (12)', item: 'Gang operations cleared', need: '39 of 39' },
  { group: 'Story & Tasks (12)', item: 'Bank jobs fully completed', need: '22 of 22' },
  { group: 'Story & Tasks (12)', item: 'Payday loan jobs fully completed', need: '7 of 7' },
  { group: 'Story & Tasks (12)', item: 'Smash ’N’ Grabs fully completed', need: '34 of 35' },
  { group: 'Story & Tasks (12)', item: 'Stick-ups fully completed', need: '50 of 91' },
  { group: 'Story & Tasks (12)', item: 'Narcotics fenced', need: '$100,000' },
  { group: 'Story & Tasks (12)', item: 'Vehicles fenced', need: '$200,000' },
  { group: 'Exploration & Activities (20)', item: 'Stunts completed', need: '300 of 397' },
  { group: 'Exploration & Activities (20)', item: 'Challenges completed', need: '70 of 80' },
  { group: 'Exploration & Activities (20)', item: 'Shooting range gold medals', need: '42 of 42' },
  { group: 'Exploration & Activities (20)', item: 'Drone races won', need: 'All' },
  { group: 'Exploration & Activities (20)', item: 'Races won', need: '30' },
  { group: 'Exploration & Activities (20)', item: 'Collectible card sets', need: '15 of 18' },
  { group: 'Exploration & Activities (20)', item: 'Meditations', need: '15 of 18' },
  { group: 'Exploration & Activities (20)', item: 'Underwater discoveries', need: '33 of 33' },
  { group: 'Exploration & Activities (20)', item: 'Bret’s target decks', need: '15 of 15' },
  { group: 'Exploration & Activities (20)', item: 'Video games played', need: '4 of 4' },
  { group: 'Discovery (3)', item: 'Vehicles scanned (WAiNK)', need: '200 of 277' },
  { group: 'Discovery (3)', item: 'Animals studied (binoculars)', need: '100 of 255' },
  { group: 'Discovery (3)', item: 'Areas explored', need: 'All' },
];

export function renderRoadmap(container, trophies, earned, onSelect) {
  container.replaceChildren();
  const intro = document.createElement('p');
  intro.className = 'list-meta';
  intro.textContent = 'Five steps from the first mission to the platinum, built from the official trophy descriptions. Difficulty 4/10, about 200 hours, one playthrough — PowerPyx.';
  container.append(intro);
  for (const stage of ROADMAP_STAGES) {
    const box = document.createElement('section');
    box.className = 'stage';
    const h = document.createElement('h2');
    h.textContent = `Step ${stage.step}: ${stage.title} `;
    const hours = document.createElement('span');
    hours.className = 'hours';
    hours.textContent = `· ${stage.hours}`;
    h.append(hours);
    const p = document.createElement('p');
    p.textContent = stage.text;
    const ul = document.createElement('ul');
    for (const id of stage.trophyIds) {
      const t = trophies.find((x) => x.id === id);
      if (!t) continue;
      const li = document.createElement('li');
      const done = earned.has(t.id) ? '✓ ' : '○ ';
      li.textContent = `${done}${t.name}`;
      const g = document.createElement('span');
      g.className = 'g';
      g.textContent = t.grade;
      li.append(g);
      li.style.cursor = 'pointer';
      li.addEventListener('click', () => onSelect(t.id));
      ul.append(li);
    }
    box.append(h, p, ul);
    container.append(box);
  }
  const h2 = document.createElement('h2');
  h2.textContent = 'The 100% checklist behind A Long Road';
  const note = document.createElement('p');
  note.textContent = '35 requirements, grouped as the game groups them (PowerPyx, GTABase). Only the lines marked “of” in full need everything; the rest ask for part of a set.';
  const table = document.createElement('table');
  table.className = 'check';
  table.innerHTML = '<thead><tr><th>Group</th><th>Requirement</th><th>Need</th></tr></thead>';
  const body = document.createElement('tbody');
  for (const row of CHECKLIST_100) {
    const tr = document.createElement('tr');
    for (const key of ['group', 'item', 'need']) {
      const td = document.createElement('td');
      td.textContent = row[key];
      tr.append(td);
    }
    body.append(tr);
  }
  table.append(body);
  const wrap = document.createElement('section');
  wrap.className = 'stage';
  wrap.append(h2, note, table);
  container.append(wrap);
}

export function renderMissables(container, trophies, onSelect) {
  container.replaceChildren();
  const warn = document.createElement('div');
  warn.className = 'warn';
  warn.textContent = 'There is no mission replay and no New Game+ in GTA VI. Keep a manual save at the start of every chapter (the game offers 15 manual slots) — PowerPyx.';
  container.append(warn);
  const missable = trophies.filter((t) => t.missable);
  const h1 = document.createElement('h2');
  h1.textContent = `Missable trophies: ${missable.length} of 55`;
  const p1 = document.createElement('p');
  p1.textContent = 'Only one trophy is reported as possibly missable, and even it is unconfirmed. Everything else in the list is confirmed available after the story in free-roam — PowerPyx and GTABase agree.';
  container.append(h1, p1);
  for (const t of missable) {
    const box = document.createElement('section');
    box.className = 'stage';
    const h = document.createElement('h2');
    h.textContent = `⚠ ${t.name} — ${t.grade}`;
    const p = document.createElement('p');
    p.textContent = t.missable_note ?? '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = 'Open the full guide';
    btn.addEventListener('click', () => onSelect(t.id));
    box.append(h, p, btn);
    container.append(box);
  }
  const h2 = document.createElement('h2');
  h2.textContent = 'Safe to leave until later';
  const p2 = document.createElement('p');
  p2.textContent = 'Quest givers who go temporarily unavailable (for example Kenton after Chapter 1) come back later in the story. Optional missions that disappear do not affect any trophy or the 100% checklist — there are far more than 100 optional tasks, and only 100 are needed. A few magazine collectibles in story buildings that close later also spawn elsewhere. Stranger strands are all still there after the story.';
  const h3 = document.createElement('h2');
  h3.textContent = 'Still unconfirmed at launch (19 Nov 2026)';
  const p3 = document.createElement('p');
  p3.textContent = 'Five trophies have no confirmed trigger yet, per PowerPyx. Their guides in this app say so plainly instead of inventing a method: In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There and Ten Pin. Check back once a second source confirms them.';
  const h4 = document.createElement('h2');
  h4.textContent = 'Cheats disable trophies';
  const p4 = document.createElement('p');
  p4.textContent = 'Turning on a cheat disables trophies and saving for that session, per PowerPyx (and GTABase / TechWiser agree). Keep cheats off on your trophy save — they only unlock after the story anyway.';
  container.append(h2, p2, h3, p3, h4, p4);
}
