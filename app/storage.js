// SPDX-License-Identifier: MIT
// storage.js — saved progress for the Leonida Trophy Guide.
// Progress lives only in this browser (localStorage) and is exported/imported
// as a small JSON file. Nothing is ever sent anywhere.
export const STORAGE_KEY = 'leonida-trophy-guide-progress-v1';

// Load the earned trophy names (official names) from localStorage.
export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set(Array.isArray(names) ? names.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

// Save the earned trophy names to localStorage. Demo mode never writes.
export function saveEarned(earned, demoMode) {
  if (demoMode) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
  } catch {
    // Private mode or a full store: progress just stays in memory.
  }
}

// Build the export file's contents: the game, the date, and the earned names.
export function buildExportPayload(earned) {
  return JSON.stringify(
    {
      game: 'Grand Theft Auto VI',
      platform: 'PlayStation 5',
      guide: 'Leonida Trophy Guide',
      exportedAt: new Date().toISOString(),
      earned: [...earned].sort(),
    },
    null,
    2,
  );
}

// Read an imported file's text and return the earned names it holds, or null
// when the file is not a progress export this guide understands.
export function parseImportPayload(text, knownNames) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) return null;
  const known = new Set(knownNames);
  const valid = names.filter((n) => typeof n === 'string' && known.has(n));
  return valid.length > 0 || names.length === 0 ? new Set(valid) : null;
}

// Trigger a download of the given text as a file.
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
