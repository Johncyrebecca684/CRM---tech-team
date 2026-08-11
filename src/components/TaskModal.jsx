import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { X, Calendar, Clock, User, Tag, CheckCircle } from 'lucide-react';

export const TaskModal = () => {
  const { 
    isTaskModalOpen, 
    setIsTaskModalOpen, 
    editingTask, 
    addTask, 
    updateTask, 
    employees,
    currentUser,
    CLIENT_PROJECT_OPTIONS,
    ACTIVITY_OPTIONS,
    CORE_ACTIVITY_OPTIONS,
    STATUS_OPTIONS,
    SLA_STATUS_OPTIONS
  } = useCrm();

  const isEmployeeRole = currentUser?.role === 'employee';
  const defaultAssignedId = isEmployeeRole ? currentUser.id : (employees[0]?.id || '');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    clientProject: CLIENT_PROJECT_OPTIONS ? CLIENT_PROJECT_OPTIONS[0] : 'Nammude Laundry',
    activity: ACTIVITY_OPTIONS ? ACTIVITY_OPTIONS[0] : 'Static',
    project: 'S01',
    coreActivity: CORE_ACTIVITY_OPTIONS ? CORE_ACTIVITY_OPTIONS[0] : 'Social Media Content',
    assignedToId: defaultAssignedId,
    workStartDate: new Date().toISOString().split('T')[0],
    targetEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    actualEndDate: '',
    slaStatus: 'Green',
    status: 'In Progress',
    commentsUpdates: '',
    estimatedHours: '10'
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        date: editingTask.date || new Date().toISOString().split('T')[0],
        clientProject: editingTask.clientProject || CLIENT_PROJECT_OPTIONS[0],
        activity: editingTask.activity || editingTask.title || ACTIVITY_OPTIONS[0],
        project: editingTask.project || '',
        coreActivity: editingTask.coreActivity || CORE_ACTIVITY_OPTIONS[0],
        assignedToId: isEmployeeRole ? currentUser.id : (editingTask.assignedToId || employees[0]?.id || ''),
        workStartDate: editingTask.workStartDate || new Date().toISOString().split('T')[0],
        targetEndDate: editingTask.targetEndDate || '',
        actualEndDate: editingTask.actualEndDate || '',
        slaStatus: editingTask.slaStatus || 'Green',
        status: editingTask.status || 'In Progress',
        commentsUpdates: editingTask.commentsUpdates || '',
        estimatedHours: editingTask.estimatedHours ? editingTask.estimatedHours.toString() : '10'
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        clientProject: CLIENT_PROJECT_OPTIONS[0],
        activity: ACTIVITY_OPTIONS[0],
        project: 'S01',
        coreActivity: CORE_ACTIVITY_OPTIONS[0],
        assignedToId: defaultAssignedId,
        workStartDate: new Date().toISOString().split('T')[0],
        targetEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actualEndDate: '',
        slaStatus: 'Green',
        status: 'In Progress',
        commentsUpdates: '',
        estimatedHours: '10'
      });
    }
  }, [editingTask, isTaskModalOpen, employees, currentUser]);

  if (!isTaskModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.activity.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }

    setIsTaskModalOpen(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '680px' }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {editingTask ? `Edit Task Record: ${editingTask.id}` : '➕ Assign Work Task (August Excel Schema)'}
          </h2>
          <button 
            onClick={() => setIsTaskModalOpen(false)}
            className="btn btn-secondary btn-icon"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form matching exact Excel sheet columns with dropdowns */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label className="form-label">Date *</label>
              <input
                type="date"
                required
                className="form-input"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Client / Project *</label>
              <select
                className="form-select"
                value={formData.clientProject}
                onChange={(e) => setFormData({ ...formData, clientProject: e.target.value })}
              >
                {CLIENT_PROJECT_OPTIONS.map((cp) => (
                  <option key={cp} value={cp}>{cp}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Activity *</label>
              <select
                className="form-select"
                value={formData.activity}
                onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              >
                {ACTIVITY_OPTIONS.map((act) => (
                  <option key={act} value={act}>{act}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Project Code / Identifier</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. S01, C04, W01, A01"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Core Activity *</label>
              <select
                className="form-select"
                value={formData.coreActivity}
                onChange={(e) => setFormData({ ...formData, coreActivity: e.target.value })}
              >
                {CORE_ACTIVITY_OPTIONS.map((ca) => (
                  <option key={ca} value={ca}>{ca}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">tech names (Assigned Tech) *</label>
              <select
                className="form-select"
                disabled={isEmployeeRole}
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    👤 {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
              {isEmployeeRole && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🔒 Locked to your account ({currentUser?.name})
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">SLA Status (G/R)</label>
              <select
                className="form-select"
                value={formData.slaStatus}
                onChange={(e) => setFormData({ ...formData, slaStatus: e.target.value })}
              >
                <option value="Green">🟩 Green (On Track / SLA Met)</option>
                <option value="Red">🟥 Red (Breached / At Risk)</option>
              </select>
            </div>

            <div>
              <label className="form-label">Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DATES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Work Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.workStartDate}
                onChange={(e) => setFormData({ ...formData, workStartDate: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Target End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.targetEndDate}
                onChange={(e) => setFormData({ ...formData, targetEndDate: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Actual End Date</label>
              <input
                type="date"
                className="form-input"
                placeholder="Auto on complete"
                value={formData.actualEndDate || ''}
                onChange={(e) => setFormData({ ...formData, actualEndDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Code Review</option>
                <option value="Completed">Completed</option>
                <option value="Incomplete">Incomplete</option>
              </select>
            </div>

            <div>
              <label className="form-label">Est. Hours</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Comments / Updates</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Completed phase 1 schema setup; awaiting QA approval..."
              value={formData.commentsUpdates}
              onChange={(e) => setFormData({ ...formData, commentsUpdates: e.target.value })}
            />
          </div>

          {/* Modal Footer */}
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
              onClick={() => setIsTaskModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle size={16} />
              {editingTask ? 'Save Task Updates' : 'Assign Task Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
