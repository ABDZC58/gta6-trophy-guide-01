// Saved progress: the earned set lives in localStorage, and can be
// exported to a file and imported back. Nothing ever leaves the browser.
export const PROGRESS_KEY = 'leonida-ledger-progress-v1';
export const SETTINGS_KEY = 'leonida-ledger-settings-v1';

// 13 early, plausible trophies, used only when the page is opened with
// ?demo=13 (a try-out link in the footer). Never applied over saved progress.
export const DEMO_EARNED = [2, 3, 8, 15, 16, 21, 28, 31, 35, 42, 52, 53, 55];

export function readProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const ids = Array.isArray(list) ? list.filter((n) => Number.isInteger(n)) : [];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

export function writeProgress(earned) {
  const sorted = [...earned].sort((a, b) => a - b);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(sorted));
}

export function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') ?? {};
  } catch {
    return {};
  }
}

export function writeSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function downloadProgress(earned) {
  const payload = { game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) };
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
  return new Set(list.filter((n) => Number.isInteger(n)));
}
