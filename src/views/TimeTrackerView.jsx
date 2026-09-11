import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Clock, Play, Square, Plus, History, Calendar, User } from 'lucide-react';

export const TimeTrackerView = () => {
  const { 
    tasks,
    visibleTasks, 
    timeLogs, 
    employees, 
    activeTimer, 
    startTimer, 
    stopTimer, 
    setIsTimeLogModalOpen, 
    setTaskForLogging 
  } = useCrm();

  const userTasks = visibleTasks || tasks;
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState(userTasks[0]?.id || '');

  const formatTimerSeconds = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalLogHoursSum = timeLogs.reduce((acc, l) => acc + l.hours, 0).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Realtime Stopwatch & Work Log Audit</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Track active work time on tech tasks or log hours manually with date & work summaries
        </p>
      </div>

      {/* Stopwatch Widget Card */}
      <div className="glass-panel-glow" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-emerald)' }}>
          ● LIVE TIMER ENGINE
        </div>

        <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
          {activeTimer ? formatTimerSeconds(activeTimer.elapsedSeconds) : '00:00:00'}
        </div>

        {/* Task Select & Play/Stop Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '500px', width: '100%' }}>
          
          {!activeTimer ? (
            <>
              <select
                value={selectedTaskForTimer}
                onChange={(e) => setSelectedTaskForTimer(e.target.value)}
                className="form-select"
                style={{ flex: 1, height: '42px', fontWeight: 600 }}
              >
                {userTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id}: {t.clientProject} - {t.activity || t.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => startTimer(selectedTaskForTimer || userTasks[0]?.id)}
                className="btn btn-primary"
                style={{ height: '42px', padding: '0 24px', background: 'var(--accent-emerald)' }}
              >
                <Play size={18} fill="currentColor" /> Start Timer
              </button>
            </>
          ) : (
            <button
              onClick={stopTimer}
              className="btn btn-danger"
              style={{ height: '42px', padding: '0 28px', fontSize: '1rem' }}
            >
              <Square size={18} fill="currentColor" /> Stop & Log Time
            </button>
          )}

        </div>
      </div>

      {/* Work Logs History Timeline */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--accent-primary)" />
            Recent Work Logs Audit ({totalLogHoursSum} Total Hours Logged)
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {timeLogs.map((log) => {
            const task = tasks.find((t) => t.id === log.taskId);
            const employee = employees.find((e) => e.id === log.employeeId);

            return (
              <div 
                key={log.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '14px 18px', 
                  borderRadius: 'var(--radius-sm)', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 300px' }}>

                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                      {employee?.name || 'Tech Member'} — <span style={{ color: 'var(--accent-primary)' }}>{log.taskId}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {log.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {log.date}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '4px 12px', borderRadius: '12px' }}>
                    ⏱ {log.hours} hrs
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
