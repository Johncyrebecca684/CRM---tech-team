import React, { useState, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  User,
  Briefcase,
  Layers,
  Clock,
  Key
} from 'lucide-react';

export const AuthView = () => {
  const { 
    setCurrentUser,
    setSelectedEmployeeViewId,
    setCurrentTab,
    admins, 
    employees,
    setEmployees, 
    addEmployee 
  } = useCrm();

  const [authRole, setAuthRole] = useState('admin'); // 'admin' | 'employee'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' (register only for employee)

  // Saved credentials in localStorage
  const savedEmailKey = 'tech_crm_saved_email';
  const savedPassKey = 'tech_crm_saved_pass';
  const savedRememberKey = 'tech_crm_remember_me';

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Registration Fields (Employee only)
  const [regName, setRegName] = useState('');
  const [regRoleTitle, setRegRoleTitle] = useState('Software Engineer');

  // UI state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // First-Time Login Forced Password Change State
  const [isForcePasswordChange, setIsForcePasswordChange] = useState(false);
  const [pendingPassUser, setPendingPassUser] = useState(null);
  const [currentTempPass, setCurrentTempPass] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);

  // Step 2: Employee Profile Setup Onboarding State
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [pendingEmployeeUser, setPendingEmployeeUser] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [profileRole, setProfileRole] = useState('');
  const [profileSkills, setProfileSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [profileCapacity, setProfileCapacity] = useState('40');

  // Preset role and skill options
  const PRESET_ROLES = [
    'Media Specialist',
    'Graphic Designer',
    'Content Specialist',
    'UI/UX Designer',
    'Digital Marketer',
    'Software Engineer',
    'Associate Software Engineer',
    'Video Editor',
    'Frontend Developer'
  ];

  const PRESET_SKILLS = [
    'Social Media',
    'Creatives',
    'Banner Design',
    'Figma',
    'React',
    'Canva',
    'Copywriting',
    'SEO',
    'Video Editing',
    'JavaScript',
    'UI/UX',
    'Content Strategy'
  ];

  // Load saved credentials on mount if remember me was enabled
  useEffect(() => {
    const isRemembered = localStorage.getItem(savedRememberKey) === 'true';
    if (isRemembered) {
      const savedEmail = localStorage.getItem(savedEmailKey) || '';
      const savedPass = localStorage.getItem(savedPassKey) || '';
      if (savedEmail) setEmail(savedEmail);
      if (savedPass) setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  // When switching to admin role, ensure authMode is strictly login
  const handleRoleChange = (role) => {
    setAuthRole(role);
    if (role === 'admin') {
      setAuthMode('login');
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsCompletingProfile(false);
  };

  const handleToggleSkill = (skill) => {
    if (profileSkills.includes(skill)) {
      setProfileSkills(profileSkills.filter((s) => s !== skill));
    } else {
      setProfileSkills([...profileSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e?.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !profileSkills.includes(trimmed)) {
      setProfileSkills([...profileSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfileSkills(profileSkills.filter((s) => s !== skillToRemove));
  };

  // Submit Handler for First-Time Forced Password Change
  const handleForcePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingPassUser?.id,
          email: pendingPassUser?.email,
          currentPassword: currentTempPass || password,
          newPassword: newPassword.trim()
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccessMsg('Password successfully created! Full workspace access granted. Entering portal...');

      const updatedUser = {
        ...pendingPassUser,
        mustChangePassword: false,
        isPasswordChanged: true
      };

      if (rememberMe) {
        localStorage.setItem(savedPassKey, newPassword.trim());
      }

      if (setEmployees) {
        setEmployees(prev => {
          const matchIdx = prev.findIndex(e => e.id === updatedUser.id || (e.email && e.email.toLowerCase() === updatedUser.email.toLowerCase()));
          if (matchIdx >= 0) {
            const updated = [...prev];
            updated[matchIdx] = { ...updated[matchIdx], ...updatedUser, mustChangePassword: false, isPasswordChanged: true };
            return updated;
          }
          return [...prev, updatedUser];
        });
      }

      setTimeout(() => {
        setCurrentUser(updatedUser);
        setSelectedEmployeeViewId(updatedUser.id);
        setCurrentTab('employee-page');
      }, 700);

    } catch (err) {
      setErrorMsg(err.message || 'Error setting new password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setIsLoading(true);

    try {
      // Call database authentication endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, role: authRole })
      });

      let data;
      try {
        data = await response.json();
      } catch {
        if (!response.ok) {
          throw new Error(`Server unreachable or returned error (${response.status}). Please make sure the backend server is running.`);
        }
        throw new Error('Invalid response received from server.');
      }

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Authentication failed. Please check your credentials.');
      }

      // Role Verification
      if (authRole === 'admin' && data.user.role !== 'admin' && data.user.role !== 'super_admin') {
        throw new Error(`Access Denied: ${data.user.name} does not have administrator privileges. Please click the "Employee Portal" tab to sign in.`);
      }

      if (authRole === 'employee' && (data.user.role === 'admin' || data.user.role === 'super_admin')) {
        throw new Error(`Access Notice: ${data.user.name} is an Administrator. Please click the "Admin Portal" tab to sign in.`);
      }

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem(savedEmailKey, cleanEmail);
        localStorage.setItem(savedPassKey, password);
        localStorage.setItem(savedRememberKey, 'true');
      } else {
        localStorage.removeItem(savedEmailKey);
        localStorage.removeItem(savedPassKey);
        localStorage.setItem(savedRememberKey, 'false');
      }

      // First-time login password change requirement
      if (authRole === 'employee' && (data.mustChangePassword || data.user?.mustChangePassword)) {
        setPendingPassUser(data.user);
        setCurrentTempPass(password);
        setIsForcePasswordChange(true);
        setIsLoading(false);
        return;
      }

      // Sync employee into state if employee role
      if (authRole === 'employee' && setEmployees) {
        setEmployees(prev => {
          const matchIdx = prev.findIndex(e => 
            e.id === data.user.id || 
            (e.email && e.email.toLowerCase() === cleanEmail)
          );
          if (matchIdx >= 0) {
            const updated = [...prev];
            updated[matchIdx] = { ...updated[matchIdx], ...data.user, email: cleanEmail };
            return updated;
          } else {
            return [...prev, data.user];
          }
        });
      }

      setSuccessMsg(`Welcome back, ${data.user.name}! Redirecting...`);

      setTimeout(() => {
        setCurrentUser(data.user);
        if (authRole === 'admin') {
          setCurrentTab('admin-dashboard');
        } else {
          setSelectedEmployeeViewId(data.user.id);
          setCurrentTab('employee-page');
        }
      }, 500);

    } catch (err) {
      console.warn('[Auth Notice]', err.message);
      setErrorMsg(err.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Step 2 Profile Setup Handler
  const handleProfileStepSubmit = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!profileRole.trim()) {
      setErrorMsg('Please select or specify your role / designation.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const targetEmpId = pendingEmployeeUser?.id || `emp-${Date.now()}`;
      const targetEmail = pendingEmployeeUser?.email || email.trim().toLowerCase();
      const finalRole = profileRole.trim();
      const finalSkills = profileSkills.length > 0 ? profileSkills : ['Social Media', 'Creatives'];
      const finalCapacity = parseInt(profileCapacity) || 40;
      const finalAvatar = '';

      const updatedData = {
        id: targetEmpId,
        name: profileName.trim(),
        email: targetEmail,
        role: finalRole,
        roleTitle: finalRole,
        skills: finalSkills,
        weeklyCapacityHours: finalCapacity,
        avatar: finalAvatar,
        status: 'Active',
        isProfileCompleted: true,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      // 1. Update backend via PUT /api/employees/:id
      try {
        await fetch(`/api/employees/${targetEmpId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
      } catch (apiErr) {
        console.warn('API Sync Notice:', apiErr.message);
      }

      // 2. Update context state
      if (setEmployees) {
        setEmployees((prev) => {
          const matchIdx = prev.findIndex(
            (e) => (e.id && e.id === targetEmpId) || (e.email && e.email.toLowerCase() === targetEmail.toLowerCase())
          );
          if (matchIdx >= 0) {
            const updated = [...prev];
            updated[matchIdx] = { ...updated[matchIdx], ...updatedData };
            return updated;
          } else {
            return [...prev, updatedData];
          }
        });
      }

      const completedUserSession = {
        id: targetEmpId,
        name: profileName.trim(),
        email: targetEmail,
        role: 'employee',
        roleTitle: finalRole,
        skills: finalSkills,
        weeklyCapacityHours: finalCapacity,
        avatar: finalAvatar,
        isProfileCompleted: true
      };

      setSuccessMsg(`Welcome aboard, ${profileName.trim()}! Workspace activated.`);

      setTimeout(() => {
        setCurrentUser(completedUserSession);
        setSelectedEmployeeViewId(targetEmpId);
        setCurrentTab('employee-page');
      }, 500);

    } catch (err) {
      console.error('[Profile Setup Error]', err);
      setErrorMsg('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Register Handler (Employee Registration only)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !email.trim() || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      const createdEmp = await addEmployee({
        name: regName.trim(),
        role: regRoleTitle || 'Software Engineer',
        email: email.trim(),
        skills: ['Engineering'],
        weeklyCapacityHours: 40
      });

      const userSession = {
        id: createdEmp.id,
        name: createdEmp.name,
        email: createdEmp.email,
        role: 'employee',
        avatar: createdEmp.avatar,
        isProfileCompleted: false
      };

      if (rememberMe) {
        localStorage.setItem(savedEmailKey, email.trim());
        localStorage.setItem(savedPassKey, password);
        localStorage.setItem(savedRememberKey, 'true');
      }

      // Transition to Step 2 for skills & role confirmation
      setPendingEmployeeUser(userSession);
      setProfileName(createdEmp.name);
      setProfileRole(regRoleTitle || 'Software Engineer');
      setProfileSkills(['Engineering', 'Creatives']);
      setProfileCapacity('40');
      setIsCompletingProfile(true);
      setIsLoading(false);

    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-fade-in">
        
        {/* Left Column: Form / Step 2 Setup */}
        <div className="auth-form-side">
          <div>
            {/* Minimal Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)'
                }}>
                  <Layers size={20} />
                </div>
                <div>
                  <span style={{ 
                    fontSize: '0.92rem', 
                    fontWeight: 700, 
                    color: '#0f172a',
                    letterSpacing: '-0.01em' 
                  }}>
                    Tech Team CRM
                  </span>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                    Enterprise Workspace
                  </div>
                </div>
              </div>

              <span style={{
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#64748b',
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}>
                v5.2
              </span>
            </div>

            {/* FIRST-TIME LOGIN: Set New Password Form */}
            {isForcePasswordChange ? (
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  background: '#fef3c7',
                  color: '#b45309',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '12px'
                }}>
                  <Key size={14} />
                  <span>Security Setup: First-Time Login</span>
                </div>

                <h1 style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700, 
                  color: '#0f172a', 
                  letterSpacing: '-0.02em',
                  marginBottom: '6px'
                }}>
                  Set Your New Password
                </h1>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '20px' }}>
                  Welcome, <strong>{pendingPassUser?.name}</strong>! Since this is your first time logging in with a temporary password, please create your private password to activate and unlock your employee account.
                </p>

                {/* Alert Messages */}
                {errorMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#dc2626',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    color: '#16a34a',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleForcePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Current Temp Password */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                      Current / Temporary Password
                    </label>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        type="text"
                        readOnly
                        className="auth-input"
                        style={{ backgroundColor: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                        value={currentTempPass || password}
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                      New Private Password *
                    </label>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <Key size={16} />
                      </span>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        className="auth-input"
                        placeholder="Enter your new secure password (min 4 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                      Confirm New Password *
                    </label>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <Key size={16} />
                      </span>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        required
                        className="auth-input"
                        placeholder="Re-enter your new password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForcePasswordChange(false);
                        setPendingPassUser(null);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="auth-submit-btn"
                      style={{ flex: 1 }}
                    >
                      {isLoading ? (
                        'Securing Account...'
                      ) : (
                        <>
                          <span>Set Password & Access Workspace</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : isCompletingProfile ? (
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginBottom: '12px'
                }}>
                  <UserCheck size={14} />
                  <span>Step 2 of 2: Specialist Profile & Skills</span>
                </div>

                <h1 style={{ 
                  fontSize: '1.4rem', 
                  fontWeight: 700, 
                  color: '#0f172a', 
                  letterSpacing: '-0.02em',
                  marginBottom: '6px'
                }}>
                  Complete Your Profile
                </h1>
                <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '20px' }}>
                  Please confirm your name, role, and skills so tasks and projects are routed to you accurately.
                </p>

                {/* Alert Messages */}
                {errorMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#dc2626',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    color: '#16a34a',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleProfileStepSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Full Name */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                      Full Name *
                    </label>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        className="auth-input"
                        placeholder="e.g. Johncy Rebecca"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Role / Designation */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                      Role / Designation *
                    </label>
                    <div className="auth-input-group" style={{ marginBottom: '8px' }}>
                      <span className="auth-input-icon">
                        <Briefcase size={16} />
                      </span>
                      <input
                        type="text"
                        required
                        className="auth-input"
                        placeholder="e.g. Media Specialist, Software Engineer"
                        value={profileRole}
                        onChange={(e) => setProfileRole(e.target.value)}
                      />
                    </div>
                    {/* Role Quick Picks */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {PRESET_ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setProfileRole(role)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '14px',
                            border: profileRole === role ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                            background: profileRole === role ? '#eef2ff' : '#ffffff',
                            color: profileRole === role ? '#4338ca' : '#64748b',
                            fontSize: '0.72rem',
                            fontWeight: profileRole === role ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills / Expertise */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                      Skills & Specialties
                    </label>
                    
                    {/* Active Selected Skills Badges */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px', minHeight: '28px' }}>
                      {profileSkills.map((skill) => (
                        <span
                          key={skill}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#0f172a',
                            color: '#ffffff',
                            fontSize: '0.74rem',
                            fontWeight: 500
                          }}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '0.75rem',
                              lineHeight: 1,
                              marginLeft: '2px'
                            }}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Skill Preset Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
                      {PRESET_SKILLS.map((skill) => {
                        const isSelected = profileSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleToggleSkill(skill)}
                            style={{
                              padding: '3px 8px',
                              borderRadius: '12px',
                              border: isSelected ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                              background: isSelected ? '#eef2ff' : '#f8fafc',
                              color: isSelected ? '#4338ca' : '#64748b',
                              fontSize: '0.7rem',
                              fontWeight: isSelected ? 600 : 400,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isSelected ? '✓ ' : '+ '}{skill}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Skill Input */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="auth-input"
                        style={{ height: '36px', fontSize: '0.8rem' }}
                        placeholder="Add custom skill (e.g. Canva, SEO) and press Enter"
                        value={customSkillInput}
                        onChange={(e) => setCustomSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomSkill();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomSkill}
                        style={{
                          padding: '0 12px',
                          borderRadius: '8px',
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Weekly Capacity */}
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
                      Weekly Working Hours Capacity
                    </label>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <Clock size={16} />
                      </span>
                      <input
                        type="number"
                        min={10}
                        max={80}
                        className="auth-input"
                        value={profileCapacity}
                        onChange={(e) => setProfileCapacity(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCompletingProfile(false);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '0.84rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="auth-submit-btn"
                      style={{ flex: 1 }}
                    >
                      {isLoading ? (
                        'Saving Profile...'
                      ) : (
                        <>
                          <span>Complete & Enter Workspace</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* STEP 1: Portal Login Form */
              <div>
                {/* Title & Subtitle */}
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: '#0f172a', 
                    letterSpacing: '-0.02em',
                    marginBottom: '6px'
                  }}>
                    {authRole === 'admin' ? 'Admin Sign In' : 'Employee Sign In'}
                  </h1>
                  <p style={{ fontSize: '0.86rem', color: '#64748b' }}>
                    {authRole === 'admin'
                      ? 'Enter your administrative credentials to access management controls.'
                      : 'Enter your specialist credentials to access your personal dashboard.'}
                  </p>
                </div>

                {/* Role Switcher (Admin vs Employee) */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Select Portal
                  </div>
                  <div className="auth-segmented-control">
                    <button
                      type="button"
                      className={`auth-segmented-btn ${authRole === 'admin' ? 'active' : ''}`}
                      onClick={() => handleRoleChange('admin')}
                    >
                      <ShieldCheck size={16} /> Admin Portal
                    </button>
                    <button
                      type="button"
                      className={`auth-segmented-btn ${authRole === 'employee' ? 'active' : ''}`}
                      onClick={() => handleRoleChange('employee')}
                    >
                      <UserCheck size={16} /> Employee Portal
                    </button>
                  </div>
                </div>

                {/* Authorized Access Notice */}
                <div style={{ 
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  {authRole === 'admin' ? (
                    <>
                      <ShieldCheck size={15} color="var(--accent-primary)" />
                      <span>Authorized administrator access only</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={15} color="var(--accent-primary)" />
                      <span>Authorized specialist access only</span>
                    </>
                  )}
                </div>

                {/* Alert Messages */}
                {errorMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#dc2626',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '18px'
                  }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {successMsg && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    color: '#16a34a',
                    fontSize: '0.84rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '18px'
                  }}>
                    <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Form: Sign In */}
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        required
                        className="auth-input"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.78rem', color: '#475569', marginBottom: '6px' }}>
                      Password
                    </label>
                    <div className="auth-input-group">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="auth-input"
                        style={{ paddingRight: '40px' }}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '2px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ accentColor: '#0f172a', width: '15px', height: '15px', cursor: 'pointer' }}
                      />
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="auth-submit-btn"
                    style={{ marginTop: '6px' }}
                  >
                    {isLoading ? (
                      'Signing in...'
                    ) : (
                      <>
                        <span>Sign in to {authRole === 'admin' ? 'Admin' : 'Employee'} Portal</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer prompt */}
          {!isCompletingProfile && (
            <div style={{ 
              marginTop: '32px', 
              textAlign: 'center', 
              fontSize: '0.82rem', 
              color: 'var(--text-muted)' 
            }}>
              {authRole === 'admin' ? (
                <span>
                  Admin accounts are provisioned by system leads. Contact IT for administrative access.
                </span>
              ) : (
                <span>
                  Employee accounts are provisioned by admin leads. Contact management for credentials.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sleek Brand Showcase */}
        <div className="auth-brand-side">
          <div>
            {/* Live Operational Status */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#f8fafc',
              marginBottom: '36px'
            }}>
              <span className="status-indicator-dot" />
              <span>Workspace Status: Operational</span>
            </div>

            {/* Headline & Value Prop */}
            <h2 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.75rem',
              fontWeight: 700,
              lineHeight: 1.25,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: '14px'
            }}>
              Precision team orchestration & velocity.
            </h2>
            <p style={{
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: '#94a3b8',
              marginBottom: '32px'
            }}>
              Designed for modern technology teams to monitor sprints, streamline tasks, manage engineering capacity, and hit delivery deadlines with ease.
            </p>

            {/* Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="auth-feature-item">
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'rgba(79, 70, 229, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#818cf8',
                  flexShrink: 0
                }}>
                  <Layers size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    Sprint & Kanban Orchestration
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                    Interactive task boards with automated SLA tracking and priority workflows.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'rgba(16, 185, 129, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#34d399',
                  flexShrink: 0
                }}>
                  <Clock size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    Precision Time & Capacity Tracking
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                    One-click active timers and team capacity insights to prevent burnout.
                  </div>
                </div>
              </div>

              <div className="auth-feature-item">
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  background: 'rgba(236, 72, 153, 0.2)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#f472b6',
                  flexShrink: 0
                }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    Role-Based Access Control (RBAC)
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                    Dedicated portals for project managers and engineering contributors.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div style={{ 
            paddingTop: '28px', 
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            <span>End-to-End Encrypted Session</span>
            <span>v5.2.0 Enterprise</span>
          </div>
        </div>

      </div>
    </div>
  );
};
