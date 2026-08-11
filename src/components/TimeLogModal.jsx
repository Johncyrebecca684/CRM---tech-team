import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { X, Clock, Check } from 'lucide-react';

export const TimeLogModal = () => {
  const { isTimeLogModalOpen, setIsTimeLogModalOpen, taskForLogging, logWorkTime } = useCrm();

  const [hours, setHours] = useState('2.0');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  if (!isTimeLogModalOpen || !taskForLogging) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(hours);
    if (parsed > 0) {
      logWorkTime(taskForLogging.id, parsed, description, logDate);
      setIsTimeLogModalOpen(false);
      setHours('2.0');
      setDescription('');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '460px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Log Work Hours</h2>
          </div>
          <button onClick={() => setIsTimeLogModalOpen(false)} className="btn btn-secondary btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Task</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{taskForLogging.id}: {taskForLogging.title}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Hours Spent</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                required
                className="form-input"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Log Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Work Summary / Remarks</label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Fixed async await bug in handler and ran regression tests..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsTimeLogModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} /> Save Log Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
