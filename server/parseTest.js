import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const csvPath = path.join(__dirname, 'tasks_dataset.csv');
const text = fs.readFileSync(csvPath, 'utf8');

export function parseCSV(str) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const next = str[i + 1];
    
    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(cell.trim());
      if (row.some(c => c.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    if (row.some(c => c.length > 0)) {
      rows.push(row);
    }
  }
  return rows;
}

function normalizeDate(rawDate) {
  if (!rawDate) return '';
  const trimmed = rawDate.trim();
  if (!trimmed) return '';

  // Handle M/D/YYYY or MM/DD/YYYY
  const slashParts = trimmed.split('/');
  if (slashParts.length === 3) {
    const month = slashParts[0].padStart(2, '0');
    const day = slashParts[1].padStart(2, '0');
    let year = slashParts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // Handle YYYY-MM-DD
  const hyphenParts = trimmed.split('-');
  if (hyphenParts.length === 3 && hyphenParts[0].length === 4) {
    return trimmed;
  }

  return trimmed;
}

function resolveAssignee(techName) {
  const lower = (techName || '').toLowerCase().trim();
  if (lower.includes('kamini')) {
    return {
      assignedToId: 'emp-kamini',
      assignedTo: 'Kamini',
      assignedToEmail: 'kamini@systemcaresitsolutions.com',
      assignedToUsername: 'Kamini'
    };
  }
  if (lower.includes('tamil') || lower.includes('selvi')) {
    return {
      assignedToId: 'emp-tamil',
      assignedTo: 'Tamil Selvi',
      assignedToEmail: 'tamil@systemcaresitsolutions.com',
      assignedToUsername: 'Tamil Selvi'
    };
  }
  if (lower.includes('hari') || lower.includes('varman')) {
    return {
      assignedToId: 'emp-harivarman',
      assignedTo: 'Harivarman',
      assignedToEmail: 'harivarman@systemcaresitsolutions.com',
      assignedToUsername: 'Harivarman'
    };
  }
  if (lower.includes('mahima')) {
    return {
      assignedToId: 'emp-mahima',
      assignedTo: 'Mahima',
      assignedToEmail: 'mahima@systemcaresitsolutions.com',
      assignedToUsername: 'Mahima'
    };
  }
  if (lower.includes('martin') || lower.includes('david')) {
    return {
      assignedToId: 'emp-martindavid',
      assignedTo: 'Martin David',
      assignedToEmail: 'martindavid@systemcaresitsolutions.com',
      assignedToUsername: 'Martin David'
    };
  }
  // Default to Rebecca
  return {
    assignedToId: 'emp-rebecca',
    assignedTo: 'Rebecca',
    assignedToEmail: 'rebecca@systemcaresitsolutions.com',
    assignedToUsername: 'Rebecca'
  };
}

function normalizeFormat(activity, comments) {
  const act = (activity || '').toLowerCase();
  const comm = (comments || '').toLowerCase();

  if (act.includes('reel') || comm.includes('reel') || comm.includes('video')) return 'Reel';
  if (act.includes('carousel') || comm.includes('carousel')) return 'Carousel';
  if (act.includes('website') || comm.includes('website') || comm.includes('web')) return 'Website UI';
  if (act.includes('static') || comm.includes('poster') || comm.includes('post')) return 'Static Poster';
  if (act.includes('creatives') || comm.includes('banner') || comm.includes('pamphlet')) return 'Banner';
  if (act.includes('meta ad')) return 'Static Poster';
  if (act.includes('support') || comm.includes('invoice') || comm.includes('data')) return 'Document';
  return 'Static Poster';
}

function normalizeStatus(rawStatus) {
  const s = (rawStatus || '').toLowerCase().trim();
  if (s === 'completed') return 'Completed';
  if (s === 'in progress') return 'In Progress';
  if (s === 'on hold') return 'On Hold';
  if (s === 'waiting for approval') return 'Waiting for approval';
  if (s === 'cancelled') return 'Backlog';
  if (s === 'yet to start') return 'Yet to start';
  return s ? (s.charAt(0).toUpperCase() + s.slice(1)) : 'Yet to start';
}

const parsed = parseCSV(text);
const tasks = [];
for (let i = 1; i < parsed.length; i++) {
  const row = parsed[i];
  const sNoStr = row[0];
  if (!sNoStr || isNaN(parseInt(sNoStr, 10))) continue;

  const sNo = parseInt(sNoStr, 10);
  const rawDate = row[1];
  const clientProject = row[2] || 'SCS';
  const activity = row[3] || 'Static';
  const project = row[4] || `P${sNo}`;
  const coreActivity = row[5] || 'Social Media Content';
  const tech = row[6] || '';
  const rawWorkStart = row[7];
  const rawTargetEnd = row[8];
  const rawActualEnd = row[9];
  const rawSla = row[10];
  const rawStatus = row[11];
  const comments = row[12] || '';

  const date = normalizeDate(rawDate) || '2026-08-01';
  const workStartDate = normalizeDate(rawWorkStart) || date;
  const targetEndDate = normalizeDate(rawTargetEnd) || date;
  const actualEndDate = normalizeDate(rawActualEnd) || '';
  const status = normalizeStatus(rawStatus);
  const assignee = resolveAssignee(tech);
  const format = normalizeFormat(activity, comments);

  let slaStatus = 'Green';
  if (actualEndDate && targetEndDate) {
    slaStatus = actualEndDate <= targetEndDate ? 'Green' : 'Red';
  } else if (targetEndDate && targetEndDate < '2026-09-15' && status !== 'Completed') {
    slaStatus = 'Red';
  }

  const taskId = `TASK-${String(sNo).padStart(3, '0')}`;
  const description = comments || `${activity} for ${clientProject} - Project ${project}`;

  let estimatedHours = 3;
  if (format === 'Carousel') estimatedHours = 5;
  else if (format === 'Reel') estimatedHours = 4;
  else if (format === 'Website UI') estimatedHours = 8;
  else if (activity.toLowerCase().includes('adhoc')) estimatedHours = 2;
  else if (activity.toLowerCase().includes('social media mgmt')) estimatedHours = 2;

  tasks.push({
    id: taskId,
    sNo: sNo,
    date: date,
    toBePostedOn: date,
    toBeCompletedOn: targetEndDate || date,
    theme: coreActivity || 'Digital Marketing',
    format: format,
    description: description,
    client: clientProject,
    comments: comments,
    reference: project,
    clientProject: clientProject,
    activity: activity,
    project: project,
    coreActivity: coreActivity,
    assignedToId: assignee.assignedToId,
    assignedTo: assignee.assignedTo,
    assignedToEmail: assignee.assignedToEmail,
    assignedToUsername: assignee.assignedToUsername,
    platform: clientProject.includes('Store') ? 'Instagram / Meta' : 'Instagram / LinkedIn',
    scheduledTime: '10:00',
    mediaUrl: '',
    workStartDate: workStartDate,
    targetEndDate: targetEndDate,
    actualEndDate: actualEndDate,
    slaStatus: slaStatus,
    status: status,
    commentsUpdates: comments,
    estimatedHours: estimatedHours,
    timeSpentHours: status === 'Completed' ? estimatedHours : 0
  });
}

console.log('Successfully mapped tasks count:', tasks.length);
console.log('Sample Task 1:', tasks[0]);
console.log('Sample Task 50:', tasks[49]);
console.log('Sample Task 196:', tasks[tasks.length - 1]);

