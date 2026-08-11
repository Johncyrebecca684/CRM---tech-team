import React from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users, 
  ListTodo,
  CheckCircle2,
  Briefcase,
  AlertTriangle,
  FolderKanban,
  PieChart,
  Edit3,
  Layers,
  CheckSquare
} from 'lucide-react';

export const AdminDashboard = () => {
  const { 
    tasks, 
    employees, 
    setIsEmployeeModalOpen,
    setEditingEmployee
  } = useCrm();

  // Metrics Overview
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Yet to start' || t.status === 'Waiting for approval').length;
  const onHoldTasks = tasks.filter((t) => t.status === 'On Hold').length;
  const redSlaCount = tasks.filter((t) => t.slaStatus === 'Red').length;
  const greenSlaCount = tasks.filter((t) => t.slaStatus === 'Green').length;

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const slaHealthPercent = totalTasks > 0 ? Math.round((greenSlaCount / totalTasks) * 100) : 100;

  // Group tasks by Client / Project Overview
  const clientGroups = React.useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const client = t.clientProject || 'Internal Project';
      if (!map[client]) {
        map[client] = { total: 0, completed: 0, inProgress: 0, pending: 0 };
      }
      map[client].total += 1;
      if (t.status === 'Completed') map[client].completed += 1;
      else if (t.status === 'In Progress') map[client].inProgress += 1;
      else map[client].pending += 1;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data }));
  }, [tasks]);

  // Group tasks by Activity Type Overview
  const activityGroups = React.useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const act = t.activity || 'Other';
      map[act] = (map[act] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Admin Overview Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Admin Executive Overview</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          High-level executive metrics, client project breakdown, activity distribution, and team profile management
        </p>
      </div>

      {/* TOP EXECUTIVE KPI SCORECARD GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Work Tasks</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ListTodo size={20} color="var(--accent-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {totalTasks} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Records</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Across {clientGroups.length} Client Projects
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Tasks</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="var(--accent-emerald)" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {completedTasks} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Done</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
            {completionPercent}% Overall Completion Rate
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active In Progress</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(129, 140, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8' }}>
            {inProgressTasks} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Active</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
            {pendingTasks} Pending / Waiting
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tech Team Size</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} color="#fbbf24" />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            {employees.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>Techs</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>
            Active Personnel Profiles
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>SLA Health Index</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: redSlaCount > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} color={redSlaCount > 0 ? '#f87171' : 'var(--accent-emerald)'} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: redSlaCount > 0 ? '#f87171' : 'var(--accent-emerald)' }}>
            {slaHealthPercent}% <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>On-Track</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: redSlaCount > 0 ? '#f87171' : 'var(--accent-emerald)', fontWeight: 600 }}>
            {redSlaCount > 0 ? `${redSlaCount} SLA Breached (Red)` : 'All SLAs Green'}
          </div>
        </div>

      </div>

      {/* TOTAL TASK CALCULATION & PROGRESS OVERVIEW BAR */}
      <div className="glass-panel-glow" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListTodo size={22} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Total Task Calculation & Progress Bar</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.9rem' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Total Tasks:</span> <strong>{totalTasks}</strong></div>
            <div><span style={{ color: 'var(--accent-emerald)' }}>Completed:</span> <strong>{completedTasks}</strong></div>
            <div><span style={{ color: '#818cf8' }}>In Progress:</span> <strong>{inProgressTasks}</strong></div>
            <div><span style={{ color: '#f87171' }}>SLA Red:</span> <strong>{redSlaCount}</strong></div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}>
            <span>Team Task Completion Rate</span>
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>{completionPercent}% Completed</span>
          </div>

          <div style={{ width: '100%', height: '14px', borderRadius: '7px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex' }}>
            <div 
              style={{ 
                width: `${completionPercent}%`, 
                background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
                height: '100%',
                transition: 'width 0.4s ease'
              }} 
            />
            <div 
              style={{ 
                width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%`, 
                background: '#818cf8', 
                height: '100%' 
              }} 
            />
            <div 
              style={{ 
                width: `${totalTasks > 0 ? (pendingTasks / totalTasks) * 100 : 0}%`, 
                background: '#fbbf24', 
                height: '100%' 
              }} 
            />
          </div>
        </div>

        {/* Calculation Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL TASKS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{totalTasks}</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>COMPLETED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{completedTasks}</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>IN PROGRESS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{inProgressTasks}</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#fbbf24' }}>YET TO START / WAITING</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{pendingTasks}</div>
          </div>
          <div style={{ padding: '14px 16px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#f87171' }}>SLA BREACHED (RED)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>{redSlaCount}</div>
          </div>
        </div>
      </div>

      {/* CLIENT PROJECT & ACTIVITY DISTRIBUTION OVERVIEW GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Client / Project Distribution */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={18} color="var(--accent-primary)" />
            Client / Project Distribution Overview
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {clientGroups.map((cg) => {
              const clientPercent = totalTasks > 0 ? Math.round((cg.total / totalTasks) * 100) : 0;
              return (
                <div key={cg.name} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: '#fff' }}>📁 {cg.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <strong>{cg.total}</strong> tasks ({clientPercent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ width: `${clientPercent}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: '3px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--accent-emerald)' }}>Done: {cg.completed}</span>
                    <span style={{ color: '#818cf8' }}>Active: {cg.inProgress}</span>
                    <span style={{ color: '#fbbf24' }}>Pending: {cg.pending}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Distribution */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-primary)" />
            Activity Type Distribution Overview
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activityGroups.map((ag) => {
              const actPercent = totalTasks > 0 ? Math.round((ag.count / totalTasks) * 100) : 0;
              return (
                <div key={ag.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>⚡ {ag.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{actPercent}% of workload</div>
                  </div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {ag.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* EMPLOYEE PROFILES & OVERVIEW */}
      <div>
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--accent-primary)" />
            Employee Profiles & Management ({employees.length} Tech Members)
          </h2>
        </div>

        {employees.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} color="var(--text-dim)" style={{ marginBottom: '8px' }} />
            <div>No employee profiles available in the system.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
            {employees.map((emp) => {
              const empTasks = tasks.filter((t) => t.assignedToId === emp.id);
              const empCompleted = empTasks.filter((t) => t.status === 'Completed').length;
              const empActive = empTasks.filter((t) => t.status === 'In Progress').length;

              return (
                <div key={emp.id} className="glass-panel" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={emp.avatar} 
                        alt={emp.name} 
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} 
                      />
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>{emp.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingEmployee(emp);
                        setIsEmployeeModalOpen(true);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                    >
                      <Edit3 size={12} /> Edit Profile
                    </button>
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {emp.skills?.map((sk, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Employee Task Breakdown Tallies */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>TOTAL TASKS</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{empTasks.length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--accent-emerald)' }}>COMPLETED</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{empCompleted}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#818cf8' }}>ACTIVE</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8' }}>{empActive}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
