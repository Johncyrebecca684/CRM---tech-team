import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { Employee } from './models/Employee.js';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { TimeLog } from './models/TimeLog.js';
import { Attendance } from './models/Attendance.js';
import { LeaveRequest } from './models/LeaveRequest.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS config notice:', e.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KC:KCecommerce@cluster0.b2v8pfh.mongodb.net/tech_team_crm?retryWrites=true&w=majority';

// 1. Team Members derived directly from the CSV and authorized whitelist
export const SEED_EMPLOYEES = [
  {
    id: 'emp-kamini',
    name: 'Kamini',
    email: 'kamini@systemcaresitsolutions.com',
    role: 'Digital Marketing Specialist',
    password: 'Kamini@2026',
    mustChangePassword: true,
    isPasswordChanged: false,
    avatar: '',
    skills: ['Digital Marketing', 'Content Strategy', 'Visual Design', 'Campaign Management'],
    weeklyCapacityHours: 40,
    status: 'Active',
    joinedDate: '2026-06-01',
    isProfileCompleted: true
  },
  {
    id: 'emp-rebecca',
    name: 'Rebecca',
    email: 'rebecca@systemcaresitsolutions.com',
    role: 'Digital Marketing Specialist',
    password: 'Rebecca@2026',
    mustChangePassword: true,
    isPasswordChanged: false,
    avatar: '',
    skills: ['Digital Marketing', 'Graphic Design', 'Social Media', 'Content Creation', 'CRM'],
    weeklyCapacityHours: 40,
    status: 'Active',
    joinedDate: '2026-06-01',
    isProfileCompleted: true
  },
  {
    id: 'emp-tamil',
    name: 'Tamil Selvi',
    email: 'tamil@systemcaresitsolutions.com',
    role: 'Creative & Media Specialist',
    password: 'Tamil@2026',
    mustChangePassword: true,
    isPasswordChanged: false,
    avatar: '',
    skills: ['Reels Production', 'Video Editing', 'Creative Direction', 'Graphic Design'],
    weeklyCapacityHours: 40,
    status: 'Active',
    joinedDate: '2026-06-01',
    isProfileCompleted: true
  },
  {
    id: 'emp-mahima',
    name: 'Mahima',
    email: 'mahima@systemcaresitsolutions.com',
    role: 'Creative & Media Specialist',
    password: 'Mahima@2026',
    mustChangePassword: true,
    isPasswordChanged: false,
    avatar: '',
    skills: ['Creative Strategy', 'Social Media Management', 'Content Writing', 'Visual Design'],
    weeklyCapacityHours: 40,
    status: 'Active',
    joinedDate: '2026-06-01',
    isProfileCompleted: true
  },
  {
    id: 'emp-harivarman',
    name: 'Harivarman',
    email: 'harivarman@systemcaresitsolutions.com',
    role: 'CRM & Strategy Specialist',
    password: 'Harivarman@2026',
    mustChangePassword: true,
    isPasswordChanged: false,
    avatar: '',
    skills: ['CRM Operations', 'Digital Strategy', 'Content Writing', 'Analytics'],
    weeklyCapacityHours: 40,
    status: 'Active',
    joinedDate: '2026-06-01',
    isProfileCompleted: true
  },
  {
    id: 'emp-martindavid',
    name: 'Martin David',
    email: 'martindavid@systemcaresitsolutions.com',
    role: 'Tech & Media Specialist',
    password: 'Martin@2026',
    mustChangePassword: true,
    isPasswordChanged: false,
    avatar: '',
    skills: ['Tech Operations', 'Media Production', 'Quality Audit', 'Deliverables Review'],
    weeklyCapacityHours: 40,
    status: 'Active',
    joinedDate: '2026-06-01',
    isProfileCompleted: true
  }
];

export const SEED_ADMINS = [
  {
    id: 'admin-1',
    name: 'System Care Admin',
    email: 'support@systemcaresitsolutions.com',
    role: 'admin',
    password: 'Admin@2026',
    mustChangePassword: false,
    isPasswordChanged: false,
    joinedDate: '2026-01-01',
    avatar: ''
  }
];

// Helper to parse CSV with quoted multiline support
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

const MONTH_MAP = {
  jan: '01', january: '01',
  feb: '02', february: '02',
  mar: '03', march: '03',
  apr: '04', april: '04',
  may: '05',
  jun: '06', june: '06',
  jul: '07', july: '07',
  aug: '08', august: '08',
  sep: '09', sept: '09', september: '09',
  oct: '10', october: '10',
  nov: '11', november: '11',
  dec: '12', december: '12'
};

