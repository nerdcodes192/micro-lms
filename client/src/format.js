// Small display helpers shared by pages.

// 12 → "12 min", 155 → "2h 35m", 120 → "2h".
export function formatDuration(minutes = 0) {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

// "Good morning" / "Good afternoon" / "Good evening" for the current local time.
export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// "Priya Sharma" → "Priya".
export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] || '';
}

// "Priya Sharma" → "PS", "sam" → "S".
export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase() || '?';
}

// Two-digit lesson number: 0 → "01".
export function lessonNumber(index) {
  return String(index + 1).padStart(2, '0');
}
