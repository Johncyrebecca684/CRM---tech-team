import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { X, UserPlus, Save } from 'lucide-react';

export const EmployeeModal = () => {
  const { 
    isEmployeeModalOpen, 
    setIsEmployeeModalOpen, 
    editingEmployee, 
    addEmployee, 
    updateEmployee 
  } = useCrm();

  const [formData, setFormData] = useState({
    name: '',
    role: 'Software Engineer',
    email: '',
    skills: 'React, Node.js',
    weeklyCapacityHours: '40'
  });

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        name: editingEmployee.name || '',
        role: editingEmployee.role || 'Software Engineer',
        email: editingEmployee.email || '',
        skills: editingEmployee.skills ? editingEmployee.skills.join(', ') : '',
        weeklyCapacityHours: editingEmployee.weeklyCapacityHours ? editingEmployee.weeklyCapacityHours.toString() : '40'
      });
    } else {
      setFormData({
        name: '',
        role: 'Software Engineer',
        email: '',
        skills: 'React, TypeScript, CSS',
        weeklyCapacityHours: '40'
      });
    }
  }, [editingEmployee, isEmployeeModalOpen]);

  if (!isEmployeeModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const skillsArray = formData.skills.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        name: formData.name,
        role: formData.role,
        email: formData.email,
        skills: skillsArray,
        weeklyCapacityHours: parseInt(formData.weeklyCapacityHours) || 40
      });
    } else {
      await addEmployee({
        name: formData.name,
        role: formData.role,
        email: formData.email,
        skills: skillsArray,
        weeklyCapacityHours: parseInt(formData.weeklyCapacityHours) || 40
      });
    }

    setIsEmployeeModalOpen(false);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(255,255,255,0.02)'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {editingEmployee ? `Edit Employee: ${editingEmployee.name}` : '👤 Add New Tech Team Member'}
          </h2>
          <button onClick={() => setIsEmployeeModalOpen(false)} className="btn btn-secondary btn-icon">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Jordan Lee"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="form-label">Role Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Senior Backend Dev"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="jordan.l@techteam.dev"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Skills (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="React, Docker, AWS"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsEmployeeModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Save Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
