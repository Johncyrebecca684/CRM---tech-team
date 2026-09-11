import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { TimeLog } from '../models/TimeLog.js';
import { Attendance } from '../models/Attendance.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { sendTaskAssignmentEmail, testSmtpConnection } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

const router = express.Router();

// POST /api/upload - Handle deliverable file uploads securely to disk
router.post('/upload', async (req, res) => {
  try {
    const { fileName, fileData, fileType } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: 'fileName and fileData are required' });
    }

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let base64Data = fileData;
    let detectedType = fileType || 'application/octet-stream';
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      const parts = fileData.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) detectedType = match[1];
      base64Data = parts[1];
    }

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${Date.now()}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    const buffer = Buffer.from(base64Data, 'base64');
    await fs.promises.writeFile(filePath, buffer);

    const sizeInKb = (buffer.length / 1024).toFixed(1);
    const sizeStr = buffer.length > 1024 * 1024 ? `${(buffer.length / (1024 * 1024)).toFixed(1)} MB` : `${sizeInKb} KB`;

    const fileUrl = `/uploads/${uniqueFileName}`;

    res.json({
      success: true,
      url: fileUrl,
      name: fileName,
      size: sizeStr,
      type: detectedType,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Upload Error]:', error);
    res.status(500).json({ error: error.message });
  }
});

