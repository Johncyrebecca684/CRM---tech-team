import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Play, 
  PlusCircle, 
  Calendar,
  Award, 
  CalendarCheck, 
  Inbox, 
  UserPlus, 
  MessageSquare, 
  Edit3, 
  X, 
  User, 
  LogOut,
  ArrowLeft,
  Search,
  Users,
  Briefcase,
  Mail,
  Trash2,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Filter,
  Upload,
  Download,
  FileText,
  Paperclip,
  FileCheck
} from 'lucide-react';
import { uploadFileToServer, downloadFileAttachment } from '../utils/fileUpload';

export const EmployeeView = () => {
  const { 
    employees, 
    selectedEmployeeViewId, 
    setSelectedEmployeeViewId, 
    tasks, 
    updateTask,
    deleteTask,
    setIsTaskModalOpen,
    setEditingTask,
    timeLogs, 
    selectedMonth, 
    setSelectedMonth,
    setIsTimeLogModalOpen, 
    setTaskForLogging, 
    startTimer, 
    activeTimer, 
    searchQuery, 
    currentUser, 
    userRole, 
    hasPermission,
    setCurrentTab, 
    logout,
    setIsEmployeeModalOpen, 
    setEditingEmployee,
    deleteEmployee,
    restoreDefaultEmployees
  } = useCrm();

  const isEmployeeRole = currentUser?.role === 'employee';

  // For admins, default to list mode if no employee selected, otherwise allow toggling
  const [viewMode, setViewMode] = useState(() => {
    return isEmployeeRole ? 'detail' : (selectedEmployeeViewId ? 'detail' : 'list');
  });

  // Keep viewMode synchronized when selectedEmployeeViewId changes externally
  useEffect(() => {
    if (!isEmployeeRole) {
      if (selectedEmployeeViewId) {
        setViewMode('detail');
      } else {
        setViewMode('list');
      }
    }
  }, [selectedEmployeeViewId, isEmployeeRole]);


  // Local task filters for Selected Employee Detail
  const [statusFilter, setStatusFilter] = useState('All');
  const [isEmployeeStatusModalOpen, setIsEmployeeStatusModalOpen] = useState(false);
  const [editingEmployeeTask, setEditingEmployeeTask] = useState(null);
  const [employeeStatusData, setEmployeeStatusData] = useState({
    status: 'In Progress',
    workStartDate: '',
    actualEndDate: '',
    commentsUpdates: '',
    taskFile: null
  });

  const handleFileUpload = async (task, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const filePayload = await uploadFileToServer(file);
      if (filePayload) {
        updateTask(task.id, {
          taskFile: filePayload,
          taskFileName: filePayload.name,
          taskFileUrl: filePayload.url
        });
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      e.target.value = '';
    }
  };

  const handleDownloadFile = (task) => {
    const file = task.taskFile || (task.taskFileUrl ? { name: task.taskFileName || 'task-document', url: task.taskFileUrl } : null);
    if (!file) return;
    downloadFileAttachment(file);
  };

  const handleRemoveFile = (task, e) => {
    e?.stopPropagation();
    updateTask(task.id, {
      taskFile: null,
      taskFileName: '',
      taskFileUrl: ''
    });
  };

  // Precise name comparison helper (handles "Johncy" vs "Johncy Rebecca")
  const isMatchingName = (n1, n2) => {
    if (!n1 || !n2) return false;
    const a = n1.toString().trim().toLowerCase();
    const b = n2.toString().trim().toLowerCase();
    if (a === b) return true;
    if (a.startsWith(b) || b.startsWith(a)) return true;
    return false;
  };

  // Active viewed employee
  const empIdToUse = isEmployeeRole ? currentUser?.id : (selectedEmployeeViewId || employees[0]?.id);
  const currentEmployee = employees.find((e) => {
    if (e.id && empIdToUse && e.id.toLowerCase() === empIdToUse.toLowerCase()) return true;
    if (isEmployeeRole && currentUser) {
      if (e.email && currentUser.email && e.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) return true;
      if (e.name && currentUser.name && isMatchingName(e.name, currentUser.name)) return true;
    }
    return false;
  }) || (isEmployeeRole && currentUser ? {
    id: currentUser.id || 'emp-5',
    name: currentUser.name || 'Johncy Rebecca',
    email: currentUser.email,
    role: currentUser.roleTitle || currentUser.role || 'Media Specialist',
    status: 'Active',
    skills: ['Creatives', 'Banner']
  } : employees[0]);

  // Strict task assignment checker
  const isTaskAssignedToEmployee = (task, emp) => {
    if (!emp || !task) return false;

    const empId = (emp.id || '').toString().trim().toLowerCase();
    const empEmail = (emp.email || '').toString().trim().toLowerCase();
    const empName = (emp.name || '').toString().trim().toLowerCase();

    const tId = (task.assignedToId || task.employeeId || '').toString().trim().toLowerCase();
    const tEmail = (task.assignedToEmail || '').toString().trim().toLowerCase();
    const tName = (task.assignedToUsername || task.assignedTo || '').toString().trim().toLowerCase();

    // 1. Direct ID match (e.g. 'emp-5' === 'emp-5')
    if (empId && tId && empId === tId) return true;

    // 2. Exact Email match (e.g. 'johncy@techteam.dev' === 'johncy@techteam.dev')
    if (empEmail) {
      if (tEmail && empEmail === tEmail) return true;
      if (tId && empEmail === tId) return true;
    }

    // 3. Exact or prefix Name match (e.g. 'johncy' vs 'johncy rebecca')
    if (empName) {
      if (tName && isMatchingName(empName, tName)) return true;
      if (tId && isMatchingName(empName, tId)) return true;
    }

    return false;
  };

  // If no employees registered at all and user is an admin viewing directory
  if (employees.length === 0 && !isEmployeeRole) {
    return (
      <div className="glass-panel" style={{ padding: '56px 32px', textAlign: 'center', maxWidth: '640px', margin: '40px auto' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <UserCheck size={36} color="var(--accent-primary)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>No Tech Employees Registered</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '10px 0 28px 0', lineHeight: 1.5 }}>
          Please register tech employees to access personalized work pages, task management, and Excel task logs.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {userRole !== 'employee' && (
            <button 
              onClick={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <UserPlus size={16} /> Register Tech Employee
            </button>
          )}
          <button 
            onClick={() => {
              if (restoreDefaultEmployees) restoreDefaultEmployees();
            }}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <RotateCcw size={16} /> Restore Default 6 Specialists
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: EMPLOYEES LIST VIEW (ADMIN DIRECTORY)
  // -------------------------------------------------------------
  if (!isEmployeeRole && viewMode === 'list') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Simple Clean Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Employees Directory ({employees.length})
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
              Real-time task statuses, active workloads, and employee work logs
            </p>
          </div>

          <button 
            onClick={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
          >
            <UserPlus size={15} /> Add Employee
          </button>
        </div>

        {/* Clean Employees Table List with Live Task Statuses */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card-hover)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '14px 20px' }}>Employee</th>
                <th style={{ padding: '14px 20px' }}>Role</th>
                <th style={{ padding: '14px 20px' }}>Live Task Statuses</th>
                <th style={{ padding: '14px 20px' }}>Completion</th>
                <th style={{ padding: '14px 20px' }}>Email</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const empTasks = tasks.filter((t) => isTaskAssignedToEmployee(t, emp));
                const totalEmpTasks = empTasks.length;
                const completedEmp = empTasks.filter((t) => t.status === 'Completed').length;
                const inProgressEmp = empTasks.filter((t) => t.status === 'In Progress').length;
                const yetToStartEmp = empTasks.filter((t) => t.status === 'Yet to start').length;
                const waitingEmp = empTasks.filter((t) => t.status === 'Waiting for approval').length;
                const onHoldEmp = empTasks.filter((t) => t.status === 'On Hold').length;
                const completionPct = totalEmpTasks > 0 ? Math.round((completedEmp / totalEmpTasks) * 100) : 0;

                return (
                  <tr 
                    key={emp.id}
                    onClick={() => {
                      setSelectedEmployeeViewId(emp.id);
                      setViewMode('detail');
                    }}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Name & ID */}
                    <td style={{ padding: '14px 20px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>ID: {emp.id}</div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                      {emp.role}
                    </td>

                    {/* Live Task Statuses */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {completedEmp > 0 && (
                          <span className="badge badge-completed" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                            {completedEmp} Completed
                          </span>
                        )}
                        {inProgressEmp > 0 && (
                          <span className="badge badge-in-progress" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                            {inProgressEmp} In Progress
                          </span>
                        )}
                        {yetToStartEmp > 0 && (
                          <span className="badge badge-yet-to-start" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                            {yetToStartEmp} Yet to start
                          </span>
                        )}
                        {waitingEmp > 0 && (
                          <span className="badge badge-waiting-for-approval" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                            {waitingEmp} Waiting approval
                          </span>
                        )}
                        {onHoldEmp > 0 && (
                          <span className="badge badge-on-hold" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                            {onHoldEmp} On Hold
                          </span>
                        )}
                        {totalEmpTasks === 0 && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            No active tasks
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Completion Rate */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: '0 0 54px', height: '6px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                          <div style={{ width: `${completionPct}%`, height: '100%', background: completionPct === 100 ? 'var(--accent-emerald)' : 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {completionPct}%
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                      {emp.email}
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEmployeeViewId(emp.id);
                          setViewMode('detail');
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>View Work Log</span>
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: SELECTED EMPLOYEE DETAIL VIEW
  // -------------------------------------------------------------
  if (!currentEmployee) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <UserCheck size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Employee Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '8px 0 20px 0' }}>
          The requested employee record could not be loaded.
        </p>
        {!isEmployeeRole && (
          <button 
            onClick={() => setViewMode('list')}
            className="btn btn-primary"
          >
            <ArrowLeft size={16} /> Return to Employees List
          </button>
        )}
      </div>
    );
  }

  // Filter tasks for this employee matching search & status
  const employeeTasks = tasks.filter((t) => {
    if (!isTaskAssignedToEmployee(t, currentEmployee)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !t.activity?.toLowerCase().includes(q) &&
        !t.clientProject?.toLowerCase().includes(q) &&
        !t.client?.toLowerCase().includes(q) &&
        !t.project?.toLowerCase().includes(q) &&
        !t.coreActivity?.toLowerCase().includes(q) &&
        !t.theme?.toLowerCase().includes(q) &&
        !t.format?.toLowerCase().includes(q) &&
        !t.id?.toLowerCase().includes(q) &&
        !t.description?.toLowerCase().includes(q) &&
        !t.comments?.toLowerCase().includes(q) &&
        !t.commentsUpdates?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Completed') {
        if (t.status !== 'Completed') return false;
      } else if (statusFilter === 'In Progress') {
        if (t.status !== 'In Progress') return false;
      } else if (statusFilter === 'Yet to start') {
        if (t.status !== 'Yet to start') return false;
      } else if (statusFilter === 'Waiting for approval') {
        if (t.status !== 'Waiting for approval') return false;
      } else if (statusFilter === 'On Hold') {
        if (t.status !== 'On Hold') return false;
      } else if (statusFilter === 'Incomplete') {
        if (t.status === 'Completed') return false;
      } else if (t.status !== statusFilter) {
        return false;
      }
    }
    return true;
  });

  const allAssignedTasks = tasks.filter((t) => isTaskAssignedToEmployee(t, currentEmployee));
  const totalAssignedTasks = allAssignedTasks.length;
  const completedTasks = allAssignedTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = allAssignedTasks.filter((t) => t.status === 'In Progress').length;
  const yetToStartTasks = allAssignedTasks.filter((t) => t.status === 'Yet to start').length;
  const waitingApprovalTasks = allAssignedTasks.filter((t) => t.status === 'Waiting for approval').length;
  const onHoldTasks = allAssignedTasks.filter((t) => t.status === 'On Hold').length;

  const totalHoursSpent = timeLogs
    .filter((l) => l.employeeId === currentEmployee.id)
    .reduce((acc, l) => acc + (Number(l.hours) || 0), 0)
    .toFixed(1);

  const completionRate = totalAssignedTasks > 0 ? Math.round((completedTasks / totalAssignedTasks) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Navigation Bar for Admins */}
      {!isEmployeeRole && (
        <div>
          <button 
            onClick={() => {
              setSelectedEmployeeViewId(null);
              setViewMode('list');
            }}
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Directory</span>
          </button>
        </div>
      )}

      {/* Modern Minimalist Profile Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        
        {/* Top Row: User Info & Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          
          {/* Avatar & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              flexShrink: 0
            }}>
              {currentEmployee.name ? currentEmployee.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'EM'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', lineHeight: 1.2 }}>
                  {isEmployeeRole ? `Welcome back, ${currentEmployee.name}! 👋` : currentEmployee.name}
                </h2>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--accent-emerald)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  lineHeight: 1.2
                }}>
                  {isEmployeeRole ? 'Personal Dashboard' : (currentEmployee.status || 'Active')}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  <Briefcase size={13} /> {currentEmployee.role}
                </span>
                {currentEmployee.email && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} /> {currentEmployee.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!isEmployeeRole && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button
                onClick={() => {
                  setEditingEmployee(currentEmployee);
                  setIsEmployeeModalOpen(true);
                }}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={14} />
                <span>Edit Profile</span>
              </button>
            </div>
          )}
        </div>

        {/* Skills Tag Row */}
        {currentEmployee.skills && currentEmployee.skills.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>
              Skills:
            </span>
            {currentEmployee.skills.map((skill, idx) => (
              <span 
                key={idx} 
                style={{ 
                  fontSize: '0.72rem', 
                  padding: '3px 8px', 
                  borderRadius: '6px', 
                  background: 'var(--bg-app)', 
                  color: 'var(--text-main)', 
                  fontWeight: 500, 
                  border: '1px solid var(--border-color)' 
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Minimal Task Status Metric Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-color)'
        }}>
          {/* Total */}
          <div style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Tasks
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {totalAssignedTasks}
            </div>
          </div>

          {/* Completed */}
          <div style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'var(--accent-emerald)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></span>
              Completed
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '2px' }}>
              {completedTasks}
            </div>
          </div>

          {/* In Progress */}
          <div style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
              In Progress
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
              {inProgressTasks}
            </div>
          </div>

          {/* Yet to Start */}
          <div style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748b' }}></span>
              Yet to Start
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {yetToStartTasks}
            </div>
          </div>

          {/* Waiting Approval */}
          <div style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: '#d97706', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
              Waiting Approval
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>
              {waitingApprovalTasks}
            </div>
          </div>

          {/* On Hold */}
          <div style={{ background: 'var(--bg-app)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.68rem', color: 'var(--accent-rose)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-rose)' }}></span>
              On Hold
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-rose)', marginTop: '2px' }}>
              {onHoldTasks}
            </div>
          </div>
        </div>
      </div>

      {/* Main Employee Work Log Data Table */}
      <div className="glass-panel" style={{ padding: '20px 24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Personal Work Log Data Sheet</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Real-time synchronization with Master Task Grid</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Filter Tab Pills */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-app)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              {['All', 'Yet to start', 'In Progress', 'Waiting for approval', 'Completed', 'On Hold'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: statusFilter === status ? 700 : 500,
                    cursor: 'pointer',
                    background: statusFilter === status ? 'var(--bg-card)' : 'transparent',
                    color: statusFilter === status ? 'var(--accent-primary)' : 'var(--text-muted)',
                    boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Add Task Button (Admins only) */}
            {!isEmployeeRole && (
              <button
                onClick={() => {
                  setEditingTask(null);
                  setSelectedEmployeeViewId(currentEmployee.id);
                  setIsTaskModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px', fontWeight: 600, borderRadius: '8px' }}
              >
                <PlusCircle size={14} /> + Assign New Task
              </button>
            )}
          </div>
        </div>

        {employeeTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <Inbox size={32} color="var(--text-dim)" style={{ marginBottom: '8px', opacity: 0.6 }} />
            <div style={{ fontSize: '0.85rem' }}>No tasks registered for {currentEmployee.name} under this filter.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'var(--bg-app)' }}>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>S.No</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Work Start Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Theme</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Format</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Assigned to</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Client</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Actual End Date</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>SLA Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Deliverable File</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700 }}>Comments</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeeTasks.map((task, idx) => {
                  const targetDateStr = task.targetEndDate || task.dueDate || task.toBePostedOn || task.date;
                  const actualDateStr = task.actualEndDate || task.toBeCompletedOn || task.completedOn;

                  // SLA Comparison: Red if actual date is after target date, Green if on or before target date
                  let isSlaGreen = true;
                  if (actualDateStr && targetDateStr) {
                    const actualTime = new Date(actualDateStr).setHours(0, 0, 0, 0);
                    const targetTime = new Date(targetDateStr).setHours(0, 0, 0, 0);
                    isSlaGreen = actualTime <= targetTime;
                  } else if (targetDateStr) {
                    const todayTime = new Date().setHours(0, 0, 0, 0);
                    const targetTime = new Date(targetDateStr).setHours(0, 0, 0, 0);
                    isSlaGreen = todayTime <= targetTime;
                  } else {
                    isSlaGreen = task.slaStatus !== 'Red';
                  }

                  const hasFile = !!(task.taskFile?.url || task.taskFileUrl || task.taskFileName);
                  const fileName = task.taskFile?.name || task.taskFileName || 'Deliverable Document';
                  const fileSize = task.taskFile?.size || '';

                  return (
                    <tr 
                      key={task.id} 
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* S.No */}
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-dim)' }}>
                        {task.sNo || idx + 1}
                      </td>

                      {/* 1. Work Start Date (Editable by employee, syncs across system) */}
                      <td style={{ padding: '8px 12px' }}>
                        {isEmployeeRole ? (
                          <input
                            type="date"
                            className="form-input"
                            style={{
                              height: '28px',
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              width: '130px',
                              borderRadius: '6px',
                              border: (task.workStartDate || task.startDate || task.toBePostedOn || task.date) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                              background: 'var(--bg-app)',
                              color: (task.workStartDate || task.startDate || task.toBePostedOn || task.date) ? 'var(--accent-primary)' : 'inherit',
                              fontWeight: 600
                            }}
                            value={task.workStartDate || task.startDate || task.toBePostedOn || task.date || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateTask(task.id, {
                                workStartDate: val,
                                startDate: val,
                                toBePostedOn: val,
                                date: val || task.date
                              });
                            }}
                            title="Set work start date"
                          />
                        ) : (
                          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                            {task.workStartDate || task.startDate || task.toBePostedOn || task.date || '—'}
                          </span>
                        )}
                      </td>

                      {/* 2. Theme */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 7px', borderRadius: '4px', background: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent-primary)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                          {task.theme || task.coreActivity || 'Digital Marketing'}
                        </span>
                      </td>

                      {/* 3. Format */}
                      <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text-main)' }}>
                        {task.format || task.activity || 'Static Poster'}
                      </td>

                      {/* 4. Assigned to */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{task.assignedToUsername || task.assignedTo || currentEmployee.name}</span>
                      </td>

                      {/* 5. Description */}
                      <td style={{ padding: '10px 12px', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={task.description || task.titleTopic || task.title || task.activity}>
                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          {task.description || task.titleTopic || task.title || task.activity || '—'}
                        </span>
                      </td>

                      {/* 6. Client */}
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {task.client || task.clientProject || 'SCS'}
                      </td>

                      {/* 7. Actual End Date (Display Only) */}
                      <td style={{ padding: '10px 12px' }}>
                        {(task.actualEndDate || task.toBeCompletedOn || task.completedOn) ? (
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                            <CalendarCheck size={13} /> {task.actualEndDate || task.toBeCompletedOn || task.completedOn}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>—</span>
                        )}
                      </td>

                      {/* 8. SLA Status (G/R) */}
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: isSlaGreen ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                          color: isSlaGreen ? '#059669' : '#e11d48',
                          border: `1px solid ${isSlaGreen ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isSlaGreen ? '#059669' : '#e11d48' }}></span>
                          {isSlaGreen ? 'Met' : 'Breached'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '8px 12px' }}>
                        {isEmployeeRole ? (
                          <select
                            value={task.status || 'Yet to start'}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              const today = new Date().toISOString().split('T')[0];
                              const isCompleted = newStatus === 'Completed';
                              updateTask(task.id, {
                                status: newStatus,
                                actualEndDate: isCompleted ? (task.actualEndDate || today) : null,
                                toBeCompletedOn: isCompleted ? (task.toBeCompletedOn || task.completedOn || today) : task.toBeCompletedOn,
                                completedOn: isCompleted ? (task.completedOn || today) : ''
                              });
                            }}
                            className={`badge-select badge-${(task.status || 'Yet to start').toLowerCase().replace(/\s+/g, '-')}`}
                            title="Update task status"
                            style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: '6px' }}
                          >
                            <option value="Yet to start">⚪ Yet to start</option>
                            <option value="In Progress">🔵 In Progress</option>
                            <option value="Waiting for approval">🟡 Waiting for approval</option>
                            <option value="Completed">🟢 Completed</option>
                            <option value="On Hold">🟠 On Hold</option>
                          </select>
                        ) : (
                          <span className={`badge badge-${(task.status || 'Yet to start').toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                            {task.status || 'Yet to start'}
                          </span>
                        )}
                      </td>

                      {/* DELIVERABLE FILE / DOCUMENT COLUMN */}
                      <td style={{ padding: '8px 12px' }}>
                        {hasFile ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: 'var(--bg-app)',
                            border: '1px solid var(--border-color)',
                            padding: '3px 6px',
                            borderRadius: '6px'
                          }}>
                            <FileText size={13} color="var(--accent-primary)" />
                            <span 
                              title={`${fileName} ${fileSize ? `(${fileSize})` : ''}`} 
                              style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 500, 
                                color: 'var(--text-main)', 
                                maxWidth: '110px', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap' 
                              }}
                            >
                              {fileName}
                            </span>
                            
                            {/* Download Action */}
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(task)}
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                background: 'rgba(99, 102, 241, 0.1)', 
                                border: '1px solid rgba(99, 102, 241, 0.2)', 
                                borderRadius: '4px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                color: 'var(--accent-primary)',
                                padding: 0
                              }}
                              title="Download deliverable"
                            >
                              <Download size={11} />
                            </button>

                            {/* Employee Replace File */}
                            {isEmployeeRole && (
                              <label
                                style={{ 
                                  width: '20px', 
                                  height: '20px', 
                                  background: 'var(--bg-card)', 
                                  border: '1px solid var(--border-color)', 
                                  borderRadius: '4px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  cursor: 'pointer', 
                                  color: 'var(--text-muted)',
                                  margin: 0
                                }}
                                title="Replace attached file"
                              >
                                <Upload size={10} />
                                <input 
                                  type="file" 
                                  style={{ display: 'none' }} 
                                  onChange={(e) => handleFileUpload(task, e)} 
                                />
                              </label>
                            )}

                            {isEmployeeRole && (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveFile(task, e)}
                                style={{ 
                                  width: '20px', 
                                  height: '20px', 
                                  background: 'rgba(244, 63, 94, 0.1)', 
                                  border: '1px solid rgba(244, 63, 94, 0.2)', 
                                  borderRadius: '4px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  cursor: 'pointer', 
                                  color: 'var(--accent-rose)',
                                  padding: 0
                                }}
                                title="Remove File"
                              >
                                <Trash2 size={10} />
                              </button>
                            )}
                          </div>
                        ) : (
                          isEmployeeRole ? (
                            <label 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: 'var(--accent-primary)',
                                background: 'rgba(99, 102, 241, 0.06)',
                                border: '1px dashed rgba(99, 102, 241, 0.3)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                margin: 0
                              }}
                              title="Upload completed task file"
                            >
                              <Upload size={11} />
                              <span>Upload</span>
                              <input 
                                type="file" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileUpload(task, e)} 
                              />
                            </label>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                              —
                            </span>
                          )
                        )}
                      </td>

                      {/* Comments */}
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.comments || task.commentsUpdates ? (
                          <span title={task.comments || task.commentsUpdates} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                            <MessageSquare size={11} color="var(--accent-primary)" /> {task.comments || task.commentsUpdates}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                          <button
                            onClick={() => {
                              if (isEmployeeRole) {
                                setEditingEmployeeTask(task);
                                setEmployeeStatusData({
                                  status: task.status || 'In Progress',
                                  workStartDate: task.workStartDate || task.startDate || task.toBePostedOn || task.date || '',
                                  actualEndDate: task.actualEndDate || task.toBeCompletedOn || new Date().toISOString().split('T')[0],
                                  commentsUpdates: task.comments || task.commentsUpdates || '',
                                  taskFile: task.taskFile || (task.taskFileUrl ? { name: task.taskFileName || 'task-doc', url: task.taskFileUrl } : null)
                                });
                                setIsEmployeeStatusModalOpen(true);
                              } else {
                                setEditingTask(task);
                                setIsTaskModalOpen(true);
                              }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '3px 7px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px', borderRadius: '5px' }}
                            title={isEmployeeRole ? "Update Work Status, File & Comments" : "Edit Full Task"}
                          >
                            <Edit3 size={11} /> {isEmployeeRole ? "Update" : "Edit"}
                          </button>
                          {hasPermission('admin') && (
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="btn btn-secondary"
                              style={{ padding: '3px 6px', fontSize: '0.72rem', color: 'var(--accent-rose)', borderRadius: '5px' }}
                              title="Delete Task"
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EMPLOYEE TASK UPDATE MODAL (Status, Completed On Date, Deliverable File, Comments) */}
      {isEmployeeStatusModalOpen && editingEmployeeTask && (
        <div className="modal-backdrop">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '520px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                📝 Update Task Status & Upload Deliverable
              </h2>
              <button 
                onClick={() => setIsEmployeeStatusModalOpen(false)} 
                className="btn btn-secondary btn-icon"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const filePayload = employeeStatusData.taskFile;
              updateTask(editingEmployeeTask.id, {
                status: employeeStatusData.status,
                workStartDate: employeeStatusData.workStartDate,
                startDate: employeeStatusData.workStartDate,
                toBePostedOn: employeeStatusData.workStartDate || editingEmployeeTask.toBePostedOn,
                actualEndDate: employeeStatusData.status === 'Completed' ? employeeStatusData.actualEndDate : (employeeStatusData.actualEndDate || null),
                toBeCompletedOn: employeeStatusData.status === 'Completed' ? employeeStatusData.actualEndDate : (editingEmployeeTask.toBeCompletedOn || editingEmployeeTask.completedOn),
                comments: employeeStatusData.commentsUpdates,
                commentsUpdates: employeeStatusData.commentsUpdates,
                taskFile: filePayload || null,
                taskFileName: filePayload?.name || '',
                taskFileUrl: filePayload?.url || ''
              });
              setIsEmployeeStatusModalOpen(false);
            }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label className="form-label">Task Reference</label>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  #{editingEmployeeTask.id} - {editingEmployeeTask.clientProject || editingEmployeeTask.client} ({editingEmployeeTask.activity || editingEmployeeTask.format})
                </div>
              </div>

              <div>
                <label className="form-label">Work Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={employeeStatusData.workStartDate || ''}
                  onChange={(e) => setEmployeeStatusData({ ...employeeStatusData, workStartDate: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Work Status *</label>
                <select
                  className="form-select"
                  value={employeeStatusData.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    setEmployeeStatusData({
                      ...employeeStatusData,
                      status: newStatus,
                      actualEndDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : employeeStatusData.actualEndDate
                    });
                  }}
                >
                  <option value="Yet to start">⚪ Yet to start</option>
                  <option value="In Progress">🔵 In Progress</option>
                  <option value="Waiting for approval">🟡 Waiting for approval</option>
                  <option value="Completed">🟢 Completed ✅</option>
                  <option value="On Hold">🟠 On Hold</option>
                </select>
              </div>

              {employeeStatusData.status === 'Completed' && (
                <div>
                  <label className="form-label">Completed On (Actual End Date) *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={employeeStatusData.actualEndDate}
                    onChange={(e) => setEmployeeStatusData({ ...employeeStatusData, actualEndDate: e.target.value })}
                  />
                </div>
              )}

              {/* Task Deliverable Document Upload */}
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>Completed Task Document / File</span>
                  {employeeStatusData.taskFile && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      ✓ File Attached
                    </span>
                  )}
                </label>
                
                {employeeStatusData.taskFile ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <FileText size={18} color="var(--accent-primary)" />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {employeeStatusData.taskFile.name}
                        </div>
                        {employeeStatusData.taskFile.size && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {employeeStatusData.taskFile.size}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <label 
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}
                        title="Change attached file"
                      >
                        Change
                        <input 
                          type="file" 
                          style={{ display: 'none' }} 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const uploaded = await uploadFileToServer(file);
                              if (uploaded) {
                                setEmployeeStatusData(prev => ({
                                  ...prev,
                                  taskFile: uploaded
                                }));
                              }
                            }
                          }} 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setEmployeeStatusData({ ...employeeStatusData, taskFile: null })}
                        className="btn btn-danger btn-icon"
                        style={{ width: '28px', height: '28px' }}
                        title="Remove attached file"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px dashed #cbd5e1',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}>
                    <Upload size={24} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Click to upload completed task deliverable
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Supports PDF, PNG, JPG, DOCX, ZIP, PSD, Figma files & more
                    </span>
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const uploaded = await uploadFileToServer(file);
                          if (uploaded) {
                            setEmployeeStatusData(prev => ({
                              ...prev,
                              taskFile: uploaded
                            }));
                          }
                        }
                      }} 
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="form-label">Employee Comments & Work Updates *</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Describe work completed, publishing details, or deliverable notes..."
                  value={employeeStatusData.commentsUpdates}
                  onChange={(e) => setEmployeeStatusData({ ...employeeStatusData, commentsUpdates: e.target.value })}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '8px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button 
                  type="button" 
                  onClick={() => setIsEmployeeStatusModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <CheckCircle2 size={16} /> Save Work Updates & Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
