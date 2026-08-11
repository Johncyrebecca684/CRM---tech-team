import React from 'react';
import { useCrm } from '../context/CrmContext';
import { FileText, Printer, Download, Calendar, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const ReportsView = () => {
  const { employees, tasks, timeLogs, selectedMonth, setSelectedMonth } = useCrm();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>End-of-Month Tech Team Audit Report</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Comprehensive month-end evaluation of tasks assigned, hours logged, and completion ratios per tech employee
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Main Printable Audit Card */}
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Monthly Performance Summary</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Audit Period: {selectedMonth}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Tech Team CRM Engine</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>6 Active Tech Engineers</div>
          </div>
        </div>

        {/* Detailed Breakdown per Employee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {employees.map((emp) => {
            const empTasks = tasks.filter((t) => t.assignedToId === emp.id);
            const empCompleted = empTasks.filter((t) => t.status === 'Completed').length;
            const empIncomplete = empTasks.filter((t) => t.status === 'Incomplete').length;
            const empInProgress = empTasks.filter((t) => t.status === 'In Progress' || t.status === 'Review').length;

            const empHours = timeLogs
              .filter((l) => l.employeeId === emp.id)
              .reduce((acc, l) => acc + l.hours, 0)
              .toFixed(1);

            const compRate = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0;

            return (
              <div 
                key={emp.id} 
                style={{ 
                  padding: '20px', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                {/* Employee Row Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={emp.avatar} alt={emp.name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Assigned: </span>
                      <strong style={{ color: '#fff' }}>{empTasks.length} tasks</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Done: </span>
                      <strong style={{ color: 'var(--accent-emerald)' }}>{empCompleted}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Incomplete: </span>
                      <strong style={{ color: 'var(--accent-rose)' }}>{empIncomplete}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-dim)' }}>Time Logged: </span>
                      <strong style={{ color: 'var(--accent-primary)' }}>{empHours} hrs</strong>
                    </div>
                  </div>
                </div>

                {/* Sub Table of Tasks for this Employee */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-dim)' }}>
                        <th style={{ padding: '8px' }}>Task ID & Title</th>
                        <th style={{ padding: '8px' }}>Start Date</th>
                        <th style={{ padding: '8px' }}>Due Date</th>
                        <th style={{ padding: '8px' }}>Actual End Date</th>
                        <th style={{ padding: '8px' }}>Hours Logged</th>
                        <th style={{ padding: '8px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empTasks.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '8px', fontWeight: 600, color: '#fff' }}>
                            {t.id}: {t.title}
                          </td>
                          <td style={{ padding: '8px', color: 'var(--text-muted)' }}>{t.startDate}</td>
                          <td style={{ padding: '8px', color: '#fb923c' }}>{t.dueDate}</td>
                          <td style={{ padding: '8px', color: t.actualEndDate ? 'var(--accent-emerald)' : 'var(--text-dim)' }}>
                            {t.actualEndDate || '—'}
                          </td>
                          <td style={{ padding: '8px', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                            {t.timeSpentHours} hrs
                          </td>
                          <td style={{ padding: '8px' }}>
                            <span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
