import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCrm } from '../context/CrmContext';
import {
  Calendar as CalendarIcon,
  Grid,
  Plus,
  Search,
  Filter,
  Lock,
  User,
  Mail,
  CheckCircle2,
  Clock,
  Share2,
  Globe,
  Video,
  Image as ImageIcon,
  Layers,
  Edit3,
  Trash2,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  FileText,
  Paperclip,
  Eye,
  Check,
  Tag,
  Sparkles,
  GripVertical,
  Move,
  ListTodo,
  AlertCircle,
  TrendingUp,
  Award,
  CalendarDays,
  Target,
  Briefcase,
  SlidersHorizontal,
  FolderGit2
} from 'lucide-react';
import { uploadFileToServer, downloadFileAttachment } from '../utils/fileUpload';
import { getEmployeeTheme, EMPLOYEE_THEMES } from '../utils/employeeColors';

export const SocialMediaCalendarView = ({ initialMode = 'social' }) => {
  const {
    tasks = [],
    addTask,
    updateTask,
    deleteTask,
    employees = [],
    currentUser,
    userRole,
    hasPermission,
    currentTab,
    setCurrentTab,
    CLIENT_PROJECT_OPTIONS,
    STATUS_OPTIONS,
    CORE_ACTIVITY_OPTIONS,
    FORMAT_OPTIONS,
    THEME_OPTIONS
  } = useCrm();

  // Active Calendar Mode: 'social' (Social Media Posts strictly on toBePostedOn) | 'tasks' (Daily Workflow Tasks by work execution date)
  const [calendarType, setCalendarType] = useState(() => {
    if (initialMode === 'tasks' || currentTab === 'task-calendar') return 'tasks';
    return 'social';
  });

  useEffect(() => {
    if (currentTab === 'task-calendar') {
      setCalendarType('tasks');
    } else if (currentTab === 'social-media-calendar') {
      setCalendarType('social');
    }
  }, [currentTab]);

  const handleSwitchCalendarType = (type) => {
    setCalendarType(type);
    if (setCurrentTab) {
      setCurrentTab(type === 'tasks' ? 'task-calendar' : 'social-media-calendar');
    }
  };

  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'grid'
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('All');
  const [selectedClientFilter, setSelectedClientFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  // Drag and Drop States for Calendar Month Matrix
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);

  // Month Matrix dynamic calendar calculations
  const { year, monthNum, monthName, daysInMonth, startOffset, daysList } = useMemo(() => {
    const [yStr, mStr] = (currentCalendarMonth || '2026-08').split('-');
    const y = parseInt(yStr, 10) || new Date().getFullYear();
    const m = parseInt(mStr, 10) || (new Date().getMonth() + 1); // 1-12
    const dateObj = new Date(y, m - 1, 1);
    const mName = dateObj.toLocaleString('en-US', { month: 'long' });
    const countDays = new Date(y, m, 0).getDate();
    const rawDay = new Date(y, m - 1, 1).getDay(); // 0 = Sun
    const offset = rawDay;

    return {
      year: y,
      monthNum: m,
      monthName: mName,
      daysInMonth: countDays,
      startOffset: offset,
      daysList: Array.from({ length: countDays }, (_, i) => i + 1)
    };
  }, [currentCalendarMonth]);

  const handlePrevMonth = () => {
    let [y, m] = currentCalendarMonth.split('-').map(Number);
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setCurrentCalendarMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let [y, m] = currentCalendarMonth.split('-').map(Number);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setCurrentCalendarMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleResetToCurrentMonth = () => {
    const today = new Date();
    setCurrentCalendarMonth(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`);
  };

  // Robust Classifier: Strictly distinguish between Sheet 2 (Social Media Publishing Schedule) and Sheet 1 (Daily Workflow Tasks)
  const isSocialMediaSchedulePost = (t) => {
    if (!t) return false;
    // 1. Explicit source sheet or post ID from Sheet 2
    if (t.sourceSheet === 'social_media_schedule' || t.taskType === 'social_post') return true;
    if (t.id && typeof t.id === 'string' && t.id.startsWith('POST-')) return true;
    if (t.sourceSheet === 'workflow_tasks' || t.taskType === 'task') return false;
    if (t.id && typeof t.id === 'string' && t.id.startsWith('TASK-')) return false;
    
    // Explicit flags
    if (t.isSocialMediaPost === true) return true;
    if (t.isSocialMediaPost === false) return false;

    // Secondary check for new items created in UI
    if (t.toBePostedOn && t.toBePostedOn.trim().length > 0 && !t.workStartDate) return true;

    return false;
  };

  // Helper to reliably resolve employee information
  const getAssignedEmployee = (task) => {
    let emp = null;
    if (task.assignedToId) {
      emp = employees.find(e => e.id?.toLowerCase() === task.assignedToId.toLowerCase());
    }
    if (!emp && task.assignedToEmail) {
      emp = employees.find(e => e.email?.toLowerCase().trim() === task.assignedToEmail.toLowerCase().trim());
    }
    if (!emp && (task.assignedToUsername || task.assignedTo)) {
      const pName = (task.assignedToUsername || task.assignedTo || '').toLowerCase().trim();
      emp = employees.find(e => {
        const eName = (e.name || '').toLowerCase().trim();
        return pName === eName || pName.includes(eName) || eName.includes(pName);
      });
    }

    const effectiveName = emp?.name || task.assignedToUsername || task.assignedTo || 'Specialist';
    const effectiveEmail = emp?.email || task.assignedToEmail || '';
    const effectiveAvatar = emp?.avatar || '';

    return {
      id: emp?.id || task.assignedToId || '',
      name: effectiveName,
      email: effectiveEmail,
      avatar: effectiveAvatar,
      role: emp?.role || 'Specialist'
    };
  };

  // Strictly segregate tasks: Social Media Publishing Schedule vs Daily Workflow Tasks
  const { allSocialMediaPosts, allGeneralTasks } = useMemo(() => {
    const social = [];
    const general = [];

    tasks.forEach(t => {
      if (isSocialMediaSchedulePost(t)) {
        social.push(t);
      } else {
        general.push(t);
      }
    });

    return { allSocialMediaPosts: social, allGeneralTasks: general };
  }, [tasks]);

  // Filter items based on active Calendar Mode (Social Media vs General Tasks) with RBAC & search
  const displayedItems = useMemo(() => {
    let list = calendarType === 'social' ? allSocialMediaPosts : allGeneralTasks;

    // 1. RBAC Filter: If user is employee, strictly filter to ONLY tasks assigned to this employee
    if (userRole === 'employee') {
      const userEmail = (currentUser?.email || '').toLowerCase().trim();
      const userName = (currentUser?.name || '').toLowerCase().trim();
      const userId = (currentUser?.id || '').toLowerCase().trim();

      list = list.filter((t) => {
        const tId = (t.assignedToId || '').toLowerCase().trim();
        const tEmail = (t.assignedToEmail || '').toLowerCase().trim();
        const tUser = (t.assignedToUsername || t.assignedTo || '').toLowerCase().trim();

        if (userId && tId === userId) return true;
        if (userEmail && (tEmail === userEmail || (userEmail.includes('johncy') && tUser.includes('johncy')))) return true;
        if (userName && (tUser === userName || tUser.includes(userName) || userName.includes(tUser))) return true;
        return false;
      });
    }

    // 2. Admin Employee Filter dropdown
    if (userRole === 'admin' && selectedEmployeeFilter !== 'All') {
      list = list.filter((t) => {
        const emp = getAssignedEmployee(t);
        return t.assignedToId === selectedEmployeeFilter || emp.id === selectedEmployeeFilter || emp.email.toLowerCase() === selectedEmployeeFilter.toLowerCase();
      });
    }

    // 3. Client Filter
    if (selectedClientFilter !== 'All') {
      list = list.filter((t) => (t.clientProject || t.client || '').toLowerCase() === selectedClientFilter.toLowerCase());
    }

    // 4. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => {
        const emp = getAssignedEmployee(t);
        return (
          (t.commentsUpdates && t.commentsUpdates.toLowerCase().includes(q)) ||
          (t.comments && t.comments.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.clientProject && t.clientProject.toLowerCase().includes(q)) ||
          (t.activity && t.activity.toLowerCase().includes(q)) ||
          (t.platform && t.platform.toLowerCase().includes(q)) ||
          (t.theme && t.theme.toLowerCase().includes(q)) ||
          (t.id && t.id.toLowerCase().includes(q)) ||
          (emp.name && emp.name.toLowerCase().includes(q)) ||
          (emp.email && emp.email.toLowerCase().includes(q))
        );
      });
    }

    return list;
  }, [calendarType, allSocialMediaPosts, allGeneralTasks, userRole, currentUser, selectedEmployeeFilter, selectedClientFilter, searchQuery]);

  // Handle Drag & Drop Rescheduling
  const handleDropOnDate = (taskId, targetDateStr, targetDayNum) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    if (calendarType === 'social') {
      updateTask(taskId, {
        toBePostedOn: targetDateStr,
        date: targetDateStr
      });
      const taskLabel = targetTask.description || targetTask.title || targetTask.format || targetTask.activity || 'Post';
      setToastNotice(`✓ Rescheduled post "${taskLabel}" posting date to ${monthName.slice(0, 3)} ${targetDayNum}, ${year}`);
    } else {
      updateTask(taskId, {
        workStartDate: targetDateStr,
        date: targetDateStr,
        targetEndDate: targetDateStr
      });
      const taskLabel = targetTask.description || targetTask.title || targetTask.activity || 'Task';
      setToastNotice(`✓ Rescheduled task "${taskLabel}" work date to ${monthName.slice(0, 3)} ${targetDayNum}, ${year}`);
    }

    setTimeout(() => setToastNotice(null), 3500);
  };

  // Modal state for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // File Preview Modal
  const [previewFile, setPreviewFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    date: '2026-08-01',
    targetEndDate: '2026-08-01',
    scheduledTime: '10:00',
    clientProject: CLIENT_PROJECT_OPTIONS?.[0] || 'SCS',
    platform: 'Instagram',
    activity: 'Static Poster',
    theme: 'Digital Marketing',
    coreActivity: 'Social Media Content',
    titleTopic: '',
    captionCopy: '',
    mediaUrl: '',
    assignedToId: employees[0]?.id || '',
    assignedToEmail: employees[0]?.email || '',
    assignedToUsername: employees[0]?.name || '',
    status: 'In Progress',
    slaStatus: 'Green',
    estimatedHours: 4,
    taskFile: null
  });

  const handleOpenCreateModal = (dateStr = null) => {
    setEditingPost(null);
    const defaultEmp = employees[0];
    const initialDate = dateStr || `${currentCalendarMonth}-01`;

    if (calendarType === 'social') {
      setFormData({
        date: initialDate,
        targetEndDate: initialDate,
        scheduledTime: '10:00',
        clientProject: CLIENT_PROJECT_OPTIONS?.[0] || 'SCS',
        platform: 'Instagram',
        activity: 'Static Poster',
        theme: 'Digital Marketing',
        coreActivity: 'Social Media Content',
        titleTopic: '',
        captionCopy: '',
        mediaUrl: '',
        assignedToId: defaultEmp?.id || '',
        assignedToEmail: defaultEmp?.email || '',
        assignedToUsername: defaultEmp?.name || '',
        status: 'In Progress',
        slaStatus: 'Green',
        estimatedHours: 4,
        taskFile: null
      });
    } else {
      setFormData({
        date: initialDate,
        targetEndDate: initialDate,
        scheduledTime: '09:30',
        clientProject: CLIENT_PROJECT_OPTIONS?.[0] || 'SCS',
        platform: 'Web/System',
        activity: 'Website UI',
        theme: 'CRM',
        coreActivity: 'Web & Search Visibility',
        titleTopic: '',
        captionCopy: '',
        mediaUrl: '',
        assignedToId: defaultEmp?.id || '',
        assignedToEmail: defaultEmp?.email || '',
        assignedToUsername: defaultEmp?.name || '',
        status: 'In Progress',
        slaStatus: 'Green',
        estimatedHours: 6,
        taskFile: null
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingPost(item);
    const emp = getAssignedEmployee(item);
    const itemDate = calendarType === 'social'
      ? (item.toBePostedOn || item.date || `${currentCalendarMonth}-01`)
      : (item.workStartDate || item.date || `${currentCalendarMonth}-01`);

    setFormData({
      date: itemDate,
      targetEndDate: item.targetEndDate || itemDate,
      scheduledTime: item.scheduledTime || '10:00',
      clientProject: item.clientProject || item.client || CLIENT_PROJECT_OPTIONS?.[0] || 'SCS',
      platform: item.platform || (item.clientProject === 'SCS' ? 'LinkedIn' : 'Instagram'),
      activity: item.format || item.activity || (calendarType === 'social' ? 'Static Poster' : 'Website UI'),
      theme: item.theme || item.coreActivity || (calendarType === 'social' ? 'Digital Marketing' : 'CRM'),
      coreActivity: item.coreActivity || (calendarType === 'social' ? 'Social Media Content' : 'Web & Search Visibility'),
      titleTopic: item.description || item.title || item.project || '',
      captionCopy: item.comments || item.commentsUpdates || '',
      mediaUrl: item.mediaUrl || item.reference || '',
      assignedToId: emp.id || employees[0]?.id || '',
      assignedToEmail: emp.email,
      assignedToUsername: emp.name,
      status: item.status || 'In Progress',
      slaStatus: item.slaStatus || 'Green',
      estimatedHours: item.estimatedHours || (calendarType === 'social' ? 4 : 6),
      taskFile: item.taskFile || (item.taskFileUrl ? { name: item.taskFileName || 'deliverable-doc', url: item.taskFileUrl } : null)
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const assignedEmp = employees.find(e => e.id === formData.assignedToId) || employees[0];
    const isSocial = calendarType === 'social';

    const payload = {
      date: formData.date,
      toBePostedOn: isSocial ? formData.date : '',
      workStartDate: formData.date,
      targetEndDate: formData.targetEndDate || formData.date,
      scheduledTime: formData.scheduledTime,
      clientProject: formData.clientProject,
      platform: formData.platform,
      activity: formData.activity,
      format: formData.activity,
      theme: formData.theme,
      coreActivity: isSocial ? 'Social Media Content' : (formData.coreActivity || 'Others'),
      project: formData.titleTopic || (isSocial ? `SM-${Date.now().toString().slice(-4)}` : `TASK-${Date.now().toString().slice(-4)}`),
      description: formData.titleTopic || formData.activity,
      title: formData.titleTopic,
      comments: formData.captionCopy,
      commentsUpdates: formData.captionCopy,
      assignedToId: assignedEmp ? assignedEmp.id : formData.assignedToId,
      assignedToEmail: assignedEmp ? assignedEmp.email : formData.assignedToEmail,
      assignedToUsername: assignedEmp ? assignedEmp.name : formData.assignedToUsername,
      assignedTo: assignedEmp ? assignedEmp.name : formData.assignedToUsername,
      mediaUrl: formData.mediaUrl,
      reference: formData.mediaUrl,
      status: formData.status,
      actualEndDate: formData.status === 'Completed' ? formData.date : null,
      slaStatus: formData.slaStatus,
      estimatedHours: Number(formData.estimatedHours) || 4,
      taskFile: formData.taskFile,
      taskFileName: formData.taskFile ? formData.taskFile.name : '',
      taskFileUrl: formData.taskFile ? formData.taskFile.url : ''
    };

    if (editingPost) {
      updateTask(editingPost.id, payload);
    } else {
      addTask(payload);
    }

    setIsModalOpen(false);
  };

  const handleTableFileUpload = async (taskItem, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedDoc = await uploadFileToServer(file);
      if (uploadedDoc) {
        updateTask(taskItem.id, {
          taskFile: uploadedDoc,
          taskFileName: uploadedDoc.name,
          taskFileUrl: uploadedDoc.url
        });
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleModalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedDoc = await uploadFileToServer(file);
      if (uploadedDoc) {
        setFormData(prev => ({
          ...prev,
          taskFile: uploadedDoc
        }));
      }
    } catch (err) {
      console.error('Modal file upload failed:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const getPlatformBadge = (platformName) => {
    const p = (platformName || '').toLowerCase();
    if (p.includes('instagram')) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(225, 48, 108, 0.12)', color: '#e1306c', fontSize: '0.74rem', fontWeight: 700 }}>
          <Share2 size={12} /> Instagram
        </span>
      );
    }
    if (p.includes('linkedin')) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(10, 102, 194, 0.12)', color: '#0a66c2', fontSize: '0.74rem', fontWeight: 700 }}>
          <Globe size={12} /> LinkedIn
        </span>
      );
    }
    if (p.includes('facebook')) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(24, 119, 242, 0.12)', color: '#1877f2', fontSize: '0.74rem', fontWeight: 700 }}>
          <Share2 size={12} /> Facebook
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '6px', background: 'rgba(100, 116, 139, 0.12)', color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: 700 }}>
        <Globe size={12} /> {platformName || 'General'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('completed') || s.includes('done')) {
      return <span className="status-pill status-pill-optimal">✓ Completed</span>;
    }
    if (s.includes('progress')) {
      return <span className="status-pill status-pill-progress">⚡ In Progress</span>;
    }
    if (s.includes('approval') || s.includes('review')) {
      return <span className="status-pill status-pill-warning">⏳ Approval</span>;
    }
    if (s.includes('hold')) {
      return <span className="status-pill status-pill-risk">⏸ On Hold</span>;
    }
    return <span className="status-pill" style={{ background: '#f1f5f9', color: '#64748b' }}>Yet to start</span>;
  };

  const isSocial = calendarType === 'social';
  const themeColor = isSocial ? 'var(--accent-primary)' : '#3b82f6';

  return (
    <div className="calendar-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast notification */}
      {toastNotice && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <Sparkles size={16} color="#a5b4fc" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP SEGREGATION SWITCHER BAR                                           */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Left: Two Clear Tab Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* TAB 1: SOCIAL MEDIA CALENDAR */}
          <button
            onClick={() => handleSwitchCalendarType('social')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: isSocial ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
              backgroundColor: isSocial ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
              color: isSocial ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: isSocial ? '0 4px 14px rgba(0, 168, 132, 0.3)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            <Share2 size={18} />
            <span>Social Media Calendar</span>
            <span style={{
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: '14px',
              backgroundColor: isSocial ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 168, 132, 0.12)',
              color: isSocial ? '#ffffff' : 'var(--accent-primary)',
              fontWeight: 800
            }}>
              {allSocialMediaPosts.length} Posts
            </span>
          </button>

          {/* TAB 2: GENERAL TASKS CALENDAR */}
          <button
            onClick={() => handleSwitchCalendarType('tasks')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              borderRadius: '12px',
              border: !isSocial ? '2px solid #3b82f6' : '1px solid var(--border-color)',
              backgroundColor: !isSocial ? '#3b82f6' : 'var(--bg-card-hover)',
              color: !isSocial ? '#ffffff' : 'var(--text-main)',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: !isSocial ? '0 4px 14px rgba(59, 130, 246, 0.3)' : 'none',
              transition: 'all 0.18s ease'
            }}
          >
            <ListTodo size={18} />
            <span>Tasks Calendar</span>
            <span style={{
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: '14px',
              backgroundColor: !isSocial ? 'rgba(255, 255, 255, 0.28)' : 'rgba(59, 130, 246, 0.12)',
              color: !isSocial ? '#ffffff' : '#3b82f6',
              fontWeight: 800
            }}>
              {allGeneralTasks.length} Tasks
            </span>
          </button>

        </div>

        {/* Right: Matrix vs Sheet View & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Matrix vs Sheet View */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-card-hover)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'calendar' ? themeColor : 'transparent',
                color: viewMode === 'calendar' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: viewMode === 'calendar' ? '0 1px 4px rgba(0, 0, 0, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <CalendarIcon size={14} /> Month Matrix
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? themeColor : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0, 0, 0, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <Grid size={14} /> Spreadsheet Grid
            </button>
          </div>

          {/* Add Entry Button */}
          <button
            onClick={() => handleOpenCreateModal()}
            className="btn btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: themeColor,
              boxShadow: isSocial ? '0 2px 10px rgba(0, 168, 132, 0.35)' : '0 2px 10px rgba(59, 130, 246, 0.35)'
            }}
          >
            <Plus size={16} /> {isSocial ? '+ Schedule Social Post' : '+ Create Task'}
          </button>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. CONTEXT BANNER & SEARCH/FILTER TOOLBAR                                */}
      {/* ========================================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '14px 20px',
        borderRadius: '12px',
        background: isSocial ? 'rgba(0, 168, 132, 0.07)' : 'rgba(59, 130, 246, 0.07)',
        border: isSocial ? '1px solid rgba(0, 168, 132, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        
        {/* Banner Left Description */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: themeColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            {isSocial ? <Share2 size={18} /> : <CalendarDays size={18} />}
          </div>
          <div>
            <div style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {isSocial ? 'Social Media Content & Publishing Schedule' : 'Daily General Workflow & Task Operations'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isSocial
                ? 'Strictly contains scheduled Social Media posts placed on their publishing date (To Be Posted On)'
                : 'Contains day-to-day workflow, web development, e-commerce and operational tasks mapped by execution date'}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={isSocial ? "Search posts, captions..." : "Search tasks, scope..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
            />
          </div>

          {/* Client Filter */}
          {CLIENT_PROJECT_OPTIONS && CLIENT_PROJECT_OPTIONS.length > 0 && (
            <select
              className="form-select"
              style={{ height: '34px', padding: '2px 8px', fontSize: '0.8rem', minWidth: '140px' }}
              value={selectedClientFilter}
              onChange={(e) => setSelectedClientFilter(e.target.value)}
            >
              <option value="All">🏢 All Brands</option>
              {CLIENT_PROJECT_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {/* Admin Employee Filter */}
          {hasPermission('admin') && (
            <select
              className="form-select"
              style={{ height: '34px', padding: '2px 8px', fontSize: '0.8rem', minWidth: '170px' }}
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
            >
              <option value="All">👥 All Specialists</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.name}
                </option>
              ))}
            </select>
          )}

        </div>

      </div>

      {/* EMPLOYEE COLOR THEME LEGEND */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        padding: '10px 16px',
        background: 'var(--bg-card)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        fontSize: '0.8rem'
      }}>
        <span style={{ fontWeight: 700, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Sparkles size={14} color="var(--accent-primary)" /> Specialist Color Legend:
        </span>
        {Object.values(EMPLOYEE_THEMES).filter(t => t.key !== 'admin').map((th) => (
          <div
            key={th.key}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: th.bg,
              border: `1.5px solid ${th.primary}`,
              color: th.text,
              fontWeight: 700,
              fontSize: '0.76rem'
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: th.primary }} />
            <span>{th.name}</span>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 3. CALENDAR MONTH MATRIX VIEW                                             */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="glass-panel" style={{
          padding: '24px',
          color: 'var(--text-main)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          borderRadius: '16px'
        }}>

          {/* Month Header & Controls Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '18px',
            borderBottom: '1.5px solid var(--border-color)'
          }}>
            
            {/* Giant Month & Year Header with Navigation */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{
                  fontSize: '2.4rem',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: 'var(--text-main)',
                  margin: 0
                }}>
                  {monthName}
                </h1>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  color: themeColor,
                  margin: 0,
                  letterSpacing: '-0.02em',
                  lineHeight: 1
                }}>
                  {year}
                </h2>
              </div>

              {/* Month Navigation Arrows */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `1.5px solid ${themeColor}`,
                    background: 'var(--bg-card-hover)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeColor,
                    transition: 'all 0.15s ease'
                  }}
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextMonth}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: `1.5px solid ${themeColor}`,
                    background: 'var(--bg-card-hover)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: themeColor,
                    transition: 'all 0.15s ease'
                  }}
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Drag instruction helper notice */}
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                color: themeColor,
                background: isSocial ? 'rgba(0, 168, 132, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                padding: '5px 12px',
                borderRadius: '20px',
                border: isSocial ? '1px solid rgba(0, 168, 132, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Move size={12} /> Drag & drop items to reschedule dates
              </span>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleResetToCurrentMonth}
                style={{
                  padding: '7px 14px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-card-hover)',
                  color: 'var(--text-main)',
                  border: '1.5px solid var(--border-color)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Current Month
              </button>
            </div>
          </div>

          {/* THE CALENDAR MATRIX */}
          <div style={{ minWidth: 0, width: '100%' }}>

            {/* Weekday Solid Pill Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
              gap: '8px',
              marginBottom: '14px',
              width: '100%'
            }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
                <div
                  key={d}
                  style={{
                    backgroundColor: themeColor,
                    color: '#ffffff',
                    padding: '8px 0',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '0.06em',
                    minWidth: 0,
                    boxShadow: isSocial ? '0 2px 5px rgba(0, 168, 132, 0.2)' : '0 2px 5px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid Matrix */}
            {(() => {
              const firstDaySunFirst = new Date(year, monthNum - 1, 1).getDay(); // 0 = Sun
              const prevMonthDaysCount = new Date(year, monthNum - 1, 0).getDate();
              
              const totalCellsNeeded = Math.ceil((firstDaySunFirst + daysInMonth) / 7) * 7;
              const weeksCount = totalCellsNeeded / 7;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  {Array.from({ length: weeksCount }).map((_, weekIdx) => (
                    <div
                      key={`week-row-${weekIdx}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                        gap: '8px',
                        paddingTop: '10px',
                        paddingBottom: '14px',
                        borderBottom: weekIdx === weeksCount - 1 ? `3px double ${themeColor}` : '1px solid var(--border-color)',
                        minHeight: '115px'
                      }}
                    >
                      {Array.from({ length: 7 }).map((_, colIdx) => {
                        const slotIndex = weekIdx * 7 + colIdx;
                        const dayNumber = slotIndex - firstDaySunFirst + 1;
                        const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

                        let displayDay = '';
                        let cellDateStr = '';

                        if (isCurrentMonth) {
                          displayDay = dayNumber;
                          const dPad = dayNumber < 10 ? '0' + dayNumber : `${dayNumber}`;
                          const mPad = monthNum < 10 ? '0' + monthNum : `${monthNum}`;
                          cellDateStr = `${year}-${mPad}-${dPad}`;
                        } else if (dayNumber < 1) {
                          displayDay = prevMonthDaysCount + dayNumber;
                        } else {
                          displayDay = dayNumber - daysInMonth;
                        }

                        // Filter items that land on this cell date:
                        // - Social Calendar: strictly matches toBePostedOn || date
                        // - Tasks Calendar: strictly matches workStartDate || date || targetEndDate
                        const dayItems = isCurrentMonth
                          ? displayedItems.filter((item) => {
                              const itemDate = isSocial
                                ? (item.toBePostedOn || '')
                                : (item.workStartDate || item.date || item.targetEndDate || (item.createdAt ? item.createdAt.split('T')[0] : ''));

                              const dPad = dayNumber < 10 ? '0' + dayNumber : `${dayNumber}`;
                              const mPad = monthNum < 10 ? '0' + monthNum : `${monthNum}`;
                              return itemDate === cellDateStr || (itemDate.startsWith(`${year}-${mPad}`) && itemDate.endsWith(`-${dPad}`));
                            })
                          : [];

                        const isDropTarget = isCurrentMonth && dragOverDate === cellDateStr;

                        return (
                          <div
                            key={`cell-${slotIndex}`}
                            onClick={() => {
                              if (isCurrentMonth) handleOpenCreateModal(cellDateStr);
                            }}
                            onDragOver={(e) => {
                              if (!isCurrentMonth) return;
                              e.preventDefault();
                              e.stopPropagation();
                              e.dataTransfer.dropEffect = 'move';
                              if (dragOverDate !== cellDateStr) setDragOverDate(cellDateStr);
                            }}
                            onDragEnter={(e) => {
                              if (!isCurrentMonth) return;
                              e.preventDefault();
                              e.stopPropagation();
                              setDragOverDate(cellDateStr);
                            }}
                            onDragLeave={(e) => {
                              if (!isCurrentMonth) return;
                              e.preventDefault();
                              e.stopPropagation();
                              if (e.currentTarget.contains(e.relatedTarget)) return;
                              setDragOverDate(null);
                            }}
                            onDrop={(e) => {
                              if (!isCurrentMonth) return;
                              e.preventDefault();
                              e.stopPropagation();
                              const droppedId = e.dataTransfer.getData('text/plain') || draggedTaskId;
                              if (droppedId) {
                                handleDropOnDate(droppedId, cellDateStr, dayNumber);
                              }
                              setDragOverDate(null);
                              setDraggedTaskId(null);
                            }}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              minWidth: 0,
                              width: '100%',
                              boxSizing: 'border-box',
                              padding: '5px',
                              borderRadius: '8px',
                              cursor: isCurrentMonth ? 'pointer' : 'default',
                              backgroundColor: isDropTarget ? (isSocial ? 'rgba(0, 168, 132, 0.15)' : 'rgba(59, 130, 246, 0.15)') : 'transparent',
                              border: isDropTarget ? `2px dashed ${themeColor}` : 'none',
                              transition: 'all 0.12s ease'
                            }}
                          >
                            {/* Day Number Badge */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
                              {isCurrentMonth ? (
                                <div style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  backgroundColor: dayItems.length > 0 ? themeColor : 'var(--bg-card-hover)',
                                  color: dayItems.length > 0 ? '#ffffff' : 'var(--text-main)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  boxShadow: dayItems.length > 0 ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                                  border: dayItems.length === 0 ? '1px solid var(--border-color)' : 'none',
                                  flexShrink: 0
                                }}>
                                  {displayDay}
                                </div>
                              ) : (
                                <span style={{
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  color: 'var(--text-dim)',
                                  paddingLeft: '6px'
                                }}>
                                  {displayDay}
                                </span>
                              )}
                            </div>

                            {/* Drop Target Indicator */}
                            {isDropTarget && (
                              <div style={{
                                padding: '3px 4px',
                                borderRadius: '4px',
                                backgroundColor: themeColor,
                                color: '#fff',
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                textAlign: 'center',
                                animation: 'pulse 1s infinite',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden'
                              }}>
                                Drop here
                              </div>
                            )}

                            {/* Cards in Cell */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, width: '100%' }}>
                              {dayItems.map((item) => {
                                const emp = getAssignedEmployee(item);
                                const empTheme = getEmployeeTheme(emp || item);
                                const isBeingDragged = draggedTaskId === item.id;
                                const itemTitle = item.description || item.title || item.format || item.activity || (isSocial ? 'Social Post' : 'Workflow Task');

                                return (
                                  <div
                                    key={item.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      setDraggedTaskId(item.id);
                                      e.dataTransfer.setData('text/plain', item.id);
                                      e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onDragEnd={(e) => {
                                      e.stopPropagation();
                                      setDraggedTaskId(null);
                                      setDragOverDate(null);
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditModal(item);
                                    }}
                                    style={{
                                      padding: '6px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: isBeingDragged ? 'var(--border-color)' : empTheme.bg,
                                      border: `1px solid ${empTheme.border}`,
                                      borderLeft: `4px solid ${empTheme.primary}`,
                                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                      cursor: 'grab',
                                      opacity: isBeingDragged ? 0.35 : 1,
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '3px',
                                      minWidth: 0,
                                      width: '100%',
                                      boxSizing: 'border-box',
                                      transition: 'all 0.15s ease'
                                    }}
                                    title="Drag to reschedule, click to edit"
                                  >
                                    {/* Top Line: Platform / Format in Social vs Task ID / SLA in General */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                      {isSocial ? (
                                        <span style={{ fontSize: '0.66rem', fontWeight: 800, color: empTheme.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          ⚡ {item.format || item.activity || 'Poster'}
                                        </span>
                                      ) : (
                                        <span style={{ fontSize: '0.66rem', fontWeight: 800, color: empTheme.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {item.id || 'TASK'}
                                        </span>
                                      )}

                                      {/* SLA Badge in General vs Platform Tag in Social */}
                                      {!isSocial && (
                                        <span style={{
                                          fontSize: '0.6rem',
                                          fontWeight: 800,
                                          padding: '1px 4px',
                                          borderRadius: '3px',
                                          backgroundColor: item.slaStatus === 'Red' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                          color: item.slaStatus === 'Red' ? '#ef4444' : '#10b981'
                                        }}>
                                          {item.slaStatus || 'Green'}
                                        </span>
                                      )}
                                    </div>

                                    {/* Headline */}
                                    <div style={{
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      color: 'var(--text-main)',
                                      lineHeight: 1.25,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {itemTitle}
                                    </div>

                                    {/* Subline */}
                                    <div style={{
                                      fontSize: '0.66rem',
                                      color: 'var(--text-muted)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '2px',
                                      minWidth: 0
                                    }}>
                                      <span style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        fontWeight: 800,
                                        color: empTheme.text,
                                        backgroundColor: empTheme.badgeBg,
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        border: `1px solid ${empTheme.border}`,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: empTheme.primary }} />
                                        {emp.name ? emp.name.split(' ')[0] : 'Specialist'}
                                      </span>
                                      {item.taskFile && <span style={{ flexShrink: 0, fontSize: '0.6rem' }}>📎</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })()}

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SPREADSHEET / SHEET MASTER DATA VIEW                                  */}
      {/* ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          
          <div style={{
            padding: '14px 20px',
            backgroundColor: 'var(--bg-card-hover)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: themeColor }}>
              <Grid size={16} /> Sheet View: [{isSocial ? 'Social Media Content Schedule' : 'General Tasks Master Data'}]
            </div>

            <div style={{ display: 'flex', gap: '16px', fontWeight: 600 }}>
              <span>Total Entries: <strong style={{ color: 'var(--text-main)' }}>{displayedItems.length}</strong></span>
            </div>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{
                  backgroundColor: 'var(--bg-card-hover)',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <th style={{ padding: '12px 14px', width: '45px', textAlign: 'center' }}>#</th>
                  <th style={{ padding: '12px 14px', width: '125px' }}>{isSocial ? 'POSTING DATE' : 'WORK DATE'}</th>
                  {!isSocial && <th style={{ padding: '12px 14px', width: '125px' }}>TARGET DATE</th>}
                  <th style={{ padding: '12px 14px', width: '130px' }}>CLIENT / BRAND</th>
                  {isSocial ? (
                    <th style={{ padding: '12px 14px', width: '115px' }}>PLATFORM</th>
                  ) : (
                    <th style={{ padding: '12px 14px', width: '130px' }}>CORE ACTIVITY</th>
                  )}
                  <th style={{ padding: '12px 14px', minWidth: '220px' }}>{isSocial ? 'POST TOPIC & CAPTION' : 'TASK OBJECTIVE / DESCRIPTION'}</th>
                  <th style={{ padding: '12px 14px', width: '120px' }}>{isSocial ? 'CONTENT FORMAT' : 'SLA STATUS'}</th>
                  <th style={{ padding: '12px 14px', width: '130px' }}>DELIVERABLE FILE</th>
                  <th style={{ padding: '12px 14px', minWidth: '180px' }}>ASSIGNED SPECIALIST</th>
                  <th style={{ padding: '12px 14px', width: '120px' }}>STATUS</th>
                  <th style={{ padding: '12px 14px', width: '80px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan={isSocial ? 10 : 11} style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <CalendarIcon size={36} color="var(--text-dim)" />
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {isSocial ? 'No social media posts found' : 'No general workflow tasks found'}
                        </div>
                        <div style={{ fontSize: '0.8rem' }}>
                          Click "{isSocial ? '+ Schedule Social Post' : '+ Create Task'}" to add an entry.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item, idx) => {
                    const emp = getAssignedEmployee(item);
                    const empTheme = getEmployeeTheme(emp || item);
                    const itemDate = isSocial
                      ? (item.toBePostedOn || item.date || '2026-08-01')
                      : (item.workStartDate || item.date || '2026-08-01');
                    const targetDate = item.targetEndDate || item.date || '2026-08-01';
                    const deliverableFile = item.taskFile || (item.taskFileUrl ? { name: item.taskFileName || 'deliverable-file', url: item.taskFileUrl } : null);

                    return (
                      <tr
                        key={item.id || idx}
                        className={empTheme.rowClass}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          borderLeft: `6px solid ${empTheme.primary}`,
                          backgroundColor: empTheme.bg,
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = empTheme.bgHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = empTheme.bg)}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: '#000000', textAlign: 'center' }}>
                          {idx + 1}
                        </td>

                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#000000', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#000000' }}>
                            <CalendarIcon size={13} color="#000000" />
                            {itemDate}
                          </span>
                        </td>

                        {!isSocial && (
                          <td style={{ padding: '12px 14px', color: '#000000', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {targetDate}
                          </td>
                        )}

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: '#ffffff', color: '#000000', fontWeight: 700, border: '1px solid #cbd5e1', fontSize: '0.76rem' }}>
                            {item.clientProject || item.client || 'SCS'}
                          </span>
                        </td>

                        {isSocial ? (
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            {getPlatformBadge(item.platform)}
                          </td>
                        ) : (
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', fontWeight: 700, color: '#000000' }}>
                            {item.coreActivity || item.activity || 'Operations'}
                          </td>
                        )}

                        <td style={{ padding: '12px 14px', maxWidth: '280px' }}>
                          <div style={{ fontWeight: 700, color: '#000000', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.description || item.title || item.project || (isSocial ? 'Social Creative' : 'General Task')}
                          </div>
                          <div style={{ color: '#000000', opacity: 0.85, fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.commentsUpdates || item.comments || 'Deliverables and scope details...'}
                          </div>
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          {isSocial ? (
                            <span style={{ fontSize: '0.76rem', color: '#000000', fontWeight: 700 }}>
                              ⚡ {item.format || item.activity || 'Static Poster'}
                            </span>
                          ) : (
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: item.slaStatus === 'Red' ? '#fecdd3' : '#bbf7d0',
                              color: item.slaStatus === 'Red' ? '#881337' : '#064e3b'
                            }}>
                              {item.slaStatus || 'Green'} SLA
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          {deliverableFile && deliverableFile.url ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => setPreviewFile(deliverableFile)}
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                              >
                                <Eye size={12} /> View
                              </button>
                              <button
                                onClick={() => downloadFileAttachment(deliverableFile.url, deliverableFile.name)}
                                className="btn btn-secondary"
                                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                              >
                                <Download size={12} />
                              </button>
                            </div>
                          ) : (
                            <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', border: '1px dashed #64748b', fontSize: '0.72rem', color: '#000000', fontWeight: 600, background: '#ffffff' }}>
                              <Upload size={12} /> Upload
                              <input type="file" onChange={(e) => handleTableFileUpload(item, e)} style={{ display: 'none' }} />
                            </label>
                          )}
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
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
                            {emp.name}
                          </span>
                        </td>

                        <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                          {getStatusBadge(item.status)}
                        </td>

                        <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          >
                            <Edit3 size={12} />
                          </button>
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

      {/* ========================================================================= */}
      {/* 5. CREATE / EDIT MODAL                                                    */}
      {/* ========================================================================= */}
      {isModalOpen && createPortal(
        <div className="modal-backdrop">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '820px', width: '95%', maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: themeColor,
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isSocial ? <Share2 size={16} /> : <CalendarDays size={16} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    {editingPost
                      ? (isSocial ? 'Edit Social Media Post' : 'Edit General Workflow Task')
                      : (isSocial ? 'Schedule New Social Media Post' : 'Create Daily Workflow Task')}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {isSocial
                      ? 'Configure publishing date, target platform and creative deliverables'
                      : 'Set work execution dates, client projects and task deliverables'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                
                {/* Primary Date */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    {isSocial ? '📅 Scheduled Posting Date (To Be Posted On) *' : '📅 Work Start Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                {/* Target End Date (for Tasks Calendar) or Scheduled Time (for Social) */}
                {!isSocial ? (
                  <div>
                    <label className="form-label">🎯 Target Completion Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.targetEndDate}
                      onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="form-label">⏰ Scheduled Posting Time</label>
                    <input
                      type="time"
                      className="form-input"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    />
                  </div>
                )}

                {/* Client / Brand */}
                <div>
                  <label className="form-label">🏢 Client / Project Brand *</label>
                  <select
                    className="form-select"
                    value={formData.clientProject}
                    onChange={(e) => setFormData({ ...formData, clientProject: e.target.value })}
                  >
                    {CLIENT_PROJECT_OPTIONS?.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Platform (for Social) or Core Activity (for Tasks) */}
                {isSocial ? (
                  <div>
                    <label className="form-label">🌐 Social Platform *</label>
                    <select
                      className="form-select"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Facebook">Facebook</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Multi-Platform">Multi-Platform</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="form-label">📂 Core Activity *</label>
                    <select
                      className="form-select"
                      value={formData.coreActivity}
                      onChange={(e) => setFormData({ ...formData, coreActivity: e.target.value })}
                    >
                      {CORE_ACTIVITY_OPTIONS?.map((act) => (
                        <option key={act} value={act}>{act}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>

              {/* Title & Description */}
              <div>
                <label className="form-label">
                  {isSocial ? '📝 Post Topic & Headline *' : '📝 Task Title & Objective *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isSocial ? "e.g., Independence Day Carousel / Opening Soon Poster" : "e.g., Kleider Care Ecom Banner UI Design / Sales Data Sheet"}
                  className="form-input"
                  value={formData.titleTopic}
                  onChange={(e) => setFormData({ ...formData, titleTopic: e.target.value })}
                />
              </div>

              {/* Caption / Comments */}
              <div>
                <label className="form-label">
                  {isSocial ? '💬 Caption Copy & Hashtags' : '💬 Detailed Instructions & Scope'}
                </label>
                <textarea
                  rows={3}
                  placeholder={isSocial ? "Write creative post caption, call to action, and hashtags..." : "Provide task specifications and deliverables..."}
                  className="form-input"
                  value={formData.captionCopy}
                  onChange={(e) => setFormData({ ...formData, captionCopy: e.target.value })}
                />
              </div>

              {/* Format / Activity in Social vs Estimated Hours in Tasks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                
                {isSocial ? (
                  <div>
                    <label className="form-label">⚡ Creative Format</label>
                    <select
                      className="form-select"
                      value={formData.activity}
                      onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    >
                      {FORMAT_OPTIONS?.map((fmt) => (
                        <option key={fmt} value={fmt}>{fmt}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="form-label">⏱ Estimated Hours</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-input"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    />
                  </div>
                )}

                {/* Assigned Specialist */}
                <div>
                  <label className="form-label">👤 Assigned Specialist</label>
                  <select
                    className="form-select"
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role || 'Specialist'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="form-label">📌 Workflow Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Yet to start">Yet to start</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting for approval">Waiting for approval</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                {/* SLA / Priority */}
                <div>
                  <label className="form-label">🎯 SLA Status</label>
                  <select
                    className="form-select"
                    value={formData.slaStatus}
                    onChange={(e) => setFormData({ ...formData, slaStatus: e.target.value })}
                  >
                    <option value="Green">Green (On Schedule)</option>
                    <option value="Red">Red (Urgent / Alert)</option>
                  </select>
                </div>

              </div>

              {/* Deliverable File Attachment */}
              <div style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '14px', backgroundColor: 'var(--bg-card-hover)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Paperclip size={16} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {formData.taskFile ? `Attached: ${formData.taskFile.name}` : 'Attach Deliverable Document / Artwork'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {formData.taskFile ? `${formData.taskFile.size || 'Ready'} file attached` : 'Upload image, video, PDF or artwork file'}
                      </div>
                    </div>
                  </div>

                  <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '5px 12px', fontSize: '0.78rem' }}>
                    <Upload size={13} /> {isUploading ? 'Uploading...' : 'Choose File'}
                    <input type="file" onChange={handleModalFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                {editingPost && hasPermission('admin') && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this entry?')) {
                        deleteTask(editingPost.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="btn btn-secondary"
                    style={{ color: '#ef4444', marginRight: 'auto' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ backgroundColor: themeColor }}
                >
                  {editingPost ? 'Save Updates' : (isSocial ? 'Schedule Post' : 'Create Task')}
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

      {/* 6. FILE PREVIEW MODAL */}
      {previewFile && createPortal(
        <div className="modal-backdrop" onClick={() => setPreviewFile(null)}>
          <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Deliverable Preview: {previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', background: '#000000', borderRadius: '8px', overflow: 'hidden' }}>
              {previewFile.url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) || previewFile.type?.includes('image') ? (
                <img src={previewFile.url} alt={previewFile.name} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
              ) : (
                <div style={{ color: '#ffffff', textAlign: 'center', padding: '40px' }}>
                  <FileText size={48} style={{ marginBottom: '12px' }} />
                  <div>Document File: {previewFile.name}</div>
                  <button onClick={() => downloadFileAttachment(previewFile.url, previewFile.name)} className="btn btn-primary" style={{ marginTop: '16px' }}>
                    <Download size={14} /> Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
