import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Crown, 
  ShieldCheck, 
  UserCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Key,
  Users,
  Settings
} from 'lucide-react';

export const SuperAdminView = () => {
  const { 
    superAdmins, 
    admins, 
    employees, 
    addAdminAccount, 
    promoteEmployeeToAdmin,
    deleteEmployee,
    clearAllData,
    tasks,
    timeLogs
  } = useCrm();

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;
    addAdminAccount({ name: newAdminName, email: newAdminEmail });
    setNewAdminName('');
    setNewAdminEmail('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Super Admin Title Banner */}
      <div className="glass-panel-glow" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}>
            <Crown size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Super Admin Master Control</h1>
              <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                FULL RBAC MASTER ACCESS
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              System-wide user role assignments, admin manager provision & security parameters
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (window.confirm('WARNING: Full System Data Wipe! Delete all tasks, time logs, and employee profiles?')) {
              clearAllData();
            }
          }}
          className="btn btn-danger"
          style={{ padding: '10px 16px', fontSize: '0.85rem' }}
        >
          <Trash2 size={16} /> Wipe All System Data to Zero
        </button>
      </div>

      {/* RBAC Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>SUPER ADMINS</span>
            <Crown size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
            {superAdmins.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Highest system authority</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ADMIN MANAGERS</span>
            <ShieldCheck size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {admins.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Task & Team managers</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TECH EMPLOYEES</span>
            <UserCheck size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>
            {employees.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Registered specialists</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE TASKS</span>
            <Zap size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {tasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Across all tech columns</div>
        </div>
      </div>

      {/* Provision New Admin Form */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={18} color="var(--accent-primary)" />
          Provision New Admin Manager Account
        </h2>

        <form onSubmit={handleCreateAdmin} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label">Manager Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Sarah Connor"
              value={newAdminName}
              onChange={(e) => setNewAdminName(e.target.value)}
            />
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="sarah.c@techteam.dev"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px' }}>
            <UserPlus size={16} /> Grant Admin Access
          </button>
        </form>
      </div>

      {/* Role Assignment Matrix Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color="#fbbf24" />
          System User Role Access Matrix (RBAC Control)
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px' }}>User Name & Email</th>
                <th style={{ padding: '12px' }}>Assigned RBAC Role</th>
                <th style={{ padding: '12px' }}>Permissions Granted</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Role Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Super Admins */}
              {superAdmins.map((sa) => (
                <tr key={sa.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 700, color: '#fff' }}>
                    {sa.name} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({sa.email})</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 700 }}>
                      👑 SUPER ADMIN
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Full master permissions, data wipes, role delegation
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                    System Root
                  </td>
                </tr>
              ))}

              {/* Admin Managers */}
              {admins.map((adm) => (
                <tr key={adm.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 700, color: '#fff' }}>
                    {adm.name} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({adm.email})</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className="badge badge-in-progress" style={{ fontSize: '0.7rem' }}>
                      🛡️ ADMIN MANAGER
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Assign tasks, add employees, set due dates & capacities
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>Active Manager</span>
                  </td>
                </tr>
              ))}

              {/* Tech Employees */}
              {employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: 700, color: '#fff' }}>
                    {emp.name} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({emp.email})</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>
                      👤 TECH EMPLOYEE
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    View assigned tasks, log work hours, stopwatch timer
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                    <button
                      onClick={() => promoteEmployeeToAdmin(emp.id)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Promote to Admin
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
