import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { Employee } from './models/Employee.js';
import { User } from './models/User.js';
import { Task } from './models/Task.js';
import { TimeLog } from './models/TimeLog.js';
import { Attendance } from './models/Attendance.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('DNS config notice:', e.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KC:KCecommerce@cluster0.b2v8pfh.mongodb.net/tech_team_crm?retryWrites=true&w=majority';

export const MOCK_ADMIN = {
  id: "admin-1",
  name: "Aftab Alika",
  email: "admin@techteam.dev",
  role: "admin",
  password: "admin",
  joinedDate: "2024-01-01",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
};

export const MOCK_SUPER_ADMIN = {
  id: "super-1",
  name: "Chief Technology Officer",
  email: "cto@techteam.dev",
  role: "super_admin",
  password: "admin",
  joinedDate: "2023-11-01",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
};

export const MOCK_EMPLOYEES = [
  {
    id: "emp-1",
    name: "Johncyrebecca",
    email: "johncyrebecca@gmail.com",
    role: "Associate Software Engineer",
    department: "Frontend & Marketing Tech",
    status: "Active",
    joinedDate: "2024-03-01",
    skills: ["Social Media", "Creatives", "Canva", "SEO", "React", "Banner Design"],
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43210",
    location: "Chennai, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-2",
    name: "Arjun Nair",
    email: "arjun.nair@techteam.dev",
    role: "Senior Full Stack Engineer",
    department: "Core Engineering",
    status: "Active",
    joinedDate: "2023-08-15",
    skills: ["React", "Node.js", "MongoDB", "AWS", "System Architecture", "GraphQL"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43211",
    location: "Bangalore, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-3",
    name: "Priya Sundaram",
    email: "priya.sundaram@techteam.dev",
    role: "Lead UI/UX Designer",
    department: "Product Design",
    status: "Active",
    joinedDate: "2024-01-10",
    skills: ["Figma", "UI/UX Design", "Design Systems", "Wireframing", "Prototyping", "Adobe XD"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43212",
    location: "Chennai, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-4",
    name: "Karthik Raja",
    email: "karthik.raja@techteam.dev",
    role: "DevOps & Cloud Engineer",
    department: "Infrastructure & Cloud",
    status: "Active",
    joinedDate: "2023-11-20",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "AWS", "Linux"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43213",
    location: "Hyderabad, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-5",
    name: "Sneha Patel",
    email: "sneha.patel@techteam.dev",
    role: "Digital Marketing Specialist",
    department: "Growth & Marketing",
    status: "Active",
    joinedDate: "2024-02-01",
    skills: ["SEO", "Google Ads", "Content Strategy", "Social Media", "Copywriting", "Analytics"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43214",
    location: "Mumbai, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-6",
    name: "Rohan Sharma",
    email: "rohan.sharma@techteam.dev",
    role: "Frontend Developer",
    department: "Frontend Engineering",
    status: "Active",
    joinedDate: "2024-04-12",
    skills: ["React", "TypeScript", "TailwindCSS", "Next.js", "Redux", "Jest"],
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43215",
    location: "Delhi, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-7",
    name: "Ananya Iyer",
    email: "ananya.iyer@techteam.dev",
    role: "Backend Developer",
    department: "Backend Engineering",
    status: "Active",
    joinedDate: "2024-03-18",
    skills: ["Node.js", "Express", "PostgreSQL", "Redis", "REST APIs", "Microservices"],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43216",
    location: "Pune, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-8",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@techteam.dev",
    role: "QA Automation Engineer",
    department: "Quality Engineering",
    status: "Active",
    joinedDate: "2024-02-15",
    skills: ["Cypress", "Playwright", "Selenium", "API Testing", "Automation", "Postman"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43217",
    location: "Bangalore, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-9",
    name: "Divya Menon",
    email: "divya.menon@techteam.dev",
    role: "Motion & Graphic Designer",
    department: "Creative Media",
    status: "Active",
    joinedDate: "2024-05-02",
    skills: ["After Effects", "Premiere Pro", "Motion Graphics", "Reels", "Brand Creatives", "Photoshop"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43218",
    location: "Kochi, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  },
  {
    id: "emp-10",
    name: "Siddharth Roy",
    email: "siddharth.roy@techteam.dev",
    role: "Data & Performance Analyst",
    department: "Data Analytics",
    status: "Active",
    joinedDate: "2024-01-22",
    skills: ["Python", "SQL", "Power BI", "Google Analytics 4", "Data Pipelines", "Reporting"],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98765 43219",
    location: "Kolkata, India",
    weeklyCapacityHours: 40,
    isProfileCompleted: true
  }
];

export const MOCK_TASKS = [
  { id: 'TASK-101', sNo: 1, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Static Poster', project: 'S01', coreActivity: 'Social Media Content', assignedToId: 'emp-1', assignedTo: 'Johncyrebecca', assignedToUsername: 'Johncyrebecca', assignedToEmail: 'johncyrebecca@gmail.com', workStartDate: '2026-08-01', targetEndDate: '2026-08-22', actualEndDate: '2026-08-01', slaStatus: 'Green', status: 'Completed', description: 'C-11 static poster for nammude laundry', commentsUpdates: 'Completed and approved', estimatedHours: 8, timeSpentHours: 8 },
  { id: 'TASK-102', sNo: 2, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Static Poster', project: 'S02', coreActivity: 'Social Media Content', assignedToId: 'emp-1', assignedTo: 'Johncyrebecca', assignedToUsername: 'Johncyrebecca', assignedToEmail: 'johncyrebecca@gmail.com', workStartDate: '2026-08-05', targetEndDate: '2026-08-25', actualEndDate: '2026-08-05', slaStatus: 'Green', status: 'Completed', description: 'C-12 static poster for nammude laundry', commentsUpdates: 'Client signoff received', estimatedHours: 8, timeSpentHours: 8 },
  { id: 'TASK-103', sNo: 3, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Static Poster', project: 'S03', coreActivity: 'Social Media Content', assignedToId: 'emp-2', assignedTo: 'Arjun Nair', assignedToUsername: 'Arjun Nair', assignedToEmail: 'arjun.nair@techteam.dev', workStartDate: '2026-08-01', targetEndDate: '2026-08-05', actualEndDate: '2026-08-05', slaStatus: 'Green', status: 'Completed', description: 'Architecture & service refactoring', commentsUpdates: 'Deployed to staging', estimatedHours: 6, timeSpentHours: 6 },
  { id: 'TASK-104', sNo: 4, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Carousel', project: 'C04', coreActivity: 'Social Media Content', assignedToId: 'emp-2', assignedTo: 'Arjun Nair', assignedToUsername: 'Arjun Nair', assignedToEmail: 'arjun.nair@techteam.dev', workStartDate: '2026-08-01', targetEndDate: '2026-09-05', actualEndDate: null, slaStatus: 'Green', status: 'Yet to start', description: 'GraphQL caching layer optimization', commentsUpdates: 'Pending sprint 2', estimatedHours: 12, timeSpentHours: 0 },
  { id: 'TASK-105', sNo: 5, date: '2026-08-01', clientProject: 'Salavai Laundry Store', activity: 'Static Poster', project: 'S05', coreActivity: 'Social Media Content', assignedToId: 'emp-3', assignedTo: 'Priya Sundaram', assignedToUsername: 'Priya Sundaram', assignedToEmail: 'priya.sundaram@techteam.dev', workStartDate: '2026-08-01', targetEndDate: '2026-08-08', actualEndDate: null, slaStatus: 'Green', status: 'Waiting for approval', description: 'Mobile design system component library', commentsUpdates: 'Submitted for lead review', estimatedHours: 10, timeSpentHours: 4 },
  { id: 'TASK-106', sNo: 6, date: '2026-08-01', clientProject: 'KC', activity: 'Adhoc', project: 'A01', coreActivity: 'Others', assignedToId: 'emp-4', assignedTo: 'Karthik Raja', assignedToUsername: 'Karthik Raja', assignedToEmail: 'karthik.raja@techteam.dev', workStartDate: '2026-08-01', targetEndDate: '2026-08-01', actualEndDate: '2026-08-01', slaStatus: 'Green', status: 'Completed', description: 'Docker multi-stage build optimization', commentsUpdates: 'Pipeline latency reduced by 40%', estimatedHours: 5, timeSpentHours: 5 },
  { id: 'TASK-107', sNo: 7, date: '2026-08-01', clientProject: 'SCS', activity: 'Social Media Mgmt', project: 'S07', coreActivity: 'Social Media Content', assignedToId: 'emp-5', assignedTo: 'Sneha Patel', assignedToUsername: 'Sneha Patel', assignedToEmail: 'sneha.patel@techteam.dev', workStartDate: '2026-08-01', targetEndDate: '2026-08-04', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', description: 'Monthly digital marketing acquisition campaign', commentsUpdates: 'Creative copy finalized', estimatedHours: 15, timeSpentHours: 6 },
  { id: 'TASK-108', sNo: 8, date: '2026-07-31', clientProject: 'SCS', activity: 'Static Poster', project: 'S08', coreActivity: 'Social Media Content', assignedToId: 'emp-6', assignedTo: 'Rohan Sharma', assignedToUsername: 'Rohan Sharma', assignedToEmail: 'rohan.sharma@techteam.dev', workStartDate: '2026-07-31', targetEndDate: '2026-08-01', actualEndDate: '2026-07-31', slaStatus: 'Green', status: 'Completed', description: 'Responsive dashboard grid layouts', commentsUpdates: 'Cross-browser tested', estimatedHours: 6, timeSpentHours: 6 },
  { id: 'TASK-109', sNo: 9, date: '2026-08-08', clientProject: 'SCS', activity: 'Website', project: 'B01', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-7', assignedTo: 'Ananya Iyer', assignedToUsername: 'Ananya Iyer', assignedToEmail: 'ananya.iyer@techteam.dev', workStartDate: '2026-08-08', targetEndDate: '2026-08-24', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', description: 'Payment gateway webhooks & Redis session store', commentsUpdates: 'Endpoint security audit complete', estimatedHours: 30, timeSpentHours: 15 },
  { id: 'TASK-110', sNo: 10, date: '2026-08-09', clientProject: 'THE SALAVAI LAUNDRY', activity: 'Adhoc', project: 'Q01', coreActivity: 'Others', assignedToId: 'emp-8', assignedTo: 'Vikram Malhotra', assignedToUsername: 'Vikram Malhotra', assignedToEmail: 'vikram.malhotra@techteam.dev', workStartDate: '2026-08-09', targetEndDate: '2026-08-22', actualEndDate: '2026-08-18', slaStatus: 'Green', status: 'Completed', description: 'Automated end-to-end regression test suite execution', commentsUpdates: '100% test pass rate', estimatedHours: 25, timeSpentHours: 25 },
  { id: 'TASK-111', sNo: 11, date: '2026-08-10', clientProject: 'NAMMUDE LAUNDRY', activity: 'Video', project: 'V01', coreActivity: 'Social Media Content', assignedToId: 'emp-9', assignedTo: 'Divya Menon', assignedToUsername: 'Divya Menon', assignedToEmail: 'divya.menon@techteam.dev', workStartDate: '2026-08-10', targetEndDate: '2026-08-20', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', description: 'Promotional short reel animation & sound mixing', commentsUpdates: 'Draft render submitted', estimatedHours: 20, timeSpentHours: 10 },
  { id: 'TASK-112', sNo: 12, date: '2026-08-11', clientProject: 'SCS', activity: 'Adhoc', project: 'D01', coreActivity: 'Growth/Leads', assignedToId: 'emp-10', assignedTo: 'Siddharth Roy', assignedToUsername: 'Siddharth Roy', assignedToEmail: 'siddharth.roy@techteam.dev', workStartDate: '2026-08-11', targetEndDate: '2026-08-28', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', description: 'Performance telemetry dashboard & monthly SLA analytics report', commentsUpdates: 'Aggregated client retention numbers', estimatedHours: 35, timeSpentHours: 20 }
];

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected successfully to MongoDB.');

    // 1. Seed Admins & Super Admins into User collection
    console.log('[Seed] Upserting Admin & Super Admin users...');
    await User.findOneAndUpdate({ id: MOCK_ADMIN.id }, MOCK_ADMIN, { upsert: true, new: true });
    await User.findOneAndUpdate({ id: MOCK_SUPER_ADMIN.id }, MOCK_SUPER_ADMIN, { upsert: true, new: true });

    // 2. Seed 10 Employees into Employee collection and User collection (for login)
    console.log('[Seed] Upserting 10 Employees...');
    for (const emp of MOCK_EMPLOYEES) {
      await Employee.findOneAndUpdate({ id: emp.id }, emp, { upsert: true, new: true });
      await User.findOneAndUpdate(
        { id: emp.id },
        {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          role: 'employee',
          password: 'password123',
          joinedDate: emp.joinedDate,
          avatar: emp.avatar
        },
        { upsert: true, new: true }
      );
    }

    // 3. Seed Tasks
    console.log('[Seed] Upserting Tasks...');
    for (const task of MOCK_TASKS) {
      await Task.findOneAndUpdate({ id: task.id }, task, { upsert: true, new: true });
    }

    // 4. Seed Attendance Records for today & yesterday across all 10 employees
    console.log('[Seed] Upserting Attendance records...');
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const attendanceSeed = [
      { id: 'att-1', employeeId: 'emp-1', date: today, status: 'Present', checkIn: '09:15', checkOut: '18:30', notes: 'In office' },
      { id: 'att-2', employeeId: 'emp-2', date: today, status: 'Present', checkIn: '09:30', checkOut: '18:30', notes: 'In office' },
      { id: 'att-3', employeeId: 'emp-3', date: today, status: 'Work From Home', checkIn: '09:00', checkOut: '18:00', notes: 'Remote UI design' },
      { id: 'att-4', employeeId: 'emp-4', date: today, status: 'Present', checkIn: '09:20', checkOut: '18:30', notes: 'In office' },
      { id: 'att-5', employeeId: 'emp-5', date: today, status: 'Half Day', checkIn: '09:30', checkOut: '14:00', notes: 'Doctor appointment' },
      { id: 'att-6', employeeId: 'emp-6', date: today, status: 'Present', checkIn: '09:10', checkOut: '18:45', notes: 'Dev deployment' },
      { id: 'att-7', employeeId: 'emp-7', date: today, status: 'Present', checkIn: '09:25', checkOut: '18:30', notes: 'In office' },
      { id: 'att-8', employeeId: 'emp-8', date: today, status: 'Present', checkIn: '09:40', checkOut: '18:30', notes: 'In office' },
      { id: 'att-9', employeeId: 'emp-9', date: today, status: 'Work From Home', checkIn: '09:00', checkOut: '18:00', notes: 'Video asset rendering' },
      { id: 'att-10', employeeId: 'emp-10', date: today, status: 'Present', checkIn: '09:15', checkOut: '18:30', notes: 'In office' },
      { id: 'att-11', employeeId: 'emp-1', date: yesterday, status: 'Present', checkIn: '09:10', checkOut: '18:30', notes: 'In office' },
      { id: 'att-12', employeeId: 'emp-2', date: yesterday, status: 'Present', checkIn: '09:25', checkOut: '18:30', notes: 'In office' },
      { id: 'att-13', employeeId: 'emp-3', date: yesterday, status: 'Present', checkIn: '09:30', checkOut: '18:30', notes: 'In office' },
      { id: 'att-14', employeeId: 'emp-4', date: yesterday, status: 'Work From Home', checkIn: '09:00', checkOut: '18:00', notes: 'Remote campaign setup' },
      { id: 'att-15', employeeId: 'emp-5', date: yesterday, status: 'Present', checkIn: '09:15', checkOut: '18:30', notes: 'In office' },
      { id: 'att-16', employeeId: 'emp-6', date: yesterday, status: 'Present', checkIn: '09:05', checkOut: '18:30', notes: 'Bug fixes' }
    ];

    for (const att of attendanceSeed) {
      await Attendance.findOneAndUpdate({ id: att.id }, att, { upsert: true, new: true });
    }

    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

seedDatabase();
