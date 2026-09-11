export const CLIENT_PROJECT_OPTIONS = [
  'SCS',
  'THE SALAVAI LAUNDRY',
  'NAMMUDE LAUNDRY',
  'THE AMLAN LAUNDRY',
  'PARISHUDHA LAUNDRY',
  'SALAVAI STORE',
  'KLEIDER CARE',
  'NAMMUDE STORE',
  'OTHERS'
];

export const ACTIVITY_OPTIONS = [
  'Static',
  'Carousel',
  'Adhoc',
  'Social Media Mgmt',
  'Website',
  'Creatives',
  'Reel',
  'Video'
];

export const FORMAT_OPTIONS = [
  'Static Poster',
  'Reel',
  'Carousel',
  'Video',
  'Story',
  'Banner',
  'Website UI',
  'Document',
  'Other'
];

export const THEME_OPTIONS = [
  'Digital Marketing',
  'BPP',
  'SIGP',
  'CRM'
];

export const CORE_ACTIVITY_OPTIONS = [
  'Social Media Content',
  'Web & Search Visibility',
  'Digital Reach',
  'Growth/Leads',
  'Others'
];

export const STATUS_OPTIONS = [
  'Yet to start',
  'In Progress',
  'Waiting for approval',
  'On Hold',
  'Completed',
  'Backlog'
];

export const SLA_STATUS_OPTIONS = [
  'Green',
  'Red'
];

// 10 Mock Employees for Testing & Demonstration
export const INITIAL_EMPLOYEES = [
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
    location: "Chennai, India"
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
    location: "Bangalore, India"
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
    location: "Chennai, India"
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
    location: "Hyderabad, India"
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
    location: "Mumbai, India"
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
    location: "Delhi, India"
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
    location: "Pune, India"
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
    location: "Bangalore, India"
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
    location: "Kochi, India"
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
    location: "Kolkata, India"
  }
];

export const DEFAULT_ADMIN = {
  id: "admin-1",
  name: "Aftab Alika",
  email: "admin@techteam.dev",
  role: "admin",
  title: "Engineering Manager",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  joinedDate: "2024-01-01"
};

