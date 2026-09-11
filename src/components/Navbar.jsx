import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  ChevronDown, 
  Settings, 
  LogOut, 
  Plus, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  User,
  Sparkles,
  Layers,
  Check,
  CheckCheck,
  Inbox
} from 'lucide-react';

export const Navbar = () => {
  const { 
    currentUser,
    userRole,
    currentTab,
    setCurrentTab,
    logout,
    tasks,
    searchQuery,
    setSearchQuery,
    setIsTaskModalOpen,
    setEditingTask,
    theme,
    toggleTheme
  } = useCrm();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Notification items state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Task Milestone Assigned',
      description: 'New deliverable targets updated in the sprint queue.',
      time: '10m ago',
      isRead: false
    },
    {
      id: 'notif-2',
      title: 'Monthly Audit Complete',
      description: 'September 2026 performance summary is ready.',
      time: '1h ago',
      isRead: false
    },
    {
      id: 'notif-3',
      title: 'SLA Compliance Passed',
      description: 'All engineering tasks met target turnarounds.',
      time: '3h ago',
      isRead: false
    },
    {
      id: 'notif-4',
      title: 'Quarterly Directives',
      description: 'New strategic objectives logged in dashboard.',
      time: '1d ago',
      isRead: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id, e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = (e) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const profileDropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute initials for the avatar (e.g. Hari Hara Sudhan -> HH, Arjun Nair -> AN)
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Get first name for top bar compact display
  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.trim().split(' ')[0];
  };

  const getRoleLabel = () => {
    if (userRole === 'super_admin') return 'Super Admin';
    if (userRole === 'admin') return 'Shop Admin';
    return 'Specialist';
  };

  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  return (
    <header 
      className="no-print app-top-header"
      style={{ 
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}
    >
      {/* Left: Global Quick Search */}
      <div style={{ flex: '0 1 360px', position: 'relative' }}>
        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search tasks, deliverables, projects..."
          className="form-input"
          style={{ 
            paddingLeft: '36px', 
            height: '38px', 
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card-hover)',
            color: 'var(--text-main)',
            fontSize: '0.84rem',
            width: '100%'
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Right Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

        {/* Theme Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? "Switch to Light Theme" : "Switch to Dark Theme"}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-main)';
            e.currentTarget.style.background = 'var(--bg-card-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'none';
          }}
        >
          {theme === 'dark' ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} />}
        </button>

        {/* Notification Bell with Dynamic Unread Badge */}
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            title="Notifications"
            style={{
              background: isNotificationsOpen ? 'var(--bg-app)' : 'none',
              border: 'none',
              color: isNotificationsOpen ? 'var(--text-main)' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.background = 'var(--bg-app)';
            }}
            onMouseLeave={(e) => {
              if (!isNotificationsOpen) {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.background = 'none';
              }
            }}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                background: '#e04f36',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 800,
                minWidth: '16px',
                height: '16px',
                padding: '0 3px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid var(--bg-card)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '340px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
              zIndex: 100,
              padding: '14px',
              animation: 'fadeIn 0.15s ease'
            }}>
              {/* Header with Title and Mark all read button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>Notifications</span>
                  {unreadCount > 0 ? (
                    <span style={{ fontSize: '0.68rem', color: '#e04f36', background: 'rgba(224, 79, 54, 0.12)', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 7px', borderRadius: '10px', fontWeight: 700 }}>
                      All read
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 6px',
                      borderRadius: '5px',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    title="Mark all notifications as read"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <Inbox size={24} style={{ opacity: 0.5, marginBottom: '6px' }} />
                    <div>No notifications available</div>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkAsRead(notif.id)}
                      style={{
                        padding: '9px 10px',
                        borderRadius: '8px',
                        background: notif.isRead ? 'var(--bg-app)' : 'rgba(99, 102, 241, 0.06)',
                        border: notif.isRead ? '1px solid var(--border-color)' : '1px solid rgba(99, 102, 241, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = notif.isRead ? 'var(--border-color)' : 'rgba(99, 102, 241, 0.25)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {!notif.isRead && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)', flexShrink: 0 }} />
                          )}
                          <span style={{ fontWeight: notif.isRead ? 600 : 700, color: 'var(--text-main)', fontSize: '0.8rem' }}>
                            {notif.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', flexShrink: 0 }}>
                          {notif.time}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.35, paddingLeft: !notif.isRead ? '12px' : '0px' }}>
                        {notif.description}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                        {!notif.isRead ? (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--accent-primary)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 4px',
                              borderRadius: '4px'
                            }}
                            title="Mark this notification as read"
                          >
                            <Check size={11} /> Mark as read
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.66rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCheck size={11} color="var(--accent-emerald)" /> Read
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider Line */}
        <div style={{ width: '1px', height: '26px', background: '#e2e8f0' }} />

        {/* Profile Bar with Dropdown (Matching Reference Screenshot) */}
        <div style={{ position: 'relative' }} ref={profileDropdownRef}>
          
          {/* Profile Trigger Button */}
          <div
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 6px 4px 4px',
              borderRadius: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
            onMouseLeave={(e) => {
              if (!isProfileOpen) e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Squircle Avatar with Initials */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#e04f36',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.86rem',
              letterSpacing: '-0.02em',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(224, 79, 54, 0.25)'
            }}>
              {getInitials(currentUser?.name || 'Hari Hara Sudhan')}
            </div>

            {/* Name and Subtitle Role */}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.15 }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {getFirstName(currentUser?.name || 'Hari')}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                {getRoleLabel()}
              </span>
            </div>

            {/* Down Chevron */}
            <ChevronDown 
              size={14} 
              color="var(--text-muted)" 
              style={{
                marginLeft: '2px',
                transition: 'transform 0.2s ease',
                transform: isProfileOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} 
            />
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '260px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.25), 0 4px 8px -2px rgba(0, 0, 0, 0.1)',
              zIndex: 100,
              padding: '12px 14px',
              animation: 'fadeIn 0.15s ease'
            }}>
              
              {/* Dropdown Header with Avatar & Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#e04f36',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  letterSpacing: '-0.02em',
                  flexShrink: 0
                }}>
                  {getInitials(currentUser?.name || 'Hari Hara Sudhan')}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.name || 'Hari Hara Sudhan'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                    {currentUser?.email || 'thesalavailaundry@gmail.com'}
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: '#e04f36',
                      background: 'rgba(224, 79, 54, 0.12)',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      border: '1px solid rgba(224, 79, 54, 0.25)'
                    }}>
                      {getRoleLabel()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dropdown Action Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '8px' }}>
                
                {/* 1. Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('profile-page');
                    setIsProfileOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-main)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Settings size={16} color="var(--text-muted)" />
                  <span>Settings</span>
                </button>

                {/* 2. Sign Out */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#e11d48',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(225, 29, 72, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <LogOut size={16} color="#e11d48" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
