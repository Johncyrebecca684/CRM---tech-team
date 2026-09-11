import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  CalendarCheck,
  MessageSquare,
  Search,
  Filter,
  RotateCcw,
  X,
  Inbox,
  Upload,
  Download,
  FileText,
  Paperclip,
  Eye,
  FileCheck,
  CheckCircle2,
  Briefcase,
  Layers,
  Clock,
  User,
  Tag
} from 'lucide-react';
import { uploadFileToServer, downloadFileAttachment } from '../utils/fileUpload';

export const TaskTableView = () => {
  const { 
    tasks,
    visibleTasks, 
    employees, 
    setIsTaskModalOpen, 
    setEditingTask, 
    deleteTask,
    updateTask,
    searchQuery,
    currentUser,
    userRole,
    hasPermission,
    CLIENT_PROJECT_OPTIONS,
    ACTIVITY_OPTIONS,
    STATUS_OPTIONS
  } = useCrm();

  const isEmployeeRole = currentUser?.role === 'employee';

  // Multi-field Filter States
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [activityFilter, setActivityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [slaFilter, setSlaFilter] = useState('All');

  // Employee quick update modal for comments / status / deliverable file
  const [isEmployeeStatusModalOpen, setIsEmployeeStatusModalOpen] = useState(false);
  const [editingEmployeeTask, setEditingEmployeeTask] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [employeeStatusData, setEmployeeStatusData] = useState({
    status: 'Yet to start',
    workStartDate: '',
    actualEndDate: '',
    commentsUpdates: '',
    taskFile: null
  });

  // File Preview Modal
  const [previewFile, setPreviewFile] = useState(null);

  const handleFileUpload = async (task, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingFile(true);
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
      setIsUploadingFile(false);
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

  const isMatchingName = (n1, n2) => {
    if (!n1 || !n2) return false;
    const a = n1.toString().trim().toLowerCase();
    const b = n2.toString().trim().toLowerCase();
    if (a === b) return true;
    if (a.startsWith(b) || b.startsWith(a)) return true;
    return false;
  };

  const isTaskAssignedToCurrentEmployee = (task) => {
    if (!currentUser || !isEmployeeRole) return false;
    if (task.assignedToId && task.assignedToId === currentUser.id) return true;
    if (task.assignedToEmail && currentUser.email && task.assignedToEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) return true;
    if (task.assignedToUsername && currentUser.name && isMatchingName(task.assignedToUsername, currentUser.name)) return true;
    if (task.assignedTo && currentUser.name && isMatchingName(task.assignedTo, currentUser.name)) return true;
    return true; // If in employee view, allow employee to update task status
  };

  const handleStatusChange = (task, newStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = newStatus === 'Completed';
    updateTask(task.id, {
      status: newStatus,
      actualEndDate: isCompleted ? (task.actualEndDate || today) : null,
      toBeCompletedOn: isCompleted ? (task.toBeCompletedOn || task.completedOn || today) : task.toBeCompletedOn,
      completedOn: isCompleted ? (task.completedOn || today) : ''
    });
  };

  const baseTasks = visibleTasks || tasks;

  // Extract unique clients combining master options and existing tasks
  const clientOptions = useMemo(() => {
    const clients = new Set(CLIENT_PROJECT_OPTIONS || []);
    (tasks || []).forEach((t) => {
      if (t.clientProject) clients.add(t.clientProject);
      if (t.client) clients.add(t.client);
    });
    return Array.from(clients).filter(Boolean).sort();
  }, [tasks, CLIENT_PROJECT_OPTIONS]);

  // Extract unique activities combining master options and existing tasks
  const activityOptions = useMemo(() => {
    const acts = new Set(ACTIVITY_OPTIONS || []);
    (tasks || []).forEach((t) => {
      if (t.activity) acts.add(t.activity);
      if (t.format) acts.add(t.format);
    });
    return Array.from(acts).filter(Boolean).sort();
  }, [tasks, ACTIVITY_OPTIONS]);

  const hasActiveFilters = 
    localSearch.trim() !== '' ||
    statusFilter !== 'All' ||
    clientFilter !== 'All' ||
    activityFilter !== 'All' ||
    (!isEmployeeRole && assigneeFilter !== 'All') ||
    slaFilter !== 'All';

  const resetFilters = () => {
    setLocalSearch('');
    setStatusFilter('All');
    setClientFilter('All');
    setActivityFilter('All');
    setAssigneeFilter('All');
    setSlaFilter('All');
  };

  // Filter tasks with combined multi-criteria logic
  const filteredTasks = useMemo(() => {
    return baseTasks.filter((task) => {
      // 1. Search Query
      const q = (localSearch || searchQuery || '').trim().toLowerCase();
      if (q) {
        const titleMatch = task.activity?.toLowerCase().includes(q) || task.title?.toLowerCase().includes(q);
        const clientMatch = task.clientProject?.toLowerCase().includes(q) || task.client?.toLowerCase().includes(q);
        const projMatch = task.project?.toLowerCase().includes(q);
        const coreMatch = task.coreActivity?.toLowerCase().includes(q) || task.theme?.toLowerCase().includes(q);
        const idMatch = task.id?.toLowerCase().includes(q);
        const commentsMatch = task.commentsUpdates?.toLowerCase().includes(q) || task.comments?.toLowerCase().includes(q);
        const fileMatch = task.taskFileName?.toLowerCase().includes(q) || task.taskFile?.name?.toLowerCase().includes(q);
        if (!titleMatch && !clientMatch && !projMatch && !coreMatch && !idMatch && !commentsMatch && !fileMatch) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'All' && task.status !== statusFilter) {
        return false;
      }

      // 3. Client Filter
      if (clientFilter !== 'All') {
        const taskClient = (task.clientProject || task.client || '').toLowerCase().trim();
        if (taskClient !== clientFilter.toLowerCase().trim()) {
          return false;
        }
      }

      // 4. Activity Filter
      if (activityFilter !== 'All') {
        const taskAct = (task.activity || task.format || '').toLowerCase().trim();
        if (taskAct !== activityFilter.toLowerCase().trim()) {
          return false;
        }
      }

      // 5. Assignee Filter
      if (assigneeFilter !== 'All') {
        const emp = employees.find((e) => e.id === assigneeFilter);
        const matchId = task.assignedToId === assigneeFilter;
        const matchEmail = emp && task.assignedToEmail && task.assignedToEmail.toLowerCase() === emp.email.toLowerCase();
        const matchName = emp && task.assignedToUsername && (task.assignedToUsername.toLowerCase().includes(emp.name.toLowerCase()) || emp.name.toLowerCase().includes(task.assignedToUsername.toLowerCase()));
        if (!matchId && !matchEmail && !matchName) {
          return false;
        }
      }

      // 6. SLA Status Filter
      if (slaFilter !== 'All') {
        const isGreen = task.slaStatus !== 'Red';
        if (slaFilter === 'Green' && !isGreen) return false;
        if (slaFilter === 'Red' && isGreen) return false;
      }

      return true;
    });
  }, [baseTasks, localSearch, searchQuery, statusFilter, clientFilter, activityFilter, assigneeFilter, slaFilter, employees]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Task Data Grid</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '3px 0 0 0' }}>
            Full spreadsheet table view with live multi-criteria filtering and deliverable document management
          </p>
        </div>

        {/* Add Task button for Employees and Admins */}
        <button 
          onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontWeight: 700, borderRadius: '8px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> {isEmployeeRole ? '+ Add My Task / Work Entry' : '+ New Task Record'}
        </button>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px', borderRadius: '12px' }}>
        
        {/* Top Row: Search & Results Counter / Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '480px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by activity, client, project code, deliverable or ID..."
              className="form-input"
              style={{ paddingLeft: '38px', height: '38px', fontSize: '0.84rem', width: '100%' }}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results Badge & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge-count-pill" style={{ fontSize: '0.82rem', padding: '6px 14px', borderRadius: '8px' }}>
              Showing <strong style={{ color: 'var(--accent-primary)' }}>{filteredTasks.length}</strong> of {baseTasks.length} tasks
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#e11d48',
                  borderColor: 'rgba(225, 29, 72, 0.3)',
                  background: 'rgba(225, 29, 72, 0.06)'
                }}
              >
                <RotateCcw size={13} /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: 5-Column Dropdown Filters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)'
        }}>
          
          {/* 1. Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              <CheckCircle2 size={12} color="var(--accent-primary)" /> Status
            </label>
            <select
              className="form-select"
              style={{
                height: '38px',
                fontSize: '0.82rem',
                width: '100%',
                borderRadius: '8px',
                borderColor: statusFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: statusFilter !== 'All' ? 'rgba(0, 168, 132, 0.1)' : 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: statusFilter !== 'All' ? 700 : 500
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {(STATUS_OPTIONS || ['Yet to start', 'In Progress', 'Waiting for approval', 'Completed', 'On Hold']).map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 2. Client / Project Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              <Briefcase size={12} color="var(--accent-primary)" /> Client / Project
            </label>
            <select
              className="form-select"
              style={{
                height: '38px',
                fontSize: '0.82rem',
                width: '100%',
                borderRadius: '8px',
                borderColor: clientFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: clientFilter !== 'All' ? 'rgba(0, 168, 132, 0.1)' : 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: clientFilter !== 'All' ? 700 : 500
              }}
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            >
              <option value="All">All Clients ({clientOptions.length})</option>
              {clientOptions.map((client) => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          {/* 3. Activity Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              <Layers size={12} color="var(--accent-primary)" /> Activity
            </label>
            <select
              className="form-select"
              style={{
                height: '38px',
                fontSize: '0.82rem',
                width: '100%',
                borderRadius: '8px',
                borderColor: activityFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: activityFilter !== 'All' ? 'rgba(0, 168, 132, 0.1)' : 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: activityFilter !== 'All' ? 700 : 500
              }}
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option value="All">All Activities ({activityOptions.length})</option>
              {activityOptions.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          {/* 4. Tech Assignee Filter (Admins only) */}
          {!isEmployeeRole && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                <User size={12} color="var(--accent-primary)" /> Tech Assignee
              </label>
              <select
                className="form-select"
                style={{
                  height: '38px',
                  fontSize: '0.82rem',
                  width: '100%',
                  borderRadius: '8px',
                  borderColor: assigneeFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: assigneeFilter !== 'All' ? 'rgba(0, 168, 132, 0.1)' : 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontWeight: assigneeFilter !== 'All' ? 700 : 500
                }}
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <option value="All">All Tech Specialists ({employees.length})</option>
                {employees.map((emp) => {
                  const isJohncy = emp.name.toLowerCase().includes('johncy') || emp.id === 'emp-5';
                  const effectiveEmail = isJohncy ? 'johncyrebecca@gmail.com' : emp.email;
                  return (
                    <option key={emp.id} value={emp.id}>
                      👤 {emp.name} ({effectiveEmail})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* 5. SLA Status Filter */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
              <Clock size={12} color="var(--accent-primary)" /> SLA Status
            </label>
            <select
              className="form-select"
              style={{
                height: '38px',
                fontSize: '0.82rem',
                width: '100%',
                borderRadius: '8px',
                borderColor: slaFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: slaFilter !== 'All' ? 'rgba(0, 168, 132, 0.1)' : 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: slaFilter !== 'All' ? 700 : 500
              }}
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
            >
              <option value="All">All SLA Statuses</option>
              <option value="Green">🟩 Green (Met SLA)</option>
              <option value="Red">🟥 Red (Breached SLA)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Main Grid Glass Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
            <Inbox size={42} color="var(--text-dim)" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>No tasks found</h3>
            <p style={{ fontSize: '0.85rem', margin: '0 0 16px 0' }}>No task records match your active filter criteria.</p>
            {hasActiveFilters && (
              <button 
                onClick={resetFilters} 
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={14} /> Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 10px' }}>S.No</th>
                  <th style={{ padding: '12px 10px' }}>Date</th>
                  <th style={{ padding: '12px 10px' }}>Client / Project</th>
                  <th style={{ padding: '12px 10px' }}>Activity</th>
                  <th style={{ padding: '12px 10px' }}>Project</th>
                  <th style={{ padding: '12px 10px' }}>Core Activity</th>
                  <th style={{ padding: '12px 10px' }}>tech names</th>
                  <th style={{ padding: '12px 10px' }}>Work Start Date</th>
                  <th style={{ padding: '12px 10px' }}>Target End Date</th>
                  <th style={{ padding: '12px 10px' }}>Actual End Date</th>
                  <th style={{ padding: '12px 10px' }}>SLA Status (G/R)</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px' }}>Task File / Deliverable</th>
                  <th style={{ padding: '12px 10px' }}>Comments/Updates</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, idx) => {
                  const assignee = employees.find((e) => e.id === task.assignedToId);
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

                  const canEmployeeEditStatus = isEmployeeRole && isTaskAssignedToCurrentEmployee(task);
                  const hasFile = !!(task.taskFile?.url || task.taskFileUrl || task.taskFileName);
                  const fileName = task.taskFile?.name || task.taskFileName || 'Deliverable Document';
                  const fileSize = task.taskFile?.size || '';

                  return (
                    <tr 
                      key={task.id} 
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        {task.sNo || idx + 1}
                      </td>

                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {task.date || 'N/A'}
                      </td>

                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {task.clientProject || 'Internal Project'}
                      </td>

                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-main)' }}>
                        {task.activity || task.title}
                      </td>

                      <td style={{ padding: '12px 10px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                        {task.project || 'Engineering'}
                      </td>

                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {task.coreActivity || '—'}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        {assignee ? (
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{assignee.name}</span>
                        ) : (task.assignedToUsername || 'Unassigned')}
                      </td>

                      {/* Work Start Date: Editable by employee, read-only for admin */}
                      <td style={{ padding: '8px 10px' }}>
                        {canEmployeeEditStatus ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="date"
                              className="form-input"
                              style={{
                                height: '30px',
                                fontSize: '0.78rem',
                                padding: '2px 8px',
                                width: '138px',
                                borderRadius: '6px',
                                border: (task.workStartDate || task.startDate) ? '1px solid var(--accent-primary)' : '1px solid #cbd5e1',
                                background: (task.workStartDate || task.startDate) ? 'rgba(99, 102, 241, 0.05)' : '#ffffff',
                                color: (task.workStartDate || task.startDate) ? 'var(--accent-primary)' : 'inherit',
                                fontWeight: (task.workStartDate || task.startDate) ? 700 : 400
                              }}
                              value={task.workStartDate || task.startDate || ''}
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
                            {(task.workStartDate || task.startDate) && (
                              <button
                                onClick={() => {
                                  updateTask(task.id, {
                                    workStartDate: '',
                                    startDate: ''
                                  });
                                }}
                                title="Clear start date"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px 4px', fontSize: '0.75rem' }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontWeight: task.workStartDate ? 600 : 400 }}>
                            {task.workStartDate || task.startDate || 'N/A'}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ color: '#fb923c', fontWeight: 600 }}>{task.targetEndDate || task.dueDate || 'N/A'}</span>
                      </td>

                      {/* Actual End Date: Editable by employee, read-only for admin */}
                      <td style={{ padding: '8px 10px' }}>
                        {canEmployeeEditStatus ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                              type="date"
                              className="form-input"
                              style={{
                                height: '30px',
                                fontSize: '0.78rem',
                                padding: '2px 8px',
                                width: '138px',
                                borderRadius: '6px',
                                border: (task.actualEndDate || task.toBeCompletedOn || task.completedOn)
                                  ? (isSlaGreen ? '1px solid #10b981' : '1px solid #f43f5e')
                                  : '1px solid #cbd5e1',
                                background: (task.actualEndDate || task.toBeCompletedOn || task.completedOn)
                                  ? (isSlaGreen ? '#ecfdf5' : '#fff1f2')
                                  : '#ffffff',
                                color: (task.actualEndDate || task.toBeCompletedOn || task.completedOn)
                                  ? (isSlaGreen ? '#047857' : '#e11d48')
                                  : 'inherit',
                                fontWeight: (task.actualEndDate || task.toBeCompletedOn || task.completedOn) ? 700 : 400
                              }}
                              value={task.actualEndDate || task.toBeCompletedOn || task.completedOn || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const target = task.targetEndDate || task.dueDate || task.toBePostedOn || task.date;
                                let newSla = 'Green';
                                if (val && target) {
                                  const actualTime = new Date(val).setHours(0, 0, 0, 0);
                                  const targetTime = new Date(target).setHours(0, 0, 0, 0);
                                  newSla = actualTime > targetTime ? 'Red' : 'Green';
                                }
                                updateTask(task.id, {
                                  actualEndDate: val || null,
                                  toBeCompletedOn: val || '',
                                  completedOn: val || '',
                                  slaStatus: newSla
                                });
                              }}
                              title="Set actual task completion date"
                            />
                            {(task.actualEndDate || task.toBeCompletedOn || task.completedOn) && (
                              <button
                                onClick={() => {
                                  const target = task.targetEndDate || task.dueDate || task.toBePostedOn || task.date;
                                  let newSla = 'Green';
                                  if (target) {
                                    const todayTime = new Date().setHours(0, 0, 0, 0);
                                    const targetTime = new Date(target).setHours(0, 0, 0, 0);
                                    newSla = todayTime > targetTime ? 'Red' : 'Green';
                                  }
                                  updateTask(task.id, {
                                    actualEndDate: null,
                                    toBeCompletedOn: '',
                                    completedOn: '',
                                    slaStatus: newSla
                                  });
                                }}
                                title="Clear date"
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px 4px', fontSize: '0.75rem' }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          (task.actualEndDate || task.toBeCompletedOn || task.completedOn) ? (
                            <span style={{ color: isSlaGreen ? 'var(--accent-emerald)' : '#f43f5e', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                              <CalendarCheck size={13} /> {task.actualEndDate || task.toBeCompletedOn || task.completedOn}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.78rem' }}>Pending</span>
                          )
                        )}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: isSlaGreen ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)',
                          color: isSlaGreen ? '#059669' : '#e11d48',
                          border: `1px solid ${isSlaGreen ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`
                        }}>
                          {isSlaGreen ? '🟩 Green (Met)' : '🟥 Red (Breached)'}
                        </span>
                      </td>

                      {/* Status Column: Interactive for Employees, Read-Only for Admins */}
                      <td style={{ padding: '12px 10px' }}>
                        {canEmployeeEditStatus ? (
                          <select
                            value={task.status || 'Yet to start'}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                            className={`badge-select badge-${(task.status || 'Yet to start').toLowerCase().replace(/\s+/g, '-')}`}
                            title="Update task status"
                          >
                            <option value="Yet to start">⚪ Yet to start</option>
                            <option value="In Progress">🔵 In Progress</option>
                            <option value="Waiting for approval">🟡 Waiting for approval</option>
                            <option value="Completed">🟢 Completed</option>
                            <option value="On Hold">🟠 On Hold</option>
                          </select>
                        ) : (
                          <span className={`badge badge-${(task.status || 'Yet to start').toLowerCase().replace(/\s+/g, '-')}`}>
                            {task.status || 'Yet to start'}
                          </span>
                        )}
                      </td>

                      {/* TASK FILE / DELIVERABLE DOCUMENT COLUMN */}
                      <td style={{ padding: '8px 10px' }}>
                        {hasFile ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'var(--bg-card-hover)',
                            border: '1px solid var(--border-color)',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                          }}>
                            <FileText size={14} color="var(--accent-primary)" />
                            <span 
                              title={`${fileName} ${fileSize ? `(${fileSize})` : ''}`} 
                              style={{ 
                                fontSize: '0.78rem', 
                                fontWeight: 600, 
                                color: 'var(--text-main)', 
                                maxWidth: '120px', 
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
                              className="btn-icon"
                              style={{ 
                                width: '22px', 
                                height: '22px', 
                                background: '#e0f2fe', 
                                border: '1px solid #bae6fd', 
                                borderRadius: '4px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                color: '#0284c7' 
                              }}
                              title="Download / View Deliverable Document"
                            >
                              <Download size={12} />
                            </button>

                            {/* Employee Replace / Remove Option */}
                            {canEmployeeEditStatus && (
                              <label
                                style={{ 
                                  width: '22px', 
                                  height: '22px', 
                                  background: '#f1f5f9', 
                                  border: '1px solid #cbd5e1', 
                                  borderRadius: '4px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  cursor: 'pointer', 
                                  color: '#475569' 
                                }}
                                title="Replace attached file"
                              >
                                <Upload size={11} />
                                <input 
                                  type="file" 
                                  style={{ display: 'none' }} 
                                  onChange={(e) => handleFileUpload(task, e)} 
                                />
                              </label>
                            )}

                            {canEmployeeEditStatus && (
                              <button
                                type="button"
                                onClick={(e) => handleRemoveFile(task, e)}
                                className="btn-icon"
                                style={{ 
                                  width: '22px', 
                                  height: '22px', 
                                  background: '#fff1f2', 
                                  border: '1px solid #fecdd3', 
                                  borderRadius: '4px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  cursor: 'pointer', 
                                  color: '#e11d48' 
                                }}
                                title="Remove File"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        ) : (
                          canEmployeeEditStatus ? (
                            <label 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: 'var(--accent-primary)',
                                background: 'rgba(99, 102, 241, 0.08)',
                                border: '1px dashed rgba(99, 102, 241, 0.4)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title="Upload completed task file document"
                            >
                              <Upload size={12} />
                              <span>+ Upload File</span>
                              <input 
                                type="file" 
                                style={{ display: 'none' }} 
                                onChange={(e) => handleFileUpload(task, e)}
                              />
                            </label>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                              No file attached
                            </span>
                          )
                        )}
                      </td>

                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.commentsUpdates || task.comments || '—'}
                      </td>

                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => {
                              if (isEmployeeRole) {
                                setEditingEmployeeTask(task);
                                setEmployeeStatusData({
                                  status: task.status || 'Yet to start',
                                  workStartDate: task.workStartDate || task.startDate || task.toBePostedOn || task.date || '',
                                  actualEndDate: task.actualEndDate || task.toBeCompletedOn || new Date().toISOString().split('T')[0],
                                  commentsUpdates: task.commentsUpdates || task.comments || '',
                                  taskFile: task.taskFile || (task.taskFileUrl ? { name: task.taskFileName || 'task-doc', url: task.taskFileUrl } : null)
                                });
                                setIsEmployeeStatusModalOpen(true);
                              } else {
                                setEditingTask(task);
                                setIsTaskModalOpen(true);
                              }
                            }}
                            className="btn btn-secondary btn-icon"
                            style={{ width: '28px', height: '28px' }}
                            title={isEmployeeRole ? "Update Status, File & Comments" : "Edit Task Specs"}
                          >
                            <Edit3 size={13} />
                          </button>

                          {(userRole === 'admin' || hasPermission('admin')) && (
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="btn btn-danger btn-icon"
                              style={{ width: '28px', height: '28px' }}
                              title="Delete Task"
                            >
                              <Trash2 size={13} />
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

      {/* EMPLOYEE QUICK STATUS, FILE & COMMENTS UPDATE MODAL IN TASK DATA GRID */}
      {isEmployeeStatusModalOpen && editingEmployeeTask && (
        <div className="modal-backdrop">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '520px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-card-hover)'
            }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
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
              const isCompleted = employeeStatusData.status === 'Completed';
              const today = new Date().toISOString().split('T')[0];
              const filePayload = employeeStatusData.taskFile;
              updateTask(editingEmployeeTask.id, {
                status: employeeStatusData.status,
                workStartDate: employeeStatusData.workStartDate,
                startDate: employeeStatusData.workStartDate,
                toBePostedOn: employeeStatusData.workStartDate || editingEmployeeTask.toBePostedOn,
                actualEndDate: isCompleted ? (employeeStatusData.actualEndDate || today) : null,
                toBeCompletedOn: isCompleted ? (employeeStatusData.actualEndDate || today) : editingEmployeeTask.toBeCompletedOn,
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
                      actualEndDate: newStatus === 'Completed' ? (employeeStatusData.actualEndDate || new Date().toISOString().split('T')[0]) : employeeStatusData.actualEndDate
                    });
                  }}
                >
                  <option value="Yet to start">⚪ Yet to start</option>
                  <option value="In Progress">🔵 In Progress</option>
                  <option value="Waiting for approval">🟡 Waiting for approval</option>
                  <option value="Completed">🟢 Completed</option>
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

              {/* Task Deliverable Document Upload in Modal */}
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
                    background: 'var(--bg-card-hover)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
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
                    border: '2px dashed var(--border-color)',
                    background: 'var(--bg-card-hover)',
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
                <label className="form-label">Work Updates & Comments</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Add notes about task completion, deliverable highlights, or updates..."
                  value={employeeStatusData.commentsUpdates}
                  onChange={(e) => setEmployeeStatusData({ ...employeeStatusData, commentsUpdates: e.target.value })}
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '12px',
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
                  Save Changes & Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