// Seed task records parsed from August(SCS Tech Productivity).csv
export const INITIAL_TASKS = [
  { id: 'TASK-101', sNo: 1, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Static', project: 'S01', coreActivity: 'Social Media Content', assignedToId: 'emp-1', workStartDate: '2026-08-01', targetEndDate: '2026-08-22', actualEndDate: '2026-08-01', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'C-11 static poster for nammude laundry', estimatedHours: 8, timeSpentHours: 8 },
  { id: 'TASK-102', sNo: 2, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Static', project: 'S02', coreActivity: 'Social Media Content', assignedToId: 'emp-1', workStartDate: '2026-08-05', targetEndDate: '2026-08-25', actualEndDate: '2026-08-05', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'C-12 static poster for nammude laundry', estimatedHours: 8, timeSpentHours: 8 },
  { id: 'TASK-103', sNo: 3, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Static', project: 'S03', coreActivity: 'Social Media Content', assignedToId: 'emp-2', workStartDate: '2026-08-01', targetEndDate: '2026-08-05', actualEndDate: '2026-08-05', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'C-9 static poster for nammude laundry', estimatedHours: 6, timeSpentHours: 6 },
  { id: 'TASK-104', sNo: 4, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Carousel', project: 'C04', coreActivity: 'Social Media Content', assignedToId: 'emp-2', workStartDate: '2026-08-01', targetEndDate: '2026-09-05', actualEndDate: null, slaStatus: 'Green', status: 'Yet to start', commentsUpdates: 'C-16 carousel for nammude laundry', estimatedHours: 12, timeSpentHours: 0 },
  { id: 'TASK-105', sNo: 5, date: '2026-08-01', clientProject: 'Salavai Laundry Store', activity: 'Static', project: 'S05', coreActivity: 'Social Media Content', assignedToId: 'emp-3', workStartDate: '2026-08-01', targetEndDate: '2026-08-08', actualEndDate: null, slaStatus: 'Green', status: 'Waiting for approval', commentsUpdates: 'c 15 - neelankarai store', estimatedHours: 10, timeSpentHours: 4 },
  { id: 'TASK-106', sNo: 6, date: '2026-08-01', clientProject: 'KC', activity: 'Adhoc', project: 'A01', coreActivity: 'Others', assignedToId: 'emp-4', workStartDate: '2026-08-01', targetEndDate: '2026-08-01', actualEndDate: '2026-08-01', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'worked in consolidate sale data sheet', estimatedHours: 5, timeSpentHours: 5 },
  { id: 'TASK-107', sNo: 7, date: '2026-08-01', clientProject: 'SCS', activity: 'Social Media Mgmt', project: 'S07', coreActivity: 'Social Media Content', assignedToId: 'emp-4', workStartDate: '2026-08-01', targetEndDate: '2026-08-04', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'content for creatives', estimatedHours: 15, timeSpentHours: 6 },
  { id: 'TASK-108', sNo: 8, date: '2026-07-31', clientProject: 'SCS', activity: 'Static', project: 'S08', coreActivity: 'Social Media Content', assignedToId: 'emp-5', workStartDate: '2026-07-31', targetEndDate: '2026-08-01', actualEndDate: '2026-07-31', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'created friendship post for scs', estimatedHours: 6, timeSpentHours: 6 },
  { id: 'TASK-109', sNo: 9, date: '2026-07-31', clientProject: 'Salavai Laundry Store', activity: 'Static', project: 'S09', coreActivity: 'Social Media Content', assignedToId: 'emp-5', workStartDate: '2026-07-31', targetEndDate: '2026-08-01', actualEndDate: '2026-07-31', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'created friendship post for SALAVAI STORE', estimatedHours: 6, timeSpentHours: 6 },
  { id: 'TASK-110', sNo: 10, date: '2026-08-01', clientProject: 'Nammude Laundry', activity: 'Static', project: 'S10', coreActivity: 'Social Media Content', assignedToId: 'emp-5', workStartDate: '2026-08-01', targetEndDate: '2026-08-04', actualEndDate: '2026-08-03', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'C4 post for nammude laundry, salavai, amlan', estimatedHours: 8, timeSpentHours: 8 },
  { id: 'TASK-111', sNo: 11, date: '2026-08-03', clientProject: 'Nammude Laundry', activity: 'Carousel', project: 'C11', coreActivity: 'Social Media Content', assignedToId: 'emp-1', workStartDate: '2026-08-03', targetEndDate: '2026-08-18', actualEndDate: '2026-08-04', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'C10 BPP carousel', estimatedHours: 10, timeSpentHours: 10 },
  { id: 'TASK-112', sNo: 12, date: '2026-08-01', clientProject: 'Salavai Laundry Store', activity: 'Static', project: 'S12', coreActivity: 'Social Media Content', assignedToId: 'emp-3', workStartDate: '2026-08-01', targetEndDate: '2026-08-09', actualEndDate: null, slaStatus: 'Green', status: 'Waiting for approval', commentsUpdates: 'c 16 - neelankarai store', estimatedHours: 8, timeSpentHours: 3 },
  { id: 'TASK-113', sNo: 13, date: '2026-08-03', clientProject: 'Salavai Laundry Store', activity: 'Static', project: 'S13', coreActivity: 'Social Media Content', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-10', actualEndDate: null, slaStatus: 'Green', status: 'Waiting for approval', commentsUpdates: 'c 4 - neelankarai store', estimatedHours: 8, timeSpentHours: 2 },
  { id: 'TASK-114', sNo: 14, date: '2026-08-03', clientProject: 'KC', activity: 'Static', project: 'S14', coreActivity: 'Social Media Content', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-21', actualEndDate: null, slaStatus: 'Green', status: 'Yet to start', commentsUpdates: 'Id-E-Emilad', estimatedHours: 10, timeSpentHours: 0 },
  { id: 'TASK-115', sNo: 15, date: '2026-08-03', clientProject: 'KC', activity: 'Static', project: 'S15', coreActivity: 'Social Media Content', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-21', actualEndDate: null, slaStatus: 'Green', status: 'Yet to start', commentsUpdates: 'Onam poster', estimatedHours: 10, timeSpentHours: 0 },
  { id: 'TASK-116', sNo: 16, date: '2026-08-03', clientProject: 'Nammude Laundry', activity: 'Carousel', project: 'C16', coreActivity: 'Social Media Content', assignedToId: 'emp-5', workStartDate: '2026-08-05', targetEndDate: '2026-08-11', actualEndDate: '2026-08-07', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'c5 for nammude laundry, salavai, amlan', estimatedHours: 12, timeSpentHours: 12 },
  { id: 'TASK-117', sNo: 18, date: '2026-08-03', clientProject: 'Amlan laundry', activity: 'Static', project: 'S17', coreActivity: 'Social Media Content', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-21', actualEndDate: null, slaStatus: 'Green', status: 'Yet to start', commentsUpdates: 'Id-E-Emilad', estimatedHours: 8, timeSpentHours: 0 },
  { id: 'TASK-118', sNo: 19, date: '2026-08-03', clientProject: 'Salavai Laundry Store', activity: 'Static', project: 'S18', coreActivity: 'Social Media Content', assignedToId: 'emp-5', workStartDate: '2026-08-03', targetEndDate: '2026-08-25', actualEndDate: null, slaStatus: 'Green', status: 'On Hold', commentsUpdates: 'creating a banner for salavai laundry store', estimatedHours: 15, timeSpentHours: 4 },
  { id: 'TASK-119', sNo: 20, date: '2026-08-03', clientProject: 'Salavai Laundry Store', activity: 'Creatives', project: 'S19', coreActivity: 'Social Media Content', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-17', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Package material design for Salavai store', estimatedHours: 20, timeSpentHours: 8 },
  { id: 'TASK-120', sNo: 21, date: '2026-08-03', clientProject: 'KC', activity: 'Website', project: 'S20', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-04', actualEndDate: '2026-08-05', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'Banner design for Kleider care ecom', estimatedHours: 12, timeSpentHours: 12 },
  { id: 'TASK-121', sNo: 41, date: '2026-08-07', clientProject: 'KC', activity: 'Website', project: 'W01', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-6', workStartDate: '2026-08-02', targetEndDate: '2026-08-20', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Working on E commerce - implement product search, filtering, and recommendation UI components.', estimatedHours: 40, timeSpentHours: 18 },
  { id: 'TASK-122', sNo: 42, date: '2026-08-07', clientProject: 'Salavai Laundry', activity: 'Website', project: 'W02', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-6', workStartDate: '2026-08-07', targetEndDate: '2026-08-25', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Working on Salavai Laundry Web platform', estimatedHours: 35, timeSpentHours: 12 },
  { id: 'TASK-123', sNo: 43, date: '2026-08-08', clientProject: 'SCS', activity: 'Website', project: 'B01', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-7', workStartDate: '2026-08-08', targetEndDate: '2026-08-24', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Secure payment gateway & API integration', estimatedHours: 30, timeSpentHours: 15 },
  { id: 'TASK-124', sNo: 44, date: '2026-08-09', clientProject: 'THE SALAVAI LAUNDRY', activity: 'Adhoc', project: 'Q01', coreActivity: 'Others', assignedToId: 'emp-8', workStartDate: '2026-08-09', targetEndDate: '2026-08-22', actualEndDate: '2026-08-18', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'Automated end-to-end regression test suite execution', estimatedHours: 25, timeSpentHours: 25 },
  { id: 'TASK-125', sNo: 45, date: '2026-08-10', clientProject: 'NAMMUDE LAUNDRY', activity: 'Video', project: 'V01', coreActivity: 'Social Media Content', assignedToId: 'emp-9', workStartDate: '2026-08-10', targetEndDate: '2026-08-20', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Promotional short reel animation & sound mixing', estimatedHours: 20, timeSpentHours: 10 },
  { id: 'TASK-126', sNo: 46, date: '2026-08-11', clientProject: 'SCS', activity: 'Adhoc', project: 'D01', coreActivity: 'Growth/Leads', assignedToId: 'emp-10', workStartDate: '2026-08-11', targetEndDate: '2026-08-28', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Performance telemetry dashboard & monthly SLA analytics report', estimatedHours: 35, timeSpentHours: 20 }
];

export const INITIAL_TIME_LOGS = [];

export const LEAVE_TYPE_OPTIONS = [
  'Casual Leave',
  'Sick Leave',
  'Emergency Leave',
  'Work From Home (WFH)',
  'Half Day',
  'Other'
];

export const INITIAL_LEAVE_REQUESTS = [
  {
    id: "leave-1",
    employeeId: "emp-1",
    employeeName: "Johncyrebecca",
    employeeEmail: "johncyrebecca@gmail.com",
    employeeRole: "Associate Software Engineer",
    leaveType: "Casual Leave",
    fromDate: "2026-09-15",
    toDate: "2026-09-16",
    days: 2,
    reason: "Attending family function & personal errands",
    appliedDate: "2026-09-10",
    status: "Pending",
    adminComment: ""
  },
  {
    id: "leave-2",
    employeeId: "emp-5",
    employeeName: "Sneha Patel",
    employeeEmail: "sneha.patel@techteam.dev",
    employeeRole: "Digital Marketing Specialist",
    leaveType: "Sick Leave",
    fromDate: "2026-09-10",
    toDate: "2026-09-10",
    days: 0.5,
    reason: "Doctor appointment and viral fever checkup",
    appliedDate: "2026-09-09",
    status: "Approved",
    adminComment: "Approved. Take rest.",
    reviewedBy: "Aftab Alika",
    reviewedAt: "2026-09-09 18:00"
  },
  {
    id: "leave-3",
    employeeId: "emp-3",
    employeeName: "Priya Sundaram",
    employeeEmail: "priya.sundaram@techteam.dev",
    employeeRole: "Lead UI/UX Designer",
    leaveType: "Work From Home (WFH)",
    fromDate: "2026-09-10",
    toDate: "2026-09-11",
    days: 2,
    reason: "Remote UI/UX design sprint and asset export",
    appliedDate: "2026-09-09",
    status: "Approved",
    adminComment: "WFH approved. Ensure sync on Slack.",
    reviewedBy: "Aftab Alika",
    reviewedAt: "2026-09-09 19:30"
  },
  {
    id: "leave-4",
    employeeId: "emp-6",
    employeeName: "Rohan Sharma",
    employeeEmail: "rohan.sharma@techteam.dev",
    employeeRole: "Frontend Developer",
    leaveType: "Emergency Leave",
    fromDate: "2026-09-18",
    toDate: "2026-09-19",
    days: 2,
    reason: "Out of station travel for urgent house relocation",
    appliedDate: "2026-09-10",
    status: "Pending",
    adminComment: ""
  }
];

