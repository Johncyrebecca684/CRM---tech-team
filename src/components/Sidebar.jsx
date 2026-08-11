import React from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Crown,
  LayoutDashboard, 
  UserCheck, 
  Kanban, 
  ListTodo, 
  Clock, 
  Users, 
  FileText,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    userRole, 
    currentUser,
    tasks, 
    employees, 
    selectedEmployeeViewId 
  } = useCrm();

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasksCount = tasks.filter((t) => t.status === 'In Progress').length;

  const currentEmployee = employees.find((e) => e.id === selectedEmployeeViewId) || employees[0];

  const navItems = [
    {
      id: 'admin-dashboard',
      label: 'Admin Overview',
      icon: LayoutDashboard,
      roles: ['admin'],
      badge: null
    },
    {
      id: 'employee-page',
      label: userRole === 'employee' ? 'My Work Page' : `${currentEmployee?.name?.split(' ')[0] || 'Employee'}'s Page`,
      icon: UserCheck,
      roles: ['admin', 'employee'],
      badge: 'Personal'
    },
    {
      id: 'kanban-tasks',
      label: 'Kanban Board',
      icon: Kanban,
      roles: ['admin', 'employee'],
      badge: totalTasksCount.toString()
    },
    {
      id: 'list-tasks',
      label: 'Task Data Grid',
      icon: ListTodo,
      roles: ['admin', 'employee'],
      badge: null
    },
    {
      id: 'team-control',
      label: 'Tech Team Control',
      icon: Users,
      roles: ['admin'],
      badge: `${employees.length} Techs`
    },
    {
      id: 'monthly-reports',
      label: 'End-of-Month Audit',
      icon: FileText,
      roles: ['admin', 'employee'],
      badge: 'Monthly'
    }
  ];

  return (
    <aside style={{ 
      width: '260px', 
      backgroundColor: 'var(--bg-sidebar)', 
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      justifyContent: 'space-between'
    }}>
      <div>
        {/* Active Role Portal Banner */}
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          background: userRole === 'super_admin'
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)'
            : userRole === 'admin'
              ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)' 
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
          border: `1px solid ${
            userRole === 'super_admin' ? 'rgba(245, 158, 11, 0.35)' : userRole === 'admin' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)'
          }`,
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
            {userRole === 'super_admin' ? 'Master Authority' : userRole === 'admin' ? 'Manager Portal' : 'Tech Member Portal'}
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '2px', color: userRole === 'super_admin' ? '#fbbf24' : userRole === 'admin' ? 'var(--accent-primary)' : 'var(--accent-emerald)' }}>
            {currentUser?.name || 'User'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Role: {userRole.toUpperCase().replace('_', ' ')}
          </div>
        </div>

        {/* Menu Navigation */}
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)', fontWeight: 700, paddingLeft: '8px', marginBottom: '8px' }}>
          RBAC Permitted Views
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: isActive ? (userRole === 'super_admin' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'var(--gradient-primary)') : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} color={isActive ? '#ffffff' : 'currentColor'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 600
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* Task Summary Stat Box */}
      <div className="glass-panel" style={{ padding: '14px', marginTop: 'auto', background: 'rgba(15, 23, 42, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Workspace Pulse</span>
          <Zap size={14} color="var(--accent-amber)" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Done</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>{completedTasksCount}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '6px' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Active</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{inProgressTasksCount}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