// Normalize Date format (M/D/YYYY, YYYY-MM-DD, or D-Month-YYYY)
function normalizeDate(rawDate, defaultYear = '2026') {
  if (!rawDate) return '';
  const trimmed = rawDate.trim();
  if (!trimmed) return '';

  // Case 1: M/D/YYYY or D/M/YYYY
  const slashParts = trimmed.split('/');
  if (slashParts.length === 3) {
    const month = slashParts[0].padStart(2, '0');
    const day = slashParts[1].padStart(2, '0');
    let year = slashParts[2];
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // Case 2: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 3: 9-July-2026 or 06-October-2026 or 31-August-2026
  const hyphenParts = trimmed.split('-');
  if (hyphenParts.length === 3) {
    const day = hyphenParts[0].replace(/\D/g, '').padStart(2, '0');
    const mStr = hyphenParts[1].toLowerCase().replace(/\s/g, '');
    const month = MONTH_MAP[mStr] || '08';
    let year = hyphenParts[2].replace(/\D/g, '') || defaultYear;
    if (year.length === 2) year = '20' + year;
    return `${year}-${month}-${day}`;
  }

  // Case 4: July 23 or July 28
  const spaceParts = trimmed.split(/\s+/);
  if (spaceParts.length === 2) {
    const mStr = spaceParts[0].toLowerCase();
    const day = spaceParts[1].replace(/\D/g, '').padStart(2, '0');
    const month = MONTH_MAP[mStr];
    if (month && day) {
      return `${defaultYear}-${month}-${day}`;
    }
  }

  return trimmed;
}

// Map tech names to employee record
export const resolveAssignee = (techName) => {
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
  // Default to Rebecca / Johncy Rebecca
  return {
    assignedToId: 'emp-rebecca',
    assignedTo: 'Rebecca',
    assignedToEmail: 'rebecca@systemcaresitsolutions.com',
    assignedToUsername: 'Rebecca'
  };
};

function normalizeFormat(activity, comments) {
  const act = (activity || '').toLowerCase();
  const comm = (comments || '').toLowerCase();

  if (act.includes('reel') || comm.includes('reel') || comm.includes('video')) return 'Reel';
  if (act.includes('carousel') || act.includes('carrousel') || comm.includes('carousel')) return 'Carousel';
  if (act.includes('website') || comm.includes('website') || comm.includes('web')) return 'Website UI';
  if (act.includes('static') || comm.includes('poster') || comm.includes('post')) return 'Static Poster';
  if (act.includes('creatives') || comm.includes('banner') || comm.includes('pamphlet')) return 'Banner';
  if (act.includes('meta ad')) return 'Static Poster';
  if (act.includes('support') || comm.includes('invoice') || comm.includes('data')) return 'Document';
  return 'Static Poster';
}

function normalizeStatus(rawStatus) {
  const s = (rawStatus || '').toLowerCase().trim();
  if (s === 'completed' || s === 'posted') return 'Completed';
  if (s === 'in progress') return 'In Progress';
  if (s === 'on hold') return 'On Hold';
  if (s === 'waiting for approval') return 'Waiting for approval';
  if (s === 'cancelled' || s === 'rejected') return 'Backlog';
  if (s === 'yet to start') return 'Yet to start';
  return s ? (s.charAt(0).toUpperCase() + s.slice(1)) : 'Yet to start';
}

export const generateTasks = () => {
  const csvPath = path.join(__dirname, 'tasks_dataset.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('[Seed] tasks_dataset.csv not found at:', csvPath);
    return [];
  }
  const text = fs.readFileSync(csvPath, 'utf8');
  const parsed = parseCSV(text);

  const tasks = [];
  let isSocialSection = false;
  let socialPostIndex = 1;

  for (let i = 0; i < parsed.length; i++) {
    const row = parsed[i];
    if (!row || row.length === 0) continue;

    // Detect transition to Social Media Calendar Sheet
    const firstCell = (row[0] || '').trim().toLowerCase();
    if (firstCell.includes('to be posted on')) {
      isSocialSection = true;
      continue;
    }

    if (!isSocialSection) {
      // -------------------------------------------------------------
      // SHEET 1: TECH TEAM DAILY WORKFLOW TASKS
      // -------------------------------------------------------------
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
        isSocialMediaPost: false,
        taskType: 'task',
        sourceSheet: 'workflow_tasks',
        date: date,
        toBePostedOn: '',
        toBeCompletedOn: targetEndDate || date,
        theme: coreActivity || 'General Operations',
        format: format,
        description: description,
        title: description,
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
    } else {
      // -------------------------------------------------------------
      // SHEET 2: SOCIAL MEDIA PUBLISHING CALENDAR (Scheduled Posts)
      // Columns: To be posted on, Theme, Format, Description, Reference, Assigned to, Status, Completed on, Comments
      // -------------------------------------------------------------
      const rawToBePostedOn = row[0];
      if (!rawToBePostedOn || !rawToBePostedOn.trim()) continue;

      const toBePostedOn = normalizeDate(rawToBePostedOn);
      if (!toBePostedOn) continue;

      const theme = row[1] || 'Digital Marketing';
      const rawFormat = row[2] || 'Static Poster';
      const description = row[3] || `${theme} ${rawFormat}`;
      const reference = row[4] || '';
      const tech = row[5] || 'Johncy';
      const rawStatus = row[6] || 'In Progress';
      const rawCompletedOn = row[7] || '';
      const comments = row[8] || '';

      const status = normalizeStatus(rawStatus);
      const completedOn = normalizeDate(rawCompletedOn);
      const assignee = resolveAssignee(tech);
      const format = normalizeFormat(rawFormat, description);

      const postId = `POST-${String(socialPostIndex).padStart(3, '0')}`;
      socialPostIndex++;

      let estimatedHours = 4;
      if (format === 'Carousel') estimatedHours = 5;
      else if (format === 'Reel') estimatedHours = 4;
      else if (format === 'Static Poster') estimatedHours = 3;

      tasks.push({
        id: postId,
        sNo: 200 + socialPostIndex,
        isSocialMediaPost: true,
        taskType: 'social_post',
        sourceSheet: 'social_media_schedule',
        date: toBePostedOn,
        toBePostedOn: toBePostedOn,
        toBeCompletedOn: toBePostedOn,
        workStartDate: completedOn || toBePostedOn,
        targetEndDate: toBePostedOn,
        actualEndDate: (status === 'Completed') ? (completedOn || toBePostedOn) : null,
        theme: theme,
        format: format,
        description: description,
        title: description ? description.split('\n')[0].slice(0, 60) : `${theme} ${format}`,
        client: theme === 'CRM' ? 'SLMS / CRM' : (theme.toLowerCase().includes('laundry') ? 'Salavai Laundry' : 'SCS Digital'),
        comments: comments || description,
        reference: reference,
        clientProject: theme === 'CRM' ? 'SLMS / CRM' : 'System Care Digital',
        activity: format,
        project: `SM-${toBePostedOn.replace(/-/g, '')}`,
        coreActivity: 'Social Media Content',
        assignedToId: assignee.assignedToId,
        assignedTo: assignee.assignedTo,
        assignedToEmail: assignee.assignedToEmail,
        assignedToUsername: assignee.assignedToUsername,
        platform: 'Instagram / Meta',
        scheduledTime: '10:00',
        mediaUrl: '',
        slaStatus: 'Green',
        status: status,
        commentsUpdates: comments,
        estimatedHours: estimatedHours,
        timeSpentHours: status === 'Completed' ? estimatedHours : 0
      });
    }
  }

  return tasks;
};

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Clear out all old collections completely
    console.log('[Seed] Clearing all existing mock and old collections...');
    await Employee.deleteMany({});
    await User.deleteMany({});
    await Task.deleteMany({});
    await TimeLog.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    console.log('[Seed] All collections cleared.');

    // 2. Insert Employees and Auth Users
    console.log('[Seed] Inserting CSV Team Employees & Users...');
    await Employee.insertMany(SEED_EMPLOYEES);

    const userDocs = [
      ...SEED_EMPLOYEES.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: 'employee',
        password: emp.password,
        mustChangePassword: emp.mustChangePassword ?? true,
        isPasswordChanged: emp.isPasswordChanged ?? false,
        avatar: emp.avatar,
        joinedDate: emp.joinedDate
      })),
      ...SEED_ADMINS.map(adm => ({
        id: adm.id,
        name: adm.name,
        email: adm.email,
        role: adm.role,
        password: adm.password,
        mustChangePassword: adm.mustChangePassword ?? false,
        isPasswordChanged: adm.isPasswordChanged ?? false,
        avatar: adm.avatar,
        joinedDate: adm.joinedDate
      }))
    ];
    await User.insertMany(userDocs);
    console.log(`[Seed] Successfully inserted ${SEED_EMPLOYEES.length} Employees and ${userDocs.length} Users.`);

    // 3. Insert Tasks generated from CSV
    const tasksToInsert = generateTasks();
    await Task.insertMany(tasksToInsert);
    console.log(`[Seed] Successfully inserted ${tasksToInsert.length} CSV tasks.`);

    // 4. Create initial time logs for completed tasks
    const completedTasks = tasksToInsert.filter(t => t.status === 'Completed' && t.actualEndDate);
    const initialTimeLogs = completedTasks.map((t, idx) => ({
      id: `log-${Date.now()}-${idx}`,
      taskId: t.id,
      taskName: `${t.format}: ${t.description.slice(0, 30)}...`,
      employeeId: t.assignedToId,
      employeeName: t.assignedTo,
      date: t.actualEndDate || t.date,
      hours: t.estimatedHours,
      activity: t.activity,
      notes: `Completed task ${t.id}`
    }));
    if (initialTimeLogs.length > 0) {
      await TimeLog.insertMany(initialTimeLogs);
      console.log(`[Seed] Created ${initialTimeLogs.length} initial productivity time logs.`);
    }

    console.log('[Seed] Database successfully seeded with CSV data!');
    return {
      employees: SEED_EMPLOYEES.length,
      users: userDocs.length,
      tasks: tasksToInsert.length,
      timeLogs: initialTimeLogs.length
    };
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase()
    .then((res) => {
      console.log('[Seed Done]:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed Fatal]:', err);
      process.exit(1);
    });
}
