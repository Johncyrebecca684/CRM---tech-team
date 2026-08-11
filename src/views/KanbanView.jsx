import React from 'react';
import { useCrm } from '../context/CrmContext';
import { Plus, Clock, User, Calendar, AlertCircle } from 'lucide-react';

export const KanbanView = () => {
  const { 
    tasks,
    visibleTasks, 
    updateTaskStatus, 
    employees, 
    setIsTaskModalOpen, 
    setEditingTask,
    setTaskForLogging,
    setIsTimeLogModalOpen,
    searchQuery
  } = useCrm();

  const columns = [
    { id: 'Yet to start', label: 'Yet to start', color: '#9ca3af', border: 'rgba(156, 163, 175, 0.3)' },
    { id: 'In Progress', label: 'In Progress', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
    { id: 'Waiting for approval', label: 'Waiting for Approval', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    { id: 'On Hold', label: 'On Hold', color: '#f87171', border: 'rgba(244, 63, 94, 0.3)' },
    { id: 'Completed', label: 'Completed', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' }
  ];

  // Filter tasks using visibleTasks
  const filteredTasks = (visibleTasks || tasks).filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const emp = employees.find((e) => e.id === t.assignedToId);
    return (
      (t.activity && t.activity.toLowerCase().includes(q)) ||
      (t.clientProject && t.clientProject.toLowerCase().includes(q)) ||
      t.id.toLowerCase().includes(q) ||
      (emp && emp.name.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Board Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tech Team Kanban Board</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Plane & Taiga inspired workflow columns for 6 tech specialists
          </p>
        </div>

        <button 
          onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
          className="btn btn-primary"
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '16px'
      }}>
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div 
              key={col.id} 
              className="glass-panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '600px',
                background: 'rgba(15, 23, 42, 0.5)'
              }}
            >
              {/* Column Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: `2px solid ${col.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{col.label}</span>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.08)',
                  color: col.color
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {colTasks.map((task) => {
                  const assignee = employees.find((e) => e.id === task.assignedToId);

                  return (
                    <div
                      key={task.id}
                      className="glass-panel"
                      style={{
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        cursor: 'pointer',
                        background: 'var(--bg-card-solid)',
                        borderLeft: `3px solid ${col.color}`
                      }}
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                    >
                      {/* Priority / SLA Tag & Category */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                          {task.id}
                        </span>

                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: task.slaStatus === 'Red' ? '#f87171' : 'var(--accent-emerald)' 
                          }}
                        >
                          ● SLA: {task.slaStatus || 'Green'}
                        </span>
                      </div>

                      {/* Title & Activity */}
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff', lineHeight: 1.3 }}>
                        {task.activity || task.title || 'Work Task'}
                      </div>

                      {task.clientProject && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          📁 {task.clientProject} {task.project ? `(${task.project})` : ''}
                        </div>
                      )}

                      {/* Dates & Time Logged */}
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={12} color="#fb923c" />
                          <span>Target End: {task.targetEndDate || task.dueDate || 'No target date'}</span>
                        </div>

                        {task.actualEndDate && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)' }}>
                            <Calendar size={12} />
                            <span>Ended: {task.actualEndDate}</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                          <Clock size={12} />
                          <span>Spent: {task.timeSpentHours}h / {task.estimatedHours}h</span>
                        </div>
                      </div>

                      {/* Assignee Footer & Column Shift Action */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border-color)'
                      }}>
                        {assignee ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img src={assignee.avatar} alt={assignee.name} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{assignee.name.split(' ')[0]}</span>
                          </div>
                        ) : <span />}

                        {/* Move Stage Selector */}
                        <select
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateTaskStatus(task.id, e.target.value);
                          }}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer'
                          }}
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.id}>
                              Move: {c.label}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
