import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Play, 
  PlusCircle, 
  Calendar,
  Award,
  CalendarCheck,
  Inbox,
  UserPlus,
  MessageSquare
} from 'lucide-react';

export const EmployeeView = () => {
  const { 
    employees, 
    selectedEmployeeViewId, 
    setSelectedEmployeeViewId, 
    tasks, 
    timeLogs,
    selectedMonth,
    setSelectedMonth,
    setIsTimeLogModalOpen,
    setTaskForLogging,
    startTimer,
    activeTimer,
    searchQuery,
    currentUser,
    userRole,
    setIsEmployeeModalOpen,
    setEditingEmployee
  } = useCrm();

  const [statusFilter, setStatusFilter] = useState('All');

  // Active viewed employee
  const empIdToUse = currentUser?.role === 'employee' ? currentUser.id : (selectedEmployeeViewId || employees[0]?.id);
  const currentEmployee = employees.find((e) => e.id === empIdToUse);

  if (!currentEmployee) {
    return (
      <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
        <UserCheck size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>No Tech Employees Registered</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '8px 0 20px 0' }}>
          Please register tech employees to access personalized work pages and Excel task logs.
        </p>
        {userRole !== 'employee' && (
          <button 
            onClick={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
            className="btn btn-primary"
          >
            <UserPlus size={16} /> Register First Tech Employee
          </button>
        )}
      </div>
    );
  }

  // Filter tasks for this employee matching search & status
  const employeeTasks = tasks.filter((t) => {
    if (t.assignedToId !== currentEmployee.id) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !t.activity?.toLowerCase().includes(q) &&
        !t.clientProject?.toLowerCase().includes(q) &&
        !t.project?.toLowerCase().includes(q) &&
        !t.coreActivity?.toLowerCase().includes(q) &&
        !t.id.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'Completed' && t.status !== 'Completed') return false;
      if (statusFilter === 'Incomplete' && t.status !== 'Incomplete') return false;
      if (statusFilter === 'In Progress' && t.status !== 'In Progress') return false;
    }
    return true;
  });

  const totalAssignedTasks = employeeTasks.length;
  const completedTasks = employeeTasks.filter((t) => t.status === 'Completed').length;
  const incompleteTasks = employeeTasks.filter((t) => t.status === 'Incomplete').length;

  const totalHoursSpent = timeLogs
    .filter((l) => l.employeeId === currentEmployee.id)
    .reduce((acc, l) => acc + l.hours, 0)
    .toFixed(1);

  const completionRate = totalAssignedTasks > 0 ? Math.round((completedTasks / totalAssignedTasks) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Employee Profile Header */}
      <div className="glass-panel-glow" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img 
            src={currentEmployee.avatar} 
            alt={currentEmployee.name} 
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{currentEmployee.name}</h1>
              <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>{currentEmployee.status || 'Active'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentEmployee.role} • {currentEmployee.email}</p>
          </div>
        </div>

        {/* Month Filter & Switch Employee Dropdown (For Admins) */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '4px' }}>Month Review Filter</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <Calendar size={16} color="var(--accent-primary)" />
              <input 
                type="month" 
                className="form-input" 
                style={{ border: 'none', padding: '4px', height: 'auto', background: 'transparent' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
          </div>

          {userRole !== 'employee' && employees.length > 0 && (
            <div>
              <label className="form-label" style={{ marginBottom: '4px' }}>Switch Employee Page</label>
              <select
                value={selectedEmployeeViewId || ''}
                onChange={(e) => setSelectedEmployeeViewId(e.target.value)}
                className="form-select"
                style={{ fontWeight: 600, borderColor: 'var(--accent-primary)' }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    👤 {emp.name} ({emp.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* End of Month Stats Cards */}
      <div>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--accent-emerald)" />
          Employee Monthly Performance Overview ({selectedMonth})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL TASKS ASSIGNED</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#ffffff' }}>
              {totalAssignedTasks}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Work tasks for {currentEmployee.name.split(' ')[0]}</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TIME SPENT ON TASKS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-primary)' }}>
              {totalHoursSpent} <span style={{ fontSize: '0.9rem' }}>Hours</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>Logged in time tracker</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COMPLETED TASKS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-emerald)' }}>
              {completedTasks}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>{completionRate}% Completion Rate</div>
          </div>

          <div className="glass-panel" style={{ padding: '18px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>INCOMPLETE / OVERDUE</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-rose)' }}>
              {incompleteTasks}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Requires completion audit</div>
          </div>
        </div>
      </div>

      {/* Main Employee Access Data Table (EXACT August.xlsx Columns) */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Employee Work Sheet (August.xlsx Structure)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Structured exactly per your August Excel specification with SLA Status (G/R), dates, and comments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'In Progress', 'Completed', 'Incomplete'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === status ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.06)',
                  color: statusFilter === status ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {employeeTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
            <Inbox size={36} color="var(--text-dim)" style={{ marginBottom: '8px' }} />
            <div>No tasks registered for {currentEmployee.name} under this filter.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '12px 10px' }}>S.No</th>
                  <th style={{ padding: '12px 10px' }}>Date</th>
                  <th style={{ padding: '12px 10px' }}>Client / Project</th>
                  <th style={{ padding: '12px 10px' }}>Activity</th>
                  <th style={{ padding: '12px 10px' }}>Project</th>
                  <th style={{ padding: '12px 10px' }}>Core Activity</th>
                  <th style={{ padding: '12px 10px' }}>tech names</th>
                  <th style={{ padding: '12px 10px' }}>Work Start Date</th>
                  <th style={{ padding: '12px 10px' }}>Target End Date</th>
                  <th style={{ padding: '12px 10px' }}>Actual End Date</th>
                  <th style={{ padding: '12px 10px' }}>SLA Status (G/R)</th>
                  <th style={{ padding: '12px 10px' }}>Status</th>
                  <th style={{ padding: '12px 10px' }}>Comments/Updates</th>
                  <th style={{ padding: '12px 10px' }}>Time Spent</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employeeTasks.map((task, idx) => {
                  const isTimerActiveForTask = activeTimer && activeTimer.taskId === task.id;
                  const isSlaGreen = task.slaStatus !== 'Red';

                  return (
                    <tr 
                      key={task.id} 
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* S.No */}
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-dim)' }}>
                        {task.sNo || idx + 1}
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {task.date || task.createdAt?.split('T')[0] || 'N/A'}
                      </td>

                      {/* Client / Project */}
                      <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>
                        {task.clientProject || 'Internal Project'}
                      </td>

                      {/* Activity */}
                      <td style={{ padding: '12px 10px', fontWeight: 700, color: '#ffffff' }}>
                        {task.activity || task.title}
                      </td>

                      {/* Project */}
                      <td style={{ padding: '12px 10px', color: 'var(--accent-primary)' }}>
                        {task.project || task.category}
                      </td>

                      {/* Core Activity */}
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {task.coreActivity || 'General Engineering'}
                      </td>

                      {/* tech names */}
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={currentEmployee.avatar} alt={currentEmployee.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>{currentEmployee.name}</span>
                        </div>
                      </td>

                      {/* Work Start Date */}
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {task.workStartDate || task.startDate || 'N/A'}
                      </td>

                      {/* Target End Date */}
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ color: '#fb923c', fontWeight: 600 }}>{task.targetEndDate || task.dueDate || 'N/A'}</span>
                      </td>

                      {/* Actual End Date */}
                      <td style={{ padding: '12px 10px' }}>
                        {task.actualEndDate ? (
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CalendarCheck size={13} /> {task.actualEndDate}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Ongoing</span>
                        )}
                      </td>

                      {/* SLA Status (G/R) */}
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: isSlaGreen ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)',
                          color: isSlaGreen ? '#34d399' : '#f87171',
                          border: `1px solid ${isSlaGreen ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`
                        }}>
                          {isSlaGreen ? '🟩 Green (Met)' : '🟥 Red (Breached)'}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 10px' }}>
                        <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                          {task.status}
                        </span>
                      </td>

                      {/* Comments/Updates */}
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {task.commentsUpdates ? (
                          <span title={task.commentsUpdates} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageSquare size={12} color="var(--accent-primary)" /> {task.commentsUpdates}
                          </span>
                        ) : '—'}
                      </td>

                      {/* Time Spent */}
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>
                          ⏱ {task.timeSpentHours} hrs
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => startTimer(task.id)}
                            className="btn btn-secondary"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', borderColor: isTimerActiveForTask ? 'var(--accent-emerald)' : 'var(--border-color)' }}
                          >
                            <Play size={11} color={isTimerActiveForTask ? 'var(--accent-emerald)' : 'currentColor'} /> 
                            {isTimerActiveForTask ? 'Timer Active' : 'Start Timer'}
                          </button>

                          <button
                            onClick={() => {
                              setTaskForLogging(task);
                              setIsTimeLogModalOpen(true);
                            }}
                            className="btn btn-primary"
                            style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          >
                            <PlusCircle size={11} /> Log Hours
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
