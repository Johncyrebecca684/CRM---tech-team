import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Users, UserPlus, Edit3, Trash2, CheckCircle2, ShieldCheck, Mail, Calendar, Briefcase } from 'lucide-react';

export const TeamView = () => {
  const { 
    employees, 
    tasks, 
    timeLogs, 
    setIsEmployeeModalOpen, 
    setEditingEmployee, 
    deleteEmployee,
    setActiveEmployeeId,
    setCurrentTab
  } = useCrm();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tech Team Control Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Admin controls for 6 tech specialists: roles, capacity limits, skill sets & status
          </p>
        </div>

        <button 
          onClick={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
          className="btn btn-primary"
        >
          <UserPlus size={16} /> Add Tech Member
        </button>
      </div>

      {/* Employees Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {employees.map((emp) => {
          const empTasks = tasks.filter((t) => t.assignedToId === emp.id);
          const empCompleted = empTasks.filter((t) => t.status === 'Completed').length;
          const empInProgress = empTasks.filter((t) => t.status === 'In Progress').length;
          const empIncomplete = empTasks.filter((t) => t.status === 'Incomplete').length;

          const totalHours = timeLogs
            .filter((l) => l.employeeId === emp.id)
            .reduce((acc, l) => acc + l.hours, 0)
            .toFixed(1);

          return (
            <div key={emp.id} className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Employee Card Top Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <img 
                    src={emp.avatar} 
                    alt={emp.name} 
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{emp.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{emp.role}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {emp.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      setEditingEmployee(emp);
                      setIsEmployeeModalOpen(true);
                    }}
                    className="btn btn-secondary btn-icon"
                    style={{ width: '32px', height: '32px' }}
                    title="Edit Employee Settings"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="btn btn-danger btn-icon"
                    style={{ width: '32px', height: '32px' }}
                    title="Remove Member"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Skill Stack */}
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '6px' }}>Technical Skills</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {emp.skills.map((skill, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Assigned</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{empTasks.length}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>Done</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{empCompleted}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>Logged Hours</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{totalHours}h</div>
                </div>
              </div>

              {/* View Employee Page Action */}
              <button
                onClick={() => {
                  setActiveEmployeeId(emp.id);
                  setCurrentTab('employee-page');
                }}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                Open {emp.name.split(' ')[0]}'s Employee Work Page →
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};
