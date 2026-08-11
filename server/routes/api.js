import express from 'express';
import { Employee } from '../models/Employee.js';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { TimeLog } from '../models/TimeLog.js';

const router = express.Router();

// GET /api/bootstrap - Fetch all data & seed default admins if empty
router.get('/bootstrap', async (req, res) => {
  try {
    let employees = await Employee.find().lean();
    let users = await User.find().lean();
    let tasks = await Task.find().sort({ createdAt: -1 }).lean();
    let timeLogs = await TimeLog.find().sort({ createdAt: -1 }).lean();

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
        name: 'Dev Team Lead',
        email: 'admin@techteam.dev',
        role: 'admin',
        joinedDate: '2024-01-01',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      });
      admins.push(defaultAdmin.toObject());
    }

    // Seed initial employees from CSV if empty
    if (employees.length === 0) {
      const defaultEmps = [
        { id: 'emp-1', name: 'Kamini', role: 'Graphic Designer', email: 'kamini@techteam.dev', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', skills: ['Social Media', 'Design'], weeklyCapacityHours: 40, status: 'Active', joinedDate: '2024-01-10' },
        { id: 'emp-2', name: 'Tamil Selvi', role: 'Content Specialist', email: 'tamil@techteam.dev', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', skills: ['Content Creation'], weeklyCapacityHours: 40, status: 'Active', joinedDate: '2024-02-01' },
        { id: 'emp-3', name: 'Hari varman', role: 'UI/UX Designer', email: 'hari@techteam.dev', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', skills: ['Figma', 'Branding'], weeklyCapacityHours: 40, status: 'Active', joinedDate: '2024-01-15' },
        { id: 'emp-4', name: 'Mahima', role: 'Digital Marketer', email: 'mahima@techteam.dev', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', skills: ['SEO', 'Instagram'], weeklyCapacityHours: 40, status: 'Active', joinedDate: '2024-03-01' },
        { id: 'emp-5', name: 'Johncy Rebecca', role: 'Media Specialist', email: 'johncy@techteam.dev', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80', skills: ['Creatives', 'Banner'], weeklyCapacityHours: 40, status: 'Active', joinedDate: '2024-02-20' },
        { id: 'emp-6', name: 'Martin David', role: 'Software Engineer', email: 'martin@techteam.dev', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', skills: ['React', 'Node.js', 'E-commerce'], weeklyCapacityHours: 40, status: 'Active', joinedDate: '2024-01-05' }
      ];
      await Employee.insertMany(defaultEmps);
      employees = defaultEmps;
    }

    // Seed initial tasks from CSV if empty
    if (tasks.length === 0) {
      const defaultTasks = [
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
        { id: 'TASK-119', sNo: 20, date: '2026-08-03', clientProject: 'Salavai Laundry Store', activity: 'Support & Others', project: 'S19', coreActivity: 'Others', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-17', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Package material design for Salavai store', estimatedHours: 20, timeSpentHours: 8 },
        { id: 'TASK-120', sNo: 21, date: '2026-08-03', clientProject: 'KC', activity: 'Website', project: 'S20', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-3', workStartDate: '2026-08-03', targetEndDate: '2026-08-04', actualEndDate: '2026-08-05', slaStatus: 'Green', status: 'Completed', commentsUpdates: 'Banner design for Kleider care ecom', estimatedHours: 12, timeSpentHours: 12 },
        { id: 'TASK-121', sNo: 41, date: '2026-08-07', clientProject: 'KC', activity: 'Website', project: 'W01', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-6', workStartDate: '2026-08-02', targetEndDate: '2026-08-20', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Working on E commerce - implement product search, filtering, and recommendation UI components.', estimatedHours: 40, timeSpentHours: 18 },
        { id: 'TASK-122', sNo: 42, date: '2026-08-07', clientProject: 'Salavai Laundry', activity: 'Website', project: 'W02', coreActivity: 'Web & Search Visibility', assignedToId: 'emp-6', workStartDate: '2026-08-07', targetEndDate: '2026-08-25', actualEndDate: null, slaStatus: 'Green', status: 'In Progress', commentsUpdates: 'Working on Salavai Laundry Web platform', estimatedHours: 35, timeSpentHours: 12 }
      ];
      await Task.insertMany(defaultTasks);
      tasks = defaultTasks;
    }

    res.json({
      employees,
      admins,
      superAdmins,
      tasks,
      timeLogs
    });
  } catch (error) {
    console.warn('[MongoDB Bootstrap Notice] Database connection offline or busy:', error.message);
    res.json({
      employees: [],
      admins: [],
      superAdmins: [],
      tasks: [],
      timeLogs: []
    });
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
    const newEmp = new Employee(req.body);
    await newEmp.save();
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/employees/:id', async (req, res) => {
  try {
    const updated = await Employee.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
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
    const existing = await User.findOne({ id: req.body.id });
    if (existing) {
      existing.role = 'admin';
      await existing.save();
      return res.json(existing);
    }
    const newAdmin = new User({ ...req.body, role: 'admin' });
    await newAdmin.save();
    res.status(201).json(newAdmin);
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
    const newTask = new Task(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/tasks/:id', async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

// CLEAR ALL
router.delete('/clear-all', async (req, res) => {
  try {
    await Employee.deleteMany({});
    await Task.deleteMany({});
    await TimeLog.deleteMany({});
    await User.deleteMany({ role: { $ne: 'super_admin' } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
