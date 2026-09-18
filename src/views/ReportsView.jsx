import React, { useState, useMemo } from 'react';
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
  TrendingUp,
  Search,
  Filter,
  BarChart3,
  CalendarDays,
  Sun,
  Flame,
  UserCheck,
  CalendarRange,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Eye
} from 'lucide-react';

export const ReportsView = () => {
  const { employees, tasks, timeLogs, attendanceRecords, userRole, currentUser } = useCrm();

  // Audit Timeframe Modes: 'daily' | 'particular-date' | 'weekly' | 'monthly' | 'yearly'
  const [auditMode, setAuditMode] = useState('monthly');

  // Timeframe Pickers State
  const [selectedParticularDate, setSelectedParticularDate] = useState(() => {
    return new Date().toISOString().split('T')[0]; // e.g. '2026-09-15'
  });

  const [selectedWeekDate, setSelectedWeekDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Employee Selection & Search State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('ALL'); // 'ALL' or employeeId
  const [searchTerm, setSearchTerm] = useState('');
  const [detailedEmployeeModal, setDetailedEmployeeModal] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  // Helper to calculate start & end of week (Monday to Sunday)
  const getWeekRange = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diffToMon));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toISOString().split('T')[0];
    const sunStr = sunday.toISOString().split('T')[0];
    return {
      start: monStr,
      end: sunStr,
      label: `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    };
  };

  const weekRange = useMemo(() => getWeekRange(selectedWeekDate), [selectedWeekDate]);

  // Current Date String for Daily
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Compute Active Period Label
  const activePeriodLabel = useMemo(() => {
    if (auditMode === 'daily') {
      return `Daily Audit: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
    }
    if (auditMode === 'particular-date') {
      const d = new Date(selectedParticularDate + 'T00:00:00');
      return `Date Audit: ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
    }
    if (auditMode === 'weekly') {
      return `Weekly Audit: ${weekRange.label}`;
    }
    if (auditMode === 'monthly') {
      const [y, m] = selectedMonth.split('-');
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      return `Monthly Audit: ${d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    }
    if (auditMode === 'yearly') {
      return `Yearly Audit: Calendar Year ${selectedYear}`;
    }
    return 'Audit Report';
  }, [auditMode, selectedParticularDate, weekRange, selectedMonth, selectedYear]);

  // Compute initials for the employee badge without photo images
  const getEmployeeInitials = (name) => {
    if (!name) return 'SP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper to filter tasks by active audit timeframe
  const isTaskInActivePeriod = (task) => {
    const taskDate = task.toBePostedOn || task.date || task.workStartDate || task.targetEndDate;
    if (!taskDate) return false;

    if (auditMode === 'daily') {
      return taskDate === todayStr;
    }
    if (auditMode === 'particular-date') {
      return taskDate === selectedParticularDate;
    }
    if (auditMode === 'weekly') {
      return taskDate >= weekRange.start && taskDate <= weekRange.end;
    }
    if (auditMode === 'monthly') {
      return taskDate.startsWith(selectedMonth);
    }
    if (auditMode === 'yearly') {
      return taskDate.startsWith(selectedYear);
    }
    return true;
  };

  // Helper to filter timelogs by active audit timeframe
  const isTimeLogInActivePeriod = (log) => {
    const logDate = log.date;
    if (!logDate) return false;

    if (auditMode === 'daily') return logDate === todayStr;
    if (auditMode === 'particular-date') return logDate === selectedParticularDate;
    if (auditMode === 'weekly') return logDate >= weekRange.start && logDate <= weekRange.end;
    if (auditMode === 'monthly') return logDate.startsWith(selectedMonth);
    if (auditMode === 'yearly') return logDate.startsWith(selectedYear);
    return true;
  };

  // Helper to filter attendance by active audit timeframe
  const isAttendanceInActivePeriod = (att) => {
    const attDate = att.date;
    if (!attDate) return false;

    if (auditMode === 'daily') return attDate === todayStr;
    if (auditMode === 'particular-date') return attDate === selectedParticularDate;
    if (auditMode === 'weekly') return attDate >= weekRange.start && attDate <= weekRange.end;
    if (auditMode === 'monthly') return attDate.startsWith(selectedMonth);
    if (auditMode === 'yearly') return attDate.startsWith(selectedYear);
    return true;
  };

  // Compute stats for a specific employee in the active audit period
  const getEmployeeAuditStats = (emp) => {
    const empId = emp.id;
    const empEmail = emp.email?.toLowerCase().trim();
    const empName = emp.name?.toLowerCase().trim();

    // 1. Period Tasks
    const periodTasks = tasks.filter((t) => {
      if (!isTaskInActivePeriod(t)) return false;
      const tId = (t.assignedToId || '').toLowerCase();
      const tEmail = (t.assignedToEmail || '').toLowerCase().trim();
      const tName = (t.assignedToUsername || t.assignedTo || '').toLowerCase().trim();

      return (
        (empId && tId === empId.toLowerCase()) ||
        (empEmail && tEmail === empEmail) ||
        (empName && (tName.includes(empName) || empName.includes(tName)))
      );
    });

    const completed = periodTasks.filter((t) => t.status === 'Completed').length;
    const inProgress = periodTasks.filter((t) => t.status === 'In Progress' || t.status === 'Waiting for approval').length;
    const pending = periodTasks.filter((t) => t.status === 'Yet to start' || t.status === 'On Hold' || t.status === 'Backlog').length;
    const greenSlaCount = periodTasks.filter((t) => t.slaStatus !== 'Red').length;
    const slaRate = periodTasks.length > 0 ? Math.round((greenSlaCount / periodTasks.length) * 100) : 100;
    const compRate = periodTasks.length > 0 ? Math.round((completed / periodTasks.length) * 100) : (periodTasks.length === 0 ? 100 : 0);

    // Formats Breakdown
    const reelsCount = periodTasks.filter((t) => (t.format || '').toLowerCase().includes('reel') || (t.activity || '').toLowerCase().includes('reel')).length;
    const carouselsCount = periodTasks.filter((t) => (t.format || '').toLowerCase().includes('carousel') || (t.activity || '').toLowerCase().includes('carousel')).length;
    const staticsCount = periodTasks.filter((t) => (t.format || '').toLowerCase().includes('static') || (t.activity || '').toLowerCase().includes('static')).length;

    // 2. Period TimeLogs
    const periodLogs = timeLogs.filter((l) => {
      if (!isTimeLogInActivePeriod(l)) return false;
      const lId = (l.employeeId || '').toLowerCase();
      const lName = (l.employeeName || '').toLowerCase();
      return (empId && lId === empId.toLowerCase()) || (empName && lName.includes(empName));
    });
    const totalHoursLogged = periodLogs.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);

    // 3. Period Attendance
    const periodAttendance = attendanceRecords.filter((a) => {
      if (!isAttendanceInActivePeriod(a)) return false;
      return a.employeeId === empId;
    });
    const presentDays = periodAttendance.filter((a) => a.status === 'Present' || a.status === 'Work From Home').length;

    return {
      tasks: periodTasks,
      totalTasks: periodTasks.length,
      completed,
      inProgress,
      pending,
      compRate,
      slaRate,
      reelsCount,
      carouselsCount,
      staticsCount,
      logs: periodLogs,
      totalHoursLogged,
      attendance: periodAttendance,
      presentDays
    };
  };

  // Filtered employees based on search & quick selector
  const displayedEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (selectedEmployeeId !== 'ALL' && emp.id !== selectedEmployeeId) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        emp.name?.toLowerCase().includes(q) ||
        emp.role?.toLowerCase().includes(q) ||
        emp.email?.toLowerCase().includes(q)
      );
    });
  }, [employees, selectedEmployeeId, searchTerm]);

  // Aggregate Total Team Statistics for Active Period
  const teamAggregate = useMemo(() => {
    let totalTasks = 0;
    let completed = 0;
    let inProgress = 0;
    let totalHours = 0;
    let greenSla = 0;

    displayedEmployees.forEach((emp) => {
      const stats = getEmployeeAuditStats(emp);
      totalTasks += stats.totalTasks;
      completed += stats.completed;
      inProgress += stats.inProgress;
      totalHours += stats.totalHoursLogged;
      greenSla += stats.tasks.filter((t) => t.slaStatus !== 'Red').length;
    });

    const compRate = totalTasks > 0 ? Math.round((completed / totalTasks) * 100) : 100;
    const slaRate = totalTasks > 0 ? Math.round((greenSla / totalTasks) * 100) : 100;

    return {
      totalTasks,
      completed,
      inProgress,
      totalHours,
      compRate,
      slaRate
    };
  }, [displayedEmployees, auditMode, selectedParticularDate, weekRange, selectedMonth, selectedYear, tasks, timeLogs]);

  // Quick Shift Handlers
  const handleShiftDate = (days) => {
    if (auditMode === 'daily') {
      // Toggle to particular date for previous/next
      const d = new Date(selectedParticularDate);
      d.setDate(d.getDate() + days);
      setSelectedParticularDate(d.toISOString().split('T')[0]);
      setAuditMode('particular-date');
    } else if (auditMode === 'particular-date') {
      const d = new Date(selectedParticularDate);
      d.setDate(d.getDate() + days);
      setSelectedParticularDate(d.toISOString().split('T')[0]);
    } else if (auditMode === 'weekly') {
      const d = new Date(selectedWeekDate);
      d.setDate(d.getDate() + (days * 7));
      setSelectedWeekDate(d.toISOString().split('T')[0]);
    } else if (auditMode === 'monthly') {
      let [y, m] = selectedMonth.split('-').map(Number);
      m += days;
      if (m < 1) { m = 12; y -= 1; }
      if (m > 12) { m = 1; y += 1; }
      setSelectedMonth(`${y}-${String(m).padStart(2, '0')}`);
    } else if (auditMode === 'yearly') {
      setSelectedYear((prev) => (parseInt(prev, 10) + days).toString());
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%', maxWidth: '1380px', margin: '0 auto' }}>
      
      {/* Print Specific CSS Rules */}
      <style>{`
        .print-only-doc { display: none !important; }
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          html, body { background: #ffffff !important; color: #000000 !important; font-size: 8.5pt !important; }
          .screen-only-ui, nav, aside, header, .sidebar, .app-header { display: none !important; }
          .print-only-doc { display: block !important; width: 100% !important; }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* SCREEN INTERACTIVE UI                                                     */}
      {/* ========================================================================= */}
      <div className="screen-only-ui" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header Title & Actions Card */}
        <div className="glass-panel-glow" style={{ padding: '22px 28px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, #075e54 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(0, 168, 132, 0.3)'
                }}>
                  <UserCheck size={22} />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Employee Audit Intelligence
                  </h1>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Comprehensive audit records & productivity metrics for every specialist team member
                  </p>
                </div>
              </div>
            </div>

            {/* Print / Export Action Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-primary"
                style={{ padding: '9px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}
              >
                <Printer size={16} />
                Print / Export Audit Dossier
              </button>
            </div>
          </div>

          {/* Audit Mode Tabs (Daily, Particular Date, Weekly, Monthly, Yearly) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '4px', textTransform: 'uppercase' }}>
              Audit Period:
            </span>

            {/* 1. Daily Audit */}
            <button
              type="button"
              onClick={() => setAuditMode('daily')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: auditMode === 'daily' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                color: auditMode === 'daily' ? '#ffffff' : 'var(--text-main)',
                border: auditMode === 'daily' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: auditMode === 'daily' ? '0 2px 8px rgba(0, 168, 132, 0.25)' : 'none'
              }}
            >
              <Sun size={15} /> Daily Audit
            </button>

            {/* 2. Particular Date Audit */}
            <button
              type="button"
              onClick={() => setAuditMode('particular-date')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: auditMode === 'particular-date' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                color: auditMode === 'particular-date' ? '#ffffff' : 'var(--text-main)',
                border: auditMode === 'particular-date' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: auditMode === 'particular-date' ? '0 2px 8px rgba(0, 168, 132, 0.25)' : 'none'
              }}
            >
              <CalendarDays size={15} /> Particular Date Audit
            </button>

            {/* 3. Weekly Audit */}
            <button
              type="button"
              onClick={() => setAuditMode('weekly')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: auditMode === 'weekly' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                color: auditMode === 'weekly' ? '#ffffff' : 'var(--text-main)',
                border: auditMode === 'weekly' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: auditMode === 'weekly' ? '0 2px 8px rgba(0, 168, 132, 0.25)' : 'none'
              }}
            >
              <CalendarRange size={15} /> Weekly Audit
            </button>

            {/* 4. Monthly Audit */}
            <button
              type="button"
              onClick={() => setAuditMode('monthly')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: auditMode === 'monthly' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                color: auditMode === 'monthly' ? '#ffffff' : 'var(--text-main)',
                border: auditMode === 'monthly' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: auditMode === 'monthly' ? '0 2px 8px rgba(0, 168, 132, 0.25)' : 'none'
              }}
            >
              <Calendar size={15} /> Monthly Audit
            </button>

            {/* 5. Yearly Audit */}
            <button
              type="button"
              onClick={() => setAuditMode('yearly')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                backgroundColor: auditMode === 'yearly' ? 'var(--accent-primary)' : 'var(--bg-card-hover)',
                color: auditMode === 'yearly' ? '#ffffff' : 'var(--text-main)',
                border: auditMode === 'yearly' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                boxShadow: auditMode === 'yearly' ? '0 2px 8px rgba(0, 168, 132, 0.25)' : 'none'
              }}
            >
              <Award size={15} /> Yearly Audit
            </button>
          </div>
        </div>

        {/* Date Filter & Selector Bar */}
        <div className="glass-panel" style={{
          padding: '14px 22px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Active Period Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', borderRadius: '8px' }}
              title="Previous Period"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-main)' }}>
              {activePeriodLabel}
            </span>

            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', borderRadius: '8px' }}
              title="Next Period"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Contextual Date Picker Control based on Active Audit Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {auditMode === 'particular-date' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Date:</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', width: '160px' }}
                  value={selectedParticularDate}
                  onChange={(e) => setSelectedParticularDate(e.target.value)}
                />
              </div>
            )}

            {auditMode === 'weekly' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Week Containing:</label>
                <input
                  type="date"
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', width: '160px' }}
                  value={selectedWeekDate}
                  onChange={(e) => setSelectedWeekDate(e.target.value)}
                />
              </div>
            )}

            {auditMode === 'monthly' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Month:</label>
                <select
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', width: '170px' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="2026-07">July 2026</option>
                  <option value="2026-08">August 2026</option>
                  <option value="2026-09">September 2026</option>
                  <option value="2026-10">October 2026</option>
                  <option value="2026-11">November 2026</option>
                  <option value="2026-12">December 2026</option>
                </select>
              </div>
            )}

            {auditMode === 'yearly' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Year:</label>
                <select
                  className="form-input"
                  style={{ padding: '6px 12px', fontSize: '0.82rem', width: '120px' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2027">2027</option>
                </select>
              </div>
            )}

            {/* Specialist Quick Filter Chips */}
            <select
              className="form-input"
              style={{ padding: '6px 12px', fontSize: '0.82rem', width: '180px' }}
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              <option value="ALL">👥 All Specialists ({employees.length})</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Aggregate KPI Scorecard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Audited Deliverables
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              {teamAggregate.totalTasks}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {teamAggregate.completed} Completed • {teamAggregate.inProgress} Active
            </span>
          </div>

          <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Completion Rate
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
              {teamAggregate.compRate}%
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-card-hover)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${teamAggregate.compRate}%`, height: '100%', backgroundColor: 'var(--accent-emerald)', transition: 'width 0.3s ease' }} />
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              SLA Adherence Rate
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: teamAggregate.slaRate >= 80 ? 'var(--accent-emerald)' : '#f87171' }}>
              {teamAggregate.slaRate}%
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Green timeline delivery index
            </span>
          </div>

          <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '6px', borderRadius: '14px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Logged Effort (Hours)
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fbbf24' }}>
              {teamAggregate.totalHours.toFixed(1)}h
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Verified work timesheet hours
            </span>
          </div>
        </div>

        {/* Main Employee Audit Matrix Table */}
        <div className="glass-panel-glow" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', margin: 0 }}>
                <Users size={19} color="var(--accent-primary)" /> Specialist Audit Matrix ({displayedEmployees.length})
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Detailed breakdown of deliverables, SLA status, and productivity for the chosen period
              </p>
            </div>

            {/* Quick Search inside audit table */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px', paddingRight: '12px', fontSize: '0.8rem' }}
                placeholder="Search specialist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>SPECIALIST</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>DELIVERABLES</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>FORMAT MIX</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>COMPLETION</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>SLA RATE</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>HOURS LOGGED</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {displayedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No specialists found matching your search.
                    </td>
                  </tr>
                ) : (
                  displayedEmployees.map((emp) => {
                    const stats = getEmployeeAuditStats(emp);

                    return (
                      <tr
                        key={emp.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* Specialist Info */}
                        <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, var(--accent-primary), #0284c7)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: '0.86rem',
                                letterSpacing: '0.5px',
                                flexShrink: 0,
                                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                              }}
                            >
                              {getEmployeeInitials(emp.name)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{emp.name}</div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {emp.role || 'Tech Specialist'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Deliverables Breakdown */}
                        <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {stats.totalTasks}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              ({stats.completed} Done / {stats.inProgress} Active)
                            </span>
                          </div>
                        </td>

                        {/* Format Mix */}
                        <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                            {stats.reelsCount > 0 && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(18, 140, 126, 0.15)', color: '#128c7e' }}>
                                🎬 {stats.reelsCount} Reels
                              </span>
                            )}
                            {stats.carouselsCount > 0 && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(7, 94, 84, 0.15)', color: '#075e54' }}>
                                📑 {stats.carouselsCount} Carousels
                              </span>
                            )}
                            {stats.staticsCount > 0 && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(0, 168, 132, 0.15)', color: 'var(--accent-primary)' }}>
                                🖼️ {stats.staticsCount} Statics
                              </span>
                            )}
                            {stats.totalTasks === 0 && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>—</span>
                            )}
                          </div>
                        </td>

                        {/* Completion Rate */}
                        <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: stats.compRate === 100 ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                              {stats.compRate}%
                            </span>
                            <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--bg-card-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${stats.compRate}%`, height: '100%', backgroundColor: 'var(--accent-emerald)' }} />
                            </div>
                          </div>
                        </td>

                        {/* SLA Compliance */}
                        <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            backgroundColor: stats.slaRate >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: stats.slaRate >= 80 ? 'var(--accent-emerald)' : '#f87171'
                          }}>
                            {stats.slaRate >= 80 ? '✓' : '⚠️'} {stats.slaRate}% SLA
                          </span>
                        </td>

                        {/* Hours Logged */}
                        <td style={{ padding: '14px', verticalAlign: 'middle', fontWeight: 700, color: '#fbbf24' }}>
                          {stats.totalHoursLogged > 0 ? `${stats.totalHoursLogged.toFixed(1)} hrs` : '—'}
                        </td>

                        {/* Action: Dossier View */}
                        <td style={{ padding: '14px', verticalAlign: 'middle', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setDetailedEmployeeModal(emp)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          >
                            <Eye size={13} /> View Audit Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* DETAILED EMPLOYEE AUDIT DOSSIER MODAL                                      */}
      {/* ========================================================================= */}
      {detailedEmployeeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          {(() => {
            const emp = detailedEmployeeModal;
            const stats = getEmployeeAuditStats(emp);

            return (
              <div className="glass-panel-glow" style={{
                width: '100%',
                maxWidth: '900px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '28px',
                borderRadius: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                {/* Modal Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, var(--accent-primary), #0284c7)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        letterSpacing: '0.5px',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                      }}
                    >
                      {getEmployeeInitials(emp.name)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {emp.name} — Audit Dossier
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {emp.role} • {emp.email} • {activePeriodLabel}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailedEmployeeModal(null)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    ✕ Close
                  </button>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                  <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>PERIOD DELIVERABLES</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)' }}>{stats.totalTasks}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{stats.completed} Completed</div>
                  </div>

                  <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>COMPLETION RATE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{stats.compRate}%</div>
                  </div>

                  <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>SLA COMPLIANCE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stats.slaRate >= 80 ? 'var(--accent-emerald)' : '#f87171' }}>{stats.slaRate}%</div>
                  </div>

                  <div className="glass-panel" style={{ padding: '14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL EFFORT</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{stats.totalHoursLogged.toFixed(1)} hrs</div>
                  </div>
                </div>

                {/* Itemized Deliverables List */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>
                    Itemized Deliverables ({stats.tasks.length})
                  </h3>

                  {stats.tasks.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card-hover)', borderRadius: '10px' }}>
                      No deliverables scheduled or recorded for this active period.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {stats.tasks.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            padding: '12px 16px',
                            borderRadius: '10px',
                            background: 'var(--bg-card-hover)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px'
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--accent-primary)' }}>{t.id}</span>
                              <span style={{ fontSize: '0.74rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--border-color)', fontWeight: 700 }}>
                                {t.format || t.activity || 'Post'}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                📅 {t.toBePostedOn || t.date}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {t.description || t.title || 'Creative Task'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: t.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: t.status === 'Completed' ? 'var(--accent-emerald)' : '#f59e0b'
                            }}>
                              {t.status}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '6px',
                              backgroundColor: t.slaStatus !== 'Red' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                              color: t.slaStatus !== 'Red' ? 'var(--accent-emerald)' : '#f87171'
                            }}>
                              {t.slaStatus !== 'Red' ? 'Green SLA' : 'Red SLA'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer close */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setDetailedEmployeeModal(null)}
                    className="btn btn-primary"
                    style={{ padding: '8px 24px' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PRINT-ONLY CLEAN EXECUTIVE AUDIT DOSSIER                                */}
      {/* ========================================================================= */}
      <div className="print-only-doc" style={{ padding: '10px', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '14px' }}>
          <div>
            <h1 style={{ fontSize: '16pt', fontWeight: 'bold', margin: 0, color: '#000' }}>TECH TEAM CRM — EMPLOYEE AUDIT DOSSIER</h1>
            <p style={{ fontSize: '9pt', color: '#555', margin: '2px 0 0 0' }}>{activePeriodLabel} • Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>SYSTEM CARE IT SOLUTIONS</div>
            <div style={{ fontSize: '8pt', color: '#666' }}>Performance & SLA Audit Division</div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
          <div style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8pt', color: '#666' }}>TOTAL DELIVERABLES</div>
            <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{teamAggregate.totalTasks}</div>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8pt', color: '#666' }}>COMPLETION RATE</div>
            <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{teamAggregate.compRate}%</div>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8pt', color: '#666' }}>SLA COMPLIANCE</div>
            <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{teamAggregate.slaRate}%</div>
          </div>
          <div style={{ border: '1px solid #ccc', padding: '8px', borderRadius: '4px' }}>
            <div style={{ fontSize: '8pt', color: '#666' }}>TOTAL EFFORT</div>
            <div style={{ fontSize: '14pt', fontWeight: 'bold' }}>{teamAggregate.totalHours.toFixed(1)} hrs</div>
          </div>
        </div>

        {/* Employee Audit Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', marginBottom: '14px' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #000' }}>
              <th style={{ padding: '6px', textAlign: 'left' }}>Specialist</th>
              <th style={{ padding: '6px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '6px', textAlign: 'center' }}>Total Tasks</th>
              <th style={{ padding: '6px', textAlign: 'center' }}>Completed</th>
              <th style={{ padding: '6px', textAlign: 'center' }}>Completion %</th>
              <th style={{ padding: '6px', textAlign: 'center' }}>SLA %</th>
              <th style={{ padding: '6px', textAlign: 'right' }}>Logged Hours</th>
            </tr>
          </thead>
          <tbody>
            {displayedEmployees.map((emp) => {
              const s = getEmployeeAuditStats(emp);
              return (
                <tr key={emp.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '6px', fontWeight: 'bold' }}>{emp.name}</td>
                  <td style={{ padding: '6px', color: '#555' }}>{emp.role}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{s.totalTasks}</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{s.completed}</td>
                  <td style={{ padding: '6px', textAlign: 'center', fontWeight: 'bold' }}>{s.compRate}%</td>
                  <td style={{ padding: '6px', textAlign: 'center' }}>{s.slaRate}%</td>
                  <td style={{ padding: '6px', textAlign: 'right' }}>{s.totalHoursLogged.toFixed(1)} hrs</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #ccc', paddingTop: '6px', fontSize: '7.5pt', color: '#777', display: 'flex', justifyContent: 'space-between' }}>
          <span>Confidential — Internal System Care IT Solutions Audit</span>
          <span>Approved By: System Care Admin</span>
        </div>
      </div>

    </div>
  );
};
