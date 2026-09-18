import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CLIENT_PROJECT_OPTIONS,
  ACTIVITY_OPTIONS,
  CORE_ACTIVITY_OPTIONS,
  THEME_OPTIONS,
  FORMAT_OPTIONS,
  STATUS_OPTIONS,
  SLA_STATUS_OPTIONS,
  LEAVE_TYPE_OPTIONS,
  INITIAL_EMPLOYEES,
  DEFAULT_ADMIN
} from '../data/initialData';

const CrmContext = createContext();

export const CrmProvider = ({ children }) => {
  // Application State initialized from DB cache or standard dataset
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('tech_crm_employees_v8') || localStorage.getItem('tech_crm_employees_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_EMPLOYEES;
  });

  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('tech_crm_admins_v8') || localStorage.getItem('tech_crm_admins_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_ADMIN ? [DEFAULT_ADMIN] : [];
  });

  const [superAdmins, setSuperAdmins] = useState(() => {
    const saved = localStorage.getItem('tech_crm_super_admins_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tech_crm_tasks_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [timeLogs, setTimeLogs] = useState(() => {
    const saved = localStorage.getItem('tech_crm_timelogs_v7');
    return saved ? JSON.parse(saved) : [];
  });

  // Attendance Records State
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('tech_crm_attendance_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState(() => {
    const saved = localStorage.getItem('tech_crm_leave_requests_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  // Current Logged In User Session
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('tech_crm_user_v7');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed) return parsed;
      } catch (e) {}
    }
    return null;
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
    safeSetLocalStorage('tech_crm_employees_v8', employees);
  }, [employees]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_admins_v8', admins);
  }, [admins]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_super_admins_v7', superAdmins);
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
    safeSetLocalStorage('tech_crm_tasks_v7', lightweightTasks);
  }, [tasks]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_timelogs_v7', timeLogs);
  }, [timeLogs]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_attendance_v7', attendanceRecords);
  }, [attendanceRecords]);

  useEffect(() => {
    safeSetLocalStorage('tech_crm_leave_requests_v7', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    if (currentUser) {
      safeSetLocalStorage('tech_crm_user_v7', currentUser);
    } else {
      try {
        localStorage.removeItem('tech_crm_user_v7');
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
    } else if (!activeTimer) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const cancelTimer = () => {
    setActiveTimer(null);
  };

  const loginAsAdmin = (adminUser) => {
    const adminObj = {
      ...adminUser,
      role: 'admin',
      isProfileCompleted: true
    };
    setCurrentUser(adminObj);
  };


  const loginAsEmployee = (empUser) => {
    const empObj = {
      ...empUser,
      role: 'employee',
      isProfileCompleted: empUser.isProfileCompleted ?? true
    };
    setCurrentUser(empObj);
  };

  const updateCurrentUser = (updatedUser) => {
    setCurrentUser(updatedUser);
    if (updatedUser.role === 'employee') {
      updateEmployee(updatedUser.id, updatedUser);
    }
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    if (!currentUser) return { success: false, error: 'Not logged in' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          email: currentUser.email,
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };


  // RBAC Permission Helper
  const hasPermission = (requiredRole) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'employee') return requiredRole === 'employee';
    return false;
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
            setEmployees(data.employees);
          } else {
            setEmployees((prev) => (prev && prev.length > 0 ? prev : INITIAL_EMPLOYEES));
          }
          if (Array.isArray(data.admins) && data.admins.length > 0) {
            setAdmins(data.admins);
          } else if (DEFAULT_ADMIN) {
            setAdmins((prev) => (prev && prev.length > 0 ? prev : [DEFAULT_ADMIN]));
          }
          if (Array.isArray(data.superAdmins)) setSuperAdmins(data.superAdmins);
          if (Array.isArray(data.tasks)) setTasks(data.tasks);
          if (Array.isArray(data.timeLogs)) setTimeLogs(data.timeLogs);
          if (Array.isArray(data.attendanceRecords)) setAttendanceRecords(data.attendanceRecords);
          if (Array.isArray(data.leaveRequests)) setLeaveRequests(data.leaveRequests);
        }
      } catch (err) {
        console.warn('Backend server not reached:', err.message);
        setEmployees((prev) => (prev && prev.length > 0 ? prev : INITIAL_EMPLOYEES));
      }
    };
    fetchBootstrapData();
  }, []);

  const restoreDefaultEmployees = () => {
    setEmployees(INITIAL_EMPLOYEES);
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
      avatar: employeeData.avatar || '',
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
      employeeId: data.employeeId || currentUser?.id || '',
      employeeName: data.employeeName || currentUser?.name || 'Employee',
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
    localStorage.removeItem('tech_crm_employees_v7');
    localStorage.removeItem('tech_crm_tasks_v7');
    localStorage.removeItem('tech_crm_timelogs_v7');
    localStorage.removeItem('tech_crm_admins_v7');
    localStorage.removeItem('tech_crm_attendance_v7');
    localStorage.removeItem('tech_crm_leave_requests_v7');
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
        changePassword,
        deleteEmployee,
        clearAllData
      }}
    >
      {children}
    </CrmContext.Provider>
  );

};

export const useCrm = () => useContext(CrmContext);
