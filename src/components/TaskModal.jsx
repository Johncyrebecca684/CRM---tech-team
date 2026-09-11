import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { X, Calendar, User, Tag, CheckCircle, Link, FileText, MessageSquare, Briefcase, Upload, Trash2, Clock, Check } from 'lucide-react';
import { uploadFileToServer } from '../utils/fileUpload';

export const TaskModal = () => {
  const { 
    isTaskModalOpen, 
    setIsTaskModalOpen, 
    editingTask, 
    addTask, 
    updateTask, 
    employees,
    currentUser,
    selectedEmployeeViewId,
    CLIENT_PROJECT_OPTIONS,
    THEME_OPTIONS,
    FORMAT_OPTIONS,
    STATUS_OPTIONS
  } = useCrm();

  const isEmployeeRole = currentUser?.role === 'employee';
  
  // Find current employee's matching record
  const currentEmployeeRecord = employees.find((e) => {
    if (currentUser?.id && e.id && e.id.toLowerCase() === currentUser.id.toLowerCase()) return true;
    if (currentUser?.email && e.email && e.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) return true;
    if (currentUser?.name && e.name && e.name.toLowerCase().includes(currentUser.name.toLowerCase())) return true;
    return false;
  });

  const defaultAssignedId = isEmployeeRole 
    ? (currentEmployeeRecord?.id || currentUser?.id || employees[0]?.id || '')
    : (selectedEmployeeViewId || employees[0]?.id || '');

  const defaultClient = CLIENT_PROJECT_OPTIONS ? CLIENT_PROJECT_OPTIONS[0] : 'SCS';
  const defaultTheme = THEME_OPTIONS ? THEME_OPTIONS[0] : 'Digital Marketing';
  const defaultFormat = FORMAT_OPTIONS ? FORMAT_OPTIONS[0] : 'Static Poster';

  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    toBePostedOn: new Date().toISOString().split('T')[0],
    theme: defaultTheme,
    format: defaultFormat,
    assignedToId: defaultAssignedId,
    description: '',
    client: defaultClient,
    toBeCompletedOn: '',
    status: 'Yet to start',
    reference: '',
    comments: '',
    taskFile: null
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        toBePostedOn: editingTask.toBePostedOn || editingTask.date || new Date().toISOString().split('T')[0],
        theme: editingTask.theme || editingTask.coreActivity || defaultTheme,
        format: editingTask.format || editingTask.activity || defaultFormat,
        assignedToId: isEmployeeRole ? (currentEmployeeRecord?.id || currentUser?.id || editingTask.assignedToId) : (editingTask.assignedToId || employees[0]?.id || ''),
        description: editingTask.description || editingTask.titleTopic || editingTask.title || editingTask.activity || '',
        client: editingTask.client || editingTask.clientProject || defaultClient,
        toBeCompletedOn: editingTask.toBeCompletedOn || editingTask.completedOn || editingTask.targetEndDate || editingTask.actualEndDate || '',
        status: editingTask.status || 'Yet to start',
        reference: editingTask.reference || editingTask.mediaUrl || '',
        comments: editingTask.comments || editingTask.commentsUpdates || '',
        taskFile: editingTask.taskFile || (editingTask.taskFileUrl ? { name: editingTask.taskFileName || 'task-doc', url: editingTask.taskFileUrl } : null)
      });
    } else {
      setFormData({
        toBePostedOn: new Date().toISOString().split('T')[0],
        theme: defaultTheme,
        format: defaultFormat,
        assignedToId: defaultAssignedId,
        description: '',
        client: defaultClient,
        toBeCompletedOn: '',
        status: 'Yet to start',
        reference: '',
        comments: '',
        taskFile: null
      });
    }
  }, [editingTask, isTaskModalOpen, employees, defaultAssignedId, isEmployeeRole, currentUser, currentEmployeeRecord, defaultClient, defaultTheme, defaultFormat]);

  if (!isTaskModalOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploaded = await uploadFileToServer(file);
      if (uploaded) {
        setFormData(prev => ({
          ...prev,
          taskFile: uploaded
        }));
      }
    } catch (err) {
      console.error('TaskModal file upload failed:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    const assignedEmp = employees.find(e => e.id === formData.assignedToId) || currentEmployeeRecord || employees[0];
    const isJohncy = (assignedEmp?.name?.toLowerCase().includes('johncy')) || (assignedEmp?.id === 'emp-5') || (currentUser?.name?.toLowerCase().includes('johncy'));
    const effectiveEmail = isJohncy ? 'johncyrebecca@gmail.com' : (assignedEmp?.email || currentUser?.email || '');

    const today = new Date().toISOString().split('T')[0];

    const payload = {
      ...formData,
      // Compatibility with all existing CRM views and MongoDB schema
      clientProject: formData.client,
      date: formData.toBePostedOn,
      workStartDate: formData.toBePostedOn,
      completedOn: formData.toBeCompletedOn || (formData.status === 'Completed' ? today : ''),
      targetEndDate: formData.toBeCompletedOn || formData.toBePostedOn,
      actualEndDate: formData.status === 'Completed' ? (formData.toBeCompletedOn || today) : null,
      title: formData.description,
      activity: formData.format,
      coreActivity: formData.theme,
      commentsUpdates: formData.comments,
      assignedToId: assignedEmp ? assignedEmp.id : formData.assignedToId,
      assignedToEmail: effectiveEmail,
      assignedToUsername: assignedEmp ? assignedEmp.name : (currentUser?.name || ''),
      assignedTo: assignedEmp ? assignedEmp.name : (currentUser?.name || ''),
      assignedBy: currentUser?.name || 'Admin',
      taskFile: formData.taskFile,
      taskFileName: formData.taskFile ? formData.taskFile.name : '',
      taskFileUrl: formData.taskFile ? formData.taskFile.url : ''
    };

    if (editingTask) {
      updateTask(editingTask.id, payload);
    } else {
      addTask(payload);
    }

    setIsTaskModalOpen(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '860px', width: '95%', maxHeight: '96vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card-hover)',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              {editingTask 
                ? `Edit Task Record: ${editingTask.id}` 
                : (isEmployeeRole ? '➕ Add My Work / Extra Task' : '➕ Assign New Task')
              }
            </h2>
          </div>
          <button 
            onClick={() => setIsTaskModalOpen(false)}
            className="btn btn-secondary btn-icon"
            style={{ width: '30px', height: '30px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Task Form (Compact 2-Column Grid) */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', flex: 1, minHeight: 0 }}>
          
          {/* LEFT COLUMN: Dates, Classification & Assignment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. Date / Start Date & 7. Completion Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>1. Work / Publish Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  value={formData.toBePostedOn}
                  onChange={(e) => setFormData({ ...formData, toBePostedOn: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Target / Completed On</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  value={formData.toBeCompletedOn}
                  onChange={(e) => setFormData({ ...formData, toBeCompletedOn: e.target.value })}
                />
              </div>
            </div>

            {/* 6. Client & 2. Theme */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Client / Brand *</label>
                <select
                  className="form-select"
                  style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                >
                  {(CLIENT_PROJECT_OPTIONS || [
                    'SCS',
                    'THE SALAVAI LAUNDRY',
                    'NAMMUDE LAUNDRY',
                    'THE AMLAN LAUNDRY',
                    'PARISHUDHA LAUNDRY',
                    'SALAVAI STORE',
                    'KLEIDER CARE',
                    'NAMMUDE STORE',
                    'OTHERS'
                  ]).map((clientName) => (
                    <option key={clientName} value={clientName}>{clientName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Theme / Core Activity *</label>
                <select
                  className="form-select"
                  style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  value={formData.theme}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                >
                  {(THEME_OPTIONS || ['Digital Marketing', 'BPP', 'SIGP', 'CRM']).map((thm) => (
                    <option key={thm} value={thm}>{thm}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Format & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Activity / Format *</label>
                <select
                  className="form-select"
                  style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                >
                  {(FORMAT_OPTIONS || [
                    'Static Poster',
                    'Reel',
                    'Carousel',
                    'Video',
                    'Story',
                    'Banner',
                    'Website UI',
                    'Adhoc',
                    'Document',
                    'Other'
                  ]).map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Status</label>
                <select
                  className="form-select"
                  style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {(STATUS_OPTIONS || ['Yet to start', 'In Progress', 'Waiting for approval', 'On Hold', 'Completed', 'Backlog']).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Assigned Specialist */}
            <div>
              <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Assigned Specialist *</label>
              <select
                className="form-select"
                style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                disabled={isEmployeeRole}
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                {employees.map((emp) => {
                  const isJohncy = emp.name.toLowerCase().includes('johncy') || emp.id === 'emp-5';
                  const emailStr = isJohncy ? 'johncyrebecca@gmail.com' : emp.email;
                  return (
                    <option key={emp.id} value={emp.id}>
                      👤 {emp.name} ({emailStr})
                    </option>
                  );
                })}
              </select>
              {isEmployeeRole && (
                <span style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 600, marginTop: '2px', display: 'block' }}>
                  ✓ Logged for your profile ({currentUser?.name})
                </span>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Description, File Attachment & Notes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 5. Description */}
            <div>
              <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Work Description / Scope *</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ padding: '7px 10px', fontSize: '0.82rem' }}
                placeholder="Describe work completed, task brief or deliverable scope..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Comments & Reference */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label" style={{ fontSize: '0.72rem', marginBottom: '3px' }}>Notes / Updates / Reference</label>
              <textarea
                rows="3"
                className="form-textarea"
                style={{ padding: '7px 10px', fontSize: '0.82rem', flex: 1, minHeight: '68px', resize: 'none' }}
                placeholder="Additional updates, reference links, client notes or remarks..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>

            {/* Deliverable File Upload */}
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
                      <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
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
                      Click to attach file (PDF, PNG, JPG, DOCX, etc.)
                    </span>
                  </div>
                  <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Modal Footer (Spans Full Width) */}
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', fontSize: '0.82rem' }}>
              <CheckCircle size={15} />
              {editingTask 
                ? 'Save Task Updates' 
                : (isEmployeeRole ? 'Add Task to Schedule' : 'Assign Task')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
