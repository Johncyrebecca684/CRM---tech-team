import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Plus, Clock, User, Calendar, AlertCircle, GripVertical } from 'lucide-react';

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

  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

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

  const handleDropOnColumn = (colId) => {
    if (!draggedTaskId) return;
    updateTaskStatus(draggedTaskId, colId);
    setDraggedTaskId(null);
    setDragOverColId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Board Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tech Team Kanban Board</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Interactive Kanban board — drag and drop cards across columns to update workflow status
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
          const isDropTarget = dragOverColId === col.id;

          return (
            <div 
              key={col.id} 
              className="glass-panel"
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (dragOverColId !== col.id) setDragOverColId(col.id);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOverColId(col.id);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (e.currentTarget.contains(e.relatedTarget)) return;
                setDragOverColId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDropOnColumn(col.id);
              }}
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '600px',
                background: isDropTarget ? 'rgba(99, 102, 241, 0.08)' : '#f8fafc',
                border: isDropTarget ? `2px dashed ${col.color}` : '1px solid var(--border-color)',
                borderRadius: '12px',
                transition: 'all 0.15s ease'
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
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{col.label}</span>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: col.color,
                  border: '1px solid #e2e8f0'
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Drop prompt when hovering */}
              {isDropTarget && (
                <div style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: col.color,
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  animation: 'pulse 1s infinite'
                }}>
                  Drop here to mark as {col.label}
                </div>
              )}

              {/* Tasks List in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {colTasks.map((task) => {
                  const assignee = employees.find((e) => e.id === task.assignedToId);
                  const isBeingDragged = draggedTaskId === task.id;

                  return (
                    <div
                      key={task.id}
                      draggable={true}
                      onDragStart={(e) => {
                        setDraggedTaskId(task.id);
                        e.dataTransfer.setData('text/plain', task.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => {
                        setDraggedTaskId(null);
                        setDragOverColId(null);
                      }}
                      className="glass-panel"
                      style={{
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        cursor: 'grab',
                        background: '#ffffff',
                        borderLeft: `4px solid ${col.color}`,
                        opacity: isBeingDragged ? 0.4 : 1,
                        boxShadow: isBeingDragged ? '0 6px 16px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'all 0.15s ease'
                      }}
                      onClick={() => {
                        setEditingTask(task);
                        setIsTaskModalOpen(true);
                      }}
                    >
                      {/* Priority / SLA Tag & Category */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', background: '#eef2ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
                          {task.id}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span 
                            style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              color: task.slaStatus === 'Red' ? '#e11d48' : 'var(--accent-emerald)' 
                            }}
                          >
                            ● SLA: {task.slaStatus || 'Green'}
                          </span>
                          <GripVertical size={13} color="#94a3b8" />
                        </div>
                      </div>

                      {/* Title & Activity */}
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.3 }}>
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
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{assignee.name.split(' ')[0]}</span>
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

