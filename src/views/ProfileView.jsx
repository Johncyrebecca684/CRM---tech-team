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
  const { currentUser, userRole, updateProfile, logout, tasks, timeLogs, employees, setCurrentTab } = useCrm();

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

  useEffect(() => {
    if (currentUser) {
      // Find matching employee record in employees state for detailed role/skills
      const empMatch = employees.find(
        (e) => (e.id && currentUser.id && e.id.toLowerCase() === currentUser.id.toLowerCase()) ||
               (e.email && currentUser.email && e.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim())
      );

      const existingRole = empMatch?.role || currentUser.roleTitle || (currentUser.role !== 'employee' && currentUser.role !== 'admin' ? currentUser.role : 'Media Specialist');

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

    const effectiveRole = formData.role.trim() || 'Tech Specialist';

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

  const getRandomAvatar = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    setFormData((prev) => ({ ...prev, avatar: newAvatar }));
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(0, 168, 132, 0.25)',
              flexShrink: 0
            }}>
              <User size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)', margin: 0 }}>{currentUser.name}</h1>
                <span className="status-pill status-pill-optimal" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
                  {userRole === 'admin' ? '🛡️ Administrator' : '👤 Tech Specialist'}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                {currentUser.email} • ID: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>{currentUser.id}</span>
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
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACCOUNT ROLE</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'capitalize' }}>
            {currentUser.role}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Access Level Permissions</span>
        </div>

        <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ASSIGNED WORK TASKS</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {userTasks.length}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{completedCount} Completed / {inProgressCount} Active</span>
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
                  placeholder="e.g. Tamil Selvi, Dev Team Lead"
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
                  placeholder="name@techteam.dev"
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
                placeholder="e.g. Senior Full Stack Engineer, Graphic Designer"
              />
            </div>
          </div>


          <div>
            <label className="form-label">Technical Skills & Specialties (Comma separated)</label>
            <div style={{ position: 'relative' }}>
              <Layers size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g. React, Node.js, Social Media, Design, MongoDB"
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

    </div>
  );
};
