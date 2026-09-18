import React from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Crown,
  LayoutDashboard, 
  UserCheck, 
  CalendarCheck, 
  Kanban, 
  ListTodo, 
  Clock, 
  Users, 
  FileText, 
  ShieldCheck,
  AlertCircle,
  User,
  LogOut,
  Layers,
  Settings,
  Award,
  Headphones,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Share2,
  CalendarDays
} from 'lucide-react';

export const Sidebar = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    userRole, 
    currentUser,
    logout,
    tasks, 
    employees, 
    selectedEmployeeViewId,
    setSelectedEmployeeViewId,
    isSidebarCollapsed,
    toggleSidebarCollapse
  } = useCrm();

  const currentEmployee = employees.find((e) => e.id === selectedEmployeeViewId) || employees[0];

  const navItems = [
    {
      id: 'admin-dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin']
    },
    {
      id: 'employee-page',
      label: userRole === 'employee' ? 'Dashboard' : 'Employees',
      icon: userRole === 'employee' ? LayoutDashboard : UserCheck,
      roles: ['admin', 'employee'],
      badge: userRole === 'admin' ? employees.length : undefined
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: CalendarCheck,
      roles: ['admin', 'employee']
    },
    {
      id: 'list-tasks',
      label: 'Tasks',
      icon: ListTodo,
      roles: ['admin', 'employee'],
      badge: tasks?.filter(t => t.status !== 'Done' && t.status !== 'Completed')?.length || undefined
    },
    {
      id: 'social-media-calendar',
      label: 'Social Calendar',
      icon: Share2,
      roles: ['admin', 'employee', 'super_admin']
    },
    {
      id: 'task-calendar',
      label: 'Task Calendar',
      icon: CalendarDays,
      roles: ['admin', 'employee', 'super_admin']
    },
    {
      id: 'monthly-reports',
      label: 'Employee Audit',
      icon: FileText,
      roles: ['admin', 'super_admin']
    },

    {
      id: 'performance-report',
      label: 'Performance',
      icon: Award,
      roles: ['admin', 'employee', 'super_admin']
    }
  ];

  return (
    <aside className="app-sidebar" style={{ 
      width: isSidebarCollapsed ? '72px' : '260px', 
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 50,
      overflowY: 'auto',
      overflowX: 'hidden',
      backgroundColor: 'var(--bg-sidebar)', 
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: isSidebarCollapsed ? '20px 8px' : '20px 14px',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)',
      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), padding 0.25s ease'
    }}>
      {/* TOP SECTION: BRAND HEADER & NAVIGATION */}
      <div>
        {/* Brand Header with Collapse Toggle Button */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isSidebarCollapsed ? 'center' : 'space-between', 
          padding: isSidebarCollapsed ? '2px 0 16px 0' : '2px 4px 16px 4px', 
          borderBottom: '1px solid var(--border-color)', 
          marginBottom: '18px' 
        }}>
          {!isSidebarCollapsed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 3px 12px rgba(0, 168, 132, 0.35)',
                  flexShrink: 0
                }}>
                  <Layers size={19} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Tech Team CRM
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 500, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
                    Enterprise Hub
                  </div>
                </div>
              </div>

              {/* Collapse Button */}
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                title="Collapse sidebar"
                style={{
                  background: 'var(--bg-card-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text-main)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                <ChevronLeft size={16} />
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={toggleSidebarCollapse}
                title="Expand sidebar"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: '0 3px 12px rgba(0, 168, 132, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.06)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Menu Section Label */}
        {!isSidebarCollapsed && (
          <div style={{ 
            fontSize: '0.66rem', 
            textTransform: 'uppercase', 
            letterSpacing: '0.08em', 
            color: 'var(--text-dim)', 
            fontWeight: 700, 
            paddingLeft: '8px', 
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-primary)' }}></span>
            RBAC Permitted Views
          </div>
        )}
        
        {/* Navigation Items */}
        <nav className="sidebar-nav-container">
          {navItems
            .filter((item) => item.roles.includes(userRole))
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'employee-page' && userRole !== 'employee') {
                      setSelectedEmployeeViewId(null);
                    }
                    setCurrentTab(item.id);
                  }}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  style={{
                    justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                    padding: isSidebarCollapsed ? '9px 0' : '8px 10px'
                  }}
                >
                  {/* Active Indicator Bar on left edge */}
                  {isActive && !isSidebarCollapsed && (
                    <div className="sidebar-active-indicator" />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div className="sidebar-nav-icon-box">
                      <Icon size={17} />
                    </div>
                    {!isSidebarCollapsed && (
                      <span style={{ 
                        fontSize: '0.86rem', 
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: '-0.01em',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.label}
                      </span>
                    )}
                  </div>

                  {/* Optional dynamic badge */}
                  {!isSidebarCollapsed && item.badge !== undefined && (
                    <span className="sidebar-badge">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>

      {/* BOTTOM SECTION: USER STATUS CARD */}
      {!isSidebarCollapsed && (
        <div style={{
          padding: '12px',
          borderRadius: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0, 168, 132, 0.15)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.82rem',
            flexShrink: 0
          }}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : (userRole === 'admin' ? 'A' : 'E')}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.name || (userRole === 'admin' ? 'Administrator' : 'Team Member')}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'capitalize' }}>
              ● {userRole.replace('_', ' ')}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

