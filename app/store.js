// Saved progress: the earned set lives in localStorage, and can be
// exported to a file and imported back. Nothing ever leaves the browser.
export const PROGRESS_KEY = 'leonida-ledger-progress-v1';
export const SETTINGS_KEY = 'leonida-ledger-settings-v1';

// 13 early, plausible trophies, used only when the page is opened with
// ?demo=13 (a try-out link in the footer). Never applied over saved progress.
export const DEMO_EARNED = [2, 3, 8, 15, 16, 21, 28, 31, 35, 42, 52, 53, 55];

// Trophy ids run 1–55; anything else in a stored file is ignored.
function validIds(list) {
  if (!Array.isArray(list)) return [];
  return list.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
}

function sortedIds(earned) {
  return [...earned].sort((a, b) => a - b);
}

export function readProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return new Set(validIds(raw ? JSON.parse(raw) : []));
  } catch {
    return new Set();
  }
}

export function writeProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(sortedIds(earned)));
}

export function readSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function writeSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function downloadProgress(earned) {
  const payload = { game: 'Grand Theft Auto VI', earned: sortedIds(earned) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export async function parseProgressFile(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(list)) throw new Error('not a progress file');
  return new Set(validIds(list));
}