const MOCK_10_EMPLOYEES = [
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

const MOCK_LEAVE_REQUESTS = [
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

// GET /api/bootstrap - Fetch all data & seed default admins if empty
router.get('/bootstrap', async (req, res) => {
  try {
    let employees = await Employee.find().lean();
    let users = await User.find().lean();
    let tasks = await Task.find().sort({ createdAt: -1 }).lean();
    let timeLogs = await TimeLog.find().sort({ createdAt: -1 }).lean();
    let attendanceRecords = await Attendance.find().sort({ date: -1 }).lean();
    let leaveRequests = await LeaveRequest.find().sort({ createdAt: -1 }).lean();

    // Check if super admin or admin users exist; seed default if empty
    let superAdmins = users.filter((u) => u.role === 'super_admin');
    let admins = users.filter((u) => u.role === 'admin');

    if (superAdmins.length === 0) {
      const defaultSuperAdmin = await User.create({
        id: 'super-1',
        name: 'Chief Technology Officer',
        email: 'cto@techteam.dev',
        role: 'super_admin',
        joinedDate: '2023-11-01',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      superAdmins.push(defaultSuperAdmin.toObject());
    }

    if (admins.length === 0) {
      const defaultAdmin = await User.create({
        id: 'admin-1',
        name: 'Aftab Alika',
        email: 'admin@techteam.dev',
        role: 'admin',
        title: 'Engineering Manager',
        joinedDate: '2024-01-01',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      admins.push(defaultAdmin.toObject());
    }

    // Seed 10 mock employees if empty or fewer than 10
    if (employees.length < 10) {
      for (const mockEmp of MOCK_10_EMPLOYEES) {
        const exists = employees.some(e => e.id === mockEmp.id || (e.email && e.email.toLowerCase() === mockEmp.email.toLowerCase()));
        if (!exists) {
          const created = await Employee.create(mockEmp);
          employees.push(created.toObject());
        }
      }
    }

    // Seed mock leave requests if empty
    if (leaveRequests.length === 0) {
      for (const mockLeave of MOCK_LEAVE_REQUESTS) {
        const created = await LeaveRequest.create(mockLeave);
        leaveRequests.push(created.toObject());
      }
    }

    // Return bootstrap collections
    res.json({
      employees,
      admins,
      superAdmins,
      tasks,
      timeLogs,
      attendanceRecords,
      leaveRequests
    });
  } catch (error) {
    console.warn('[MongoDB Bootstrap Notice] Database connection offline or busy, providing fallback defaults:', error.message);
    res.json({
      employees: MOCK_10_EMPLOYEES,
      admins: [
        { id: 'admin-1', name: 'Aftab Alika', email: 'admin@techteam.dev', role: 'admin', title: 'Engineering Manager', joinedDate: '2024-01-01', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' }
      ],
      superAdmins: [
        { id: 'super-1', name: 'Chief Technology Officer', email: 'cto@techteam.dev', role: 'super_admin', joinedDate: '2023-11-01' }
      ],
      tasks: [],
      timeLogs: [],
      attendanceRecords: [],
      leaveRequests: MOCK_LEAVE_REQUESTS
    });
  }
});

// Clear all mock employees endpoint
router.post('/employees/clear-all-mock', async (req, res) => {
  try {
    await Employee.deleteMany({ email: { $regex: /@techteam\.dev$/i } });
    await User.deleteMany({ role: 'employee', email: { $regex: /@techteam\.dev$/i } });
    const remaining = await Employee.find();
    res.json({ success: true, message: 'Cleared mock employees', remainingEmployees: remaining });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AUTHENTICATION & LOGIN ENDPOINTS
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (role === 'admin') {
      // Find admin or super_admin account
      let adminAccount = await User.findOne({ 
        email: new RegExp(`^${cleanEmail}$`, 'i'),
        role: { $in: ['admin', 'super_admin'] }
      });

      if (!adminAccount) {
        // Check if this is an employee trying to sign in through admin portal
        let empAccount = await Employee.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
        if (empAccount) {
          return res.status(403).json({ 
            error: `Access Denied: ${empAccount.name} is an Employee / Specialist. Please click 'Employee Portal' tab above to sign in.` 
          });
        }
        return res.status(401).json({ error: 'Administrator account not found. Please verify your credentials or contact IT.' });
      }

      // Verify password
      if (adminAccount.password && adminAccount.password !== password && adminAccount.password !== '123456') {
        return res.status(401).json({ error: 'Incorrect administrator password.' });
      } else if (password) {
        adminAccount.password = password;
        await adminAccount.save();
      }

      return res.json({
        success: true,
        user: {
          id: adminAccount.id,
          name: adminAccount.name,
          email: adminAccount.email,
          role: adminAccount.role || 'admin',
          avatar: adminAccount.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adminAccount.name)}`
        }
      });

    } else {
      // Employee portal login
      let empAccount = await Employee.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });

      // If not found by exact email, check if email matches existing specialist by name or prefix (e.g. johncyrebecca@gmail.com -> Johncy Rebecca)
      if (!empAccount) {
        const usernamePrefix = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const allEmps = await Employee.find();
        for (const emp of allEmps) {
          const empCleanName = emp.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const empFirstName = emp.name.toLowerCase().split(' ')[0];
          if (
            empCleanName.includes(usernamePrefix) ||
            usernamePrefix.includes(empCleanName) ||
            usernamePrefix.startsWith(empFirstName)
          ) {
            empAccount = emp;
            break;
          }
        }
      }

      if (empAccount) {
        // Automatically link and save the login email onto the specialist's employee record
        if (empAccount.email.toLowerCase() !== cleanEmail) {
          empAccount.email = cleanEmail;
          await empAccount.save();

          await User.findOneAndUpdate(
            { id: empAccount.id },
            { email: cleanEmail, name: empAccount.name, role: 'employee' },
            { upsert: true }
          );

          await Task.updateMany(
            { assignedToId: empAccount.id },
            { $set: { assignedToEmail: cleanEmail, assignedToUsername: empAccount.name } }
          );
        }

        if (empAccount.password && empAccount.password !== password && empAccount.password !== '123456') {
          return res.status(401).json({ error: 'Incorrect employee password.' });
        } else if (password) {
          empAccount.password = password;
          await empAccount.save();
        }

        const isComplete = !!(empAccount.isProfileCompleted && empAccount.name && empAccount.role && empAccount.role !== 'Media Specialist' && empAccount.skills && empAccount.skills.length > 0);

        return res.json({
          success: true,
          user: {
            id: empAccount.id,
            name: empAccount.name,
            email: cleanEmail,
            role: 'employee',
            roleTitle: empAccount.role || '',
            skills: empAccount.skills || [],
            weeklyCapacityHours: empAccount.weeklyCapacityHours || 40,
            avatar: empAccount.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(empAccount.name)}`,
            isProfileCompleted: isComplete
          },
          requiresProfileSetup: !isComplete
        });
      }

      // Check if admin is trying to sign into employee portal
      let adminAccount = await User.findOne({ 
        email: new RegExp(`^${cleanEmail}$`, 'i'),
        role: { $in: ['admin', 'super_admin'] }
      });
      if (adminAccount) {
        return res.status(403).json({ 
          error: `Access Notice: ${adminAccount.name} is an Administrator. Please click 'Admin Portal' tab above to sign in.` 
        });
      }

      // Auto register new employee if not matching any specialist
      const newId = `emp-${Date.now()}`;
      const rawName = cleanEmail.split('@')[0].replace('.', ' ');
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      const newEmp = await Employee.create({
        id: newId,
        name: formattedName,
        email: cleanEmail,
        password: password,
        role: '',
        skills: [],
        isProfileCompleted: false,
        joinedDate: new Date().toISOString().split('T')[0]
      });
      await User.create({
        id: newId,
        name: newEmp.name,
        email: cleanEmail,
        role: 'employee',
        password: password
      });

      return res.json({
        success: true,
        user: {
          id: newEmp.id,
          name: newEmp.name,
          email: newEmp.email,
          role: 'employee',
          roleTitle: '',
          skills: [],
          weeklyCapacityHours: 40,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newEmp.name)}`,
          isProfileCompleted: false
        },
        requiresProfileSetup: true
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// EMPLOYEES ENDPOINTS
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/employees', async (req, res) => {
  try {
    const newEmp = await Employee.findOneAndUpdate(
      { id: req.body.id },
      { ...req.body, isProfileCompleted: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // Also save corresponding User auth record in MongoDB
    await User.findOneAndUpdate(
      { id: req.body.id },
      {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        role: 'employee',
        avatar: req.body.avatar,
        joinedDate: req.body.joinedDate || new Date().toISOString().split('T')[0]
      },
      { upsert: true, new: true }
    );

    res.status(201).json(newEmp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const empId = req.params.id;
    const body = req.body || {};
    const effectiveRole = body.role || body.roleTitle || 'Tech Specialist';

    const updatePayload = {
      ...body,
      role: effectiveRole,
      isProfileCompleted: true
    };

    // Find and update or upsert Employee record
    const updated = await Employee.findOneAndUpdate(
      { $or: [{ id: empId }, { email: body.email }] },
      updatePayload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also update corresponding User auth record
    if (body.name || body.email || body.avatar) {
      await User.findOneAndUpdate(
        { $or: [{ id: empId }, { email: body.email }] },
        {
          id: empId,
          ...(body.name ? { name: body.name } : {}),
          ...(body.email ? { email: body.email } : {}),
          ...(body.avatar ? { avatar: body.avatar } : {})
        },
        { upsert: true }
      );
    }

    // Also update assigned task assignees in MongoDB
    if (body.name || body.email) {
      const taskUpdates = {};
      if (body.name) {
        taskUpdates.assignedToUsername = body.name;
        taskUpdates.assignedTo = body.name;
      }
      if (body.email) {
        taskUpdates.assignedToEmail = body.email;
      }
      await Task.updateMany(
        { $or: [{ assignedToId: empId }, { assignedToEmail: body.email }] },
        { $set: taskUpdates }
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/employees/:id', async (req, res) => {
  try {
    await Employee.deleteOne({ id: req.params.id });
    await User.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMINS ENDPOINTS
router.get('/admins', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/admins', async (req, res) => {
  try {
    const adminUser = await User.findOneAndUpdate(
      { id: req.body.id },
      {
        id: req.body.id,
        name: req.body.name,
        email: req.body.email,
        role: 'admin',
        avatar: req.body.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedDate: req.body.joinedDate || new Date().toISOString().split('T')[0]
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(adminUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/admins/:id', async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// TASKS ENDPOINTS
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks', async (req, res) => {
  try {
    const taskId = req.body.id || `TASK-${Date.now().toString().slice(-4)}`;
    const taskData = { ...req.body, id: taskId };
    const newTask = await Task.findOneAndUpdate(
      { id: taskId },
      taskData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Resolve recipient employee details
    let recipientEmail = (newTask.assignedToEmail || req.body.assignedToEmail || '').trim();
    let recipientName = newTask.assignedTo || newTask.assignedToUsername || req.body.assignedTo || req.body.assignedToUsername || 'Team Member';

    if (!recipientEmail || !recipientEmail.includes('@')) {
      const emp = await Employee.findOne({
        $or: [
          { id: newTask.assignedToId },
          { id: req.body.assignedToId },
          { name: newTask.assignedTo },
          { name: newTask.assignedToUsername },
          { name: req.body.assignedTo }
        ]
      });
      if (emp && emp.email) {
        recipientEmail = emp.email;
        recipientName = recipientName || emp.name;
      }
    }

    // If dummy test domain was selected for Johncy Rebecca, route to real email
    if (recipientName && recipientName.toLowerCase().includes('johncy') && (!recipientEmail || recipientEmail.endsWith('@techteam.dev'))) {
      recipientEmail = 'johncyrebecca@gmail.com';
    }

    let emailResult = { success: false };
    if (recipientEmail && recipientEmail.includes('@')) {
      console.log(`[Task Assignment] Sending email for task ${newTask.id} to ${recipientEmail} (${recipientName})...`);
      emailResult = await sendTaskAssignmentEmail({
        task: newTask,
        employeeEmail: recipientEmail,
        employeeName: recipientName,
        assignedByName: req.body.assignedBy || 'Admin'
      });
    } else {
      console.warn(`[Task Assignment] Skipped email: No valid recipient email found for task ${newTask.id} (Assignee: ${recipientName})`);
    }

    res.status(201).json({
      ...newTask.toObject(),
      emailNotification: emailResult
    });
  } catch (error) {
    console.error('[Create Task Error]:', error);
    res.status(400).json({ error: error.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const existingTask = await Task.findOne({ id: req.params.id });
    const updated = await Task.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    let emailResult = null;
    // Check if task assignee was changed or newly assigned
    if (
      existingTask &&
      req.body.assignedToId &&
      req.body.assignedToId !== existingTask.assignedToId
    ) {
      let recipientEmail = (updated.assignedToEmail || req.body.assignedToEmail || '').trim();
      let recipientName = updated.assignedTo || updated.assignedToUsername || req.body.assignedTo || 'Team Member';

      if (!recipientEmail || !recipientEmail.includes('@')) {
        const emp = await Employee.findOne({
          $or: [
            { id: updated.assignedToId },
            { id: req.body.assignedToId },
            { name: updated.assignedTo },
            { name: updated.assignedToUsername }
          ]
        });
        if (emp && emp.email) {
          recipientEmail = emp.email;
          recipientName = recipientName || emp.name;
        }
      }

      if (recipientName && recipientName.toLowerCase().includes('johncy') && (!recipientEmail || recipientEmail.endsWith('@techteam.dev'))) {
        recipientEmail = 'johncyrebecca@gmail.com';
      }

      if (recipientEmail && recipientEmail.includes('@')) {
        console.log(`[Task Reassignment] Sending email for task ${updated.id} to ${recipientEmail} (${recipientName})...`);
        emailResult = await sendTaskAssignmentEmail({
          task: updated,
          employeeEmail: recipientEmail,
          employeeName: recipientName,
          assignedByName: req.body.assignedBy || 'Admin'
        });
      }
    }

    res.json({
      ...updated.toObject(),
      ...(emailResult ? { emailNotification: emailResult } : {})
    });
  } catch (error) {
    console.error('[Update Task Error]:', error);
    res.status(400).json({ error: error.message });
  }
});

// EMAIL INTEGRATION STATUS & TEST ENDPOINTS
router.get('/email/status', async (req, res) => {
  try {
    const isConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    res.json({
      configured: isConfigured,
      smtpHost: process.env.SMTP_HOST || 'smtp.office365.com',
      smtpPort: process.env.SMTP_PORT || '587',
      senderUser: isConfigured ? process.env.SMTP_USER : '(Not configured in server/.env)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/email/test', async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || process.env.SMTP_USER;
    if (!testEmail) {
      return res.status(400).json({ error: 'Please provide a test recipient email address or configure SMTP_USER in server/.env' });
    }

    const result = await testSmtpConnection(testEmail);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.message });
    }

    res.json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.deleteOne({ id: req.params.id });
    await TimeLog.deleteMany({ taskId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TIME LOGS ENDPOINTS
router.get('/timelogs', async (req, res) => {
  try {
    const timeLogs = await TimeLog.find().sort({ createdAt: -1 });
    res.json(timeLogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/timelogs', async (req, res) => {
  try {
    const newLog = new TimeLog(req.body);
    await newLog.save();

    // Increment task spent hours
    await Task.findOneAndUpdate(
      { id: req.body.taskId },
      { $inc: { timeSpentHours: req.body.hours } }
    );

    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ATTENDANCE ENDPOINTS
router.get('/attendance', async (req, res) => {
  try {
    const records = await Attendance.find().sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/attendance', async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    const recordId = req.body.id || `att-${Date.now()}-${employeeId}`;
    const record = await Attendance.findOneAndUpdate(
      { employeeId, date },
      { id: recordId, employeeId, date, status, checkIn, checkOut, notes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/attendance/bulk', async (req, res) => {
  try {
    const { date, status, checkIn, checkOut, notes } = req.body;
    const employees = await Employee.find();
    const ops = employees.map(emp => ({
      updateOne: {
        filter: { employeeId: emp.id, date },
        update: {
          $set: {
            id: `att-${Date.now()}-${emp.id}`,
            employeeId: emp.id,
            date,
            status: status || 'Present',
            checkIn: checkIn || '09:30',
            checkOut: checkOut || '',
            notes: notes || 'Bulk marked present'
          }
        },
        upsert: true
      }
    }));
    await Attendance.bulkWrite(ops);
    const updatedRecords = await Attendance.find({ date });
    res.json(updatedRecords);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// USER & PROFILE ENDPOINTS
router.put('/users/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;

    const userDoc = await User.findOneAndUpdate(
      { id: userId },
      { $set: updatedData },
      { new: true }
    );

    // Also sync to Employee document if exists
    const empDoc = await Employee.findOneAndUpdate(
      { id: userId },
      { $set: updatedData },
      { new: true }
    );

    res.json({ success: true, user: userDoc, employee: empDoc });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LEAVE REQUESTS ENDPOINTS
router.get('/leave-requests', async (req, res) => {
  try {
    const requests = await LeaveRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/leave-requests', async (req, res) => {
  try {
    const data = req.body;
    const newRequest = new LeaveRequest({
      id: data.id || `leave-${Date.now()}`,
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      employeeEmail: data.employeeEmail,
      employeeRole: data.employeeRole,
      leaveType: data.leaveType,
      fromDate: data.fromDate,
      toDate: data.toDate,
      days: data.days || 1,
      reason: data.reason,
      appliedDate: data.appliedDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
      adminComment: ''
    });
    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/leave-requests/:id', async (req, res) => {
  try {
    const leaveId = req.params.id;
    const { status, adminComment, reviewedBy } = req.body;
    const updated = await LeaveRequest.findOneAndUpdate(
      { id: leaveId },
      { 
        $set: { 
          status, 
          adminComment: adminComment || '',
          reviewedBy: reviewedBy || 'Admin',
          reviewedAt: new Date().toISOString()
        } 
      },
      { new: true }
    );
    
    // If approved, optionally create/update attendance record as Leave / WFH
    if (updated && status === 'Approved') {
      const attStatus = updated.leaveType === 'Work From Home (WFH)' 
        ? 'Work From Home' 
        : (updated.leaveType === 'Half Day' ? 'Half Day' : 'Absent');
      
      await Attendance.findOneAndUpdate(
        { employeeId: updated.employeeId, date: updated.fromDate },
        {
          $set: {
            id: `att-${Date.now()}-${updated.employeeId}`,
            employeeId: updated.employeeId,
            date: updated.fromDate,
            status: attStatus,
            checkIn: attStatus === 'Half Day' ? '09:30' : (attStatus === 'Work From Home' ? '09:00' : ''),
            checkOut: attStatus === 'Half Day' ? '14:00' : (attStatus === 'Work From Home' ? '18:00' : ''),
            notes: `Approved ${updated.leaveType}: ${updated.reason}`
          }
        },
        { upsert: true }
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/leave-requests/:id', async (req, res) => {
  try {
    const leaveId = req.params.id;
    await LeaveRequest.findOneAndDelete({ id: leaveId });
    res.json({ success: true, message: 'Leave request deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// CLEAR ALL
router.delete('/clear-all', async (req, res) => {
  try {
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await TimeLog.deleteMany({});
    await Attendance.deleteMany({});
    await LeaveRequest.deleteMany({});
    await Attendance.deleteMany({});
    await User.deleteMany({ role: { $ne: 'super_admin' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
