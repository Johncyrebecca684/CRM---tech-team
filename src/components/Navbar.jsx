import React from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  User, 
  Plus, 
  Search, 
  LogOut, 
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { 
    currentUser,
    userRole,
    currentTab,
    logout,
    searchQuery,
    setSearchQuery,
    setIsTaskModalOpen,
    setEditingTask
  } = useCrm();

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const getRoleBadge = () => {
    if (userRole === 'admin') {
      return (
        <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--accent-primary)', fontWeight: 700, border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          🛡️ ADMIN MANAGER
        </span>
      );
    }
    return (
      <span style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent-emerald)', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.4)' }}>
        👤 EMPLOYEE
      </span>
    );
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
      {/* Brand & Workspace Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ 
          width: '38px', 
          height: '38px', 
          borderRadius: '10px', 
          background: 'var(--gradient-accent)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>TechPulse CRM</h1>
            {getRoleBadge()}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role-Based Access Control Active</p>
        </div>
      </div>

      {/* Global Search (Hidden on Admin Overview) */}
      {currentTab !== 'admin-dashboard' ? (
        <div style={{ flex: '0 1 340px', position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search tasks, category, ID..."
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', borderRadius: '20px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      ) : <div style={{ flex: 1 }} />}

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Assign Task Button Modal Trigger */}
        <button 
          onClick={handleOpenNewTask} 
          className="btn btn-primary" 
          style={{ padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <Plus size={16} /> Assign Task
        </button>

        {/* Current User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
          ) : (
            <User size={16} color="var(--accent-primary)" />
          )}
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
            {currentUser?.name}
          </div>
        </div>

        {/* Logout */}
        <button 
          onClick={logout} 
          className="btn btn-secondary btn-icon"
          title="Sign Out / Switch Portal"
        >
          <LogOut size={16} />
        </button>

      </div>
    </header>
  );
};
