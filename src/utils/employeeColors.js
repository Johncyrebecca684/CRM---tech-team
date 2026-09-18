// Central Employee Color & Theme Utility
// Provides high-contrast, distinct row colors for every employee across all tables

export const EMPLOYEE_THEMES = {
  rebecca: {
    key: 'rebecca',
    name: 'Rebecca / Johncy',
    colorName: 'Yellow',
    primary: '#eab308', // Amber / Gold
    // Distinct, vibrant pastel background for the whole row
    bg: '#fef9c3', // Light Yellow (yellow-100)
    bgHover: '#fef08a', // yellow-200
    border: '#ca8a04',
    text: '#854d0e',
    cellText: '#0f172a',
    badgeBg: '#fef08a',
    badgeText: '#713f12',
    accentDot: '#ca8a04',
    rowClass: 'emp-row-rebecca'
  },
  kamini: {
    key: 'kamini',
    name: 'Kamini',
    colorName: 'Green',
    primary: '#10b981', // Emerald Green
    bg: '#d1fae5', // Light Emerald (emerald-100)
    bgHover: '#a7f3d0', // emerald-200
    border: '#059669',
    text: '#047857',
    cellText: '#0f172a',
    badgeBg: '#a7f3d0',
    badgeText: '#065f46',
    accentDot: '#059669',
    rowClass: 'emp-row-kamini'
  },
  tamil: {
    key: 'tamil',
    name: 'Tamil Selvi',
    colorName: 'Purple',
    primary: '#8b5cf6', // Violet / Purple
    bg: '#ede9fe', // Light Violet (violet-100)
    bgHover: '#ddd6fe', // violet-200
    border: '#7c3aed',
    text: '#6d28d9',
    cellText: '#0f172a',
    badgeBg: '#ddd6fe',
    badgeText: '#4c1d95',
    accentDot: '#7c3aed',
    rowClass: 'emp-row-tamil'
  },
  mahima: {
    key: 'mahima',
    name: 'Mahima',
    colorName: 'Pink',
    primary: '#f43f5e', // Rose Pink
    bg: '#ffe4e6', // Light Rose (rose-100)
    bgHover: '#fecdd3', // rose-200
    border: '#e11d48',
    text: '#be123c',
    cellText: '#0f172a',
    badgeBg: '#fecdd3',
    badgeText: '#9f1239',
    accentDot: '#e11d48',
    rowClass: 'emp-row-mahima'
  },
  harivarman: {
    key: 'harivarman',
    name: 'Harivarman',
    colorName: 'Blue',
    primary: '#0284c7', // Sky Blue
    bg: '#e0f2fe', // Light Sky (sky-100)
    bgHover: '#bae6fd', // sky-200
    border: '#0284c7',
    text: '#0369a1',
    cellText: '#0f172a',
    badgeBg: '#bae6fd',
    badgeText: '#075985',
    accentDot: '#0369a1',
    rowClass: 'emp-row-harivarman'
  },
  martindavid: {
    key: 'martindavid',
    name: 'Martin David',
    colorName: 'Orange',
    primary: '#ea580c', // Orange
    bg: '#ffedd5', // Light Orange (orange-100)
    bgHover: '#fed7aa', // orange-200
    border: '#ea580c',
    text: '#c2410c',
    cellText: '#0f172a',
    badgeBg: '#fed7aa',
    badgeText: '#9a3412',
    accentDot: '#c2410c',
    rowClass: 'emp-row-martindavid'
  },
  admin: {
    key: 'admin',
    name: 'System Care Admin',
    colorName: 'Indigo',
    primary: '#6366f1', // Indigo
    bg: '#e0e7ff', // Light Indigo (indigo-100)
    bgHover: '#c7d2fe', // indigo-200
    border: '#4f46e5',
    text: '#4f46e5',
    cellText: '#0f172a',
    badgeBg: '#c7d2fe',
    badgeText: '#3730a3',
    accentDot: '#4f46e5',
    rowClass: 'emp-row-admin'
  }
};

export const DEFAULT_EMPLOYEE_THEME = {
  key: 'default',
  name: 'Specialist',
  colorName: 'Slate',
  primary: '#64748b',
  bg: 'transparent',
  bgHover: 'rgba(100, 116, 139, 0.08)',
  border: 'var(--border-color)',
  text: 'var(--text-main)',
  cellText: 'var(--text-main)',
  badgeBg: 'var(--bg-card-hover)',
  badgeText: 'var(--text-main)',
  accentDot: '#64748b',
  rowClass: ''
};

/**
 * Resolves the theme and color configuration for any task, employee ID, email, or name.
 */
export function getEmployeeTheme(assigneeOrTask) {
  if (!assigneeOrTask) return DEFAULT_EMPLOYEE_THEME;

  let lookupStr = '';

  if (typeof assigneeOrTask === 'string') {
    lookupStr = assigneeOrTask.toLowerCase();
  } else if (typeof assigneeOrTask === 'object') {
    lookupStr = (
      (assigneeOrTask.assignedToId || '') + ' ' +
      (assigneeOrTask.assignedToEmail || '') + ' ' +
      (assigneeOrTask.assignedToUsername || '') + ' ' +
      (assigneeOrTask.assignedTo || '') + ' ' +
      (assigneeOrTask.id || '') + ' ' +
      (assigneeOrTask.email || '') + ' ' +
      (assigneeOrTask.name || '')
    ).toLowerCase();
  }

  if (lookupStr.includes('rebecca') || lookupStr.includes('johncy')) {
    return EMPLOYEE_THEMES.rebecca;
  }
  if (lookupStr.includes('kamini')) {
    return EMPLOYEE_THEMES.kamini;
  }
  if (lookupStr.includes('tamil') || lookupStr.includes('selvi')) {
    return EMPLOYEE_THEMES.tamil;
  }
  if (lookupStr.includes('mahima')) {
    return EMPLOYEE_THEMES.mahima;
  }
  if (lookupStr.includes('hari') || lookupStr.includes('varman')) {
    return EMPLOYEE_THEMES.harivarman;
  }
  if (lookupStr.includes('martin') || lookupStr.includes('david')) {
    return EMPLOYEE_THEMES.martindavid;
  }
  if (lookupStr.includes('admin')) {
    return EMPLOYEE_THEMES.admin;
  }

  return DEFAULT_EMPLOYEE_THEME;
}
