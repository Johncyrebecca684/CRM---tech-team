import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  PlusCircle, 
  CalendarCheck,
  MessageSquare
} from 'lucide-react';

export const TaskTableView = () => {
  const { 
    tasks,
    visibleTasks, 
    employees, 
    setIsTaskModalOpen, 
    setEditingTask, 
    deleteTask,
    setIsTimeLogModalOpen,
    setTaskForLogging,
    searchQuery
  } = useCrm();

  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [slaFilter, setSlaFilter] = useState('All');

  // Filter tasks using role-isolated visibleTasks
  const filteredTasks = (visibleTasks || tasks).filter((task) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !task.activity?.toLowerCase().includes(q) &&
        !task.clientProject?.toLowerCase().includes(q) &&
        !task.project?.toLowerCase().includes(q) &&
        !task.coreActivity?.toLowerCase().includes(q) &&
        !task.id.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (assigneeFilter !== 'All' && task.assignedToId !== assigneeFilter) return false;
    if (slaFilter !== 'All' && task.slaStatus !== slaFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Task Data Grid (August.xlsx Structure)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Full spreadsheet table view with SLA Status (G/R), dates, and comments
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* SLA Filter */}
          <select 
            className="form-select" 
            style={{ height: '38px', fontSize: '0.8rem' }}
            value={slaFilter}
            onChange={(e) => setSlaFilter(e.target.value)}
          >
            <option value="All">All SLA Statuses</option>
            <option value="Green">🟩 Green (Met SLA)</option>
            <option value="Red">🟥 Red (Breached SLA)</option>
          </select>

          {/* Assignee Filter */}
          <select 
            className="form-select" 
            style={{ height: '38px', fontSize: '0.8rem' }}
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="All">All Tech Assignees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          <button 
            onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
            className="btn btn-primary"
          >
            <Plus size={16} /> New Task Record
          </button>
        </div>
      </div>

      {/* Main Grid Glass Panel */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
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
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, idx) => {
                const assignee = employees.find((e) => e.id === task.assignedToId);
                const isSlaGreen = task.slaStatus !== 'Red';

                return (
                  <tr 
                    key={task.id} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--text-dim)' }}>
                      {task.sNo || idx + 1}
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                      {task.date || 'N/A'}
                    </td>

                    <td style={{ padding: '12px 10px', fontWeight: 600, color: '#ffffff' }}>
                      {task.clientProject || 'Internal Project'}
                    </td>

                    <td style={{ padding: '12px 10px', fontWeight: 700, color: '#ffffff' }}>
                      {task.activity || task.title}
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--accent-primary)' }}>
                      {task.project || 'Engineering'}
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                      {task.coreActivity || '—'}
                    </td>

                    <td style={{ padding: '12px 10px' }}>
                      {assignee ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={assignee.avatar} alt={assignee.name} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>{assignee.name}</span>
                        </div>
                      ) : 'Unassigned'}
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                      {task.workStartDate || task.startDate || 'N/A'}
                    </td>

                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ color: '#fb923c', fontWeight: 600 }}>{task.targetEndDate || task.dueDate || 'N/A'}</span>
                    </td>

                    <td style={{ padding: '12px 10px' }}>
                      {task.actualEndDate ? (
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CalendarCheck size={13} /> {task.actualEndDate}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Pending</span>
                      )}
                    </td>

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

                    <td style={{ padding: '12px 10px' }}>
                      <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                        {task.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 10px', color: 'var(--text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.commentsUpdates || '—'}
                    </td>

                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setTaskForLogging(task);
                            setIsTimeLogModalOpen(true);
                          }}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Log Work Hours"
                        >
                          <PlusCircle size={13} />
                        </button>

                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className="btn btn-secondary btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Edit Task Specs"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="btn btn-danger btn-icon"
                          style={{ width: '28px', height: '28px' }}
                          title="Delete Task"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
