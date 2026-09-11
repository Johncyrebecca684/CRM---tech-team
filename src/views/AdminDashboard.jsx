import React, { useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FolderKanban,
  Layers,
  BarChart3,
  TrendingUp,
  Activity,
  UserCheck
} from 'lucide-react';

export const AdminDashboard = () => {
  const {
    tasks,
    employees,
    timeLogs,
    selectedMonth
  } = useCrm();

  // Task Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Yet to start' || t.status === 'Waiting for approval').length;
  const onHoldTasks = tasks.filter((t) => t.status === 'On Hold').length;
  const redSlaCount = tasks.filter((t) => t.slaStatus === 'Red').length;
  const greenSlaCount = tasks.filter((t) => t.slaStatus === 'Green').length;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const inProgressPercent = totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const pendingPercent = totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0;
  const onHoldPercent = totalTasks > 0 ? Math.round((onHoldTasks / totalTasks) * 100) : 0;
  const slaHealthPercent = totalTasks > 0 ? Math.round((greenSlaCount / totalTasks) * 100) : 100;

  // Total Hours Logged
  const totalLoggedHours = useMemo(() => {
    if (timeLogs && timeLogs.length > 0) {
      return timeLogs.reduce((acc, l) => acc + (Number(l.hours) || 0), 0);
    }
    return tasks.reduce((acc, t) => acc + (Number(t.timeSpentHours) || 0), 0);
  }, [tasks, timeLogs]);

  const avgHoursPerTask = completedTasks > 0 ? (totalLoggedHours / completedTasks).toFixed(1) : '0.0';

  // Monthly Capacity
  const totalMonthlyCapacityHours = useMemo(() => {
    return employees.reduce((acc, emp) => acc + (emp.weeklyCapacityHours || 40) * 4, 0);
  }, [employees]);

  const teamUtilizationPercent = totalMonthlyCapacityHours > 0
    ? Math.min(100, Math.round((totalLoggedHours / totalMonthlyCapacityHours) * 100))
    : 0;

  // Project Breakdown
  const clientAnalytics = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const client = t.clientProject || 'General Work';
      if (!map[client]) {
        map[client] = { name: client, total: 0, completed: 0, inProgress: 0, pending: 0, hours: 0, redSla: 0 };
      }
      map[client].total += 1;
      map[client].hours += Number(t.timeSpentHours) || 0;
      if (t.status === 'Completed') map[client].completed += 1;
      else if (t.status === 'In Progress') map[client].inProgress += 1;
      else map[client].pending += 1;
      if (t.slaStatus === 'Red') map[client].redSla += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [tasks]);

  // Activity Breakdown
  const activityAnalytics = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const act = t.activity || 'Deliverable';
      if (act.toLowerCase().includes('support')) return;
      if (!map[act]) map[act] = { name: act, count: 0, hours: 0 };
      map[act].count += 1;
      map[act].hours += Number(t.timeSpentHours) || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [tasks]);

  // Core Domains
  const domainAnalytics = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const domain = t.coreActivity || 'General Technical';
      if (domain.toLowerCase().includes('support')) return;
      if (!map[domain]) map[domain] = { name: domain, count: 0 };
      map[domain].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [tasks]);

  // Specialist Productivity Matrix
  const teamProductivityMatrix = useMemo(() => {
    return employees.map((emp) => {
      const empTasks = tasks.filter(t => t.assignedToId === emp.id);
      const empCompleted = empTasks.filter(t => t.status === 'Completed').length;
      const empInProgress = empTasks.filter(t => t.status === 'In Progress').length;
      
      const empLogs = timeLogs.filter(l => l.employeeId === emp.id);
      const loggedHours = empLogs.length > 0
        ? empLogs.reduce((acc, l) => acc + (Number(l.hours) || 0), 0)
        : empTasks.reduce((acc, t) => acc + (Number(t.timeSpentHours) || 0), 0);

      const targetMonthlyHours = (emp.weeklyCapacityHours || 40) * 4;
      const utilization = targetMonthlyHours > 0 ? Math.min(100, Math.round((loggedHours / targetMonthlyHours) * 100)) : 0;
      const completionRate = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0;

      let loadStatus = 'Optimal';
      let loadType = 'optimal';

      if (utilization > 85 || empInProgress >= 5) {
        loadStatus = 'High Load';
        loadType = 'high';
      } else if (utilization < 30 && empTasks.length <= 1) {
        loadStatus = 'Available';
        loadType = 'available';
      }

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        assignedCount: empTasks.length,
        completedCount: empCompleted,
        inProgressCount: empInProgress,
        loggedHours,
        utilization,
        completionRate,
        loadStatus,
        loadType
      };
    }).sort((a, b) => b.assignedCount - a.assignedCount);
  }, [employees, tasks, timeLogs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
            Executive Dashboard
          </h1>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: 'rgba(99, 102, 241, 0.08)',
            color: 'var(--accent-primary)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Activity size={12} />
            Live Telemetry
          </span>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        
        {/* Completion Rate */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completion Rate
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {completionPercent}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            <strong style={{ color: 'var(--accent-emerald)' }}>{completedTasks}</strong> of {totalTasks} tasks closed
          </div>
        </div>

        {/* Logged Hours */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Logged Hours
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {totalLoggedHours.toFixed(1)}h
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Avg. velocity: <strong>{avgHoursPerTask}h</strong> / task
          </div>
        </div>

        {/* SLA Health */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SLA Health
            </span>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '8px', 
              background: redSlaCount > 0 ? 'rgba(225, 29, 72, 0.1)' : 'rgba(5, 150, 105, 0.1)', 
              color: redSlaCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {redSlaCount > 0 ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: redSlaCount > 0 ? 'var(--accent-rose)' : 'var(--text-main)', lineHeight: 1 }}>
            {slaHealthPercent}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            {redSlaCount > 0 ? `${redSlaCount} SLA breach(es)` : '100% compliant fulfillment'}
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Team Capacity
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--accent-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
            {teamUtilizationPercent}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            <strong>{totalLoggedHours.toFixed(0)}h</strong> / {totalMonthlyCapacityHours}h total capacity
          </div>
        </div>

      </div>

      {/* 3. Delivery Progress Pipeline */}
      <div className="glass-panel" style={{ padding: '18px 20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Delivery Velocity Pipeline
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              Done: <strong style={{ color: 'var(--text-main)' }}>{completedTasks}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4f46e5' }} />
              Active: <strong style={{ color: 'var(--text-main)' }}>{inProgressTasks}</strong>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              Pending: <strong style={{ color: 'var(--text-main)' }}>{pendingTasks}</strong>
            </span>
            {onHoldTasks > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48' }} />
                Hold: <strong style={{ color: 'var(--text-main)' }}>{onHoldTasks}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border-color)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${completionPercent}%`, background: '#10b981', transition: 'width 0.3s' }} title={`Done: ${completionPercent}%`} />
          <div style={{ width: `${inProgressPercent}%`, background: '#00a884', transition: 'width 0.3s' }} title={`Active: ${inProgressPercent}%`} />
          <div style={{ width: `${pendingPercent}%`, background: '#f59e0b', transition: 'width 0.3s' }} title={`Pending: ${pendingPercent}%`} />
          <div style={{ width: `${onHoldPercent}%`, background: '#e11d48', transition: 'width 0.3s' }} title={`Hold: ${onHoldPercent}%`} />
        </div>
      </div>

      {/* 4. Projects & Workload Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Project Workload */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderKanban size={16} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Project Workload</h2>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {clientAnalytics.length} Project(s)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {clientAnalytics.map((cg) => {
              const clientCompPercent = cg.total > 0 ? Math.round((cg.completed / cg.total) * 100) : 0;
              return (
                <div
                  key={cg.name}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-hover)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-main)' }}>
                      {cg.name}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {cg.total} task{cg.total > 1 ? 's' : ''} • {cg.hours}h
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '5px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${clientCompPercent}%`, height: '100%', background: '#00a884' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{cg.completed} done • {cg.inProgress} active • {cg.pending} pending</span>
                    <span style={{ fontWeight: 600 }}>{clientCompPercent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Domain & Activity Breakdown */}
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={16} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0 }}>Activity & Domains</h2>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Work Allocation
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {domainAnalytics.map((dm) => {
              const pct = totalTasks > 0 ? Math.round((dm.count / totalTasks) * 100) : 0;
              return (
                <div key={dm.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', padding: '8px 12px', background: 'var(--bg-card-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{dm.name}</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{dm.count} task{dm.count > 1 ? 's' : ''} ({pct}%)</span>
                </div>
              );
            })}

            {activityAnalytics.slice(0, 4).map((ag) => {
              const actPercent = totalTasks > 0 ? Math.round((ag.count / totalTasks) * 100) : 0;
              return (
                <div key={ag.name} style={{ padding: '8px 12px', background: 'var(--bg-card-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ag.name}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{ag.count} ({actPercent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'var(--border-color)', overflow: 'hidden' }}>
                    <div style={{ width: `${actPercent}%`, height: '100%', background: 'var(--accent-primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Specialist Capacity & Productivity Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderRadius: '12px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Specialist Capacity Matrix</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Bandwidth utilization and deliverables output per engineer
            </p>
          </div>
          <span className="badge-count-pill">
            {employees.length} Specialist{employees.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card-hover)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 18px' }}>Specialist</th>
                <th style={{ padding: '12px 18px', textAlign: 'center' }}>Tasks</th>
                <th style={{ padding: '12px 18px', textAlign: 'center' }}>Completion</th>
                <th style={{ padding: '12px 18px', textAlign: 'center' }}>Logged Hours</th>
                <th style={{ padding: '12px 18px', textAlign: 'center' }}>Bandwidth</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {teamProductivityMatrix.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                    No specialists registered yet.
                  </td>
                </tr>
              ) : (
                teamProductivityMatrix.map((item) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}
                  >
                    {/* Specialist */}
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                          fontSize: '0.82rem'
                        }}>
                          {item.name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.86rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{item.role}</div>
                        </div>
                      </div>
                    </td>

                    {/* Assigned */}
                    <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.assignedCount}</span>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {item.completedCount} done • {item.inProgressCount} active
                      </div>
                    </td>

                    {/* Completion % */}
                    <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '50px', height: '5px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                          <div style={{ width: `${item.completionRate}%`, height: '100%', background: 'var(--accent-emerald)' }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-main)' }}>{item.completionRate}%</span>
                      </div>
                    </td>

                    {/* Logged Hours */}
                    <td style={{ padding: '12px 18px', textAlign: 'center', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.loggedHours.toFixed(1)}h
                    </td>

                    {/* Bandwidth */}
                    <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '50px', height: '5px', borderRadius: '3px', background: 'var(--border-color)', overflow: 'hidden' }}>
                          <div style={{ width: `${item.utilization}%`, height: '100%', background: item.utilization > 85 ? '#f59e0b' : 'var(--accent-primary)' }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.utilization}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                      <span className={`status-pill status-pill-${item.loadType}`}>
                        <span className="status-dot" />
                        {item.loadStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
