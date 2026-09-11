import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_EMPLOYEES,
  DEFAULT_ADMIN,
  INITIAL_TASKS,
  INITIAL_TIME_LOGS,
  CLIENT_PROJECT_OPTIONS,
  ACTIVITY_OPTIONS,
  CORE_ACTIVITY_OPTIONS,
  THEME_OPTIONS,
  FORMAT_OPTIONS,
  STATUS_OPTIONS,
  SLA_STATUS_OPTIONS,
  INITIAL_LEAVE_REQUESTS,
  LEAVE_TYPE_OPTIONS
} from '../data/initialData';

const CrmContext = createContext();

export const CrmProvider = ({ children }) => {
  // Local storage lists - initialize with 10 mock employees and 1 admin
  const [employees, setEmployees] = useState(() => {
    const dedupe = (list) => {
      const seen = new Set();
      return list.filter(e => {
        if (!e || !e.id) return false;
        if (e.email === 'admin@techteam.dev' || e.email === 'cto@techteam.dev') return false;
        const key = e.email ? e.email.toLowerCase().trim() : e.id;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };

    const saved = localStorage.getItem('tech_crm_employees_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          const unique = dedupe(parsed);
          if (unique.length === 10) return unique;
        }
      } catch (e) {}
    }
    return INITIAL_EMPLOYEES;
  });

  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('tech_crm_admins_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      DEFAULT_ADMIN
    ];
  });

  const [superAdmins, setSuperAdmins] = useState(() => {
    const saved = localStorage.getItem('tech_crm_super_admins_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'super-1', name: 'Chief Technology Officer', email: 'cto@techteam.dev', role: 'super_admin', joinedDate: '2023-11-01' }
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tech_crm_tasks_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(t => {
            let task = t.activity === 'Support & Others' ? { ...t, activity: 'Creatives', coreActivity: 'Social Media Content' } : t;
            if (task.assignedToId === 'emp-5' || task.assignedToUsername?.toLowerCase().includes('johncy')) {
              if (!task.assignedToEmail || task.assignedToEmail.toLowerCase().includes('techteam.dev')) {
                task = { ...task, assignedToEmail: 'johncyrebecca@gmail.com' };
              }
            }
            return task;
          });
        }
      } catch (e) {}
    }
    return INITIAL_TASKS.map(t => t.activity === 'Support & Others' ? { ...t, activity: 'Creatives', coreActivity: 'Social Media Content' } : t);
  });

  const [timeLogs, setTimeLogs] = useState(() => {
    const saved = localStorage.getItem('tech_crm_timelogs_v5');
    return saved ? JSON.parse(saved) : INITIAL_TIME_LOGS;
  });

  // Attendance Records State
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('tech_crm_attendance_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return [
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
  });

  // Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('tech_crm_leave_requests_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_LEAVE_REQUESTS;
  });

  // Current Logged In User Session
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('tech_crm_user_v5');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const userRole = currentUser ? currentUser.role : 'guest';

  // Strict RBAC Visible Tasks computation:
  // Employees ONLY see their own assigned tasks & social media posts. Admins & Super Admins see all tasks.
  const visibleTasks = React.useMemo(() => {
    if (!currentUser) return tasks;
    if (currentUser.role === 'employee') {
      const isMatch = (n1, n2) => {
        if (!n1 || !n2) return false;
        const a = n1.toString().trim().toLowerCase();
        const b = n2.toString().trim().toLowerCase();
        return a === b || a.startsWith(b) || b.startsWith(a);
      };

      const curEmp = employees.find(e => {
        if (e.id && currentUser.id && e.id.toLowerCase() === currentUser.id.toLowerCase()) return true;
        if (e.email && currentUser.email && e.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) return true;
        if (e.name && currentUser.name && isMatch(e.name, currentUser.name)) return true;
        return false;
      });

      const empId = (curEmp?.id || currentUser.id || '').toString().trim().toLowerCase();
      const empEmail = (curEmp?.email || currentUser.email || '').toString().trim().toLowerCase();
      const empName = (curEmp?.name || currentUser.name || '').toString().trim().toLowerCase();

      return tasks.filter((t) => {
        const tId = (t.assignedToId || t.employeeId || '').toString().trim().toLowerCase();
        const tEmail = (t.assignedToEmail || '').toString().trim().toLowerCase();
        const tName = (t.assignedToUsername || t.assignedTo || '').toString().trim().toLowerCase();

        // 1. Direct ID match
        if (empId && tId && empId === tId) return true;

        // 2. Exact email match
        if (empEmail) {
          if (tEmail && empEmail === tEmail) return true;
          if (tId && empEmail === tId) return true;
        }

        // 3. Exact or prefix name match
        if (empName) {
          if (tName && isMatch(empName, tName)) return true;
          if (tId && isMatch(empName, tId)) return true;
        }

        return false;
      });
    }
    return tasks;
  }, [tasks, currentUser, employees]);

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState(() => {
    return currentUser?.role === 'admin' ? 'admin-dashboard' : 'employee-page';
  });
  const [selectedEmployeeViewId, setSelectedEmployeeViewId] = useState(null);

  // Sidebar Collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('tech_crm_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('tech_crm_sidebar_collapsed', next.toString());
      return next;
    });
  };

  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('tech_crm_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('tech_crm_theme', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isTimeLogModalOpen, setIsTimeLogModalOpen] = useState(false);
  const [taskForLogging, setTaskForLogging] = useState(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Active Timer state
  const [activeTimer, setActiveTimer] = useState(null);

  // Safe LocalStorage setter with quota overflow prevention
  const safeSetLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (err) {
      console.warn(`[Storage Quota Notice] Unable to cache ${key} to localStorage:`, err.message);
    }
  };

  // Persistence Effects
  useEffect(() => {
    safeSetLocalStorage('tech_crm_employees_v5', employees);
  }, [employees]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_admins_v5', admins);
  }, [admins]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_super_admins_v5', superAdmins);
  }, [superAdmins]);

  useEffect(() => {
    // Strip bulky Base64 from local storage cache to keep storage well within 5MB limit
    const lightweightTasks = tasks.map((t) => {
      if (t.taskFile && t.taskFile.url && t.taskFile.url.startsWith('data:')) {
        return {
          ...t,
          taskFile: { ...t.taskFile, url: '' },
          taskFileUrl: ''
        };
      }
      return t;
    });
    safeSetLocalStorage('tech_crm_tasks_v5', lightweightTasks);
  }, [tasks]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_timelogs_v5', timeLogs);
  }, [timeLogs]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_attendance_v1', attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_leave_requests_v1', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    if (currentUser) {
      safeSetLocalStorage('tech_crm_user_v5', currentUser);
    } else {
      try {
        localStorage.removeItem('tech_crm_user_v5');
      } catch (err) {}
    }
  }, [currentUser]);

  // Ensure logged-in employee email is synchronized in the employees directory
  useEffect(() => {
    if (currentUser?.role === 'employee' && currentUser.email) {
      setEmployees((prev) => {
        let changed = false;
        const updated = prev.map((e) => {
          const isMatch =
            (e.id && currentUser.id && e.id.toLowerCase() === currentUser.id.toLowerCase()) ||
            (e.name && currentUser.name && e.name.toLowerCase().split(' ')[0] === currentUser.name.toLowerCase().split(' ')[0]);

          if (isMatch && e.email.toLowerCase() !== currentUser.email.toLowerCase()) {
            changed = true;
            return { ...e, email: currentUser.email };
          }
          return e;
        });
        return changed ? updated : prev;
      });
    }
  }, [currentUser]);

  // Sync selected employee view ID (Only force for employee role)
  useEffect(() => {
    if (currentUser?.role === 'employee') {
      setSelectedEmployeeViewId(currentUser.id);
    }
  }, [currentUser]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      interval = setInterval(() => {
        setActiveTimer((prev) => ({
          ...prev,
          elapsedSeconds: prev.elapsedSeconds + 1
        }));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  // RBAC Permission Helper
  const hasPermission = (requiredRole) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'employee') return requiredRole === 'employee';
    return false;
  };

  // AUTH LOGIN HANDLERS
  const loginAsAdmin = async (adminId) => {
    const adminObj = admins.find((a) => a.id === adminId) || admins[0];
    const user = {
      id: adminObj ? adminObj.id : 'admin-1',
      name: adminObj ? adminObj.name : 'Team Admin',
      email: adminObj ? adminObj.email : 'admin@techteam.dev',
      role: 'admin',
      avatar: adminObj?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(user);
    setCurrentTab('admin-dashboard');

    // Save Admin Login to MongoDB database
    try {
      await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      });
      console.log('[MongoDB] Admin login saved to database:', user.email);
    } catch (e) {
      console.warn('[MongoDB Notice] Admin login save notice:', e.message);
    }
  };

  const loginAsEmployee = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      const user = {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: 'employee',
        avatar: emp.avatar
      };
      setCurrentUser(user);
      setSelectedEmployeeViewId(emp.id);
      setCurrentTab('employee-page');
    }
  };

  const logout = () => {
    if (activeTimer) stopTimer();
    setCurrentUser(null);
  };

  // Bootstrap data from backend MongoDB on initial load
  useEffect(() => {
    const fetchBootstrapData = async () => {
      try {
        const res = await fetch('/api/bootstrap');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.employees) && data.employees.length > 0) {
            const seen = new Set();
            const realEmps = data.employees.filter(e => {
              if (!e || !e.id) return false;
              if (e.email === 'admin@techteam.dev' || e.email === 'cto@techteam.dev') return false;
              const key = e.email ? e.email.toLowerCase().trim() : e.id;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setEmployees(realEmps.length > 0 ? realEmps : INITIAL_EMPLOYEES);
          } else {
            setEmployees(INITIAL_EMPLOYEES);
          }
          if (Array.isArray(data.admins) && data.admins.length > 0) setAdmins(data.admins);
          if (Array.isArray(data.superAdmins) && data.superAdmins.length > 0) setSuperAdmins(data.superAdmins);
          if (Array.isArray(data.tasks) && data.tasks.length > 0) setTasks(data.tasks);
          if (Array.isArray(data.timeLogs) && data.timeLogs.length > 0) setTimeLogs(data.timeLogs);
          if (Array.isArray(data.attendanceRecords) && data.attendanceRecords.length > 0) setAttendanceRecords(data.attendanceRecords);
          if (Array.isArray(data.leaveRequests) && data.leaveRequests.length > 0) setLeaveRequests(data.leaveRequests);
        }
      } catch (err) {
        console.warn('Backend server not reached, using local storage cache:', err.message);
      }
    };
    fetchBootstrapData();
  }, []);

  const restoreDefaultEmployees = () => {
    setEmployees(INITIAL_EMPLOYEES);
    setTasks(INITIAL_TASKS);
    localStorage.setItem('tech_crm_employees_v5', JSON.stringify(INITIAL_EMPLOYEES));
    localStorage.setItem('tech_crm_tasks_v5', JSON.stringify(INITIAL_TASKS));
  };

  // PROMOTION HANDLERS
  const addAdminAccount = async (data) => {
    const newAdmin = {
      id: `admin-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'admin',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setAdmins((prev) => [...prev, newAdmin]);

    try {
      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
      });
      if (res.ok) {
        console.log('[MongoDB] New Admin account saved to database:', newAdmin.email);
      }
    } catch (e) {
      console.warn('[MongoDB Notice] API Sync Notice:', e.message);
    }

    return newAdmin;
  };

  const promoteEmployeeToAdmin = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;
    const newAdmin = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: 'admin',
      joinedDate: emp.joinedDate
    };
    setAdmins((prev) => [...prev, newAdmin]);
    fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin)
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  // TASK ACTIONS
  const addTask = async (newTaskData) => {
    const sNo = tasks.length + 1;
    const taskId = newTaskData.id || `TASK-${100 + sNo}`;
    const today = new Date().toISOString().split('T')[0];

    const assignedEmp = employees.find((e) => 
      e.id === newTaskData.assignedToId || 
      (e.email && newTaskData.assignedToEmail && e.email.toLowerCase() === newTaskData.assignedToEmail.toLowerCase()) ||
      (e.name && newTaskData.assignedTo && e.name.toLowerCase().trim() === newTaskData.assignedTo.toLowerCase().trim())
    );

    const effectiveEmail = newTaskData.assignedToEmail || assignedEmp?.email || '';
    const effectiveName = newTaskData.assignedTo || newTaskData.assignedToUsername || assignedEmp?.name || '';

    const newTask = {
      ...newTaskData,
      id: taskId,
      sNo: sNo,
      // New Social / Workflow Schema (Image 1)
      toBePostedOn: newTaskData.toBePostedOn || newTaskData.date || today,
      theme: newTaskData.theme || newTaskData.coreActivity || 'Digital Marketing',
      format: newTaskData.format || newTaskData.activity || 'Static Poster',
      description: newTaskData.description || newTaskData.titleTopic || newTaskData.activity || '',
      reference: newTaskData.reference || newTaskData.mediaUrl || '',
      completedOn: newTaskData.completedOn || (newTaskData.status === 'Completed' ? today : ''),
      comments: newTaskData.comments || newTaskData.commentsUpdates || '',

      // General & Legacy Schema compatibility
      date: newTaskData.toBePostedOn || newTaskData.date || today,
      clientProject: newTaskData.clientProject || newTaskData.client || newTaskData.theme || 'Digital Marketing',
      activity: newTaskData.format || newTaskData.activity || 'Static',
      project: newTaskData.project || 'S01',
      coreActivity: newTaskData.theme || newTaskData.coreActivity || 'Social Media Content',
      assignedToId: newTaskData.assignedToId || assignedEmp?.id || '',
      assignedToEmail: effectiveEmail,
      assignedToUsername: effectiveName,
      assignedTo: effectiveName,
      assignedBy: newTaskData.assignedBy || currentUser?.name || 'Admin',
      workStartDate: newTaskData.workStartDate || newTaskData.toBePostedOn || today,
      targetEndDate: newTaskData.targetEndDate || newTaskData.toBePostedOn || '',
      actualEndDate: newTaskData.completedOn || (newTaskData.status === 'Completed' ? (newTaskData.actualEndDate || today) : null),
      slaStatus: newTaskData.slaStatus || 'Green',
      status: newTaskData.status || 'Yet to start',
      commentsUpdates: newTaskData.comments || newTaskData.commentsUpdates || '',
      estimatedHours: parseFloat(newTaskData.estimatedHours) || 10,
      timeSpentHours: 0,
      taskFile: newTaskData.taskFile || null,
      taskFileName: newTaskData.taskFileName || '',
      taskFileUrl: newTaskData.taskFileUrl || '',
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => [newTask, ...prev]);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        console.log('[MongoDB] Task stored in database successfully:', newTask.id);
      }
    } catch (e) {
      console.warn('[MongoDB Notice] Task DB Sync Notice:', e.message);
    }
  };

  const updateTask = (taskId, updatedFields) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isMarkingCompleted = updatedFields.status === 'Completed' && t.status !== 'Completed';
          const autoEndDate = isMarkingCompleted
            ? (updatedFields.actualEndDate || new Date().toISOString().split('T')[0])
            : (updatedFields.status !== 'Completed' && updatedFields.status !== undefined ? (updatedFields.actualEndDate !== undefined ? updatedFields.actualEndDate : t.actualEndDate) : (updatedFields.actualEndDate !== undefined ? updatedFields.actualEndDate : t.actualEndDate));

          const finalActualEndDate = updatedFields.actualEndDate !== undefined ? updatedFields.actualEndDate : autoEndDate;
          const targetDateStr = updatedFields.targetEndDate || t.targetEndDate || updatedFields.toBePostedOn || t.toBePostedOn || t.date;

          let calculatedSla = updatedFields.slaStatus || t.slaStatus || 'Green';
          if (finalActualEndDate && targetDateStr) {
            const actualTime = new Date(finalActualEndDate).setHours(0, 0, 0, 0);
            const targetTime = new Date(targetDateStr).setHours(0, 0, 0, 0);
            calculatedSla = actualTime > targetTime ? 'Red' : 'Green';
          } else if (!finalActualEndDate && targetDateStr) {
            const todayTime = new Date().setHours(0, 0, 0, 0);
            const targetTime = new Date(targetDateStr).setHours(0, 0, 0, 0);
            calculatedSla = todayTime > targetTime ? 'Red' : 'Green';
          }

          const updated = {
            ...t,
            ...updatedFields,
            actualEndDate: finalActualEndDate,
            slaStatus: calculatedSla
          };

          fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
          }).catch((e) => console.warn('API Sync Notice:', e.message));

          return updated;
        }
        return t;
      })
    );
  };

  const updateTaskStatus = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTimeLogs((prev) => prev.filter((l) => l.taskId !== taskId));
    fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  // TIME LOGGING
  const logWorkTime = (taskId, hoursLogged, description, logDate = null) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newLog = {
      id: `log-${Date.now()}`,
      taskId,
      employeeId: task.assignedToId,
      hours: parseFloat(hoursLogged),
      date: logDate || new Date().toISOString().split('T')[0],
      description: description || 'Work progress log'
    };

    setTimeLogs((prev) => [newLog, ...prev]);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            timeSpentHours: parseFloat((t.timeSpentHours + parseFloat(hoursLogged)).toFixed(2))
          };
        }
        return t;
      })
    );

    fetch('/api/timelogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  // TIMER HANDLERS
  const startTimer = (taskId) => {
    if (activeTimer) stopTimer();
    setActiveTimer({
      taskId,
      startTime: Date.now(),
      elapsedSeconds: 0
    });
  };

  const stopTimer = () => {
    if (!activeTimer) return;
    const hours = parseFloat((activeTimer.elapsedSeconds / 3600).toFixed(2));
    if (hours > 0.01) {
      logWorkTime(activeTimer.taskId, hours, 'Recorded via live stopwatch');
    }
    setActiveTimer(null);
  };

  // EMPLOYEE HANDLERS
  const addEmployee = async (employeeData) => {
    const empId = `emp-${Date.now()}`;
    const newEmp = {
      id: empId,
      name: employeeData.name,
      role: employeeData.role || 'Software Engineer',
      email: employeeData.email,
      avatar: employeeData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(employeeData.name)}`,
      skills: employeeData.skills || ['Engineering'],
      weeklyCapacityHours: parseInt(employeeData.weeklyCapacityHours) || 40,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setEmployees((prev) => [...prev, newEmp]);
    if (!selectedEmployeeViewId) setSelectedEmployeeViewId(empId);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmp)
      });
      if (res.ok) {
        const savedDoc = await res.json();
        console.log('[MongoDB] Employee successfully saved to database:', savedDoc.name);
      }
    } catch (e) {
      console.warn('[MongoDB Notice] API Save Notice:', e.message);
    }

    return newEmp;
  };

  const updateEmployee = (empId, updatedFields) => {
    const empPrev = employees.find((e) => e.id === empId);
    const prevEmail = empPrev?.email?.toLowerCase();
    const prevName = empPrev?.name?.toLowerCase();

    const normalizedFields = {
      ...updatedFields,
      role: updatedFields.role || updatedFields.roleTitle || empPrev?.role,
      roleTitle: updatedFields.roleTitle || updatedFields.role || empPrev?.roleTitle
    };

    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, ...normalizedFields } : e))
    );
    if (currentUser?.id === empId) {
      setCurrentUser((prev) => ({ ...prev, ...normalizedFields }));
    }

    // Sync task assignees if name or email changed
    if (updatedFields.name || updatedFields.email) {
      setTasks((prev) =>
        prev.map((t) => {
          const isAssigned =
            t.assignedToId === empId ||
            (prevEmail && t.assignedToEmail && t.assignedToEmail.toLowerCase() === prevEmail) ||
            (prevName && t.assignedToUsername && t.assignedToUsername.toLowerCase() === prevName);

          if (isAssigned) {
            return {
              ...t,
              assignedToId: empId,
              ...(updatedFields.name ? { assignedToUsername: updatedFields.name, assignedTo: updatedFields.name } : {}),
              ...(updatedFields.email ? { assignedToEmail: updatedFields.email } : {})
            };
          }
          return t;
        })
      );
    }

    fetch(`/api/employees/${empId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizedFields)
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  const updateProfile = async (updatedFields) => {
    if (!currentUser) return;
    const userId = currentUser.id;
    const userPrevEmail = currentUser.email?.toLowerCase();
    const userPrevName = currentUser.name?.toLowerCase();

    // 1. Maintain auth role & update currentUser
    const empRoleTitle = updatedFields.role || updatedFields.roleTitle || currentUser.roleTitle || 'Tech Specialist';
    const normalizedUser = {
      ...currentUser,
      ...updatedFields,
      role: currentUser.role === 'admin' || currentUser.role === 'super_admin' ? currentUser.role : 'employee',
      roleTitle: empRoleTitle
    };
    setCurrentUser(normalizedUser);

    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
      setAdmins((prev) =>
        prev.map((a) => (a.id === userId || (a.email && a.email.toLowerCase() === userPrevEmail) ? { ...a, ...updatedFields } : a))
      );
      try {
        await fetch(`/api/admins/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        });
      } catch (e) {
        console.warn('Admin profile sync notice:', e.message);
      }
    } else {
      // 2. Synchronize with Employees directory (seen by Admin & across the CRM)
      setEmployees((prev) => {
        const matchIdx = prev.findIndex(
          (e) => (e.id && e.id === userId) ||
                 (e.email && userPrevEmail && e.email.toLowerCase() === userPrevEmail) ||
                 (e.name && userPrevName && e.name.toLowerCase() === userPrevName)
        );

        if (matchIdx >= 0) {
          const updatedList = [...prev];
          updatedList[matchIdx] = {
            ...updatedList[matchIdx],
            ...updatedFields,
            id: prev[matchIdx].id || userId,
            role: empRoleTitle,
            roleTitle: empRoleTitle,
            name: updatedFields.name || updatedList[matchIdx].name,
            email: updatedFields.email || updatedList[matchIdx].email,
            avatar: updatedFields.avatar || updatedList[matchIdx].avatar,
            skills: updatedFields.skills || updatedList[matchIdx].skills,
            weeklyCapacityHours: updatedFields.weeklyCapacityHours || updatedList[matchIdx].weeklyCapacityHours || 40
          };
          return updatedList;
        } else {
          // If this employee was registered on-the-fly, append to employees directory
          const newEmp = {
            id: userId,
            name: updatedFields.name || currentUser.name,
            email: updatedFields.email || currentUser.email,
            role: empRoleTitle,
            roleTitle: empRoleTitle,
            avatar: updatedFields.avatar || currentUser.avatar,
            skills: updatedFields.skills || [],
            weeklyCapacityHours: updatedFields.weeklyCapacityHours || 40,
            status: 'Active',
            joinedDate: currentUser.joinedDate || new Date().toISOString().split('T')[0]
          };
          return [...prev, newEmp];
        }
      });

      // 3. Update tasks assigned to this employee so admin views reflect the new name/email
      if (updatedFields.name || updatedFields.email) {
        setTasks((prev) =>
          prev.map((t) => {
            const isAssigned =
              t.assignedToId === userId ||
              (userPrevEmail && t.assignedToEmail && t.assignedToEmail.toLowerCase() === userPrevEmail) ||
              (userPrevName && t.assignedToUsername && t.assignedToUsername.toLowerCase() === userPrevName);

            if (isAssigned) {
              return {
                ...t,
                assignedToId: userId,
                ...(updatedFields.name ? { assignedToUsername: updatedFields.name, assignedTo: updatedFields.name } : {}),
                ...(updatedFields.email ? { assignedToEmail: updatedFields.email } : {})
              };
            }
            return t;
          })
        );
      }

      // 4. Send PUT request to persist changes to MongoDB backend
      try {
        await fetch(`/api/employees/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...updatedFields,
            id: userId,
            role: empRoleTitle,
            roleTitle: empRoleTitle
          })
        });
      } catch (e) {
        console.warn('Employee profile sync notice:', e.message);
      }
    }
  };

  const deleteEmployee = (empId) => {
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
    setAdmins((prev) => prev.filter((a) => a.id !== empId));
    fetch(`/api/employees/${empId}`, {
      method: 'DELETE'
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  const markAttendance = (employeeId, date, status, checkIn = '09:30', checkOut = '', notes = '') => {
    setAttendanceRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.employeeId === employeeId && r.date === date);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status,
          checkIn: checkIn || updated[existingIdx].checkIn || '09:30',
          checkOut: checkOut !== undefined ? checkOut : updated[existingIdx].checkOut || '',
          notes: notes !== undefined ? notes : updated[existingIdx].notes
        };
        return updated;
      } else {
        const newRecord = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          employeeId,
          date,
          status,
          checkIn: checkIn || '09:30',
          checkOut: checkOut || '',
          notes: notes || ''
        };
        return [newRecord, ...prev];
      }
    });

    fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, date, status, checkIn, checkOut, notes })
    }).catch((e) => console.warn('Attendance DB Notice:', e.message));
  };

  const markAllPresent = (date) => {
    setAttendanceRecords((prev) => {
      let updated = [...prev];
      employees.forEach((emp) => {
        const idx = updated.findIndex((r) => r.employeeId === emp.id && r.date === date);
        if (idx >= 0) {
          updated[idx] = {
            ...updated[idx],
            status: 'Present',
            checkIn: updated[idx].checkIn || '09:30'
          };
        } else {
          updated.push({
            id: `att-${Date.now()}-${emp.id}`,
            employeeId: emp.id,
            date,
            status: 'Present',
            checkIn: '09:30',
            checkOut: '',
            notes: 'Bulk marked present'
          });
        }
      });
      return updated;
    });

    fetch('/api/attendance/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, status: 'Present', checkIn: '09:30', notes: 'Bulk marked present' })
    }).catch((e) => console.warn('Bulk Attendance DB Notice:', e.message));
  };

  const applyLeaveRequest = async (data) => {
    const newReq = {
      id: `leave-${Date.now()}`,
      employeeId: data.employeeId || currentUser?.id || 'emp-1',
      employeeName: data.employeeName || currentUser?.name || 'Specialist',
      employeeEmail: data.employeeEmail || currentUser?.email || '',
      employeeRole: data.employeeRole || 'Specialist',
      leaveType: data.leaveType || 'Casual Leave',
      fromDate: data.fromDate,
      toDate: data.toDate || data.fromDate,
      days: Number(data.days) || 1,
      reason: data.reason || '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      adminComment: ''
    };

    setLeaveRequests((prev) => [newReq, ...prev]);

    try {
      await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReq)
      });
    } catch (e) {
      console.warn('API Sync Notice:', e.message);
    }

    return newReq;
  };

  const updateLeaveStatus = async (leaveId, status, adminComment = '') => {
    const reviewedBy = currentUser?.name || 'Admin';
    const reviewedAt = new Date().toISOString();

    setLeaveRequests((prev) =>
      prev.map((req) => {
        if (req.id === leaveId) {
          return {
            ...req,
            status,
            adminComment,
            reviewedBy,
            reviewedAt
          };
        }
        return req;
      })
    );

    // If approved, update attendance records to reflect Leave / WFH
    const targetLeave = leaveRequests.find(r => r.id === leaveId);
    if (targetLeave && status === 'Approved') {
      const attStatus = targetLeave.leaveType === 'Work From Home (WFH)'
        ? 'Work From Home'
        : (targetLeave.leaveType === 'Half Day' ? 'Half Day' : 'Absent');

      markAttendance(
        targetLeave.employeeId,
        targetLeave.fromDate,
        attStatus,
        attStatus === 'Half Day' ? '09:30' : (attStatus === 'Work From Home' ? '09:00' : ''),
        attStatus === 'Half Day' ? '14:00' : (attStatus === 'Work From Home' ? '18:00' : ''),
        `Approved ${targetLeave.leaveType}: ${targetLeave.reason}`
      );
    }

    try {
      await fetch(`/api/leave-requests/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminComment, reviewedBy })
      });
    } catch (e) {
      console.warn('API Sync Notice:', e.message);
    }
  };

  const deleteLeaveRequest = async (leaveId) => {
    setLeaveRequests((prev) => prev.filter((req) => req.id !== leaveId));
    try {
      await fetch(`/api/leave-requests/${leaveId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('API Sync Notice:', e.message);
    }
  };

  const clearAllData = () => {
    setEmployees([]);
    setTasks([]);
    setTimeLogs([]);
    setAdmins([]);
    setLeaveRequests([]);
    localStorage.removeItem('tech_crm_employees_v5');
    localStorage.removeItem('tech_crm_tasks_v5');
    localStorage.removeItem('tech_crm_timelogs_v5');
    localStorage.removeItem('tech_crm_admins_v5');
    localStorage.removeItem('tech_crm_attendance_v1');
    localStorage.removeItem('tech_crm_leave_requests_v1');
    fetch('/api/clear-all', { method: 'DELETE' }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  return (
    <CrmContext.Provider
      value={{
        employees,
        setEmployees,
        admins,
        setAdmins,
        superAdmins,
        tasks,
        visibleTasks,
        timeLogs,
        attendanceRecords,
        leaveRequests,
        setLeaveRequests,
        LEAVE_TYPE_OPTIONS,
        currentUser,
        setCurrentUser,
        userRole,
        hasPermission,
        CLIENT_PROJECT_OPTIONS,
        ACTIVITY_OPTIONS,
        CORE_ACTIVITY_OPTIONS,
        THEME_OPTIONS,
        FORMAT_OPTIONS,
        STATUS_OPTIONS,
        SLA_STATUS_OPTIONS,
        loginAsAdmin,
        loginAsEmployee,
        logout,
        addAdminAccount,
        promoteEmployeeToAdmin,
        restoreDefaultEmployees,
        selectedEmployeeViewId,
        setSelectedEmployeeViewId,
        setActiveEmployeeId: setSelectedEmployeeViewId,
        currentTab,
        setCurrentTab,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebarCollapse,
        searchQuery,
        setSearchQuery,
        selectedMonth,
        setSelectedMonth,
        statusFilter,
        setStatusFilter,
        theme,
        setTheme,
        toggleTheme,

        // Modals
        isTaskModalOpen,
        setIsTaskModalOpen,
        editingTask,
        setEditingTask,
        isTimeLogModalOpen,
        setIsTimeLogModalOpen,
        taskForLogging,
        setTaskForLogging,
        isEmployeeModalOpen,
        setIsEmployeeModalOpen,
        editingEmployee,
        setEditingEmployee,

        // Timer
        activeTimer,
        startTimer,
        stopTimer,

        // Handlers
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        logWorkTime,
        markAttendance,
        markAllPresent,
        applyLeaveRequest,
        updateLeaveStatus,
        deleteLeaveRequest,
        addEmployee,
        updateEmployee,
        updateProfile,
        deleteEmployee,
        clearAllData
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => useContext(CrmContext);
