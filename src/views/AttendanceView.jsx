import React, { useState, useMemo, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  CheckCircle2, 
  XCircle,
  Clock, 
  Calendar, 
  Search, 
  Users, 
  Eye, 
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
  Building2,
  Laptop,
  Timer,
  CheckCheck,
  FileText,
  Plus,
  AlertCircle,
  X,
  Send,
  CalendarDays,
  ShieldCheck,
  Check,
  Trash2,
  Inbox,
  Filter,
  LogIn,
  LogOut
} from 'lucide-react';

export const AttendanceView = () => {
  const { 
    employees, 
    attendanceRecords, 
    leaveRequests,
    applyLeaveRequest,
    updateLeaveStatus,
    deleteLeaveRequest,
    LEAVE_TYPE_OPTIONS,
    markAttendance, 
    markAllPresent, 
    currentUser, 
    userRole 
  } = useCrm();

  const isEmployeeRole = userRole === 'employee';
  
  // Navigation sub-tab: 'register' | 'leave-requests'
  const [activeTab, setActiveTab] = useState('register');

  // Inspected specialist ID (null = team overview, 'emp-x' = inspecting specialist)
  const [inspectedEmployeeId, setInspectedEmployeeId] = useState(isEmployeeRole ? (currentUser?.id || '') : null);

  // Leave Request Filter & Modal State
  const [leaveFilter, setLeaveFilter] = useState('All');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState({
    employeeId: currentUser?.id || '',
    leaveType: 'Casual Leave',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    days: 1,
    reason: ''
  });

  // Admin Review Decision Modal
  const [reviewModalData, setReviewModalData] = useState(null);

  // Deduplicate employees to ensure distinct specialists
  const uniqueEmployees = useMemo(() => {
    const seen = new Set();
    return employees.filter(e => {
      if (!e || !e.id) return false;
      if (e.email && e.email.toLowerCase().includes('techteam.dev')) return false;
      const key = e.email ? e.email.toLowerCase().trim() : e.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [employees]);

  const activeEmployee = uniqueEmployees.find(e => e.id === inspectedEmployeeId) || (isEmployeeRole ? (uniqueEmployees.find(e => e.id === currentUser?.id) || uniqueEmployees[0]) : null);

  const todayDateObj = new Date();
  const todayStr = todayDateObj.toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Employee Attendance Calendar View state
  const [empCalendarMonth, setEmpCalendarMonth] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [selectedCalendarDay, setSelectedCalendarDay] = useState(todayStr);

  const handlePrevEmpMonth = () => {
    let [y, m] = empCalendarMonth.split('-').map(Number);
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setEmpCalendarMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleNextEmpMonth = () => {
    let [y, m] = empCalendarMonth.split('-').map(Number);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setEmpCalendarMonth(`${y}-${String(m).padStart(2, '0')}`);
  };

  const handleCurrentEmpMonth = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setEmpCalendarMonth(`${y}-${m}`);
    setSelectedCalendarDay(todayStr);
  };

  // Live time ticker for Punch In / Out precision
  const [liveTime, setLiveTime] = useState(() => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${strMinutes} ${ampm}`;
  });
  const [toastNotice, setToastNotice] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      const strHours = hours < 10 ? '0' + hours : hours;
      setLiveTime(`${strHours}:${strMinutes} ${ampm}`);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getFormattedCurrentTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${strMinutes} ${ampm}`;
  };

  // Formatted date string for header
  const formattedTodayLong = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Calculate team-wide attendance statistics for selectedDate
  const teamDailyStats = useMemo(() => {
    let presentCount = 0;
    let wfhCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let totalLoggedHours = 0;

    uniqueEmployees.forEach((emp, idx) => {
      const rec = attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedDate);
      const status = rec?.status || (idx === 2 || idx === 8 ? 'Work From Home' : (idx === 4 ? 'Half Day' : 'Present'));
      if (status === 'Present') {
        presentCount++;
        totalLoggedHours += 8.5;
      } else if (status === 'Work From Home') {
        wfhCount++;
        totalLoggedHours += 8.0;
      } else if (status === 'Half Day') {
        halfDayCount++;
        totalLoggedHours += 4.5;
      } else {
        absentCount++;
      }
    });

    const totalTeam = uniqueEmployees.length || 10;
    const activeWorking = presentCount + wfhCount + (halfDayCount * 0.5);
    const attendanceRate = Math.round((activeWorking / totalTeam) * 100);
    const avgHours = totalTeam > 0 ? (totalLoggedHours / totalTeam).toFixed(1) : '8.0';

    return {
      presentCount,
      wfhCount,
      halfDayCount,
      absentCount,
      totalTeam,
      attendanceRate,
      avgHours,
      totalLoggedHours: totalLoggedHours.toFixed(1)
    };
  }, [uniqueEmployees, attendanceRecords, selectedDate]);

  // Leave Requests Counts & Metrics
  const leaveStats = useMemo(() => {
    const list = isEmployeeRole 
      ? leaveRequests.filter(r => r.employeeId === (currentUser?.id || activeEmployee?.id) || r.employeeEmail?.toLowerCase() === currentUser?.email?.toLowerCase())
      : leaveRequests;
    const total = list.length;
    const pending = list.filter(r => r.status === 'Pending').length;
    const approved = list.filter(r => r.status === 'Approved').length;
    const rejected = list.filter(r => r.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [leaveRequests, isEmployeeRole, currentUser, activeEmployee]);

  // Filtered Leave Requests List
  const filteredLeaveRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      if (isEmployeeRole && req.employeeId !== currentUser?.id && req.employeeEmail?.toLowerCase() !== currentUser?.email?.toLowerCase()) {
        return false;
      }
      if (leaveFilter !== 'All' && req.status !== leaveFilter) return false;
      if (leaveSearch.trim()) {
        const q = leaveSearch.toLowerCase();
        const empName = req.employeeName?.toLowerCase() || '';
        const role = req.employeeRole?.toLowerCase() || '';
        const type = req.leaveType?.toLowerCase() || '';
        const reason = req.reason?.toLowerCase() || '';
        if (!empName.includes(q) && !role.includes(q) && !type.includes(q) && !reason.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [leaveRequests, isEmployeeRole, currentUser, leaveFilter, leaveSearch]);

  // Attendance Record for Active Employee Today (when inspecting a single employee)
  const todayRecord = activeEmployee ? attendanceRecords.find(
    r => r.employeeId === activeEmployee.id && r.date === todayStr
  ) : null;

  const isCheckedIn = !!(todayRecord && todayRecord.status !== 'Absent' && todayRecord.checkIn);
  const isPunchedOut = !!(todayRecord && todayRecord.checkOut && todayRecord.checkOut !== '');
  const currentPunchInTime = todayRecord?.checkIn || (isCheckedIn ? '09:30 AM' : '09:30 AM');
  const currentPunchOutTime = todayRecord?.checkOut || '';

  // Handle Punch In Action (Employee Only)
  const handlePunchIn = (status = 'Present') => {
    if (!activeEmployee) return;
    const timeNow = getFormattedCurrentTime();
    markAttendance(activeEmployee.id, todayStr, status, timeNow, '', 'Punched in via Employee Portal');
    setToastNotice(`✓ Punched In successfully at ${timeNow} (${status === 'Work From Home' ? 'Remote WFH' : 'In Office'})`);
    setTimeout(() => setToastNotice(null), 4000);
  };

  // Handle Punch Out Action (Employee Only)
  const handlePunchOut = () => {
    if (!activeEmployee) return;
    const timeNow = getFormattedCurrentTime();
    const inTime = todayRecord?.checkIn || '09:30 AM';
    markAttendance(activeEmployee.id, todayStr, todayRecord?.status || 'Present', inTime, timeNow, 'Punched out via Employee Portal');
    setToastNotice(`✓ Punched Out successfully at ${timeNow}! Total hours logged today.`);
    setTimeout(() => setToastNotice(null), 4000);
  };
  
  const todayLoggedHours = useMemo(() => {
    if (!activeEmployee) return Number(teamDailyStats.avgHours);
    if (!isCheckedIn) return 0;
    if (todayRecord?.checkIn && todayRecord?.checkOut) {
      const parseTimeToHours = (timeStr) => {
        if (!timeStr) return 0;
        const [time, period] = timeStr.split(' ');
        let [h, m] = (time || '0:0').split(':').map(Number);
        if (period === 'PM' && h < 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return (h || 0) + ((m || 0) / 60);
      };
      const inVal = parseTimeToHours(todayRecord.checkIn);
      const outVal = parseTimeToHours(todayRecord.checkOut);
      if (outVal > inVal) {
        return Math.max(0.1, Number((outVal - inVal).toFixed(2)));
      }
    }
    return 3.45;
  }, [todayRecord, isCheckedIn, activeEmployee, teamDailyStats.avgHours]);

  const breakHours = 1.21;
  const overtimeHours = todayLoggedHours > 8 ? Number((todayLoggedHours - 8).toFixed(1)) : 1.0;

  // Monthly Attendance Calendar Matrix for Active Employee
  const empMonthData = useMemo(() => {
    const [yStr, mStr] = empCalendarMonth.split('-');
    const y = parseInt(yStr, 10) || 2026;
    const m = parseInt(mStr, 10) || 9; // 1-12
    const dateObj = new Date(y, m - 1, 1);
    const monthName = dateObj.toLocaleString('en-US', { month: 'long' });
    const countDays = new Date(y, m, 0).getDate();
    // Monday as 1st column: (0 = Sun => 6, 1 = Mon => 0, ..., 6 = Sat => 5)
    const rawFirstDay = new Date(y, m - 1, 1).getDay();
    const startOffset = (rawFirstDay + 6) % 7;

    let presentDaysCount = 0;
    let wfhDaysCount = 0;
    let halfDaysCount = 0;
    let leaveDaysCount = 0;
    let totalWorkHours = 0;

    const days = [];
    for (let dayNum = 1; dayNum <= countDays; dayNum++) {
      const dayDateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayObj = new Date(y, m - 1, dayNum);
      const dayOfWeek = dayObj.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const rec = activeEmployee ? attendanceRecords.find(r => r.employeeId === activeEmployee.id && r.date === dayDateStr) : null;
      
      const isToday = dayDateStr === todayStr;
      let status = 'Scheduled';
      let checkIn = '-';
      let checkOut = '-';
      let hours = 0;
      let breakTime = '1.0 hr';
      let overtime = '0 hr';

      if (isToday) {
        if (isCheckedIn) {
          status = todayRecord?.status || 'Present';
          checkIn = currentPunchInTime;
          checkOut = isPunchedOut ? currentPunchOutTime : 'In Progress';
          hours = todayLoggedHours;
          breakTime = `${breakHours} hrs`;
          overtime = `${overtimeHours} hrs`;
        } else {
          status = isWeekend ? 'Weekend Off' : 'Pending Punch In';
        }
      } else if (rec) {
        status = rec.status || 'Present';
        checkIn = rec.checkIn || '09:30 AM';
        checkOut = rec.checkOut || '06:30 PM';
        hours = status === 'Half Day' ? 4.5 : (status === 'Work From Home' ? 8.0 : 8.5);
        breakTime = status === 'Half Day' ? '0.5 hr' : '1.0 hr';
        overtime = dayNum === 2 ? '1.5 hrs' : (dayNum === 6 ? '1.0 hr' : '0 hr');
      } else if (isWeekend) {
        status = 'Weekend Off';
      } else {
        if (dayDateStr < todayStr) {
          if (dayNum % 7 === 3) {
            status = 'Work From Home';
            checkIn = '09:00 AM';
            checkOut = '06:00 PM';
            hours = 8.0;
            breakTime = '1.0 hr';
          } else if (dayNum === 4) {
            status = 'Half Day';
            checkIn = '09:30 AM';
            checkOut = '02:00 PM';
            hours = 4.5;
            breakTime = '0.5 hr';
          } else {
            status = 'Present';
            checkIn = '09:30 AM';
            checkOut = '06:30 PM';
            hours = 8.5;
            breakTime = '1.0 hr';
          }
        } else {
          status = 'Scheduled Shift';
          checkIn = '09:30 AM (Est)';
          checkOut = '06:30 PM (Est)';
          hours = 8.0;
        }
      }

      if (status === 'Present') {
        presentDaysCount++;
        totalWorkHours += hours;
      } else if (status === 'Work From Home') {
        wfhDaysCount++;
        totalWorkHours += hours;
      } else if (status === 'Half Day') {
        halfDaysCount++;
        totalWorkHours += hours;
      } else if (status === 'Leave' || status === 'Approved Leave') {
        leaveDaysCount++;
      }

      days.push({
        dayNum,
        dateStr: dayDateStr,
        dayOfWeek,
        isWeekend,
        isToday,
        status,
        checkIn,
        checkOut,
        hours,
        breakTime,
        overtime,
        record: rec
      });
    }

    const workingDays = days.filter(d => !d.isWeekend).length;
    const completedDays = presentDaysCount + wfhDaysCount + (halfDaysCount * 0.5);
    const attendanceRate = workingDays > 0 ? Math.min(100, Math.round((completedDays / Math.max(1, days.filter(d => d.dateStr <= todayStr && !d.isWeekend).length)) * 100)) : 100;

    return {
      year: y,
      monthNum: m,
      monthName,
      daysInMonth: countDays,
      startOffset,
      days,
      presentDaysCount,
      wfhDaysCount,
      halfDaysCount,
      leaveDaysCount,
      totalWorkHours: totalWorkHours.toFixed(1),
      workingDays,
      attendanceRate
    };
  }, [empCalendarMonth, activeEmployee, attendanceRecords, isCheckedIn, isPunchedOut, currentPunchInTime, currentPunchOutTime, todayLoggedHours, todayStr, todayRecord, breakHours, overtimeHours]);

  const activeSelectedDayInfo = useMemo(() => {
    return empMonthData.days.find(d => d.dateStr === selectedCalendarDay) || empMonthData.days.find(d => d.isToday) || empMonthData.days[0];
  }, [empMonthData, selectedCalendarDay]);

  // Master All Employees Attendance List (for Admin View)
  const allEmployeesAttendanceList = useMemo(() => {
    return uniqueEmployees.map((emp, idx) => {
      const rec = attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedDate);
      const status = rec?.status || (idx === 2 || idx === 8 ? 'Work From Home' : (idx === 4 ? 'Half Day' : 'Present'));
      
      const inTime = rec?.checkIn || (idx % 2 === 0 ? '09:15 AM' : '09:30 AM');
      const outTime = rec?.checkOut || (status === 'Half Day' ? '02:00 PM' : '06:30 PM');
      const prod = status === 'Half Day' ? '4.5 hrs' : (status === 'Work From Home' ? '8.0 hrs' : '8.5 hrs');
      const brk = status === 'Half Day' ? '0.5 hrs' : '1.0 hrs';
      const ot = idx === 1 ? '1.5 hrs' : (idx === 3 ? '2.0 hrs' : (idx === 5 ? '1.0 hrs' : '0 hrs'));

      return {
        sNo: idx + 1,
        id: emp.id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        avatar: emp.avatar,
        date: selectedDate,
        punchIn: inTime,
        punchOut: outTime,
        production: prod,
        breakTime: brk,
        overtime: ot,
        status: status
      };
    }).filter(row => {
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        if (!row.name.toLowerCase().includes(q) && !row.role.toLowerCase().includes(q) && !row.email.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      return true;
    });
  }, [uniqueEmployees, attendanceRecords, selectedDate, searchFilter, statusFilter]);

  // Single Employee Attendance History List (when inspecting one specialist)
  const singleEmployeeHistoryList = useMemo(() => {
    if (!activeEmployee) return [];
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const dStr = d.toISOString().split('T')[0];
      const rec = attendanceRecords.find(r => r.employeeId === activeEmployee.id && r.date === dStr);
      
      const formattedDate = d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const prod = i === 0 ? todayLoggedHours : (rec?.status === 'Present' || rec?.status === 'Work From Home' ? 9 : 8);
      const brk = 1;
      const ot = i === 0 ? overtimeHours : (i === 4 ? 3 : (i === 3 ? 1 : 0));

      const inTime = i === 0 
        ? (isCheckedIn ? currentPunchInTime : 'Not Punched In')
        : (rec?.checkIn || '09:30 AM');

      const outTime = i === 0
        ? (isPunchedOut ? currentPunchOutTime : (isCheckedIn ? 'In Progress' : 'Pending'))
        : (rec?.checkOut || '06:30 PM');

      list.push({
        sNo: i + 1,
        date: formattedDate,
        rawDate: dStr,
        punchIn: inTime,
        punchOut: outTime,
        production: `${prod} hrs`,
        breakTime: `${brk} hrs`,
        overtime: `${ot} hrs`,
        status: i === 0 ? (isCheckedIn ? (todayRecord?.status || 'Present') : 'Absent') : (rec?.status || 'Present')
      });
    }
    return list;
  }, [attendanceRecords, activeEmployee, isCheckedIn, isPunchedOut, currentPunchInTime, currentPunchOutTime, todayLoggedHours, overtimeHours, todayRecord]);

  // Daily Records Bar Chart Data
  const dailyBarData = useMemo(() => {
    return [
      { day: '28', hoursA: 7.5, hoursB: 1.5, total: '9.0 hrs' },
      { day: '29', hoursA: 8.0, hoursB: 1.0, total: '9.0 hrs' },
      { day: '30', hoursA: 7.0, hoursB: 2.0, total: '9.0 hrs' },
      { day: '01', hoursA: 8.5, hoursB: 0.5, total: '9.0 hrs' },
      { day: '02', hoursA: 8.0, hoursB: 1.5, total: '9.5 hrs', highlight: true },
      { day: '03', hoursA: 8.5, hoursB: 1.0, total: '9.5 hrs' },
      { day: '04', hoursA: 7.8, hoursB: 1.2, total: '9.0 hrs' },
      { day: '05', hoursA: 8.2, hoursB: 0.8, total: '9.0 hrs' },
      { day: '06', hoursA: 8.5, hoursB: 1.5, total: '10.0 hrs' }
    ];
  }, []);

  // Circular gauge calculations
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const maxHours = 8;
  const progressPercent = activeEmployee 
    ? Math.min(100, Math.max(0, (todayLoggedHours / maxHours) * 100))
    : teamDailyStats.attendanceRate;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Status badge helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: 'rgba(16, 185, 129, 0.25)', dot: '#10b981', label: 'Present' };
      case 'Work From Home':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: 'rgba(59, 130, 246, 0.25)', dot: '#3b82f6', label: 'Remote (WFH)' };
      case 'Half Day':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: 'rgba(245, 158, 11, 0.25)', dot: '#f59e0b', label: 'Half Day' };
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', border: 'rgba(100, 116, 139, 0.2)', dot: '#94a3b8', label: status };
    }
  };

  // Leave badge helper
  const getLeaveBadge = (status) => {
    switch (status) {
      case 'Approved':
        return { bg: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: 'rgba(16, 185, 129, 0.3)', dot: '#10b981', icon: CheckCircle2 };
      case 'Rejected':
        return { bg: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.3)', dot: '#ef4444', icon: XCircle };
      default:
        return { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: 'rgba(245, 158, 11, 0.3)', dot: '#f59e0b', icon: AlertCircle };
    }
  };

  // Handle Leave Submission
  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    const emp = uniqueEmployees.find(emp => emp.id === leaveFormData.employeeId) || uniqueEmployees[0];
    
    let days = 1;
    if (leaveFormData.leaveType === 'Half Day') {
      days = 0.5;
    } else if (leaveFormData.fromDate && leaveFormData.toDate) {
      const d1 = new Date(leaveFormData.fromDate);
      const d2 = new Date(leaveFormData.toDate);
      const diffTime = Math.abs(d2 - d1);
      days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }

    applyLeaveRequest({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeEmail: emp.email,
      employeeRole: emp.role,
      leaveType: leaveFormData.leaveType,
      fromDate: leaveFormData.fromDate,
      toDate: leaveFormData.toDate,
      days,
      reason: leaveFormData.reason
    });

    setIsLeaveModalOpen(false);
    setLeaveFormData({
      employeeId: currentUser?.id || '',
      leaveType: 'Casual Leave',
      fromDate: todayStr,
      toDate: todayStr,
      days: 1,
      reason: ''
    });
  };

  // Handle Admin Review Decision
  const handleConfirmReview = () => {
    if (!reviewModalData) return;
    updateLeaveStatus(
      reviewModalData.request.id,
      reviewModalData.action,
      reviewModalData.comment
    );
    setReviewModalData(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '1440px', margin: '0 auto', width: '100%', paddingBottom: '30px', position: 'relative' }}>
      
      {/* Floating Toast Notification for Punch In / Out Confirmation */}
      {toastNotice && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <Sparkles size={16} color="#a5b4fc" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* 1. PROFESSIONAL BALANCED HEADER ROW */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '16px',
        paddingBottom: '4px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Title & Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Attendance & Leaves
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span>Dashboard</span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{activeTab === 'register' ? 'Register' : 'Leave Requests'}</span>
              {!isEmployeeRole && activeEmployee && activeTab === 'register' && (
                <>
                  <span style={{ opacity: 0.4 }}>/</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{activeEmployee.name}</span>
                </>
              )}
            </div>
          </div>

          {/* Segment Controller Switcher */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            background: 'var(--bg-app)', 
            padding: '4px', 
            borderRadius: '9px', 
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setActiveTab('register')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: activeTab === 'register' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === 'register' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'register' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Users size={13} color={activeTab === 'register' ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Attendance Register</span>
            </button>

            <button
              onClick={() => setActiveTab('leave-requests')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: activeTab === 'leave-requests' ? 'var(--bg-card)' : 'transparent',
                color: activeTab === 'leave-requests' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: activeTab === 'leave-requests' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: activeTab === 'leave-requests' ? 'var(--shadow-xs)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <CalendarDays size={13} color={activeTab === 'leave-requests' ? 'var(--accent-primary)' : 'currentColor'} />
              <span>Leave Requests</span>
              {leaveStats.pending > 0 && (
                <span style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '2px'
                }}>
                  {leaveStats.pending}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right-aligned Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!isEmployeeRole && activeEmployee && activeTab === 'register' && (
            <button
              onClick={() => setInspectedEmployeeId(null)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px', fontWeight: 600 }}
            >
              <ArrowLeft size={13} /> Back to Register
            </button>
          )}

          {/* Quick Punch In / Punch Out Button in Header - Strictly for Employees */}
          {isEmployeeRole && activeTab === 'register' && (
            !isCheckedIn ? (
              <button
                onClick={() => handlePunchIn('Present')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <LogIn size={13} /> Punch In
              </button>
            ) : !isPunchedOut ? (
              <button
                onClick={handlePunchOut}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(244, 63, 94, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <LogOut size={13} /> Punch Out
              </button>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle2 size={13} /> Punched Out ({currentPunchOutTime})
              </span>
            )
          )}

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px' }}
          >
            <Plus size={13} /> Apply for Leave
          </button>

          {!isEmployeeRole && activeTab === 'register' && (
            <button
              onClick={() => markAllPresent(selectedDate)}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px' }}
            >
              <CheckCheck size={14} /> Mark All Present
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB A: ATTENDANCE REGISTER */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <>
          {/* Top Telemetry Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '16px' }}>
            
            {/* Card 1: Timesheet Gauge */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {activeEmployee ? `Timesheet • ${activeEmployee.name}` : 'Team Telemetry'}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-app)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    {formattedTodayLong}
                  </span>
                </div>

                <div style={{
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {activeEmployee ? 'Punch In Time' : 'Team Attendance Status'}
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                      {activeEmployee 
                        ? (isCheckedIn ? `${currentPunchInTime} (Logged Today)` : 'Not Punched In Yet')
                        : `${teamDailyStats.presentCount + teamDailyStats.wfhCount} of ${teamDailyStats.totalTeam} Specialists Active (${teamDailyStats.attendanceRate}%)`
                      }
                    </div>
                  </div>

                  {activeEmployee && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isPunchedOut ? 'rgba(16, 185, 129, 0.12)' : (isCheckedIn ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
                      color: isPunchedOut ? '#059669' : (isCheckedIn ? '#2563eb' : '#d97706'),
                      border: `1px solid ${isPunchedOut ? 'rgba(16, 185, 129, 0.3)' : (isCheckedIn ? 'rgba(59, 130, 246, 0.3)' : 'rgba(245, 158, 11, 0.3)')}`
                    }}>
                      {isPunchedOut ? '✓ Completed' : (isCheckedIn ? '● Active Session' : '○ Not Punched')}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '6px 0' }}>
                  <svg width="124" height="124" viewBox="0 0 124 124">
                    <circle
                      cx="62"
                      cy="62"
                      r={radius}
                      fill="transparent"
                      stroke="#e2e8f0"
                      strokeWidth="8"
                      opacity="0.5"
                    />
                    <circle
                      cx="62"
                      cy="62"
                      r={radius}
                      fill="transparent"
                      stroke={activeEmployee ? '#0088ff' : '#10b981'}
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 62 62)"
                      style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                    />
                  </svg>
                  
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                      {activeEmployee ? `${todayLoggedHours} hrs` : `${teamDailyStats.avgHours} hrs`}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: isPunchedOut ? '#059669' : (isCheckedIn ? 'var(--accent-emerald)' : 'var(--text-muted)'), fontWeight: 700, marginTop: '3px' }}>
                      {activeEmployee ? (isPunchedOut ? '● Punched Out' : (isCheckedIn ? '● Active' : '○ Inactive')) : '● Team Avg'}
                    </div>
                  </div>
                </div>

                {/* Punch In / Punch Out Controls (Exclusively for Employee Section) */}
                {isEmployeeRole && (
                  <div style={{ marginTop: '12px', marginBottom: '4px' }}>
                    {!isCheckedIn ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                        <button
                          onClick={() => handlePunchIn('Present')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '7px',
                            padding: '9px 14px',
                            borderRadius: '9px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            boxShadow: '0 3px 10px rgba(16, 185, 129, 0.35)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <LogIn size={15} /> Punch In Now
                        </button>
                        <button
                          onClick={() => handlePunchIn('Work From Home')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            padding: '9px 12px',
                            borderRadius: '9px',
                            background: 'var(--bg-app)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                          title="Punch In remotely (Work From Home)"
                        >
                          <Laptop size={13} /> WFH
                        </button>
                      </div>
                    ) : !isPunchedOut ? (
                      <button
                        onClick={handlePunchOut}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '7px',
                          padding: '9px 14px',
                          borderRadius: '9px',
                          background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                          color: '#ffffff',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          boxShadow: '0 3px 10px rgba(244, 63, 94, 0.35)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <LogOut size={15} /> Punch Out ({liveTime})
                      </button>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '9px',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 700, color: '#059669' }}>
                          <CheckCircle2 size={14} /> Shift Completed ({currentPunchOutTime})
                        </div>
                        <button
                          onClick={() => handlePunchIn('Present')}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-primary)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            padding: 0
                          }}
                        >
                          Re-Punch
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                paddingTop: '12px',
                marginTop: '10px',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {activeEmployee ? 'BREAK' : 'IN OFFICE'}
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {activeEmployee ? `${breakHours} hrs` : `${teamDailyStats.presentCount} Specialists`}
                  </div>
                </div>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }}></div>
                <div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {activeEmployee ? 'OVERTIME' : 'REMOTE (WFH)'}
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                    {activeEmployee ? `${overtimeHours} hrs` : `${teamDailyStats.wfhCount} Specialists`}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Productivity Stats */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
                  {activeEmployee ? `Statistics • ${activeEmployee.name}` : 'Team Statistics (10 Specialists)'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Today Logged</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {activeEmployee ? todayLoggedHours : `${teamDailyStats.totalLoggedHours}`} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/ {activeEmployee ? '8 hrs' : '80 hrs'}</span>
                      </span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--bg-app)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: activeEmployee ? `${Math.min(100, (todayLoggedHours / 8) * 100)}%` : '92%', background: '#2dd4bf', borderRadius: '6px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>This Week</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {activeEmployee ? '28' : '385'} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/ {activeEmployee ? '40 hrs' : '400 hrs'}</span>
                      </span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--bg-app)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '75%', background: '#fb7185', borderRadius: '6px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>This Month</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        {activeEmployee ? '90' : '1,420'} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/ {activeEmployee ? '160 hrs' : '1,600 hrs'}</span>
                      </span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--bg-app)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '68%', background: '#f59e0b', borderRadius: '6px' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Overtime Total</span>
                      <span style={{ fontWeight: 700, color: '#d97706' }}>
                        {activeEmployee ? `${overtimeHours} hrs` : '32 hrs total'}
                      </span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--bg-app)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '25%', background: '#eab308', borderRadius: '6px' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <span>Baseline: 8h/day</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>100% On-Track</span>
              </div>
            </div>

            {/* Card 3: Today Activity Timeline */}
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{activeEmployee ? `Today Activity • ${activeEmployee.name}` : 'Live Activity Stream'}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>● Synchronized</span>
                </div>

                {activeEmployee ? (
                  /* Particular Employee's Own Day Timeline Checkpoints */
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '4px' }}>
                    {/* Checkpoint 1: Punch In */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingBottom: '12px' }}>
                      <div style={{ position: 'absolute', left: '6px', top: '14px', bottom: '0', width: '2px', background: 'var(--border-color)', zIndex: 1 }} />
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid #10b981', background: 'var(--bg-card)', zIndex: 2, marginRight: '12px', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Punch In • {isCheckedIn ? (todayRecord?.status === 'Work From Home' ? 'Remote (WFH)' : 'In Office') : 'Scheduled'}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {isCheckedIn ? 'Shift officially started' : 'Awaiting punch in'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: isCheckedIn ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                          <Clock size={11} />
                          <span>{isCheckedIn ? currentPunchInTime : '09:30 AM (Est)'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Checkpoint 2: Meal & Rest Break */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingBottom: '12px' }}>
                      <div style={{ position: 'absolute', left: '6px', top: '14px', bottom: '0', width: '2px', background: 'var(--border-color)', zIndex: 1 }} />
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid #0088ff', background: 'var(--bg-card)', zIndex: 2, marginRight: '12px', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Lunch & Rest Break
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {breakHours} hrs standard break duration
                          </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <span>1:00 PM - 2:00 PM</span>
                        </div>
                      </div>
                    </div>

                    {/* Checkpoint 3: Active Production Tracking */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingBottom: '12px' }}>
                      <div style={{ position: 'absolute', left: '6px', top: '14px', bottom: '0', width: '2px', background: 'var(--border-color)', zIndex: 1 }} />
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid #f59e0b', background: 'var(--bg-card)', zIndex: 2, marginRight: '12px', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Active Production
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {todayLoggedHours} hrs tracked deliverables
                          </div>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: isCheckedIn && !isPunchedOut ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: 700 }}>
                          <span>{isCheckedIn && !isPunchedOut ? '● Live Tracking' : 'Verified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Checkpoint 4: Shift Departure / Punch Out */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingBottom: '0' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: isPunchedOut ? '2.5px solid #10b981' : '2.5px solid #cbd5e1', background: 'var(--bg-card)', zIndex: 2, marginRight: '12px', flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            Punch Out • {isPunchedOut ? 'Completed' : (isCheckedIn ? 'In Progress' : 'Pending')}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {isPunchedOut ? 'Daily shift signed off' : 'Awaiting punch out'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: isPunchedOut ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
                          <Clock size={11} />
                          <span>{isPunchedOut ? currentPunchOutTime : (isCheckedIn ? '06:30 PM (Est)' : '-')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Team Live Activity Feed for Admin */
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: '4px' }}>
                    {uniqueEmployees.slice(0, 5).map((emp, idx) => {
                      const rec = attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedDate);
                      const timeStr = rec?.checkIn || (idx % 2 === 0 ? `09:${15 + idx * 3} AM` : `09:${30 + idx * 2} AM`);
                      const statusStr = rec?.status || (idx === 2 ? 'Work From Home' : 'Present');
                      const isLast = idx === 4;

                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', position: 'relative', paddingBottom: isLast ? '0' : '12px' }}>
                          {!isLast && (
                            <div style={{
                              position: 'absolute',
                              left: '6px',
                              top: '14px',
                              bottom: '0',
                              width: '2px',
                              background: '#e2e8f0',
                              zIndex: 1
                            }} />
                          )}

                          <div style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            border: '2.5px solid #2dd4bf',
                            background: '#ffffff',
                            zIndex: 2,
                            marginRight: '12px',
                            flexShrink: 0,
                            marginTop: '2px'
                          }} />

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              {emp.name} • {statusStr}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              <Clock size={11} />
                              <span>{timeStr}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid var(--border-color)', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {activeEmployee ? `Personal shift telemetry synchronized for ${activeEmployee.name}` : 'Real-time team punch telemetry synchronized'}
              </div>
            </div>

          </div>

          {/* Master Attendance Section: Calendar for Employee or Master Table for Admin */}
          {activeEmployee ? (
            /* ========================================================================= */
            /* EMPLOYEE SECTION: MONTHLY ATTENDANCE CALENDAR MATRIX */
            /* ========================================================================= */
            <div className="glass-panel" style={{ padding: '22px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', width: '100%', boxSizing: 'border-box' }}>
              
              {/* Calendar Header with Title & Navigation Controls */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 136, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0088ff' }}>
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                        Attendance Calendar • {activeEmployee.name}
                      </h2>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '1px 0 0 0' }}>
                        Monthly shift timeline, punch telemetry & compliance matrix
                      </p>
                    </div>
                  </div>
                </div>

                {/* Month Navigator controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-app)', borderRadius: '9px', border: '1px solid var(--border-color)', padding: '2px' }}>
                    <button
                      onClick={handlePrevEmpMonth}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        padding: '6px 8px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Previous Month"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', minWidth: '125px', textAlign: 'center', padding: '0 6px' }}>
                      {empMonthData.monthName} {empMonthData.year}
                    </span>

                    <button
                      onClick={handleNextEmpMonth}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-main)',
                        padding: '6px 8px',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Next Month"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  <button
                    onClick={handleCurrentEmpMonth}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.74rem', fontWeight: 700, padding: '6px 12px', borderRadius: '8px' }}
                  >
                    Current Month
                  </button>
                </div>
              </div>

              {/* Monthly Telemetry Summary KPI Pills */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.74rem', fontWeight: 700, color: '#059669' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                  <span>Present (Office): <strong>{empMonthData.presentDaysCount} Days</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', fontSize: '0.74rem', fontWeight: 700, color: '#2563eb' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span>Remote (WFH): <strong>{empMonthData.wfhDaysCount} Days</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.74rem', fontWeight: 700, color: '#d97706' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span>Half Day: <strong>{empMonthData.halfDaysCount} Days</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  <Timer size={13} color="var(--accent-primary)" />
                  <span>Total Logged: <strong>{empMonthData.totalWorkHours} hrs</strong></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '8px', background: 'rgba(13, 148, 136, 0.1)', border: '1px solid rgba(13, 148, 136, 0.25)', fontSize: '0.74rem', fontWeight: 700, color: '#0f766e', marginLeft: 'auto' }}>
                  <TrendingUp size={13} />
                  <span>Compliance Rate: <strong>{empMonthData.attendanceRate}%</strong></span>
                </div>
              </div>

              {/* Calendar Grid Matrix */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-app)' }}>
                {/* Weekday Header Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  background: 'var(--bg-card)',
                  borderBottom: '1px solid var(--border-color)',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '10px 0'
                }}>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div style={{ color: 'var(--accent-danger, #ef4444)' }}>Sat</div>
                  <div style={{ color: 'var(--accent-danger, #ef4444)' }}>Sun</div>
                </div>

                {/* Day Cells Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: '1px',
                  background: 'var(--border-color)'
                }}>
                  {/* Leading Offset Empty Cells */}
                  {Array.from({ length: empMonthData.startOffset }).map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      style={{
                        background: 'var(--bg-app)',
                        opacity: 0.35,
                        minHeight: '86px'
                      }}
                    />
                  ))}

                  {/* Month Days */}
                  {empMonthData.days.map((day) => {
                    const isSelected = selectedCalendarDay === day.dateStr;

                    let statusDotColor = '#94a3b8';
                    let statusBg = 'rgba(100, 116, 139, 0.08)';
                    let statusTextColor = 'var(--text-muted)';

                    if (day.status === 'Present') {
                      statusDotColor = '#10b981';
                      statusBg = 'rgba(16, 185, 129, 0.12)';
                      statusTextColor = '#059669';
                    } else if (day.status === 'Work From Home') {
                      statusDotColor = '#3b82f6';
                      statusBg = 'rgba(59, 130, 246, 0.12)';
                      statusTextColor = '#2563eb';
                    } else if (day.status === 'Half Day') {
                      statusDotColor = '#f59e0b';
                      statusBg = 'rgba(245, 158, 11, 0.12)';
                      statusTextColor = '#d97706';
                    } else if (day.isWeekend) {
                      statusDotColor = '#94a3b8';
                      statusBg = 'rgba(148, 163, 184, 0.08)';
                      statusTextColor = 'var(--text-muted)';
                    }

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => setSelectedCalendarDay(day.dateStr)}
                        style={{
                          background: isSelected 
                            ? 'var(--bg-card)' 
                            : (day.isToday ? 'rgba(0, 136, 255, 0.04)' : 'var(--bg-card)'),
                          minHeight: '92px',
                          padding: '8px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          position: 'relative',
                          outline: isSelected ? '2px solid var(--accent-primary)' : 'none',
                          outlineOffset: '-2px',
                          zIndex: isSelected ? 2 : 1
                        }}
                      >
                        {/* Day Number and Status Tag */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            fontSize: '0.78rem',
                            fontWeight: day.isToday || isSelected ? 800 : 600,
                            background: day.isToday ? 'var(--accent-primary)' : (isSelected ? 'var(--bg-app)' : 'transparent'),
                            color: day.isToday ? '#ffffff' : (day.isWeekend ? 'var(--accent-danger, #ef4444)' : 'var(--text-main)'),
                            border: isSelected && !day.isToday ? '1px solid var(--border-color)' : 'none'
                          }}>
                            {day.dayNum}
                          </span>

                          <span style={{
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '5px',
                            background: statusBg,
                            color: statusTextColor,
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: statusDotColor }} />
                            {day.status === 'Work From Home' ? 'WFH' : (day.status === 'Weekend Off' ? 'Off' : (day.status === 'Scheduled Shift' ? 'Shift' : day.status))}
                          </span>
                        </div>

                        {/* Punch Timings & Production */}
                        <div style={{ marginTop: '6px' }}>
                          {!day.isWeekend && day.status !== 'Leave' && day.checkIn !== '-' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>In: {day.checkIn.split(' ')[0]}</span>
                                <span style={{ color: day.checkOut === 'In Progress' ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: day.checkOut === 'In Progress' ? 700 : 500 }}>
                                  Out: {day.checkOut.split(' ')[0]}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '2px' }}>
                                {day.hours > 0 ? `${day.hours} hrs` : '-'}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              {day.isWeekend ? 'Weekend Break' : (day.status === 'Scheduled Shift' ? '09:30 AM Shift' : 'Off-duty')}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Selected Day Inspector Bar */}
              {activeSelectedDayInfo && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      color: 'var(--text-main)'
                    }}>
                      📅 {new Date(activeSelectedDayInfo.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: activeSelectedDayInfo.status === 'Present' ? 'rgba(16, 185, 129, 0.12)' : (activeSelectedDayInfo.status === 'Work From Home' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(245, 158, 11, 0.12)'),
                      color: activeSelectedDayInfo.status === 'Present' ? '#059669' : (activeSelectedDayInfo.status === 'Work From Home' ? '#2563eb' : '#d97706')
                    }}>
                      ● {activeSelectedDayInfo.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Punch In: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeSelectedDayInfo.checkIn}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Punch Out: </span>
                      <strong style={{ color: activeSelectedDayInfo.checkOut === 'In Progress' ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                        {activeSelectedDayInfo.checkOut}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Production: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeSelectedDayInfo.hours > 0 ? `${activeSelectedDayInfo.hours} hrs` : '8.5 hrs (Est)'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Break: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{activeSelectedDayInfo.breakTime || '1.0 hr'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Overtime: </span>
                      <strong style={{ color: activeSelectedDayInfo.overtime && activeSelectedDayInfo.overtime !== '0 hr' ? '#d97706' : 'var(--text-muted)' }}>
                        {activeSelectedDayInfo.overtime || '0 hr'}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ========================================================================= */
            /* ADMIN SECTION: MASTER ALL EMPLOYEES ATTENDANCE TABLE */
            /* ========================================================================= */
            <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', width: '100%', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    All Employees Attendance Register ({allEmployeesAttendanceList.length})
                  </h2>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Live attendance, punch logs, production hours and overtime breakdown
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: '190px' }}>
                    <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search specialist..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '30px', height: '32px', fontSize: '0.78rem', width: '100%', borderRadius: '7px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-app)', padding: '3px', borderRadius: '7px', border: '1px solid var(--border-color)' }}>
                    {['All', 'Present', 'Work From Home', 'Half Day'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        style={{
                          border: 'none',
                          background: statusFilter === st ? 'var(--bg-card)' : 'transparent',
                          color: statusFilter === st ? 'var(--text-main)' : 'var(--text-muted)',
                          fontWeight: statusFilter === st ? 700 : 500,
                          fontSize: '0.72rem',
                          padding: '3px 9px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          boxShadow: statusFilter === st ? 'var(--shadow-xs)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {st === 'Work From Home' ? 'WFH' : st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '9px 10px', fontWeight: 700, width: '45px', textAlign: 'center' }}>S. No</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700 }}>Employee Specialist</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700 }}>Punch In</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700 }}>Punch Out</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700 }}>Production</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700 }}>Break</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700 }}>Overtime</th>
                      <th style={{ padding: '9px 12px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allEmployeesAttendanceList.map((row) => {
                      const badge = getStatusBadge(row.status);
                      return (
                        <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '11px 10px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{row.sNo}</td>
                          <td style={{ padding: '11px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '7px',
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                flexShrink: 0
                              }}>
                                {row.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.8rem' }}>{row.name}</div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>{row.role}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '11px 12px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: badge.dot }} />
                              {badge.label}
                            </span>
                          </td>
                          <td style={{ padding: '11px 12px', color: 'var(--text-main)', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.punchIn}</td>
                          <td style={{ padding: '11px 12px', color: 'var(--text-main)', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.punchOut}</td>
                          <td style={{ padding: '11px 12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{row.production}</td>
                          <td style={{ padding: '11px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{row.breakTime}</td>
                          <td style={{ padding: '11px 12px', fontWeight: 700, color: row.overtime !== '0 hrs' ? '#d97706' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {row.overtime}
                          </td>
                          <td style={{ padding: '11px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              onClick={() => setInspectedEmployeeId(row.id)}
                              className="btn btn-secondary"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                fontSize: '0.72rem',
                                borderRadius: '6px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title={`View ${row.name}'s detailed timesheet`}
                            >
                              <Eye size={12} />
                              <span>View Timesheet</span>
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

          {/* Daily Records Chart */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Daily Records (Hours Logged)
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Past 10 days productivity comparison across production vs overtime hours
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#2dd4bf' }} />
                  <span>Regular Production</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0088ff' }} />
                  <span>Overtime / Extra</span>
                </div>
              </div>
            </div>
            
            <div style={{
              height: '170px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px',
              paddingTop: '25px',
              paddingBottom: '6px',
              borderBottom: '1px solid var(--border-color)',
              position: 'relative'
            }}>
              {dailyBarData.map((item, idx) => {
                const isHovered = hoveredBarIndex === idx;
                const showBadge = item.highlight || isHovered;
                
                return (
                  <div 
                    key={idx} 
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      gap: '4px',
                      height: '100%',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {showBadge && (
                      <div style={{
                        position: 'absolute',
                        top: `${Math.max(0, 100 - (item.hoursA / 10) * 100 - 30)}px`,
                        background: '#facc15',
                        color: '#1e293b',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        zIndex: 10
                      }}>
                        {item.total}
                      </div>
                    )}

                    <div style={{
                      width: '9px',
                      height: `${(item.hoursA / 10) * 100}%`,
                      background: '#2dd4bf',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }} />

                    <div style={{
                      width: '9px',
                      height: `${(item.hoursB / 10) * 100}%`,
                      background: '#0088ff',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease'
                    }} />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {dailyBarData.map((item, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {item.day}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB B: LEAVE REQUESTS & APPROVALS */}
      {/* ========================================================================= */}
      {activeTab === 'leave-requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 4 Balanced KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Pending Review
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px', lineHeight: 1.2 }}>
                {leaveStats.pending}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Awaiting admin action
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Approved Leaves
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px', lineHeight: 1.2 }}>
                {leaveStats.approved}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Synced to register
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rejected Requests
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', marginTop: '4px', lineHeight: 1.2 }}>
                {leaveStats.rejected}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Declined requests
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Applications
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px', lineHeight: 1.2 }}>
                {leaveStats.total}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Across team
              </div>
            </div>
          </div>

          {/* Master Leave Requests Table */}
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', width: '100%', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Leave & Time-Off Management
                </h2>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  {isEmployeeRole 
                    ? 'Your personal leave applications, statuses, and administrator remarks' 
                    : 'Employee leave requests submitted for review, with real-time approval actions'}
                </p>
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '190px' }}>
                  <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={leaveSearch}
                    onChange={(e) => setLeaveSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '30px', height: '32px', fontSize: '0.78rem', width: '100%', borderRadius: '7px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '3px', background: 'var(--bg-app)', padding: '3px', borderRadius: '7px', border: '1px solid var(--border-color)' }}>
                  {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setLeaveFilter(st)}
                      style={{
                        border: 'none',
                        background: leaveFilter === st ? 'var(--bg-card)' : 'transparent',
                        color: leaveFilter === st ? 'var(--text-main)' : 'var(--text-muted)',
                        fontWeight: leaveFilter === st ? 700 : 500,
                        fontSize: '0.72rem',
                        padding: '3px 9px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: leaveFilter === st ? 'var(--shadow-xs)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '22%' }}>Employee</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '13%' }}>Leave Type</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%' }}>Period / Duration</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '24%' }}>Reason / Purpose</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '10%' }}>Applied Date</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '9%' }}>Status</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, width: '16%', textAlign: 'right' }}>
                      {isEmployeeRole ? 'Remarks' : 'Admin Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaveRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        <FileText size={26} style={{ opacity: 0.4, marginBottom: '8px' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>No leave requests found</div>
                        <div style={{ fontSize: '0.74rem', marginTop: '2px' }}>Click "Apply for Leave" above to submit a new request</div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeaveRequests.map((req) => {
                      const badge = getLeaveBadge(req.status);
                      
                      return (
                        <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                              <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #4338ca 100%)',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                flexShrink: 0
                              }}>
                                {req.employeeName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                              </div>
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.employeeName}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.employeeRole}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ padding: '14px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-block',
                              background: 'var(--bg-app)',
                              border: '1px solid var(--border-color)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              color: 'var(--text-main)'
                            }}>
                              {req.leaveType}
                            </span>
                          </td>

                          <td style={{ padding: '14px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.8rem' }}>
                              {req.fromDate} {req.toDate && req.toDate !== req.fromDate ? `→ ${req.toDate}` : ''}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {req.days} {req.days === 1 ? 'day' : (req.days === 0.5 ? 'half day' : 'days')}
                            </div>
                          </td>

                          <td style={{ padding: '14px 14px', verticalAlign: 'middle' }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {req.reason}
                            </div>
                            {req.adminComment && (
                              <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--accent-primary)',
                                fontWeight: 600,
                                marginTop: '4px',
                                background: 'var(--bg-app)',
                                padding: '2px 8px',
                                borderRadius: '5px',
                                border: '1px solid var(--border-color)',
                                display: 'inline-block'
                              }}>
                                Remark: {req.adminComment}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '14px 14px', color: 'var(--text-muted)', fontSize: '0.76rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            {req.appliedDate}
                          </td>

                          <td style={{ padding: '14px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: badge.bg,
                              color: badge.color,
                              border: `1px solid ${badge.border}`,
                              padding: '3px 9px',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: badge.dot }} />
                              <span>{req.status}</span>
                            </span>
                          </td>

                          <td style={{ padding: '14px 14px', textAlign: 'right', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                            {isEmployeeRole ? (
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontStyle: req.adminComment ? 'normal' : 'italic' }}>
                                {req.adminComment || (req.status === 'Pending' ? 'Under Review' : 'Processed')}
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', width: '100%' }}>
                                {req.status === 'Pending' ? (
                                  <>
                                    <button
                                      onClick={() => setReviewModalData({ request: req, action: 'Approved', comment: 'Approved' })}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#10b981',
                                        color: '#ffffff',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                      title="Approve leave request"
                                    >
                                      <Check size={12} /> Approve
                                    </button>

                                    <button
                                      onClick={() => setReviewModalData({ request: req, action: 'Rejected', comment: '' })}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: '#ef4444',
                                        color: '#ffffff',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                      }}
                                      title="Reject leave request"
                                    >
                                      <X size={12} /> Reject
                                    </button>
                                  </>
                                ) : (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                      {req.reviewedBy ? `By ${req.reviewedBy}` : 'Processed'}
                                    </span>
                                    <button
                                      onClick={() => deleteLeaveRequest(req.id)}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        padding: '3px',
                                        display: 'flex',
                                        alignItems: 'center'
                                      }}
                                      title="Remove entry"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
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
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: APPLY FOR LEAVE */}
      {/* ========================================================================= */}
      {isLeaveModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Apply for Leave / Time-Off
                </h3>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Submit a leave application for manager review & approval
                </p>
              </div>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!isEmployeeRole && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    Applying For Specialist
                  </label>
                  <select
                    value={leaveFormData.employeeId}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, employeeId: e.target.value })}
                    className="form-select"
                    style={{ width: '100%', height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
                    required
                  >
                    {uniqueEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Leave Type
                </label>
                <select
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                  className="form-select"
                  style={{ width: '100%', height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
                  required
                >
                  {LEAVE_TYPE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    From Date
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.fromDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, fromDate: e.target.value, toDate: leaveFormData.toDate < e.target.value ? e.target.value : leaveFormData.toDate })}
                    className="form-input"
                    style={{ width: '100%', height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                    To Date
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.toDate}
                    min={leaveFormData.fromDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, toDate: e.target.value })}
                    className="form-input"
                    style={{ width: '100%', height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  Reason / Purpose for Leave
                </label>
                <textarea
                  rows={3}
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  placeholder="State the reason for time-off (e.g. personal errands, doctor appointment)..."
                  className="form-input"
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.8rem', borderRadius: '8px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '6px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  <Send size={13} /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADMIN REVIEW / APPROVAL DECISION */}
      {/* ========================================================================= */}
      {reviewModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '22px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color={reviewModalData.action === 'Approved' ? '#10b981' : '#ef4444'} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  {reviewModalData.action === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h3>
              </div>
              <button
                onClick={() => setReviewModalData(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '14px', lineHeight: 1.5, background: 'var(--bg-app)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div><strong>Specialist:</strong> {reviewModalData.request.employeeName}</div>
              <div><strong>Type:</strong> {reviewModalData.request.leaveType} ({reviewModalData.request.days} days)</div>
              <div><strong>Period:</strong> {reviewModalData.request.fromDate} → {reviewModalData.request.toDate}</div>
              <div style={{ marginTop: '4px', color: 'var(--text-muted)' }}><strong>Reason:</strong> {reviewModalData.request.reason}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                Administrator Remark (Optional)
              </label>
              <input
                type="text"
                placeholder={reviewModalData.action === 'Approved' ? 'e.g. Approved. Take rest.' : 'e.g. Incomplete deliverable sprint'}
                value={reviewModalData.comment}
                onChange={(e) => setReviewModalData({ ...reviewModalData, comment: e.target.value })}
                className="form-input"
                style={{ width: '100%', height: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => setReviewModalData(null)}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReview}
                style={{
                  padding: '6px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: 'none',
                  background: reviewModalData.action === 'Approved' ? '#10b981' : '#ef4444',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Confirm {reviewModalData.action}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AttendanceView;
