import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Crown, ShieldCheck, UserCheck, Sparkles, LogIn, UserPlus, Key } from 'lucide-react';

export const AuthView = () => {
  const { 
    loginAsSuperAdmin, 
    loginAsAdmin, 
    loginAsEmployee, 
    setCurrentUser,
    setSelectedEmployeeViewId,
    setCurrentTab,
    admins, 
    employees, 
    addEmployee,
    addAdminAccount 
  } = useCrm();

  const [authMode, setAuthMode] = useState('employee'); // Default to Employee tab for registration ease

  // Super Admin state
  const [superName, setSuperName] = useState('Chief Technology Officer');
  const [superEmail, setSuperEmail] = useState('cto@techteam.dev');

  // Admin state
  const [selectedAdminId, setSelectedAdminId] = useState(admins[0]?.id || '');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Employee state
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Software Engineer');
  const [newEmpEmail, setNewEmpEmail] = useState('');

  const handleSuperSubmit = (e) => {
    e.preventDefault();
    loginAsSuperAdmin(superName, superEmail);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    if (selectedAdminId) {
      loginAsAdmin(selectedAdminId);
    } else if (admins.length > 0) {
      loginAsAdmin(admins[0].id);
    }
  };

  const handleCreateAdminSubmit = (e) => {
    e.preventDefault();
    if (!newAdminName.trim() || !newAdminEmail.trim()) return;
    const createdAdmin = addAdminAccount({ name: newAdminName, email: newAdminEmail });
    
    // Direct User Session Set
    setCurrentUser({
      id: createdAdmin.id,
      name: createdAdmin.name,
      email: createdAdmin.email,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });
    setCurrentTab('admin-dashboard');
  };

  const handleEmployeeSubmit = (e) => {
    e.preventDefault();
    if (selectedEmpId) {
      loginAsEmployee(selectedEmpId);
    } else if (employees.length > 0) {
      loginAsEmployee(employees[0].id);
    }
  };

  const handleRegisterEmployeeSubmit = (e) => {
    e.preventDefault();
    if (!newEmpName.trim()) return;

    const createdEmp = addEmployee({
      name: newEmpName,
      role: newEmpRole || 'Software Engineer',
      email: newEmpEmail || `${newEmpName.toLowerCase().replace(/\s+/g, '.')}@techteam.dev`,
      skills: ['React', 'JavaScript'],
      weeklyCapacityHours: 40
    });

    // Direct User Session Set to bypass React async closure delay
    const userSession = {
      id: createdEmp.id,
      name: createdEmp.name,
      email: createdEmp.email,
      role: 'employee',
      avatar: createdEmp.avatar
    };

    setCurrentUser(userSession);
    setSelectedEmployeeViewId(createdEmp.id);
    setCurrentTab('employee-page');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.18) 0%, rgba(7, 10, 18, 1) 70%)',
      padding: '20px'
    }}>
      <div className="glass-panel-glow animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '36px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Tech Team CRM</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            3-Tier Role-Based Access Control (RBAC) System
          </p>
        </div>

        {/* 2 Role Portal Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
          background: 'var(--bg-input)',
          padding: '4px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setAuthMode('admin')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: authMode === 'admin' || authMode === 'register-admin' ? 'var(--gradient-primary)' : 'transparent',
              color: authMode === 'admin' || authMode === 'register-admin' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: '6px' }} /> Admin Portal
          </button>

          <button
            onClick={() => setAuthMode('employee')}
            style={{
              padding: '10px 8px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: authMode === 'employee' || authMode === 'register-emp' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
              color: authMode === 'employee' || authMode === 'register-emp' ? '#fff' : 'var(--text-muted)'
            }}
          >
            <UserCheck size={14} style={{ display: 'inline', marginRight: '6px' }} /> Employee Portal
          </button>
        </div>

        {/* ADMIN PORTAL */}
        {authMode === 'admin' && (
          <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
              🛡️ Admin Manager Access: Work task assignment, employee capacities, dates & team stats control.
            </div>

            {admins.length > 0 ? (
              <>
                <div>
                  <label className="form-label">Select Admin Manager</label>
                  <select
                    className="form-select"
                    style={{ padding: '12px' }}
                    value={selectedAdminId || admins[0]?.id}
                    onChange={(e) => setSelectedAdminId(e.target.value)}
                  >
                    {admins.map((adm) => (
                      <option key={adm.id} value={adm.id}>
                        🛡️ {adm.name} ({adm.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '0.95rem', marginTop: '6px' }}>
                  <LogIn size={18} /> Login as Admin Manager
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>No admin manager profiles found.</p>
                <button type="button" onClick={() => setAuthMode('register-admin')} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                  <UserPlus size={16} /> Create Admin Profile
                </button>
              </div>
            )}
          </form>
        )}

        {/* CREATE ADMIN PORTAL */}
        {authMode === 'register-admin' && (
          <form onSubmit={handleCreateAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Create Admin Manager Account</h3>

            <div>
              <label className="form-label">Manager Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Alex Manager"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="alex.m@techteam.dev"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '6px' }}>
              <Key size={16} /> Register & Enter Admin Dashboard
            </button>
          </form>
        )}

        {/* EMPLOYEE PORTAL */}
        {(authMode === 'employee' || authMode === 'register-emp') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', color: 'var(--accent-emerald)' }}>
              👤 Employee Access: Personal task list, stopwatch time logger, and end-of-month hour audits.
            </div>

            {employees.length > 0 && authMode === 'employee' ? (
              <form onSubmit={handleEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="form-label">Select Registered Tech Employee</label>
                  <select
                    className="form-select"
                    style={{ padding: '12px' }}
                    value={selectedEmpId || employees[0]?.id}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        👤 {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn" style={{ padding: '12px', fontSize: '0.95rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
                  <LogIn size={18} /> Enter Employee Work Page
                </button>

                <div style={{ textAlign: 'center', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register-emp')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Register New Tech Employee Account
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterEmployeeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>Register Tech Specialist Account</h3>

                <div>
                  <label className="form-label">FULL NAME *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Johncy Rebecca"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">JOB TITLE / TECH ROLE *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Software Engineer"
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">EMAIL ADDRESS *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="johncyrebecca@gmail.com"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn" style={{ padding: '12px', background: 'var(--accent-emerald)', color: '#fff', marginTop: '6px', cursor: 'pointer' }}>
                  <UserPlus size={16} /> Register & Open Employee Page
                </button>

                {employees.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('employee')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', marginTop: '4px' }}
                  >
                    ← Back to Registered Employee Select
                  </button>
                )}
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
