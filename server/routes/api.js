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

// GET /api/bootstrap - Fetch all data from database
router.get('/bootstrap', async (req, res) => {
  try {
    let employees = await Employee.find().lean();
    let users = await User.find().lean();
    let tasks = await Task.find().sort({ createdAt: -1 }).lean();
    let timeLogs = await TimeLog.find().sort({ createdAt: -1 }).lean();
    let attendanceRecords = await Attendance.find().sort({ date: -1 }).lean();
    let leaveRequests = await LeaveRequest.find().sort({ createdAt: -1 }).lean();

    let superAdmins = users.filter((u) => u.role === 'super_admin');
    let admins = users.filter((u) => u.role === 'admin');

    // Return bootstrap collections from database
    res.json({
      employees: employees || [],
      admins: admins || [],
      superAdmins: superAdmins || [],
      tasks: tasks || [],
      timeLogs: timeLogs || [],
      attendanceRecords: attendanceRecords || [],
      leaveRequests: leaveRequests || []
    });
  } catch (error) {
    console.warn('[MongoDB Bootstrap Notice] Database error during bootstrap:', error.message);
    res.json({
      employees: [],
      admins: [],
      superAdmins: [],
      tasks: [],
      timeLogs: [],
      attendanceRecords: [],
      leaveRequests: []
    });
  }
});

// Clear all tasks and social media posts endpoint
router.delete('/tasks/clear-all', async (req, res) => {
  try {
    const taskRes = await Task.deleteMany({});
    const logRes = await TimeLog.deleteMany({});
    res.json({ success: true, message: 'All tasks and time logs deleted', tasksDeleted: taskRes.deletedCount, logsDeleted: logRes.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks/clear-all', async (req, res) => {
  try {
    const taskRes = await Task.deleteMany({});
    const logRes = await TimeLog.deleteMany({});
    res.json({ success: true, message: 'All tasks and time logs deleted', tasksDeleted: taskRes.deletedCount, logsDeleted: logRes.deletedCount });
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
      // Find admin or super_admin account in database
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
        return res.status(401).json({ error: 'Administrator account not found in database. Please verify your credentials or contact IT.' });
      }

      // Verify password
      if (adminAccount.password && adminAccount.password !== password) {
        return res.status(401).json({ error: 'Incorrect administrator password.' });
      } else if (password && !adminAccount.password) {
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
          avatar: adminAccount.avatar || '',
          mustChangePassword: false,
          isPasswordChanged: false
        }
      });

    } else {
      // Employee portal login - lookup directly in database
      let empAccount = await Employee.findOne({ email: new RegExp(`^${cleanEmail}$`, 'i') });
      
      if (!empAccount) {
        // Also check in User collection for role === 'employee'
        const userAccount = await User.findOne({ 
          email: new RegExp(`^${cleanEmail}$`, 'i'), 
          role: 'employee' 
        });
        if (userAccount) {
          empAccount = await Employee.findOne({ id: userAccount.id }) || userAccount;
        }
      }

      if (!empAccount) {
        // Check if admin is attempting to log in via employee portal
        const adminAccount = await User.findOne({ 
          email: new RegExp(`^${cleanEmail}$`, 'i'),
          role: { $in: ['admin', 'super_admin'] }
        });
        if (adminAccount) {
          return res.status(403).json({
            error: `Access Notice: ${adminAccount.name} is an Administrator. Please click 'Admin Portal' tab above to sign in.`
          });
        }
        return res.status(401).json({
          error: 'Employee account not found in database. Please verify your email or contact your administrator.'
        });
      }

      // Verify password
      if (empAccount.password && empAccount.password !== password) {
        return res.status(401).json({ error: 'Incorrect employee password. Please check your credentials.' });
      } else if (password && !empAccount.password) {
        empAccount.password = password;
        await empAccount.save();
      }

      const mustChange = empAccount.mustChangePassword === true;

      return res.json({
        success: true,
        mustChangePassword: mustChange,
        user: {
          id: empAccount.id,
          name: empAccount.name,
          email: empAccount.email || cleanEmail,
          role: 'employee',
          roleTitle: empAccount.role || empAccount.roleTitle || 'Specialist',
          skills: empAccount.skills || [],
          weeklyCapacityHours: empAccount.weeklyCapacityHours || 40,
          avatar: empAccount.avatar || '',
          mustChangePassword: mustChange,
          isPasswordChanged: !mustChange,
          isProfileCompleted: true
        }
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CHANGE PASSWORD ENDPOINT
router.post('/auth/change-password', async (req, res) => {
  try {
    const { userId, email, currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    let user = null;
    if (userId) {
      user = await User.findOne({ id: userId });
    }
    if (!user && email) {
      user = await User.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') });
    }

    if (!user) {
      // Look up in Employee if not in User
      const emp = await Employee.findOne({ 
        $or: [{ id: userId }, { email: new RegExp(`^${(email || '').trim()}$`, 'i') }] 
      });
      if (emp) {
        emp.password = newPassword.trim();
        emp.mustChangePassword = false;
        emp.isPasswordChanged = true;
        await emp.save();

        await User.findOneAndUpdate(
          { id: emp.id },
          { 
            id: emp.id, 
            name: emp.name, 
            email: emp.email, 
            role: 'employee', 
            password: newPassword.trim(),
            mustChangePassword: false,
            isPasswordChanged: true
          },
          { upsert: true }
        );

        return res.json({
          success: true,
          message: 'Password updated successfully! Full access unlocked.'
        });
      }
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Verify current password if user already has a password set and current password was provided
    if (user.password && currentPassword && user.password !== currentPassword && user.password !== '123456') {
      return res.status(401).json({ error: 'Current / Temporary password does not match.' });
    }

    user.password = newPassword.trim();
    user.mustChangePassword = false;
    user.isPasswordChanged = true;
    await user.save();

    // Also update Employee collection
    await Employee.findOneAndUpdate(
      { $or: [{ id: user.id }, { email: user.email }] },
      { 
        $set: { 
          password: newPassword.trim(),
          mustChangePassword: false,
          isPasswordChanged: true
        } 
      }
    );

    res.json({
      success: true,
      message: 'Password updated successfully! Full access unlocked.'
    });
  } catch (error) {
    console.error('[Change Password Error]:', error);
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

    if (recipientName && recipientName.toLowerCase().includes('johncy') && !recipientEmail) {
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
    const updatePayload = { ...req.body };
    delete updatePayload._id;
    delete updatePayload.__v;

    const existingTask = await Task.findOne({ id: req.params.id });
    const updated = await Task.findOneAndUpdate(
      { id: req.params.id },
      { $set: updatePayload },
      { new: true, upsert: true }
    );
    console.log(`[Task DB Update] Task ${req.params.id} updated. Date: ${updated.toBePostedOn || updated.date}, Status: ${updated.status}`);


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

      if (recipientName && recipientName.toLowerCase().includes('johncy') && !recipientEmail) {
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
