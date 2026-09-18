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
  Tag,
  Sparkles,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Play,
  Share2,
  CheckCircle
} from 'lucide-react';
import { uploadFileToServer, downloadFileAttachment } from '../utils/fileUpload';
import { getEmployeeTheme, EMPLOYEE_THEMES } from '../utils/employeeColors';

// Helper to classify Social Media Scheduled Posts (Sheet 2) vs Workflow Tasks (Sheet 1)
const isSocialMediaSchedulePost = (t) => {
  if (!t) return false;
  if (t.sourceSheet === 'social_media_schedule' || t.taskType === 'social_post') return true;
  if (t.id && typeof t.id === 'string' && t.id.startsWith('POST-')) return true;
  if (t.sourceSheet === 'workflow_tasks' || t.taskType === 'task') return false;
  if (t.id && typeof t.id === 'string' && t.id.startsWith('TASK-')) return false;
  if (t.isSocialMediaPost === true) return true;
  if (t.toBePostedOn && t.toBePostedOn.trim().length > 0 && !t.workStartDate) return true;
  return false;
};

// Helper to identify Not Started Yet or Future Works
const isFutureOrNotStarted = (t) => {
  if (!t) return false;
  if (t.status === 'Yet to start' || t.status === 'Backlog') return true;
  const d = t.date || t.toBePostedOn || t.workStartDate || '';
  if (d > '2026-08-31' && t.status !== 'Completed') return true;
  return false;
};

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

  // Admin Dataset Source Tabs: 'all' | 'august' | 'social' | 'future'
  const [adminDatasetTab, setAdminDatasetTab] = useState('all');
  const [isFutureWorksOpen, setIsFutureWorksOpen] = useState(true);

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

  // Dataset Counts for Admin
  const allTasksCount = baseTasks.length;
  const augustTasksCount = useMemo(() => baseTasks.filter(t => !isSocialMediaSchedulePost(t)).length, [baseTasks]);
  const socialTasksCount = useMemo(() => baseTasks.filter(t => isSocialMediaSchedulePost(t)).length, [baseTasks]);

  // Dedicated Future Works & Not Started Tasks collection
  const futureAndUnstartedTasks = useMemo(() => {
    return baseTasks.filter(isFutureOrNotStarted).sort((a, b) => {
      const dateA = a.date || a.workStartDate || a.toBePostedOn || '';
      const dateB = b.date || b.workStartDate || b.toBePostedOn || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.id || '').localeCompare(b.id || '');
    });
  }, [baseTasks]);

  const futureTasksCount = futureAndUnstartedTasks.length;

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
    let list = baseTasks.filter((task) => {
      // 0. Admin Dataset Tab Filter (Applies only for Admin view)
      if (!isEmployeeRole) {
        if (adminDatasetTab === 'august' && isSocialMediaSchedulePost(task)) return false;
        if (adminDatasetTab === 'social' && !isSocialMediaSchedulePost(task)) return false;
        if (adminDatasetTab === 'future' && !isFutureOrNotStarted(task)) return false;
      }

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

    // Sort chronologically by date
    list.sort((a, b) => {
      const dateA = a.date || a.workStartDate || a.toBePostedOn || '';
      const dateB = b.date || b.workStartDate || b.toBePostedOn || '';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.id || '').localeCompare(b.id || '');
    });

    return list;
  }, [baseTasks, isEmployeeRole, adminDatasetTab, localSearch, searchQuery, statusFilter, clientFilter, activityFilter, assigneeFilter, slaFilter, employees]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Task Data Grid</h1>
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

      {/* ADMIN DATASET SOURCE TABS (Minimal & Clean Segmented Control) */}
      {!isEmployeeRole && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '4px',
          background: 'var(--bg-card)',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          maxWidth: '100%',
          overflowX: 'auto'
        }}>
          <button
            type="button"
            onClick={() => setAdminDatasetTab('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              background: adminDatasetTab === 'all' ? 'var(--accent-primary)' : 'transparent',
              color: adminDatasetTab === 'all' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Layers size={13} />
            <span>All Tasks</span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '10px',
              background: adminDatasetTab === 'all' ? 'rgba(255,255,255,0.25)' : 'var(--bg-card-hover)',
              color: adminDatasetTab === 'all' ? '#ffffff' : 'var(--text-main)'
            }}>
              {allTasksCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminDatasetTab('august')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              background: adminDatasetTab === 'august' ? 'var(--accent-primary)' : 'transparent',
              color: adminDatasetTab === 'august' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <FileText size={13} />
            <span>Workflow Tasks</span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '10px',
              background: adminDatasetTab === 'august' ? 'rgba(255,255,255,0.25)' : 'var(--bg-card-hover)',
              color: adminDatasetTab === 'august' ? '#ffffff' : 'var(--text-main)'
            }}>
              {augustTasksCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminDatasetTab('social')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              background: adminDatasetTab === 'social' ? 'var(--accent-primary)' : 'transparent',
              color: adminDatasetTab === 'social' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Share2 size={13} />
            <span>Social Schedule</span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '10px',
              background: adminDatasetTab === 'social' ? 'rgba(255,255,255,0.25)' : 'var(--bg-card-hover)',
              color: adminDatasetTab === 'social' ? '#ffffff' : 'var(--text-main)'
            }}>
              {socialTasksCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAdminDatasetTab('future')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
              background: adminDatasetTab === 'future' ? '#f59e0b' : 'transparent',
              color: adminDatasetTab === 'future' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            <Clock size={13} />
            <span>Upcoming & Unstarted</span>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '10px',
              background: adminDatasetTab === 'future' ? 'rgba(255,255,255,0.25)' : 'var(--bg-card-hover)',
              color: adminDatasetTab === 'future' ? '#ffffff' : 'var(--text-main)'
            }}>
              {futureTasksCount}
            </span>
          </button>
        </div>
      )}

      {/* FILTER & SEARCH TOOLBAR (Minimalist & Clean) */}
      <div className="glass-panel" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px', borderRadius: '12px' }}>
        
        {/* Top Row: Search Input + Results Pill & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search tasks, clients, activities, deliverables or IDs..."
              className="form-input"
              style={{ paddingLeft: '32px', height: '34px', fontSize: '0.82rem', width: '100%', borderRadius: '8px' }}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button 
                onClick={() => setLocalSearch('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Results Badge & Reset Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: '8px',
              background: 'var(--bg-card-hover)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)'
            }}>
              Showing <strong style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{filteredTasks.length}</strong> of {baseTasks.length} tasks
            </span>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#e11d48',
                  borderColor: 'rgba(225, 29, 72, 0.25)',
                  background: 'rgba(225, 29, 72, 0.05)',
                  borderRadius: '8px'
                }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Middle Row: Perfectly Aligned 5-Column Grid of Dropdown Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isEmployeeRole ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '10px',
          width: '100%',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color)'
        }}>
          {/* Status */}
          <select
            className="form-select"
            style={{
              width: '100%',
              height: '36px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              padding: '0 12px',
              borderColor: statusFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
              backgroundColor: statusFilter !== 'All' ? 'rgba(0, 168, 132, 0.08)' : 'var(--bg-card)',
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

          {/* Client */}
          <select
            className="form-select"
            style={{
              width: '100%',
              height: '36px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              padding: '0 12px',
              borderColor: clientFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
              backgroundColor: clientFilter !== 'All' ? 'rgba(0, 168, 132, 0.08)' : 'var(--bg-card)',
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

          {/* Activity */}
          <select
            className="form-select"
            style={{
              width: '100%',
              height: '36px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              padding: '0 12px',
              borderColor: activityFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
              backgroundColor: activityFilter !== 'All' ? 'rgba(0, 168, 132, 0.08)' : 'var(--bg-card)',
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

          {/* Tech Assignee (Admin only) */}
          {!isEmployeeRole && (
            <select
              className="form-select"
              style={{
                width: '100%',
                height: '36px',
                fontSize: '0.82rem',
                borderRadius: '8px',
                padding: '0 12px',
                borderColor: assigneeFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
                backgroundColor: assigneeFilter !== 'All' ? 'rgba(0, 168, 132, 0.08)' : 'var(--bg-card)',
                color: 'var(--text-main)',
                fontWeight: assigneeFilter !== 'All' ? 700 : 500
              }}
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="All">All Tech Specialists ({employees.length})</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.name}
                </option>
              ))}
            </select>
          )}

          {/* SLA Status */}
          <select
            className="form-select"
            style={{
              width: '100%',
              height: '36px',
              fontSize: '0.82rem',
              borderRadius: '8px',
              padding: '0 12px',
              borderColor: slaFilter !== 'All' ? 'var(--accent-primary)' : 'var(--border-color)',
              backgroundColor: slaFilter !== 'All' ? 'rgba(0, 168, 132, 0.08)' : 'var(--bg-card)',
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

        {/* Bottom Row: Minimalist Employee Color Dots Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          paddingTop: '8px',
          borderTop: '1px dashed var(--border-color)',
          fontSize: '0.75rem'
        }}>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="var(--accent-primary)" /> Team:
          </span>
          {Object.values(EMPLOYEE_THEMES).filter(t => t.key !== 'admin').map((th) => (
            <div
              key={th.key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: th.bg,
                border: `1px solid ${th.border}`,
                color: th.text,
                fontWeight: 700,
                fontSize: '0.72rem'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: th.primary }} />
              <span>{th.name.split(' / ')[0]}</span>
            </div>
          ))}
        </div>

      </div>

      {/* DEDICATED ADMIN SECTION: FUTURE WORKS & NOT STARTED TASKS (Admin Section Only) */}
      {!isEmployeeRole && (
        <div 
          className="glass-panel" 
          style={{ 
            padding: '20px', 
            borderRadius: '14px', 
            border: '1.5px solid rgba(245, 158, 11, 0.35)', 
            background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, var(--bg-card) 100%)',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.08)'
          }}
        >
          {/* Section Header with Expand/Collapse */}
          <div 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', cursor: 'pointer' }}
            onClick={() => setIsFutureWorksOpen(!isFutureWorksOpen)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <Clock size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  ⏳ Upcoming Future Works & Not Started Tasks Pipeline
                  <span style={{ fontSize: '0.74rem', padding: '2px 9px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontWeight: 800, border: '1px solid #fde68a' }}>
                    {futureAndUnstartedTasks.length} Pending Execution
                  </span>
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Dedicated section for all assignments not started yet and scheduled future deliverables across all tech team specialists
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsFutureWorksOpen(!isFutureWorksOpen); }}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
              >
                {isFutureWorksOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {isFutureWorksOpen ? 'Collapse Pipeline' : 'Expand Pipeline'}
              </button>
            </div>
          </div>

          {/* Collapsible Section Body */}
          {isFutureWorksOpen && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Quick Pipeline KPI Summary Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e' }}>
                  ⚪ Status 'Yet to start': <strong>{futureAndUnstartedTasks.filter(t => t.status === 'Yet to start').length}</strong>
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}>
                  📱 Future Social Publishing Posts: <strong>{futureAndUnstartedTasks.filter(isSocialMediaSchedulePost).length}</strong>
                </span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#5b21b6' }}>
                  📊 August Workflow Pending: <strong>{futureAndUnstartedTasks.filter(t => !isSocialMediaSchedulePost(t)).length}</strong>
                </span>
              </div>

              {/* Pipeline Tasks Dedicated Table */}
              <div style={{ overflowX: 'auto', maxHeight: '440px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card-hover)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', position: 'sticky', top: 0, zIndex: 2 }}>
                      <th style={{ padding: '10px 12px' }}>s.no</th>
                      <th style={{ padding: '10px 12px' }}>client project</th>
                      <th style={{ padding: '10px 12px' }}>activity</th>
                      <th style={{ padding: '10px 12px' }}>project</th>
                      <th style={{ padding: '10px 12px' }}>core activity</th>
                      <th style={{ padding: '10px 12px' }}>tech names</th>
                      <th style={{ padding: '10px 12px' }}>work started date</th>
                      <th style={{ padding: '10px 12px' }}>target date</th>
                      <th style={{ padding: '10px 12px' }}>actual end date</th>
                      <th style={{ padding: '10px 12px' }}>sla status (G/R)</th>
                      <th style={{ padding: '10px 12px' }}>status</th>
                      <th style={{ padding: '10px 12px' }}>comments updates</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {futureAndUnstartedTasks.length === 0 ? (
                      <tr>
                        <td colSpan={13} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                          <CheckCircle2 size={24} color="#10b981" style={{ display: 'block', margin: '0 auto 6px auto' }} />
                          No pending unstarted tasks! All tasks have been started or completed.
                        </td>
                      </tr>
                    ) : (
                      futureAndUnstartedTasks.map((task, idx) => {
                        const assignee = employees.find((e) => e.id === task.assignedToId);
                        const empTheme = getEmployeeTheme(assignee || task);
                        const isSocial = isSocialMediaSchedulePost(task);
                        const targetDateStr = task.targetEndDate || task.dueDate || task.toBePostedOn || task.date;
                        const actualDateStr = task.actualEndDate || task.toBeCompletedOn || task.completedOn;

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

                        return (
                          <tr
                            key={task.id || idx}
                            className={empTheme.rowClass}
                            style={{
                              borderBottom: '1px solid var(--border-color)',
                              borderLeft: `6px solid ${empTheme.primary}`,
                              backgroundColor: empTheme.bg,
                              transition: 'background 0.15s ease'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = empTheme.bgHover)}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = empTheme.bg)}
                          >
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#000000', textAlign: 'center' }}>
                              {idx + 1}
                            </td>

                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#000000' }}>
                              {task.clientProject || task.client || 'SCS'}
                            </td>

                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#000000' }}>
                              {task.activity || task.format || task.title}
                            </td>

                            <td style={{ padding: '10px 12px', fontWeight: 700, color: '#000000' }}>
                              {task.project || (isSocial ? 'Social Media' : 'Workflow')}
                            </td>

                            <td style={{ padding: '10px 12px', color: '#000000', fontWeight: 600 }}>
                              {task.coreActivity || task.theme || '—'}
                            </td>

                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                fontWeight: 800,
                                color: '#000000',
                                backgroundColor: empTheme.badgeBg,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                border: `1.5px solid ${empTheme.border}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}>
                                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: empTheme.primary }} />
                                {assignee?.name || task.assignedToUsername || task.assignedTo || 'Specialist'}
                              </span>
                            </td>

                            <td style={{ padding: '10px 12px', color: '#000000', fontWeight: 600 }}>
                              {task.workStartDate || task.startDate || task.date || '—'}
                            </td>

                            <td style={{ padding: '10px 12px', color: '#000000', fontWeight: 700 }}>
                              {task.targetEndDate || task.dueDate || task.toBePostedOn || '—'}
                            </td>

                            <td style={{ padding: '10px 12px', color: '#000000', fontWeight: 600 }}>
                              {task.actualEndDate || task.toBeCompletedOn || task.completedOn || '—'}
                            </td>

                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '12px',
                                background: isSlaGreen ? '#bbf7d0' : '#fecdd3',
                                color: isSlaGreen ? '#064e3b' : '#881337',
                                border: `1px solid ${isSlaGreen ? '#86efac' : '#fda4af'}`
                              }}>
                                {isSlaGreen ? '🟩 Green (Met)' : '🟥 Red (Breached)'}
                              </span>
                            </td>

                            <td style={{ padding: '10px 12px' }}>
                              <span className={`badge badge-${(task.status || 'Yet to start').toLowerCase().replace(/\s+/g, '-')}`}>
                                {task.status || 'Yet to start'}
                              </span>
                            </td>

                            <td style={{ padding: '10px 12px', color: '#000000', fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.commentsUpdates || task.comments || '—'}
                            </td>

                            <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    updateTask(task.id, {
                                      status: 'In Progress',
                                      workStartDate: task.workStartDate || today,
                                      startDate: task.startDate || today
                                    });
                                  }}
                                  className="btn btn-primary"
                                  style={{ padding: '3px 9px', fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                                  title="Start this task now"
                                >
                                  <Play size={11} /> Start
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}
                                  className="btn btn-secondary btn-icon"
                                  style={{ width: '26px', height: '26px' }}
                                  title="Edit task specifications"
                                >
                                  <Edit3 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

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
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 10px' }}>s.no</th>
                  <th style={{ padding: '12px 10px' }}>client project</th>
                  <th style={{ padding: '12px 10px' }}>activity</th>
                  <th style={{ padding: '12px 10px' }}>project</th>
                  <th style={{ padding: '12px 10px' }}>core activity</th>
                  <th style={{ padding: '12px 10px' }}>tech names</th>
                  <th style={{ padding: '12px 10px' }}>work started date</th>
                  <th style={{ padding: '12px 10px' }}>target date</th>
                  <th style={{ padding: '12px 10px' }}>actual end date</th>
                  <th style={{ padding: '12px 10px' }}>sla status (G/R)</th>
                  <th style={{ padding: '12px 10px' }}>status</th>
                  <th style={{ padding: '12px 10px' }}>comments updates</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, idx) => {
                  const assignee = employees.find((e) => e.id === task.assignedToId);
                  const empTheme = getEmployeeTheme(assignee || task);
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
                      className={empTheme.rowClass}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        borderLeft: `6px solid ${empTheme.primary}`,
                        backgroundColor: empTheme.bg,
                        transition: 'background 0.2s ease' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = empTheme.bgHover}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = empTheme.bg}
                    >
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#000000', textAlign: 'center' }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#000000' }}>
                        {task.clientProject || 'Internal Project'}
                      </td>

                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#000000' }}>
                        {task.activity || task.title}
                      </td>

                      <td style={{ padding: '12px 10px', color: '#000000', fontWeight: 700 }}>
                        {task.project || 'Engineering'}
                      </td>

                      <td style={{ padding: '12px 10px', color: '#000000', fontWeight: 600 }}>
                        {task.coreActivity || '—'}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          fontWeight: 800,
                          color: '#000000',
                          backgroundColor: empTheme.badgeBg,
                          padding: '3px 10px',
                          borderRadius: '12px',
                          border: `1.5px solid ${empTheme.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: empTheme.primary }} />
                          {assignee?.name || task.assignedToUsername || task.assignedTo || 'Specialist'}
                        </span>
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
                                background: '#ffffff',
                                color: '#000000',
                                fontWeight: 700
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
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#000000', padding: '2px 4px', fontSize: '0.75rem' }}
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#000000', fontWeight: 600 }}>
                            {task.workStartDate || task.startDate || 'N/A'}
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ color: '#000000', fontWeight: 700 }}>{task.targetEndDate || task.dueDate || 'N/A'}</span>
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
                            <span style={{ color: '#000000', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                              <CalendarCheck size={13} color={isSlaGreen ? '#059669' : '#e11d48'} /> {task.actualEndDate || task.toBeCompletedOn || task.completedOn}
                            </span>
                          ) : (
                            <span style={{ color: '#000000', opacity: 0.75, fontStyle: 'italic', fontSize: '0.78rem' }}>Pending</span>
                          )
                        )}
                      </td>

                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: isSlaGreen ? '#bbf7d0' : '#fecdd3',
                          color: isSlaGreen ? '#064e3b' : '#881337',
                          border: `1px solid ${isSlaGreen ? '#86efac' : '#fda4af'}`
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

                      {/* Comments / Updates Column */}
                      <td style={{ padding: '12px 10px', color: '#000000', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span>{task.commentsUpdates || task.comments || '—'}</span>
                          {hasFile && (
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(task)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '2px 6px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: '#e0f2fe',
                                border: '1px solid #bae6fd',
                                borderRadius: '4px',
                                color: '#0284c7',
                                cursor: 'pointer'
                              }}
                              title={`Download ${fileName}`}
                            >
                              <Paperclip size={10} /> Attachment
                            </button>
                          )}
                        </div>
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
