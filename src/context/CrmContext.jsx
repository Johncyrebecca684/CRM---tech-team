import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_TASKS, 
  INITIAL_TIME_LOGS,
  CLIENT_PROJECT_OPTIONS,
  ACTIVITY_OPTIONS,
  CORE_ACTIVITY_OPTIONS,
  STATUS_OPTIONS,
  SLA_STATUS_OPTIONS 
} from '../data/initialData';

const CrmContext = createContext();

export const CrmProvider = ({ children }) => {
  // Local storage lists
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('tech_crm_employees_v5');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [admins, setAdmins] = useState(() => {
    const saved = localStorage.getItem('tech_crm_admins_v5');
    return saved ? JSON.parse(saved) : [
      { id: 'admin-1', name: 'Dev Team Lead', email: 'admin@techteam.dev', role: 'admin', joinedDate: '2024-01-01' }
    ];
  });

  const [superAdmins, setSuperAdmins] = useState(() => {
    const saved = localStorage.getItem('tech_crm_super_admins_v5');
    return saved ? JSON.parse(saved) : [
      { id: 'super-1', name: 'Chief Technology Officer', email: 'cto@techteam.dev', role: 'super_admin', joinedDate: '2023-11-01' }
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tech_crm_tasks_v5');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [timeLogs, setTimeLogs] = useState(() => {
    const saved = localStorage.getItem('tech_crm_timelogs_v5');
    return saved ? JSON.parse(saved) : INITIAL_TIME_LOGS;
  });

  // Current Logged In User Session
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('tech_crm_user_v5');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const userRole = currentUser ? currentUser.role : 'guest';

  // Strict RBAC Visible Tasks computation:
  // Employees only see their own assigned tasks. Admins & Super Admins see all tasks.
  const visibleTasks = React.useMemo(() => {
    if (!currentUser) return tasks;
    if (currentUser.role === 'employee') {
      return tasks.filter((t) => t.assignedToId === currentUser.id);
    }
    return tasks;
  }, [tasks, currentUser]);

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState(() => {
    return currentUser?.role === 'admin' ? 'admin-dashboard' : 'employee-page';
  });
  const [selectedEmployeeViewId, setSelectedEmployeeViewId] = useState(null);

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

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('tech_crm_employees_v5', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('tech_crm_admins_v5', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('tech_crm_super_admins_v5', JSON.stringify(superAdmins));
  }, [superAdmins]);

  useEffect(() => {
    localStorage.setItem('tech_crm_tasks_v5', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tech_crm_timelogs_v5', JSON.stringify(timeLogs));
  }, [timeLogs]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tech_crm_user_v5', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('tech_crm_user_v5');
    }
  }, [currentUser]);

  // Sync selected employee view ID
  useEffect(() => {
    if (currentUser?.role === 'employee') {
      setSelectedEmployeeViewId(currentUser.id);
    } else if (!selectedEmployeeViewId && employees.length > 0) {
      setSelectedEmployeeViewId(employees[0].id);
    }
  }, [currentUser, employees]);

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
  const loginAsAdmin = (adminId) => {
    const adminObj = admins.find((a) => a.id === adminId) || admins[0];
    const user = {
      id: adminObj ? adminObj.id : 'admin-1',
      name: adminObj ? adminObj.name : 'Team Admin',
      email: adminObj ? adminObj.email : 'admin@techteam.dev',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    };
    setCurrentUser(user);
    setCurrentTab('admin-dashboard');
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
          if (data.employees) setEmployees(data.employees);
          if (data.admins) setAdmins(data.admins);
          if (data.superAdmins) setSuperAdmins(data.superAdmins);
          if (data.tasks) setTasks(data.tasks);
          if (data.timeLogs) setTimeLogs(data.timeLogs);
        }
      } catch (err) {
        console.warn('Backend server not reached, using local storage cache:', err.message);
      }
    };
    fetchBootstrapData();
  }, []);

  // PROMOTION HANDLERS
  const addAdminAccount = (data) => {
    const newAdmin = {
      id: `admin-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'admin',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setAdmins((prev) => [...prev, newAdmin]);
    fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin)
    }).catch((e) => console.warn('API Sync Notice:', e.message));
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
  const addTask = (newTaskData) => {
    const sNo = tasks.length + 1;
    const taskId = `TASK-${100 + sNo}`;
    const today = new Date().toISOString().split('T')[0];

    const newTask = {
      id: taskId,
      sNo: sNo,
      date: newTaskData.date || today,
      clientProject: newTaskData.clientProject || 'Internal Project',
      activity: newTaskData.activity || newTaskData.title || '',
      project: newTaskData.project || 'Core System',
      coreActivity: newTaskData.coreActivity || '',
      assignedToId: newTaskData.assignedToId,
      workStartDate: newTaskData.workStartDate || today,
      targetEndDate: newTaskData.targetEndDate || '',
      actualEndDate: newTaskData.status === 'Completed' ? (newTaskData.actualEndDate || today) : null,
      slaStatus: newTaskData.slaStatus || 'Green',
      status: newTaskData.status || 'In Progress',
      commentsUpdates: newTaskData.commentsUpdates || '',
      estimatedHours: parseFloat(newTaskData.estimatedHours) || 10,
      timeSpentHours: 0,
      createdAt: new Date().toISOString()
    };

    setTasks((prev) => [newTask, ...prev]);
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  const updateTask = (taskId, updatedFields) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isMarkingCompleted = updatedFields.status === 'Completed' && t.status !== 'Completed';
          const autoEndDate = isMarkingCompleted
            ? (updatedFields.actualEndDate || new Date().toISOString().split('T')[0])
            : (updatedFields.status !== 'Completed' && updatedFields.status !== undefined ? null : t.actualEndDate);

          const updated = {
            ...t,
            ...updatedFields,
            actualEndDate: autoEndDate
          };

          fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFields)
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
  const addEmployee = (employeeData) => {
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

    fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmp)
    }).catch((e) => console.warn('API Sync Notice:', e.message));

    return newEmp;
  };

  const updateEmployee = (empId, updatedFields) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === empId ? { ...e, ...updatedFields } : e))
    );
    fetch(`/api/employees/${empId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  const deleteEmployee = (empId) => {
    setEmployees((prev) => prev.filter((e) => e.id !== empId));
    setAdmins((prev) => prev.filter((a) => a.id !== empId));
    fetch(`/api/employees/${empId}`, {
      method: 'DELETE'
    }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  const clearAllData = () => {
    setEmployees([]);
    setTasks([]);
    setTimeLogs([]);
    setAdmins([]);
    localStorage.removeItem('tech_crm_employees_v5');
    localStorage.removeItem('tech_crm_tasks_v5');
    localStorage.removeItem('tech_crm_timelogs_v5');
    localStorage.removeItem('tech_crm_admins_v5');
    fetch('/api/clear-all', { method: 'DELETE' }).catch((e) => console.warn('API Sync Notice:', e.message));
  };

  return (
    <CrmContext.Provider
      value={{
        employees,
        admins,
        superAdmins,
        tasks,
        visibleTasks,
        timeLogs,
        currentUser,
        setCurrentUser,
        userRole,
        hasPermission,
        CLIENT_PROJECT_OPTIONS,
        ACTIVITY_OPTIONS,
        CORE_ACTIVITY_OPTIONS,
        STATUS_OPTIONS,
        SLA_STATUS_OPTIONS,
        loginAsAdmin,
        loginAsEmployee,
        logout,
        addAdminAccount,
        promoteEmployeeToAdmin,
        selectedEmployeeViewId,
        setSelectedEmployeeViewId,
        currentTab,
        setCurrentTab,
        searchQuery,
        setSearchQuery,
        selectedMonth,
        setSelectedMonth,
        statusFilter,
        setStatusFilter,
        
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
        addEmployee,
        updateEmployee,
        deleteEmployee,
        clearAllData
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => useContext(CrmContext);
