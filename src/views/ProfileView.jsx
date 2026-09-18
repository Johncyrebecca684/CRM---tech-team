import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  User, 
  Mail, 
  Briefcase, 
  Calendar, 
  Save, 
  LogOut, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Image as ImageIcon,
  Key,
  Award
} from 'lucide-react';

export const ProfileView = () => {
  const { currentUser, userRole, updateProfile, changePassword, logout, tasks, timeLogs, employees, setCurrentTab } = useCrm();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    avatar: '',
    skills: '',
    weeklyCapacityHours: '40'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Password Change Form State
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Find matching employee record in employees state for detailed role/skills
      const empMatch = employees.find(
        (e) => (e.id && currentUser.id && e.id.toLowerCase() === currentUser.id.toLowerCase()) ||
               (e.email && currentUser.email && e.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim())
      );

      const existingRole = empMatch?.role || currentUser.roleTitle || (currentUser.role !== 'employee' && currentUser.role !== 'admin' ? currentUser.role : 'System Care Admin');

      setFormData({
        name: currentUser.name || empMatch?.name || '',
        email: currentUser.email || empMatch?.email || '',
        role: existingRole,
        avatar: currentUser.avatar || empMatch?.avatar || '',
        skills: Array.isArray(currentUser.skills) 
          ? currentUser.skills.join(', ') 
          : empMatch?.skills 
            ? (Array.isArray(empMatch.skills) ? empMatch.skills.join(', ') : empMatch.skills) 
            : (currentUser.skills || ''),
        weeklyCapacityHours: currentUser.weeklyCapacityHours 
          ? currentUser.weeklyCapacityHours.toString() 
          : (empMatch?.weeklyCapacityHours ? empMatch.weeklyCapacityHours.toString() : '40')
      });
    }
  }, [currentUser, employees]);

  if (!currentUser) return null;

  // Compute profile statistics
  const userTasks = tasks.filter((t) => {
    if (userRole === 'admin' || userRole === 'super_admin') return true;
    return (
      t.assignedToId === currentUser.id ||
      (t.assignedToEmail && t.assignedToEmail.toLowerCase() === currentUser.email?.toLowerCase()) ||
      (t.assignedToUsername && t.assignedToUsername.toLowerCase() === currentUser.name?.toLowerCase())
    );
  });

  const completedCount = userTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = userTasks.filter((t) => t.status === 'In Progress').length;
  
  const userLogs = timeLogs.filter((l) => l.employeeId === currentUser.id);
  const totalHoursLogged = userLogs.reduce((acc, curr) => acc + (parseFloat(curr.hours) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const skillsArray = formData.skills
      ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const effectiveRole = formData.role.trim() || (userRole === 'admin' ? 'System Care Admin' : 'Tech Specialist');

    await updateProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: effectiveRole,
      roleTitle: effectiveRole,
      avatar: formData.avatar,
      skills: skillsArray,
      weeklyCapacityHours: parseInt(formData.weeklyCapacityHours) || 40
    });

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passData.newPassword || passData.newPassword.length < 4) {
      setPassError('New password must be at least 4 characters.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPass(true);
    const result = await changePassword({
      currentPassword: passData.currentPassword,
      newPassword: passData.newPassword
    });
    setIsChangingPass(false);

    if (result.success) {
      setPassSuccess(result.message || 'Password updated successfully!');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassSuccess(''), 5000);
    } else {
      setPassError(result.error || 'Failed to change password. Please check your current password.');
    }
  };

  // Compute initials for the user profile badge
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, var(--accent-primary), #0284c7)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 18px rgba(0,0,0,0.15)',
                flexShrink: 0
              }}
            >
              {getInitials(formData.name || currentUser?.name || 'User')}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{formData.name || 'User Profile'}</h1>
                <span className="status-pill status-pill-optimal" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
                  {userRole === 'admin' ? '🛡️ Administrator' : '👤 Specialist'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                {formData.email} • ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>{currentUser.id}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setCurrentTab('performance-report')}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontWeight: 700
              }}
            >
              <Award size={16} /> My Performance Report (PDF)
            </button>

            <button
              onClick={logout}
              className="btn btn-secondary"
              style={{
                borderColor: 'rgba(225, 29, 72, 0.3)',
                color: '#e11d48',
                background: 'rgba(225, 29, 72, 0.08)',
                padding: '10px 18px',
                fontWeight: 700
              }}
            >
              <LogOut size={16} /> Sign Out Account
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ASSIGNED TASKS</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{userTasks.length}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{completedCount} Completed / {inProgressCount} Active</span>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>LOGGED HOURS</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{totalHoursLogged.toFixed(1)}h</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total productivity recorded</span>
        </div>


        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MEMBER JOINED DATE</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>
            {currentUser.joinedDate || 'Active 2026'}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Tech Team CRM Account</span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass-panel-glow" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--accent-primary)" /> Edit Profile Details
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Updates are stored directly to your account in the database and synchronized across the portal.
            </p>
          </div>

          {savedSuccess && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-emerald)',
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle2 size={16} /> Profile Saved to DB!
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. System Care Admin"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@company.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">Job Role / Designation</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. System Care Admin, Lead Specialist"
              />
            </div>
          </div>


          <div>
            <label className="form-label">Specialties & Skills</label>
            <div style={{ position: 'relative' }}>
              <Layers size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. System Admin, Strategy, Digital Marketing"
              />
            </div>
          </div>

          {/* Action Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button
              type="button"
              onClick={logout}
              className="btn btn-secondary"
              style={{
                color: '#f87171',
                borderColor: 'rgba(244, 63, 94, 0.3)',
                background: 'rgba(244, 63, 94, 0.08)'
              }}
            >
              <LogOut size={16} /> Sign Out of Tech CRM
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
              style={{ minWidth: '180px', padding: '10px 24px' }}
            >
              <Save size={16} />
              {isSaving ? 'Saving to Database...' : 'Save Profile Changes'}
            </button>
          </div>

        </form>
      </div>

      {/* Security & Password Change Form */}
      <div className="glass-panel" style={{ padding: '28px', borderRadius: '16px' }}>
        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="#fbbf24" /> Security & Change Password
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Update your account login password. The new password will be stored securely in the database for all future logins.
          </p>
        </div>

        {passSuccess && (
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--accent-emerald)',
            background: 'rgba(16, 185, 129, 0.15)',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle2 size={18} /> {passSuccess}
          </div>
        )}

        {passError && (
          <div style={{
            marginBottom: '16px',
            color: '#f87171',
            background: 'rgba(244, 63, 94, 0.15)',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid rgba(244, 63, 94, 0.3)'
          }}>
            {passError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">Current Password (or temporary password)</label>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                value={passData.currentPassword}
                onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                placeholder="Current / Initial password"
              />
            </div>

            <div>
              <label className="form-label">New Password *</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                className="form-input"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                placeholder="Enter new strong password"
              />
            </div>

            <div>
              <label className="form-label">Confirm New Password *</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                className="form-input"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={showPass}
                onChange={(e) => setShowPass(e.target.checked)}
              />
              Show passwords in plaintext
            </label>

            <button
              type="submit"
              disabled={isChangingPass}
              className="btn btn-primary"
              style={{ minWidth: '180px', padding: '10px 24px', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', fontWeight: 700 }}
            >
              <Key size={16} />
              {isChangingPass ? 'Updating in Database...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
