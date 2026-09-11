import React, { useState, useMemo } from 'react';
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
  Move
} from 'lucide-react';
import { uploadFileToServer, downloadFileAttachment } from '../utils/fileUpload';

const THEME_OPTIONS = ['Digital Marketing', 'CRM', 'BPP', 'SIGP', 'other'];

export const SocialMediaCalendarView = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    employees,
    currentUser,
    userRole,
    hasPermission,
    CLIENT_PROJECT_OPTIONS,
    STATUS_OPTIONS
  } = useCrm();

  const isEmployeeRole = currentUser?.role === 'employee';

  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'grid'
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState('2026-08');

  // Drag and Drop States for Calendar Month Matrix
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);

  // Month Matrix dynamic calendar calculations
  const { year, monthNum, monthName, daysInMonth, startOffset, daysList } = useMemo(() => {
    const [yStr, mStr] = currentCalendarMonth.split('-');
    const y = parseInt(yStr, 10) || 2026;
    const m = parseInt(mStr, 10) || 8; // 1-12
    const dateObj = new Date(y, m - 1, 1);
    const mName = dateObj.toLocaleString('en-US', { month: 'long' });
    const countDays = new Date(y, m, 0).getDate();
    // Monday as 1st column: (0 = Sun => 6, 1 = Mon => 0, ..., 6 = Sat => 5)
    const rawDay = new Date(y, m - 1, 1).getDay();
    const offset = (rawDay + 6) % 7;

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

  const handleDropOnDate = (taskId, targetDateStr, targetDayNum) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    updateTask(taskId, {
      date: targetDateStr,
      toBePostedOn: targetDateStr,
      workStartDate: targetDateStr,
      targetEndDate: targetDateStr
    });

    const taskLabel = targetTask.description || targetTask.title || targetTask.activity || 'Task';
    setToastNotice(`✓ Rescheduled "${taskLabel}" to ${monthName.slice(0, 3)} ${targetDayNum}, ${year}`);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Modal state for Admin Post creation/edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // File Preview Modal
  const [previewFile, setPreviewFile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    date: '2026-08-01',
    scheduledTime: '10:00',
    clientProject: CLIENT_PROJECT_OPTIONS[0] || 'SCS',
    platform: 'Instagram',
    activity: 'Static Poster',
    theme: 'Digital Marketing',
    titleTopic: '',
    captionCopy: '',
    mediaUrl: '',
    assignedToId: employees[0]?.id || '',
    assignedToEmail: employees[0]?.email || '',
    assignedToUsername: employees[0]?.name || '',
    status: 'In Progress',
    slaStatus: 'Green',
    taskFile: null
  });

  // Helper to reliably resolve employee information
  const getAssignedEmployee = (post) => {
    let emp = null;
    if (post.assignedToId) {
      emp = employees.find(e => e.id?.toLowerCase() === post.assignedToId.toLowerCase());
    }
    if (!emp && post.assignedToEmail) {
      emp = employees.find(e => e.email?.toLowerCase().trim() === post.assignedToEmail.toLowerCase().trim());
    }
    if (!emp && (post.assignedToUsername || post.assignedTo)) {
      const pName = (post.assignedToUsername || post.assignedTo || '').toLowerCase().trim();
      emp = employees.find(e => {
        const eName = (e.name || '').toLowerCase().trim();
        return pName === eName || pName.includes(eName) || eName.includes(pName);
      });
    }

    const effectiveName = emp?.name || post.assignedToUsername || post.assignedTo || 'Specialist';
    const isJohncy = effectiveName.toLowerCase().includes('johncy');
    const effectiveEmail = emp?.email || post.assignedToEmail || (isJohncy ? 'johncyrebecca@gmail.com' : 'specialist@techteam.dev');
    const effectiveAvatar = emp?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(effectiveName)}`;

    return {
      id: emp?.id || post.assignedToId || '',
      name: effectiveName,
      email: effectiveEmail,
      avatar: effectiveAvatar,
      role: emp?.role || 'Specialist'
    };
  };

  // Social Media Filtered Tasks
  const socialMediaPosts = useMemo(() => {
    let list = tasks;

    // 1. RBAC Filter: If user is employee, strictly filter to ONLY posts assigned to this employee
    if (userRole === 'employee') {
      const userEmail = (currentUser?.email || '').toLowerCase().trim();
      const userName = (currentUser?.name || '').toLowerCase().trim();
      const userId = (currentUser?.id || '').toLowerCase().trim();

      list = tasks.filter((t) => {
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

    // 3. Search Filter
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
  }, [tasks, userRole, currentUser, employees, selectedEmployeeFilter, searchQuery]);

  const handleOpenCreateModal = (dateStr = null) => {
    setEditingPost(null);
    const defaultEmp = employees[0];
    setFormData({
      date: dateStr || `${currentCalendarMonth}-01`,
      scheduledTime: '10:00',
      clientProject: CLIENT_PROJECT_OPTIONS[0] || 'SCS',
      platform: 'Instagram',
      activity: 'Static Poster',
      theme: 'Digital Marketing',
      titleTopic: '',
      captionCopy: '',
      mediaUrl: '',
      assignedToId: defaultEmp?.id || 'emp-1',
      assignedToEmail: defaultEmp?.email || '',
      assignedToUsername: defaultEmp?.name || '',
      status: 'In Progress',
      slaStatus: 'Green',
      taskFile: null
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post) => {
    setEditingPost(post);
    const emp = getAssignedEmployee(post);
    setFormData({
      date: post.toBePostedOn || post.date || post.workStartDate || `${currentCalendarMonth}-01`,
      scheduledTime: post.scheduledTime || '10:00',
      clientProject: post.clientProject || post.client || CLIENT_PROJECT_OPTIONS[0],
      platform: post.platform || (post.clientProject === 'SCS' ? 'LinkedIn' : 'Instagram'),
      activity: post.format || post.activity || 'Static Poster',
      theme: post.theme || post.coreActivity || 'Digital Marketing',
      titleTopic: post.description || post.title || post.project || '',
      captionCopy: post.comments || post.commentsUpdates || '',
      mediaUrl: post.mediaUrl || post.reference || '',
      assignedToId: emp.id || employees[0]?.id || '',
      assignedToEmail: emp.email,
      assignedToUsername: emp.name,
      status: post.status || 'In Progress',
      slaStatus: post.slaStatus || 'Green',
      taskFile: post.taskFile || (post.taskFileUrl ? { name: post.taskFileName || 'task-doc', url: post.taskFileUrl } : null)
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const assignedEmp = employees.find(e => e.id === formData.assignedToId) || employees[0];

    const postPayload = {
      date: formData.date,
      toBePostedOn: formData.date,
      workStartDate: formData.date,
      targetEndDate: formData.date,
      scheduledTime: formData.scheduledTime,
      clientProject: formData.clientProject,
      platform: formData.platform,
      activity: formData.activity,
      format: formData.activity,
      theme: formData.theme,
      coreActivity: formData.theme === 'Digital Marketing' ? 'Social Media Content' : formData.theme,
      project: formData.titleTopic || `SM-${Date.now().toString().slice(-4)}`,
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
      estimatedHours: 4,
      taskFile: formData.taskFile,
      taskFileName: formData.taskFile ? formData.taskFile.name : '',
      taskFileUrl: formData.taskFile ? formData.taskFile.url : ''
    };

    if (editingPost) {
      updateTask(editingPost.id, postPayload);
    } else {
      addTask(postPayload);
    }

    setIsModalOpen(false);
  };

  const handleTableFileUpload = async (post, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedDoc = await uploadFileToServer(file);
      if (uploadedDoc) {
        updateTask(post.id, {
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

  const getPlatformBadge = (platform = 'Instagram') => {
    const p = (platform || 'Instagram').toLowerCase();
    if (p.includes('linkedin')) {
      return (
        <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <Globe size={12} /> LinkedIn
        </span>
      );
    }
    if (p.includes('instagram')) {
      return (
        <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(236, 72, 153, 0.1)', color: '#db2777', border: '1px solid rgba(236, 72, 153, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <ImageIcon size={12} /> Instagram
        </span>
      );
    }
    if (p.includes('facebook')) {
      return (
        <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <Globe size={12} /> Facebook
        </span>
      );
    }
    if (p.includes('twitter') || p.includes('x')) {
      return (
        <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <Share2 size={12} /> Twitter / X
        </span>
      );
    }
    if (p.includes('youtube')) {
      return (
        <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
          <Video size={12} /> YouTube
        </span>
      );
    }
    return (
      <span style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'rgba(147, 51, 234, 0.1)', color: '#9333ea', border: '1px solid rgba(147, 51, 234, 0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
        <Share2 size={12} /> {platform}
      </span>
    );
  };

  const getThemeBadge = (theme = 'Digital Marketing') => {
    const t = (theme || 'Digital Marketing').toLowerCase();
    if (t.includes('crm')) {
      return (
        <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac', whiteSpace: 'nowrap' }}>
          CRM
        </span>
      );
    }
    if (t.includes('bpp')) {
      return (
        <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#e0e7ff', color: '#4338ca', border: '1px solid #a5b4fc', whiteSpace: 'nowrap' }}>
          BPP
        </span>
      );
    }
    if (t.includes('sigp')) {
      return (
        <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', whiteSpace: 'nowrap' }}>
          SIGP
        </span>
      );
    }
    if (t.includes('other')) {
      return (
        <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>
          other
        </span>
      );
    }
    return (
      <span style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe', whiteSpace: 'nowrap' }}>
        Digital Marketing
      </span>
    );
  };

  const getStatusBadge = (status = 'Yet to start') => {
    switch (status) {
      case 'Completed':
        return (
          <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Check size={11} /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #a5b4fc', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            <Clock size={11} /> In Progress
          </span>
        );
      case 'Waiting for approval':
        return (
          <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            ⏳ Approval Pending
          </span>
        );
      case 'On Hold':
        return (
          <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            ⏸️ On Hold
          </span>
        );
      default:
        return (
          <span style={{ padding: '3px 9px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
            ⚪ Yet to start
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>

      {/* Floating Toast Notification for Drag & Drop Reschedule */}
      {toastNotice && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
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

      {/* 1. HEADER SECTION & CONTROLS */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#00a884', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(0, 168, 132, 0.25)', flexShrink: 0 }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Social Media Content Calendar</h1>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* View Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-card-hover)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'calendar' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'calendar' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: viewMode === 'calendar' ? '0 1px 4px rgba(0, 168, 132, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <CalendarIcon size={13} /> Month Matrix
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: viewMode === 'grid' ? 'var(--accent-primary)' : 'transparent',
                color: viewMode === 'grid' ? '#ffffff' : 'var(--text-muted)',
                boxShadow: viewMode === 'grid' ? '0 1px 4px rgba(0, 168, 132, 0.3)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease'
              }}
            >
              <Grid size={13} /> Spreadsheet Grid
            </button>
          </div>

          {/* Admin / Employee Create Entry Button */}
          <button
            onClick={() => handleOpenCreateModal()}
            className="btn btn-primary"
            style={{ padding: '7px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> + Create Calendar Entry
          </button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: '1 1 300px' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search topic, client, campaign, platform or assignee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '34px', height: '36px', fontSize: '0.83rem' }}
          />
        </div>

        {/* Admin Employee Filter */}
        {hasPermission('admin') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Employee:</span>
            <select
              className="form-select"
              style={{ height: '36px', padding: '4px 10px', fontSize: '0.82rem', minWidth: '220px' }}
              value={selectedEmployeeFilter}
              onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
            >
              <option value="All">👥 All Specialists ({employees.length})</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.name} ({emp.email})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. SPREADSHEET GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '10px' }}>

          {/* Table Header Bar Style */}
          <div style={{
            padding: '12px 18px',
            backgroundColor: 'var(--bg-card-hover)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--accent-primary)' }}>
              <Grid size={15} /> Sheet View: [Social Media Calendar Master Data]
            </div>

            <div style={{ display: 'flex', gap: '16px', fontWeight: 600 }}>
              <span>Total Posts: <strong style={{ color: 'var(--text-main)' }}>{socialMediaPosts.length}</strong></span>
              <span>Active Platforms: <strong style={{ color: 'var(--text-main)' }}>6</strong></span>
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
                  <th style={{ padding: '12px 14px', width: '45px', textAlign: 'center', verticalAlign: 'middle' }}>#</th>
                  <th style={{ padding: '12px 14px', width: '115px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>PUBLISH DATE</th>
                  <th style={{ padding: '12px 14px', width: '130px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>CLIENT / BRAND</th>
                  <th style={{ padding: '12px 14px', width: '110px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>PLATFORM</th>
                  <th style={{ padding: '12px 14px', minWidth: '220px', maxWidth: '280px', verticalAlign: 'middle' }}>POST TOPIC & CAPTION</th>
                  <th style={{ padding: '12px 14px', width: '110px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>CONTENT TYPE</th>
                  <th style={{ padding: '12px 14px', width: '120px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>THEME</th>
                  <th style={{ padding: '12px 14px', width: '130px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>DELIVERABLE FILE</th>
                  <th style={{ padding: '12px 14px', minWidth: '180px', maxWidth: '220px', verticalAlign: 'middle' }}>ASSIGNED TO (SPECIALIST)</th>
                  <th style={{ padding: '12px 14px', width: '130px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ padding: '12px 14px', width: '80px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {socialMediaPosts.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <CalendarIcon size={36} color="var(--text-dim)" />
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          No social media posts found
                        </div>
                        <div style={{ fontSize: '0.8rem' }}>
                          Click "+ Create Calendar Entry" to add your first post to the calendar schedule.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  socialMediaPosts.map((post, idx) => {
                    const emp = getAssignedEmployee(post);
                    const platformName = post.platform || (post.activity?.includes('Reel') ? 'Instagram' : post.clientProject === 'SCS' ? 'LinkedIn' : 'Instagram');
                    const postDate = post.toBePostedOn || post.date || post.workStartDate || post.targetEndDate || '2026-08-01';
                    const deliverableFile = post.taskFile || (post.taskFileUrl ? { name: post.taskFileName || 'deliverable-file', url: post.taskFileUrl } : null);

                    return (
                      <tr
                        key={post.id || idx}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color 0.15s ease',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Row Index */}
                        <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-dim)', textAlign: 'center', verticalAlign: 'middle' }}>
                          {idx + 1}
                        </td>

                        {/* Publish Date */}
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <CalendarIcon size={13} color="var(--accent-primary)" />
                            {postDate}
                          </span>
                        </td>

                        {/* Client / Brand */}
                        <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ padding: '4px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-main)', fontWeight: 700, border: '1px solid var(--border-color)', fontSize: '0.76rem' }}>
                            {post.clientProject || post.client || 'SCS'}
                          </span>
                        </td>

                        {/* Platform Badge */}
                        <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          {getPlatformBadge(platformName)}
                        </td>

                        {/* Post Topic & Caption */}
                        <td style={{ padding: '12px 14px', maxWidth: '280px', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                            {post.description || post.title || post.project || post.activity || 'Creative Social Poster'}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {post.commentsUpdates || post.comments || 'Creative copywriting & banner content...'}
                          </div>
                        </td>

                        {/* Content Type */}
                        <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            ⚡ {post.format || post.activity || 'Static Poster'}
                          </span>
                        </td>

                        {/* Theme */}
                        <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          {getThemeBadge(post.theme || post.coreActivity)}
                        </td>

                        {/* Deliverable Document File */}
                        <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          {deliverableFile && deliverableFile.url ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <button
                                type="button"
                                onClick={() => downloadFileAttachment(deliverableFile)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  background: '#ecfdf5',
                                  color: '#047857',
                                  border: '1px solid #a7f3d0',
                                  cursor: 'pointer',
                                  maxWidth: '105px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                                title={`Download Deliverable: ${deliverableFile.name}`}
                              >
                                <Paperclip size={11} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {deliverableFile.name}
                                </span>
                              </button>

                              {deliverableFile.type && deliverableFile.type.startsWith('image') && (
                                <button
                                  type="button"
                                  onClick={() => setPreviewFile(deliverableFile)}
                                  className="btn-icon"
                                  style={{ width: '24px', height: '24px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                                  title="Quick Preview"
                                >
                                  <Eye size={11} />
                                </button>
                              )}

                              {/* Upload/Replace File */}
                              <label
                                style={{ width: '24px', height: '24px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                                title="Upload new version"
                              >
                                <Upload size={11} />
                                <input
                                  type="file"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleTableFileUpload(post, e)}
                                />
                              </label>
                            </div>
                          ) : (
                            <label
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                color: 'var(--accent-primary)',
                                background: 'rgba(99, 102, 241, 0.08)',
                                border: '1px dashed rgba(99, 102, 241, 0.4)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                              title="Upload Deliverable Document"
                            >
                              <Upload size={11} />
                              <span>+ Upload</span>
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => handleTableFileUpload(post, e)}
                              />
                            </label>
                          )}
                        </td>

                        {/* Assigned Specialist (Name & Login Email) */}
                        <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#e0e7ff',
                              color: '#4338ca',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {emp.name ? emp.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div style={{ minWidth: 0, overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {emp.name}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {emp.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '12px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          {getStatusBadge(post.status)}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '12px 14px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
                            <button
                              onClick={() => handleOpenEditModal(post)}
                              className="btn btn-secondary btn-icon"
                              style={{ width: '28px', height: '28px' }}
                              title="Edit Social Media Entry"
                            >
                              <Edit3 size={12} />
                            </button>
                            {hasPermission('admin') && (
                              <button
                                onClick={() => deleteTask(post.id)}
                                className="btn btn-danger btn-icon"
                                style={{ width: '28px', height: '28px' }}
                                title="Delete Entry"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
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

      {/* 4. CALENDAR MONTH MATRIX VIEW — CLEAN MINIMALIST GLASSMORPHIC WHATSAPP GREEN DESIGN */}
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
                  fontSize: '2.8rem',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: 'var(--text-main)',
                  margin: 0,
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  {monthName}
                </h1>
                <h2 style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
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
                    border: '1.5px solid var(--accent-primary)',
                    background: 'var(--bg-card-hover)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
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
                    border: '1.5px solid var(--accent-primary)',
                    background: 'var(--bg-card-hover)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-primary)',
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
                color: 'var(--accent-primary)',
                background: 'rgba(0, 168, 132, 0.12)',
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(0, 168, 132, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Move size={12} color="var(--accent-primary)" /> Drag & drop tasks to reschedule dates
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentCalendarMonth('2026-08')}
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
                Today ({monthName.slice(0, 3)} {year})
              </button>
              <button
                onClick={() => handleOpenCreateModal()}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(0, 168, 132, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Plus size={14} /> + Add Post
              </button>
            </div>
          </div>

          {/* THE CALENDAR MATRIX */}
          <div style={{ minWidth: 0, width: '100%' }}>

              {/* Weekday Solid WhatsApp Green Pill Headers */}
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
                      backgroundColor: 'var(--accent-primary)',
                      color: '#ffffff',
                      padding: '8px 0',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '0.06em',
                      minWidth: 0,
                      boxShadow: '0 2px 5px rgba(0, 168, 132, 0.2)'
                    }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid Matrix with Horizontal Week Line Separators */}
              {(() => {
                // Calculate SUN-first month parameters (Sunday = 0, Monday = 1, ... Saturday = 6)
                const firstDaySunFirst = new Date(year, monthNum - 1, 1).getDay(); // 0 = Sun, 1 = Mon, 6 = Sat
                const prevMonthDaysCount = new Date(year, monthNum - 1, 0).getDate();
                
                // Build total calendar slots: 5 or 6 weeks (35 or 42 slots)
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
                          borderBottom: weekIdx === weeksCount - 1 ? '3px double var(--accent-primary)' : '1px solid var(--border-color)',
                          minHeight: '110px'
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
                            // Trailing day from previous month
                            displayDay = prevMonthDaysCount + dayNumber;
                          } else {
                            // Leading day into next month
                            displayDay = dayNumber - daysInMonth;
                          }

                          const dayPosts = isCurrentMonth
                            ? socialMediaPosts.filter((p) => {
                                const pDate = p.toBePostedOn || p.date || p.workStartDate || '';
                                const dPad = dayNumber < 10 ? '0' + dayNumber : `${dayNumber}`;
                                const mPad = monthNum < 10 ? '0' + monthNum : `${monthNum}`;
                                return pDate === cellDateStr || (pDate.startsWith(`${year}-${mPad}`) && pDate.endsWith(`-${dPad}`));
                              })
                            : [];

                          const isDropTarget = isCurrentMonth && dragOverDate === cellDateStr;

                          // Compute circle color based on posts
                          let circleBg = 'var(--accent-primary)';
                          if (dayPosts.length > 0) {
                            const p = dayPosts[0];
                            const pform = (p.platform || '').toLowerCase();
                            const fact = (p.format || p.activity || '').toLowerCase();
                            if (pform.includes('instagram') || fact.includes('carousel')) circleBg = '#075e54';
                            else if (pform.includes('linkedin') || fact.includes('video') || fact.includes('reel')) circleBg = '#128c7e';
                            else if (pform.includes('facebook') || fact.includes('adhoc')) circleBg = 'var(--accent-primary)';
                            else if (fact.includes('poster') || fact.includes('static')) circleBg = '#075e54';
                            else circleBg = 'var(--accent-primary)';
                          }

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
                                padding: '4px',
                                borderRadius: '8px',
                                cursor: isCurrentMonth ? 'pointer' : 'default',
                                backgroundColor: isDropTarget ? 'rgba(0, 168, 132, 0.15)' : 'transparent',
                                border: isDropTarget ? '2px dashed var(--accent-primary)' : 'none',
                                transition: 'all 0.12s ease'
                              }}
                            >
                              {/* Day Circle Badge (Matching Reference Template Circles) */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minWidth: 0 }}>
                                {isCurrentMonth ? (
                                  <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    backgroundColor: circleBg,
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.72rem',
                                    fontWeight: 800,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
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

                              {/* Drop Indicator */}
                              {isDropTarget && (
                                <div style={{
                                  padding: '3px 4px',
                                  borderRadius: '4px',
                                  backgroundColor: 'var(--accent-primary)',
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

                              {/* Task Items (Editorial Minimalist Typography Style) */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0, width: '100%' }}>
                                {dayPosts.map((p) => {
                                  const emp = getAssignedEmployee(p);
                                  const isBeingDragged = draggedTaskId === p.id;
                                  const postTitle = p.format || p.activity || p.description || p.title || 'Social Post';

                                  return (
                                    <div
                                      key={p.id}
                                      draggable={true}
                                      onDragStart={(e) => {
                                        e.stopPropagation();
                                        setDraggedTaskId(p.id);
                                        e.dataTransfer.setData('text/plain', p.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                      }}
                                      onDragEnd={(e) => {
                                        e.stopPropagation();
                                        setDraggedTaskId(null);
                                        setDragOverDate(null);
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(p);
                                      }}
                                      style={{
                                        padding: '5px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: isBeingDragged ? 'var(--border-color)' : 'var(--bg-card-hover)',
                                        border: '1px solid var(--border-color)',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        cursor: 'grab',
                                        opacity: isBeingDragged ? 0.35 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                        minWidth: 0,
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.15s ease'
                                      }}
                                      title="Drag to move, click to edit"
                                    >
                                      {/* Clean Headline matching template */}
                                      <div style={{
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        color: 'var(--text-main)',
                                        lineHeight: 1.2,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {postTitle}
                                      </div>

                                      {/* Subline with specialist & client */}
                                      <div style={{
                                        fontSize: '0.66rem',
                                        color: 'var(--text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '2px',
                                        minWidth: 0
                                      }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                          {p.clientProject || 'SCS'} • {emp.name ? emp.name.split(' ')[0] : 'Specialist'}
                                        </span>
                                        {p.taskFile && <span style={{ flexShrink: 0, fontSize: '0.6rem' }}>📎</span>}
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

      {/* 5. POST CREATOR / EDIT MODAL (COMPACT 2-COLUMN NO-SCROLL DESIGN) */}
      {isModalOpen && createPortal(
        <div className="modal-backdrop">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '860px', width: '95%', maxHeight: '96vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-card-hover)',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={18} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {editingPost ? `Edit Social Media Post: ${editingPost.id}` : 'Create Social Media Post'}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-icon" style={{ width: '30px', height: '30px' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', flex: 1, minHeight: 0 }}>
              
              {/* LEFT COLUMN: Schedule, Client, Platform, Format & Assignment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Date & Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Publish Date *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Scheduled Time</label>
                    <input
                      type="time"
                      className="form-input"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Client & Platform */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Client / Brand *</label>
                    <select
                      className="form-select"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.clientProject}
                      onChange={(e) => setFormData({ ...formData, clientProject: e.target.value })}
                    >
                      {CLIENT_PROJECT_OPTIONS.map((cp) => (
                        <option key={cp} value={cp}>{cp}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Social Platform *</label>
                    <select
                      className="form-select"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    >
                      <option value="Instagram">📸 Instagram</option>
                      <option value="LinkedIn">💼 LinkedIn</option>
                      <option value="Facebook">🌐 Facebook</option>
                      <option value="Twitter">🐦 Twitter / X</option>
                      <option value="YouTube">📹 YouTube</option>
                      <option value="TikTok">🎵 TikTok</option>
                    </select>
                  </div>
                </div>

                {/* Content Format & Theme */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Content Type *</label>
                    <select
                      className="form-select"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.activity}
                      onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    >
                      <option value="Static Poster">🖼️ Static Poster</option>
                      <option value="Carousel">🎠 Carousel</option>
                      <option value="Reel / Video">🎬 Reel / Video</option>
                      <option value="Story">📱 Story</option>
                      <option value="Banner">🏷️ Banner</option>
                      <option value="Adhoc">⚡ Adhoc</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Theme *</label>
                    <select
                      className="form-select"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    >
                      {THEME_OPTIONS.map((thm) => (
                        <option key={thm} value={thm}>{thm}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Assigned Specialist */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Assigned Specialist *</label>
                  <select
                    className="form-select"
                    style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                    value={formData.assignedToId}
                    onChange={(e) => {
                      const emp = employees.find((empItem) => empItem.id === e.target.value);
                      setFormData({
                        ...formData,
                        assignedToId: e.target.value,
                        assignedToEmail: emp ? emp.email : '',
                        assignedToUsername: emp ? emp.name : ''
                      });
                    }}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        👤 {emp.name} ({emp.email}) — {emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status & SLA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Status</label>
                    <select
                      className="form-select"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>SLA Status</label>
                    <select
                      className="form-select"
                      style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                      value={formData.slaStatus}
                      onChange={(e) => setFormData({ ...formData, slaStatus: e.target.value })}
                    >
                      <option value="Green">🟩 Green (On Track)</option>
                      <option value="Red">🟥 Red (Breached)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Topic, Copywriting & Media Document */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Topic & Title */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Post Topic & Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                    placeholder="e.g. Promotional short reel animation & sound mixing"
                    value={formData.titleTopic}
                    onChange={(e) => setFormData({ ...formData, titleTopic: e.target.value })}
                  />
                </div>

                {/* Caption / Copywriting */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Caption / Creative Copywriting / Notes</label>
                  <textarea
                    rows="3"
                    className="form-textarea"
                    style={{ padding: '7px 10px', fontSize: '0.82rem', flex: 1, minHeight: '68px', resize: 'none' }}
                    placeholder="Add copywriting text, hashtags, target audience notes or deliverable comments..."
                    value={formData.captionCopy}
                    onChange={(e) => setFormData({ ...formData, captionCopy: e.target.value })}
                  />
                </div>

                {/* DELIVERABLE FILE UPLOADER */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Deliverable File / Attachment</label>
                  {formData.taskFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-card-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <FileText size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {formData.taskFile.name}
                          </div>
                          {formData.taskFile.size && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {formData.taskFile.size}
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <label className="btn btn-secondary" style={{ padding: '3px 8px', fontSize: '0.72rem', cursor: 'pointer' }}>
                          Change
                          <input type="file" style={{ display: 'none' }} onChange={handleModalFileUpload} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, taskFile: null })}
                          className="btn btn-danger btn-icon"
                          style={{ width: '24px', height: '24px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 14px', borderRadius: '8px', border: '1.5px dashed var(--border-color)', background: 'var(--bg-card-hover)', cursor: 'pointer', gap: '8px', transition: 'all 0.15s ease' }}>
                      <Upload size={15} color="var(--accent-primary)" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          Click to upload deliverable poster / file
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          Supports PDF, PNG, JPG, DOCX, PSD (Max 25MB)
                        </span>
                      </div>
                      <input type="file" style={{ display: 'none' }} onChange={handleModalFileUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* FULL-WIDTH MODAL FOOTER */}
              <div style={{
                gridColumn: '1 / -1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', fontSize: '0.82rem' }}>
                  <CheckCircle2 size={14} />
                  {editingPost ? 'Save Post Updates' : 'Add to Social Calendar'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 6. IMAGE PREVIEW MODAL */}
      {previewFile && createPortal(
        <div className="modal-backdrop" onClick={() => setPreviewFile(null)}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '600px', padding: '20px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Deliverable Preview: {previewFile.name}</h3>
              <button onClick={() => setPreviewFile(null)} className="btn btn-secondary btn-icon">
                <X size={16} />
              </button>
            </div>
            <div style={{ textAlign: 'center', maxHeight: '500px', overflowY: 'auto' }}>
              <img
                src={previewFile.url}
                alt={previewFile.name}
                style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '8px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => downloadFileAttachment(previewFile)} className="btn btn-primary">
                <Download size={14} /> Download File
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

