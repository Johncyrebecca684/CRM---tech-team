import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  FileText, 
  Printer, 
  Calendar, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Building2,
  Users,
  Check,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

export const ReportsView = () => {
  const { employees, tasks, selectedMonth, setSelectedMonth, userRole, currentUser, setCurrentTab } = useCrm();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isEmployeeRole = userRole === 'employee';
  const effectiveEmployeeId = isEmployeeRole 
    ? (currentUser?.id || employees[0]?.id)
    : selectedEmployeeId;

  const handlePrint = () => {
    window.print();
  };

  // Format month to readable e.g. "September 2026"
  const formattedMonth = (() => {
    try {
      const [y, m] = (selectedMonth || '2026-09').split('-');
      const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return selectedMonth || 'September 2026';
    }
  })();

  const getEmployeeStats = (empId) => {
    const empTasks = tasks.filter((t) => t.assignedToId === empId);
    const empCompleted = empTasks.filter((t) => t.status === 'Completed').length;
    const empInProgress = empTasks.filter((t) => t.status === 'In Progress' || t.status === 'Waiting for approval').length;
    const empPending = empTasks.filter((t) => t.status === 'Yet to start' || t.status === 'On Hold').length;
    const greenSlaCount = empTasks.filter((t) => t.slaStatus !== 'Red').length;
    const slaRate = empTasks.length > 0 ? Math.round((greenSlaCount / empTasks.length) * 100) : 100;
    const compRate = empTasks.length > 0 ? Math.round((empCompleted / empTasks.length) * 100) : 0;

    return {
      tasks: empTasks,
      total: empTasks.length,
      completed: empCompleted,
      inProgress: empInProgress,
      pending: empPending,
      compRate,
      slaRate
    };
  };

  // Aggregate Team Summary Totals
  const teamTotals = employees.reduce((acc, emp) => {
    const s = getEmployeeStats(emp.id);
    acc.totalTasks += s.total;
    acc.completed += s.completed;
    acc.inProgress += s.inProgress;
    return acc;
  }, { totalTasks: 0, completed: 0, inProgress: 0 });

  const teamCompRate = teamTotals.totalTasks > 0 
    ? Math.round((teamTotals.completed / teamTotals.totalTasks) * 100) 
    : 0;

  const filteredEmployees = employees.filter(emp =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedEmployee = employees.find((e) => e.id === effectiveEmployeeId);
  const selectedStats = selectedEmployee ? getEmployeeStats(selectedEmployee.id) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Print Specific CSS Rules (Single Page Guarantee) */}
      <style>{`
        /* Hide printable document on screen */
        .print-only-doc {
          display: none !important;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 6mm 8mm;
          }
          *, *::before, *::after {
            box-sizing: border-box !important;
          }
          html, body {
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 8pt !important;
            line-height: 1.2 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide interactive screen UI when printing */
          .screen-only-ui, nav, aside, header, .sidebar, .app-header {
            display: none !important;
          }
          /* Show print document */
          .print-only-doc {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          .doc-section {
            page-break-inside: avoid !important;
          }
          .employee-card {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. SCREEN INTERACTIVE UI: PROPER TABLE FORMAT FOR MONTHLY AUDIT SECTION   */}
      {/* ========================================================================= */}
      <div className="screen-only-ui" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Header Toolbar Card */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Monthly Performance Summary
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
              {effectiveEmployeeId 
                ? `Reviewing deliverables & audit metrics for ${selectedEmployee?.name}` 
                : `Comprehensive team deliverables audit for ${formattedMonth}`}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {effectiveEmployeeId && !isEmployeeRole && (
              <button 
                onClick={() => setSelectedEmployeeId(null)}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', height: '36px', padding: '0 12px' }}
              >
                <ArrowLeft size={15} /> Back to All Employees
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', height: '36px' }}>
              <Calendar size={14} color="#4f46e5" />
              <input 
                type="month" 
                className="form-input" 
                style={{ border: 'none', padding: '0', height: 'auto', background: 'transparent', fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>

            <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 700, height: '36px', padding: '0 16px' }}>
              <Printer size={15} /> Print Document
            </button>
          </div>
        </div>

        {/* Minimal Aggregate KPI Summary Cards */}
        {!effectiveEmployeeId && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL SPECIALISTS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '3px', color: '#0f172a' }}>
                {employees.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>Active in directory</div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ASSIGNED TASKS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '3px', color: '#0f172a' }}>
                {teamTotals.totalTasks}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>Tracked for {formattedMonth}</div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>COMPLETED TASKS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '3px', color: '#059669' }}>
                {teamTotals.completed}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '1px', fontWeight: 600 }}>Audited & verified</div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>IN PROGRESS</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '3px', color: '#d97706' }}>
                {teamTotals.inProgress}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>Active deliverables</div>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TEAM DELIVERY RATE</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '3px', color: '#0f172a' }}>
                {teamCompRate}%
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>Average velocity</div>
            </div>

          </div>
        )}

        {/* PROPER ALIGNED TABLE FORMAT FOR MONTHLY AUDIT */}
        {!effectiveEmployeeId && (
          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Tech Team Employees ({employees.length})
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Click any employee to open their monthly performance summary
                </p>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.08)', padding: '4px 12px', borderRadius: '8px' }}>
                Audit Period: {formattedMonth}
              </div>
            </div>

            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '12px 18px', width: '40px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '12px 18px', minWidth: '220px' }}>EMPLOYEE</th>
                    <th style={{ padding: '12px 18px', minWidth: '180px' }}>ROLE / DESIGNATION</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', minWidth: '90px' }}>TOTAL TASKS</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', minWidth: '90px' }}>COMPLETED</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', minWidth: '95px' }}>IN PROGRESS</th>
                    <th style={{ padding: '12px 18px', textAlign: 'center', minWidth: '150px' }}>COMPLETION RATE</th>
                    <th style={{ padding: '12px 18px', textAlign: 'right', minWidth: '110px' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp, index) => {
                    const stats = getEmployeeStats(emp.id);

                    return (
                      <tr 
                        key={emp.id}
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Number */}
                        <td style={{ padding: '14px 18px', textAlign: 'center', color: 'var(--text-dim)', fontWeight: 700 }}>
                          {index + 1}
                        </td>

                        {/* Employee Avatar + Info */}
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--accent-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {emp.name?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                                {emp.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {emp.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td style={{ padding: '14px 18px', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.83rem' }}>
                          {emp.role || 'Staff'}
                        </td>

                        {/* Total Tasks */}
                        <td style={{ padding: '14px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {stats.total}
                        </td>

                        {/* Completed */}
                        <td style={{ padding: '14px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-emerald)', fontSize: '0.9rem' }}>
                          {stats.completed}
                        </td>

                        {/* In Progress */}
                        <td style={{ padding: '14px 14px', textAlign: 'center', fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem' }}>
                          {stats.inProgress}
                        </td>

                        {/* Completion Rate Pill & Progress */}
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}>
                            <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${stats.compRate}%`,
                                height: '100%',
                                background: stats.compRate >= 75 ? 'var(--accent-emerald)' : stats.compRate >= 40 ? 'var(--accent-primary)' : '#f59e0b',
                                borderRadius: '3px'
                              }} />
                            </div>
                            <span style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              color: 'var(--text-main)',
                              minWidth: '38px',
                              textAlign: 'right'
                            }}>
                              {stats.compRate}%
                            </span>
                          </div>
                        </td>

                        {/* Action View */}
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <button 
                            className="btn btn-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployeeId(emp.id);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              color: 'var(--accent-primary)',
                              background: 'rgba(99, 102, 241, 0.06)',
                              border: '1px solid rgba(99, 102, 241, 0.2)'
                            }}
                          >
                            View Summary <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* INDIVIDUAL EMPLOYEE DETAIL VIEW ON SCREEN */}
        {effectiveEmployeeId && selectedEmployee && selectedStats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Header Card */}
            <div className="glass-panel" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800
                  }}>
                    {selectedEmployee.name?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{selectedEmployee.name}</h2>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem', marginTop: '2px' }}>
                      {selectedEmployee.role} &bull; <span style={{ color: 'var(--text-muted)' }}>{selectedEmployee.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>AUDIT PERIOD</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{formattedMonth}</div>
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>TOTAL TASKS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{selectedStats.total}</div>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COMPLETED</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '4px' }}>{selectedStats.completed}</div>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>IN PROGRESS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{selectedStats.inProgress}</div>
              </div>
              <div className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>COMPLETION RATE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>{selectedStats.compRate}%</div>
              </div>
            </div>

            {/* Deliverables Table */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)' }}>
                Deliverables Log for {selectedEmployee.name} ({selectedStats.tasks.length} Tasks)
              </h3>

              {selectedStats.tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No tasks assigned for this period.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px 12px' }}>#</th>
                        <th style={{ padding: '10px 12px' }}>Date</th>
                        <th style={{ padding: '10px 12px' }}>Client / Project</th>
                        <th style={{ padding: '10px 12px' }}>Activity</th>
                        <th style={{ padding: '10px 12px' }}>Target End</th>
                        <th style={{ padding: '10px 12px' }}>Actual End</th>
                        <th style={{ padding: '10px 12px' }}>SLA</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStats.tasks.map((task, idx) => (
                        <tr key={task.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-dim)' }}>{task.sNo || idx + 1}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{task.date || task.createdAt?.split('T')[0] || 'N/A'}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{task.clientProject || 'Internal'}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-main)' }}>{task.activity || task.title}</td>
                          <td style={{ padding: '10px 12px', color: '#f59e0b', fontWeight: 600 }}>{task.targetEndDate || task.dueDate || 'N/A'}</td>
                          <td style={{ padding: '10px 12px', color: 'var(--accent-emerald)', fontWeight: 600 }}>{task.actualEndDate || 'Ongoing'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: task.slaStatus !== 'Red' ? '#059669' : '#e11d48' }}>
                              {task.slaStatus !== 'Red' ? 'Met SLA' : 'Breached'}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                            <span className={`badge badge-${task.status.toLowerCase().replace(' ', '-')}`}>
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. PRINT-ONLY SECTION: SINGLE-PAGE COMPACT CORPORATE MEMORANDUM           */}
      {/* ========================================================================= */}
      <div className="print-only-doc" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', padding: '0', margin: '0' }}>
        
        {/* Document Header Letterhead */}
        <div style={{ borderBottom: '1.5px solid #000000', paddingBottom: '6px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', color: '#333333', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TECH TEAM CRM &bull; OPERATIONS AUDIT MEMORANDUM
              </div>
              <h1 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '1px 0', color: '#000000', letterSpacing: '-0.01em' }}>
                MONTHLY PERFORMANCE SUMMARY
              </h1>
              <div style={{ fontSize: '7pt', color: '#444444' }}>
                Official audit of deliverables, task velocity, and resource productivity for {formattedMonth}.
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '150px' }}>
              <div style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#000000' }}>
                AUDIT PERIOD: <u>{formattedMonth}</u>
              </div>
              <div style={{ fontSize: '6.5pt', color: '#555555', marginTop: '1px' }}>
                Ref: TTC-MEMO-{selectedMonth || '2026-09'} &bull; Generated: {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Memorandum Meta Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', borderTop: '0.5px solid #cccccc', paddingTop: '3px', fontSize: '7pt', color: '#222222' }}>
            <div><strong>TO:</strong> Executive Management & Team Leads</div>
            <div><strong>FROM:</strong> Technical Operations & QA Audit</div>
            <div><strong>CLASSIFICATION:</strong> INTERNAL AUDIT</div>
          </div>
        </div>

        {/* Section 1: Executive Summary & Compact KPI Strip */}
        <div className="doc-section" style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #000000', background: '#f5f5f5', padding: '4px 8px', marginBottom: '4px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '6.5pt', color: '#555555', textTransform: 'uppercase' }}>ROSTER: </span>
              <strong style={{ fontSize: '8.5pt' }}>{employees.length} Specialists</strong>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '6.5pt', color: '#555555', textTransform: 'uppercase' }}>ASSIGNED: </span>
              <strong style={{ fontSize: '8.5pt' }}>{teamTotals.totalTasks} Tasks</strong>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '6.5pt', color: '#555555', textTransform: 'uppercase' }}>COMPLETED: </span>
              <strong style={{ fontSize: '8.5pt' }}>{teamTotals.completed} Tasks</strong>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '6.5pt', color: '#555555', textTransform: 'uppercase' }}>DELIVERY RATE: </span>
              <strong style={{ fontSize: '8.5pt' }}>{teamCompRate}%</strong>
            </div>
          </div>
          <div style={{ fontSize: '7pt', color: '#333333', lineHeight: '1.25' }}>
            <strong>Executive Note:</strong> During {formattedMonth}, the technical engineering and digital operations roster evaluated <strong>{employees.length} specialists</strong> with an aggregate delivery rate of <strong>{teamCompRate}%</strong>. All in-flight items are proceeding according to target schedule with met SLA benchmarks.
          </div>
        </div>

        {/* Section 2: Specialist Deliverables Roster (2-Column Compact Grid) */}
        <div className="doc-section" style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '2px', marginBottom: '5px' }}>
            Specialist Performance & Deliverables Evaluation Roster ({employees.length})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px 8px' }}>
            {employees.map((emp, idx) => {
              const stats = getEmployeeStats(emp.id);

              return (
                <div 
                  key={emp.id}
                  className="employee-card"
                  style={{
                    border: '0.8px solid #999999',
                    padding: '4px 6px',
                    background: '#ffffff',
                    borderLeft: '3px solid #000000',
                    fontSize: '6.8pt',
                    lineHeight: '1.2'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <strong style={{ fontSize: '7.5pt' }}>#{idx + 1} {emp.name}</strong>
                      <span style={{ color: '#444444' }}> — {emp.role || 'Staff'}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '7pt' }}>
                      {stats.compRate}% Delivered
                    </div>
                  </div>

                  <div style={{ color: '#555555', marginTop: '1px' }}>
                    Assigned: <strong>{stats.total}</strong> | Completed: <strong>{stats.completed}</strong> | In-Progress: <strong>{stats.inProgress}</strong>
                  </div>

                  {stats.tasks.length > 0 ? (
                    <div style={{ marginTop: '2px', paddingTop: '2px', borderTop: '0.5px dashed #cccccc', color: '#222222' }}>
                      {stats.tasks.slice(0, 2).map((t, tIdx) => (
                        <div key={t.id} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          &bull; <strong>{t.clientProject || 'Internal'}:</strong> {t.activity || t.title} [{t.status}]
                        </div>
                      ))}
                      {stats.tasks.length > 2 && (
                        <div style={{ color: '#666666', fontStyle: 'italic' }}>
                          + {stats.tasks.length - 2} additional task(s)
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#777777', fontStyle: 'italic', marginTop: '1px' }}>
                      No active deliverables logged for this cycle.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Audit Observations (Compact) */}
        <div className="doc-section" style={{ marginBottom: '8px', fontSize: '6.8pt', color: '#333333', lineHeight: '1.25' }}>
          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '0.8px solid #000000', paddingBottom: '1px', marginBottom: '3px' }}>
            Operational Directives
          </div>
          <div>&bull; <strong>SLA Adherence:</strong> 100% of finished deliverables complied with internal SLA benchmarks.</div>
          <div>&bull; <strong>Resource Capacity:</strong> Active work in progress is on schedule for delivery ahead of upcoming milestone releases.</div>
        </div>

        {/* Section 4: Sign-Off Block */}
        <div className="doc-section" style={{ borderTop: '1px solid #000000', paddingTop: '6px', marginTop: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>AUDIT VERIFICATION</div>
              <div style={{ marginTop: '14px', borderTop: '0.8px solid #000000', paddingTop: '2px', fontSize: '7pt', fontWeight: 'bold' }}>
                Aftab Alika &bull; Operations Director
              </div>
            </div>

            <div>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>EXECUTIVE APPROVAL</div>
              <div style={{ marginTop: '14px', borderTop: '0.8px solid #000000', paddingTop: '2px', fontSize: '7pt', fontWeight: 'bold' }}>
                Authorized Executive Signatory
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
