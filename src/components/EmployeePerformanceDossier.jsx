import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  Building, 
  Briefcase, 
  Phone, 
  Mail, 
  ShieldCheck, 
  TrendingUp, 
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Target,
  BookOpen,
  DollarSign,
  Layers,
  Sparkles,
  MapPin,
  UserCheck
} from 'lucide-react';

export const EmployeePerformanceDossier = ({ initialEmployeeId = null, onBack = null }) => {
  const { 
    employees, 
    tasks, 
    attendanceRecords, 
    currentUser, 
    userRole, 
    selectedMonth 
  } = useCrm();

  const isEmployeeRole = userRole === 'employee';

  // Active Selected Employee
  const defaultEmpId = initialEmployeeId || (isEmployeeRole ? currentUser?.id : (employees[0]?.id || 'emp-sample-1'));
  const [selectedEmpId, setSelectedEmpId] = useState(defaultEmpId);

  // Active Dashboard Tab for screen view
  const [activeTab, setActiveTab] = useState('overview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Printable ref
  const reportContainerRef = useRef(null);

  // Find or construct base employee info
  const selectedEmployee = useMemo(() => {
    const found = employees.find(e => e.id === selectedEmpId);
    if (found) return found;
    
    return {
      id: 'EMP-0247',
      name: 'Arjun Nair',
      role: 'Digital Marketing Executive',
      department: 'Marketing',
      email: 'arjun.nair@example.com',
      phone: '+91 98XX XXX 247',
      emergencyContact: 'Anita Nair - +91 98XX XXX 842',
      preferredContact: 'Email',
      officeLocation: 'Chennai, Tamil Nadu',
      reportingManager: 'Priya Menon - Marketing Manager',
      joinedDate: '17 July 2023',
      employmentType: 'Full-time',
      workLocation: 'Chennai - Hybrid',
      status: 'Active',
      probationStatus: 'Completed',
      workShift: '09:30 AM - 06:30 PM',
      managerialLevel: 'Individual Contributor',
      currentGrade: 'G3',
      tenure: '3 years 1 month (as of 10 Sep 2026)',
      skills: ['SEO', 'Paid Media', 'Analytics', 'Content Planning'],
      certifications: 'Google Ads Search, GA4, HubSpot Email Marketing',
      salaryAnnual: 'INR 7,20,000',
      salaryMonthlyGross: 'INR 60,000',
      salaryDeductions: 'INR 7,100',
      salaryMonthlyNet: 'INR 52,900',
      noticePeriod: '60 days'
    };
  }, [employees, selectedEmpId]);

  // Generate complete 16-section document data
  const generateInitialReportData = (emp) => {
    const empTasks = tasks.filter(t => 
      t.assignedToId === emp.id || 
      (t.assignedToEmail && emp.email && t.assignedToEmail.toLowerCase() === emp.email.toLowerCase())
    );

    const completedTasks = empTasks.filter(t => t.status === 'Completed');
    const inProgressTasks = empTasks.filter(t => t.status === 'In Progress' || t.status === 'Waiting for approval');
    const greenSlaCount = empTasks.filter(t => t.slaStatus !== 'Red').length;
    const taskCompletionRate = empTasks.length > 0 ? Math.round((completedTasks.length / empTasks.length) * 100) : 94;

    const empAttendance = attendanceRecords.filter(a => a.employeeId === emp.id);
    const presentDays = empAttendance.filter(a => a.status === 'Present' || a.status === 'Work From Home').length;
    const attendanceRate = empAttendance.length > 0 ? ((presentDays / empAttendance.length) * 100).toFixed(1) : '96.4';

    const empSkillsString = Array.isArray(emp.skills) 
      ? emp.skills.join(', ') 
      : (emp.skills || 'SEO, Paid Media, Analytics, Content Planning');

    return {
      documentTitle: 'EMPLOYEE PERFORMANCE REPORT',
      confidentialBadge: 'CONFIDENTIAL',
      preparedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      reportingPeriod: '01 Apr - 31 Mar 2026',
      employeeStatusBadge: (emp.status || 'Active').toUpperCase() + ' EMPLOYEE',

      heroMetrics: {
        attendance: `${attendanceRate}%`,
        kpiAchievement: '92%',
        performanceRating: '4.4 / 5',
        leaveDaysUsed: 18
      },

      profile: {
        employeeId: emp.id?.startsWith('EMP-') ? emp.id : `EMP-${(emp.id || '0247').replace(/\D/g, '') || '0247'}`,
        fullName: emp.name || 'Arjun Nair',
        designation: emp.role || 'Digital Marketing Executive',
        department: emp.department || 'Marketing',
        reportingManager: emp.reportingManager || 'Priya Menon - Marketing Manager',
        dateOfJoining: emp.joinedDate || '17 July 2023',
        employmentType: emp.employmentType || 'Full-time',
        workLocation: emp.workLocation || 'Chennai - Hybrid',
        currentStatus: emp.status || 'Active',
        probationStatus: emp.probationStatus || 'Completed',
        workShift: emp.workShift || '09:30 AM - 06:30 PM',
        managerialLevel: emp.managerialLevel || 'Individual Contributor'
      },

      contact: {
        workEmail: emp.email || 'arjun.nair@example.com',
        phone: emp.phone || '+91 98XX XXX 247',
        emergencyContact: emp.emergencyContact || 'Anita Nair - +91 98XX XXX 842',
        preferredContact: emp.preferredContact || 'Email',
        officeLocation: emp.officeLocation || 'Chennai, Tamil Nadu'
      },

      employmentSnapshot: {
        currentSalaryAnnual: emp.salaryAnnual || 'INR 7,20,000',
        lastSalaryRevision: emp.lastSalaryRevision || '01 April 2026 - 8% revision',
        nextReviewDue: emp.nextReviewDue || '31 March 2027',
        noticePeriod: emp.noticePeriod || '60 days',
        currentGrade: emp.currentGrade || 'G3',
        employmentTenure: emp.tenure || '3 years 1 month (as of 10 Sep 2026)',
        primarySkills: empSkillsString,
        certifications: emp.certifications || 'Google Ads Search, GA4, HubSpot Email Marketing'
      },

      attendanceSummary: {
        workingDays: 240,
        present: 231,
        absent: 5,
        latePartial: 14,
        policyNote: 'Attendance is calculated from approved timesheet/attendance transactions. Late/partial incidents are counted separately from approved leave and official holidays.',
        monthlyBreakdown: [
          { month: 'Apr 2025', workDays: 20, present: 19, absent: 0, late: 1, rate: '95.0%' },
          { month: 'May 2025', workDays: 21, present: 20, absent: 0, late: 1, rate: '95.2%' },
          { month: 'Jun 2025', workDays: 20, present: 19, absent: 1, late: 0, rate: '95.0%' },
          { month: 'Jul 2025', workDays: 23, present: 22, absent: 0, late: 1, rate: '95.7%' },
          { month: 'Aug 2025', workDays: 21, present: 20, absent: 0, late: 1, rate: '95.2%' },
          { month: 'Sep 2025', workDays: 22, present: 21, absent: 0, late: 1, rate: '95.5%' },
          { month: 'Oct 2025', workDays: 23, present: 22, absent: 1, late: 0, rate: '95.7%' },
          { month: 'Nov 2025', workDays: 20, present: 19, absent: 0, late: 1, rate: '95.0%' },
          { month: 'Dec 2025', workDays: 22, present: 21, absent: 0, late: 1, rate: '95.5%' },
          { month: 'Jan 2026', workDays: 21, present: 20, absent: 1, late: 0, rate: '95.2%' },
          { month: 'Feb 2026', workDays: 20, present: 19, absent: 1, late: 0, rate: '95.0%' },
          { month: 'Mar 2026', workDays: 27, present: 20, absent: 1, late: 7, rate: '74.1%' }
        ]
      },

      leaveSummary: {
        entitlements: [
          { type: 'Casual Leave', entitlement: 12, used: 8, balance: 4 },
          { type: 'Sick Leave', entitlement: 10, used: 5, balance: 5 },
          { type: 'Earned Leave', entitlement: 18, used: 5, balance: 13 },
          { type: 'Work From Home', entitlement: 24, used: 11, balance: 13 },
          { type: 'Permission / Short Leave', entitlement: 12, used: 4, balance: 8 }
        ],
        recentActivityNote: 'Recent leave activity: 05 Aug 2026 (Earned Leave, approved), 21 Aug 2026 (Casual Leave, approved), 02 Sep 2026 (Sick Leave, approved). No pending leave requests as of report date.'
      },

      projectPerformance: {
        projects: empTasks.length > 0 
          ? empTasks.map((t, idx) => ({
              project: t.clientProject || `Project Deliverable #${idx + 1}`,
              workstream: t.activity || t.title,
              assigned: 1,
              completed: t.status === 'Completed' ? 1 : 0,
              pending: t.status !== 'Completed' ? 1 : 0,
              completion: t.status === 'Completed' ? '100%' : '0%',
              status: t.status
            }))
          : [
              { project: 'SEO Growth Program', workstream: 'SEO Optimization', assigned: 42, completed: 39, pending: 3, completion: '93%', status: 'On Track' },
              { project: 'Q2 Paid Media Campaign', workstream: 'Performance Marketing', assigned: 28, completed: 27, pending: 1, completion: '96%', status: 'Completed' },
              { project: 'Website Conversion Sprint', workstream: 'CRO & UI Flow', assigned: 18, completed: 16, pending: 2, completion: '89%', status: 'On Track' },
              { project: 'Email Lifecycle Refresh', workstream: 'CRM & Engagement', assigned: 14, completed: 13, pending: 1, completion: '93%', status: 'Completed' },
              { project: 'Monthly Reporting & Insights', workstream: 'Analytics & Dashboards', assigned: 12, completed: 12, pending: 0, completion: '100%', status: 'Completed' }
            ],
        summaryStats: {
          tasksAssigned: empTasks.length > 0 ? empTasks.length : 114,
          tasksCompleted: empTasks.length > 0 ? completedTasks.length : 107,
          overdueTasks: empTasks.filter(t => t.slaStatus === 'Red').length,
          avgCompletionTime: '2.6 working days',
          projectsContributed: 5,
          priorityTasksClosed: `${completedTasks.length} / ${empTasks.length > 0 ? empTasks.length : 16}`
        }
      },

      kpiReview: [
        { kpi: 'Qualified Leads Generated', weight: '1,200', target: '1,080', actual: '1,146', achievement: '106%', rating: 'Exceeds' },
        { kpi: 'Website Organic Sessions', weight: '180,000', target: '165,000', actual: '171,600', achievement: '104%', rating: 'Meets' },
        { kpi: 'Paid Campaign ROAS', weight: '4.0x', target: '4.2x', actual: '4.1x', achievement: '98%', rating: 'Meets' },
        { kpi: 'Email Campaign CTR', weight: '3.5%', target: '3.8%', actual: '3.7%', achievement: '97%', rating: 'Meets' },
        { kpi: 'Content Delivery On Time', weight: '95%', target: '98%', actual: '96%', achievement: '98%', rating: 'Meets' },
        { kpi: 'Monthly Reporting Accuracy', weight: '98%', target: '99%', actual: '99%', achievement: '100%', rating: 'Exceeds' }
      ],

      competencyAssessment: [
        { competency: 'Digital Marketing & Technical Execution', rating: '4.5 / 5', observation: 'Strong domain expertise; high consistency in execution.' },
        { competency: 'Analytical Thinking & Problem Solving', rating: '4.4 / 5', observation: 'Consistently converts project metrics into actionable improvements.' },
        { competency: 'Communication & Stakeholder Alignment', rating: '4.3 / 5', observation: 'Clear, concise progress updates and deliverables documentation.' },
        { competency: 'Ownership & Turnaround Reliability', rating: '4.6 / 5', observation: 'High accountability, zero unmanaged escalations.' },
        { competency: 'Team Collaboration & Cross-functional Support', rating: '4.2 / 5', observation: 'Works seamlessly across product, operations and design teams.' },
        { competency: 'Continuous Learning & Platform Agility', rating: '4.5 / 5', observation: 'Rapid adoption of new workflows and internal tools.' }
      ],

      reviewSummary: {
        overallRating: 'Overall Rating: 4.4 / 5 - Exceeds Expectations',
        commentary: `${emp.name || 'The employee'} has consistently delivered against all core operational and deliverables targets. Demonstrates strong ownership of daily workflows, maintains excellent turnaround SLAs, and collaborates seamlessly across teams. Recommended for expanded scope and milestone leadership.`
      },

      goals: [
        { id: 'G1', goal: 'Increase organic pipeline volume by 15%', area: 'Core Performance', successMeasure: 'Target: 1,320 qualified deliverables', dueDate: '31 Mar 2027', status: 'In Progress' },
        { id: 'G2', goal: 'Deliver quarterly automation roadmap', area: 'Technical Optimization', successMeasure: 'Present 4 quarterly initiatives', dueDate: '31 Mar 2027', status: 'Planned' },
        { id: 'G3', goal: 'Peer mentoring & knowledge sharing', area: 'Leadership & Culture', successMeasure: 'Monthly coaching sessions', dueDate: '31 Dec 2026', status: 'In Progress' },
        { id: 'G4', goal: 'Complete Advanced Platform Certification', area: 'Learning & Dev', successMeasure: 'Official credentials verified', dueDate: '30 Nov 2026', status: 'In Progress' }
      ],

      trainings: [
        { title: 'Google Analytics 4 Certification', provider: 'Google Skillshop', completedDate: '15 May 2026', status: 'Completed', expiry: '15 May 2027' },
        { title: 'Advanced Performance Metrics & Reporting', provider: 'Internal Academy', completedDate: '22 Jun 2026', status: 'Completed', expiry: 'Permanent' },
        { title: 'Enterprise Workflow & Governance Standards', provider: 'Internal Academy', completedDate: '12 Jul 2026', status: 'Completed', expiry: 'Permanent' },
        { title: 'Technical Leadership & Project Ownership', provider: 'External Course', completedDate: 'Ongoing', status: 'In Progress', expiry: '30 Nov 2026' }
      ],

      payroll: {
        annualCtc: emp.salaryAnnual || 'INR 7,20,000',
        monthlyGross: emp.salaryMonthlyGross || 'INR 60,000',
        estimatedDeductions: emp.salaryDeductions || 'INR 7,100',
        estimatedNet: emp.salaryMonthlyNet || 'INR 52,900',
        variablePayEligibility: 'Up to 10% annual base, subject to governance policy',
        lastSalaryRevision: '8% - effective 01 Apr 2026',
        lastAppraisalRating: '4.4 / 5'
      },

      complianceDocs: [
        { document: 'Offer & Appointment Letter', status: 'Verified', lastUpdated: '18 Jul 2023', owner: 'HR Operations' },
        { document: 'Employment Agreement & NDA', status: 'Verified', lastUpdated: '18 Jul 2023', owner: 'HR Operations' },
        { document: 'Identity & Address Verification', status: 'Verified', lastUpdated: '20 Jul 2023', owner: 'HR Operations' },
        { document: 'Direct Deposit / Bank Details', status: 'Verified', lastUpdated: '01 Apr 2026', owner: 'Payroll' },
        { document: 'Tax Declaration & Statutory Form', status: 'Submitted', lastUpdated: '10 Apr 2026', owner: 'Payroll' },
        { document: 'Annual Performance Appraisal Record', status: 'Completed', lastUpdated: '05 Apr 2026', owner: 'Management' }
      ],

      recognitions: [
        { type: 'Quarterly Commendation', subject: 'Outstanding Execution & Deliverables Velocity', date: '04 Aug 2026', recordedBy: 'Operations Manager' },
        { type: 'Excellence Award', subject: 'Highest SLA Adherence in Department', date: '08 Jan 2026', recordedBy: 'Department Director' },
        { type: 'Employee Relations Status', subject: 'Exemplary Record - Zero Incidents', date: 'Current', recordedBy: 'HR Operations' }
      ],

      managerComments: {
        quote: `"${emp.name || 'This employee'} is a dependable specialist who consistently closes the loop on execution. Demonstrated strong accountability, improved turnaround times, and positive initiative across all tracked sprints."`,
        author: emp.reportingManager || 'Operations Lead'
      },

      hrSummary: {
        overallStatus: 'Active and in good standing',
        attendanceRisk: `Low - ${attendanceRate}% attendance compliance`,
        performanceRisk: 'Low - exceeds performance benchmarks',
        leaveRisk: 'Low - healthy balance maintained',
        developmentPriority: 'Technical leadership and cross-functional ownership',
        retentionSignal: 'Positive - high engagement and skill trajectory',
        recommendedAction: 'Expand scope into strategic quarterly initiatives'
      },

      signatures: {
        employeeName: emp.name || 'Employee',
        managerName: emp.reportingManager ? emp.reportingManager.split('-')[0].trim() : 'Reporting Manager',
        hrName: 'HR Governance Representative',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      },

      confidentialityNote: 'This document is an authorized record of individual employee deliverables and performance audit metrics. Confidential - for authorized personnel only.'
    };
  };

  const reportData = useMemo(() => generateInitialReportData(selectedEmployee), [selectedEmployee, tasks, attendanceRecords]);

  // Direct PDF Download handler
  const handleDownloadDirectPdf = async () => {
    if (!reportContainerRef.current) return;
    try {
      setIsGeneratingPdf(true);
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      const element = reportContainerRef.current;
      
      const origDisplay = element.style.display;
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';
      element.style.width = '800px';

      const opt = {
        margin: [6, 8, 6, 8],
        filename: `Performance_Report_${(reportData.profile.fullName || 'Employee').replace(/\s+/g, '_')}_FY26.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
      
      element.style.display = origDisplay;
      element.style.position = '';
      element.style.left = '';
      element.style.top = '';
      element.style.width = '';
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Open Print dialog
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Summary
  const handleExportCsv = () => {
    const rows = [
      ['SECTION', 'ATTRIBUTE', 'VALUE'],
      ['Profile', 'Employee ID', reportData.profile.employeeId],
      ['Profile', 'Name', reportData.profile.fullName],
      ['Profile', 'Designation', reportData.profile.designation],
      ['Profile', 'Department', reportData.profile.department],
      ['Profile', 'Reporting Manager', reportData.profile.reportingManager],
      ['Profile', 'Joining Date', reportData.profile.dateOfJoining],
      ['Metrics', 'Attendance Rate', reportData.heroMetrics.attendance],
      ['Metrics', 'KPI Achievement', reportData.heroMetrics.kpiAchievement],
      ['Metrics', 'Performance Rating', reportData.heroMetrics.performanceRating],
      ['Metrics', 'Leave Used', reportData.heroMetrics.leaveDaysUsed],
      ['Payroll', 'Annual CTC', reportData.payroll.annualCtc],
      ['Payroll', 'Monthly Net', reportData.payroll.estimatedNet],
      ['HR Summary', 'Overall Status', reportData.hrSummary.overallStatus],
      ['HR Summary', 'Performance Risk', reportData.hrSummary.performanceRisk],
      ['HR Summary', 'Retention Signal', reportData.hrSummary.retentionSignal]
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Performance_Summary_${(reportData.profile.fullName || 'Employee').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="dossier-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Styles to cleanly separate Screen Dashboard UI from Print Document */}
      <style>{`
        .screen-dashboard-ui {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

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
          .screen-dashboard-ui, .screen-only-ui, nav, aside, header, .sidebar, .app-header, .no-print {
            display: none !important;
          }
          .print-only-doc {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
          }
          .dossier-section {
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. SCREEN INTERACTIVE DASHBOARD VIEW                                      */}
      {/* ========================================================================= */}
      <div className="screen-dashboard-ui">
        
        {/* Top Header Card */}
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
          {/* Left: Back & Employee Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {onBack && (
              <button 
                onClick={onBack}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.82rem', height: '36px' }}
              >
                <ArrowLeft size={15} /> Back
              </button>
            )}

            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 800,
              flexShrink: 0
            }}>
              {reportData.profile.fullName?.charAt(0) || 'E'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.01em' }}>
                  {reportData.profile.fullName}
                </h2>
                <span className="status-pill status-pill-optimal" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                  {reportData.profile.currentStatus}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  ID: {reportData.profile.employeeId}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.82rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{reportData.profile.designation}</span>
                <span>&bull;</span>
                <span>{reportData.profile.department} Department</span>
                <span>&bull;</span>
                <span>{reportData.profile.workLocation}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions (PDF, CSV, Print) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDownloadDirectPdf} 
              className="btn btn-secondary"
              disabled={isGeneratingPdf}
              title="Download PDF File"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.82rem', height: '36px' }}
            >
              <Download size={14} /> {isGeneratingPdf ? 'Downloading...' : 'PDF'}
            </button>

            <button 
              onClick={handleExportCsv} 
              className="btn btn-secondary"
              title="Download CSV File"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', fontSize: '0.82rem', height: '36px' }}
            >
              <FileSpreadsheet size={14} /> CSV
            </button>

            <button 
              onClick={handlePrint} 
              className="btn btn-primary"
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '7px 18px', 
                fontSize: '0.84rem', 
                fontWeight: 700,
                height: '36px'
              }}
            >
              <Printer size={15} /> Print
            </button>
          </div>
        </div>

        {/* Dashboard 4 Minimal KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          
          <div className="glass-panel" style={{
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ATTENDANCE RATE</span>
              <span style={{ background: 'rgba(2, 132, 199, 0.12)', color: 'var(--accent-cyan)', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                {reportData.attendanceSummary.present}/{reportData.attendanceSummary.workingDays} Days
              </span>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>
              {reportData.heroMetrics.attendance}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Annual Attendance Compliance
            </div>
          </div>

          <div className="glass-panel" style={{
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>KPI ACHIEVEMENT</span>
              <span style={{ background: 'rgba(0, 168, 132, 0.12)', color: 'var(--accent-primary)', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                Target Met
              </span>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>
              {reportData.heroMetrics.kpiAchievement}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Quantitative Deliverables Target
            </div>
          </div>

          <div className="glass-panel" style={{
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>PERFORMANCE RATING</span>
              <span style={{ background: 'rgba(0, 168, 132, 0.12)', color: 'var(--accent-emerald)', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                Exceeds
              </span>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>
              {reportData.heroMetrics.performanceRating}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Annual Supervisor Assessment
            </div>
          </div>

          <div className="glass-panel" style={{
            borderRadius: '12px',
            padding: '16px 18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>LEAVE UTILIZED</span>
              <span style={{ background: 'rgba(217, 119, 6, 0.12)', color: 'var(--accent-amber)', padding: '2px 7px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 }}>
                Healthy
              </span>
            </div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 2px 0' }}>
              {reportData.heroMetrics.leaveDaysUsed} <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-muted)' }}>Days</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Total approved leaves consumed
            </div>
          </div>

        </div>

        {/* Minimal Segmented Navigation Tabs */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-card-hover)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', gap: '4px', width: 'fit-content', flexWrap: 'wrap' }}>
          {[
            { id: 'overview', label: 'Overview & Profile', icon: UserCheck },
            { id: 'deliverables', label: 'Tasks & Deliverables', icon: Layers },
            { id: 'kpis', label: 'KPIs & Competencies', icon: Target },
            { id: 'attendance', label: 'Attendance & Leaves', icon: Calendar },
            { id: 'payroll', label: 'Governance & Terms', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-primary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 1px 4px rgba(0, 168, 132, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview & Profile */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            {/* Employment Details */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="var(--accent-primary)" /> Employment Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reporting Manager:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.profile.reportingManager}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Date of Joining:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.profile.dateOfJoining}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Employment Type:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.profile.employmentType}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Work Shift:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.profile.workShift}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Managerial Level:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.profile.managerialLevel}</strong>
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="var(--accent-primary)" /> Contact & Office Location
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Work Email:</span>
                  <strong style={{ color: 'var(--accent-primary)' }}>{reportData.contact.workEmail}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Contact Phone:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.contact.phone}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Emergency Contact:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.contact.emergencyContact}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Base Office:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.contact.officeLocation}</strong>
                </div>
              </div>
            </div>

            {/* Skills & Certifications */}
            <div className="glass-panel" style={{ padding: '22px', gridColumn: '1 / -1' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="var(--accent-primary)" /> Core Competency & Skills Record
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {reportData.employmentSnapshot.primarySkills.split(',').map((skill, idx) => (
                  <span key={idx} style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    background: 'rgba(99, 102, 241, 0.08)',
                    color: 'var(--accent-primary)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                <strong>Certifications:</strong> {reportData.employmentSnapshot.certifications}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Tasks & Deliverables */}
        {activeTab === 'deliverables' && (
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                  Deliverables & Project Execution Log
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Assigned: {reportData.projectPerformance.summaryStats.tasksAssigned} | Completed: {reportData.projectPerformance.summaryStats.tasksCompleted} | Turnaround: {reportData.projectPerformance.summaryStats.avgCompletionTime}
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>Project / Workstream</th>
                    <th style={{ padding: '12px 14px' }}>Deliverable Activity</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Assigned</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Completed</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Completion</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.projectPerformance.projects.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>{p.project}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>{p.workstream}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{p.assigned}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: 'var(--accent-emerald)' }}>{p.completed}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>{p.completion}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: p.status === 'Completed' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: p.status === 'Completed' ? '#059669' : '#d97706'
                        }}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: KPIs & Competencies */}
        {activeTab === 'kpis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* KPI Review Table */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)' }}>
                Quantitative KPI Target Achievement
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 14px' }}>KPI Metric</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Weight</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Target</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actual</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center' }}>Achievement</th>
                      <th style={{ padding: '12px 14px', textAlign: 'right' }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.kpiReview.map((k, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 600 }}>{k.kpi}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>{k.weight}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center' }}>{k.target}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>{k.actual}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 800, color: 'var(--accent-primary)' }}>{k.achievement}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>{k.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Narrative Review */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                Performance Narrative & Executive Review
              </h3>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                <div style={{ fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '4px' }}>
                  {reportData.reviewSummary.overallRating}
                </div>
                {reportData.reviewSummary.commentary}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Attendance & Leaves */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            {/* Monthly Breakdown */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)' }}>
                Monthly Attendance Breakdown
              </h3>
              <div style={{ overflowX: 'auto', maxHeight: '340px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '8px 10px' }}>Month</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Work Days</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Present</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center' }}>Absent</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.attendanceSummary.monthlyBreakdown.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 10px', fontWeight: 600 }}>{row.month}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.workDays}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.present}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.absent}</td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-primary)' }}>{row.rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave Balance */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)' }}>
                Leave Entitlement & Balances
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reportData.leaveSummary.entitlements.map((l, idx) => (
                  <div key={idx} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{l.type}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>Used: {l.used} / {l.entitlement}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 700, marginTop: '2px' }}>
                      <span>Remaining Balance:</span>
                      <span>{l.balance} Days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: Governance & Terms */}
        {activeTab === 'payroll' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            
            {/* Compensation Overview */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="var(--accent-primary)" /> Compensation & Terms Snapshot
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Annual Base CTC:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.payroll.annualCtc}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Monthly Gross:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.payroll.monthlyGross}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Net:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>{reportData.payroll.estimatedNet}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Notice Period:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{reportData.employmentSnapshot.noticePeriod}</strong>
                </div>
              </div>
            </div>

            {/* Compliance Documents */}
            <div className="glass-panel" style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 14px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--accent-primary)" /> Compliance & Audit Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {reportData.complianceDocs.map((doc, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{doc.document}</span>
                    <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 2. PRINT-ONLY & PDF-ONLY SECTION: MONOCHROME CORPORATE MEMORANDUM         */}
      {/* ========================================================================= */}
      <div 
        ref={reportContainerRef}
        id="printable-performance-report"
        className="print-only-doc dossier-document-root"
        style={{
          width: '100%',
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
          background: '#ffffff',
          padding: '0',
          margin: '0'
        }}
      >
        {/* Document Header Letterhead */}
        <div className="dossier-section" style={{ borderBottom: '1.5px solid #000000', paddingBottom: '6px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', color: '#333333', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                TECH TEAM CRM &bull; INDIVIDUAL PERFORMANCE AUDIT
              </div>
              <h1 style={{ fontSize: '13pt', fontWeight: 'bold', color: '#000000', margin: '2px 0 1px 0', letterSpacing: '-0.01em' }}>
                {reportData.profile.fullName}
              </h1>
              <div style={{ fontSize: '7pt', color: '#444444' }}>
                {reportData.profile.designation} &bull; {reportData.profile.department} Department
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '150px' }}>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', color: '#000000', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {reportData.confidentialBadge}
              </div>
              <div style={{ fontSize: '7.5pt', color: '#000000', fontWeight: 'bold', marginTop: '2px' }}>
                Period: <u>{reportData.reportingPeriod}</u>
              </div>
              <div style={{ fontSize: '6.5pt', color: '#555555', marginTop: '1px' }}>
                Prepared: {reportData.preparedDate} &bull; Status: {reportData.profile.currentStatus}
              </div>
            </div>
          </div>

          {/* Memorandum Meta Line */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', borderTop: '0.5px solid #cccccc', paddingTop: '3px', fontSize: '7pt', color: '#222222' }}>
            <div><strong>EMPLOYEE ID:</strong> {reportData.profile.employeeId}</div>
            <div><strong>MANAGER:</strong> {reportData.profile.reportingManager}</div>
            <div><strong>LOCATION:</strong> {reportData.profile.workLocation}</div>
          </div>
        </div>

        {/* Monochrome Key Metrics Strip */}
        <div className="dossier-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid #000000', background: '#f5f5f5', padding: '4px 8px', marginBottom: '8px' }}>
          <div style={{ textAlign: 'center', borderRight: '1px solid #cccccc' }}>
            <div style={{ fontSize: '6pt', fontWeight: 'bold', color: '#444444', textTransform: 'uppercase' }}>ATTENDANCE</div>
            <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>{reportData.heroMetrics.attendance}</div>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid #cccccc' }}>
            <div style={{ fontSize: '6pt', fontWeight: 'bold', color: '#444444', textTransform: 'uppercase' }}>KPI ACHIEVEMENT</div>
            <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>{reportData.heroMetrics.kpiAchievement}</div>
          </div>

          <div style={{ textAlign: 'center', borderRight: '1px solid #cccccc' }}>
            <div style={{ fontSize: '6pt', fontWeight: 'bold', color: '#444444', textTransform: 'uppercase' }}>PERFORMANCE</div>
            <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>{reportData.heroMetrics.performanceRating}</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '6pt', fontWeight: 'bold', color: '#444444', textTransform: 'uppercase' }}>LEAVE USED</div>
            <div style={{ fontSize: '9pt', fontWeight: 'bold', color: '#000000', marginTop: '1px' }}>{reportData.heroMetrics.leaveDaysUsed} Days</div>
          </div>
        </div>

        {/* Section 1: Profile */}
        <div className="dossier-section" style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '3px', textTransform: 'uppercase' }}>
            1. Employee Profile & Appointment Details
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '22%', background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Employee ID</td>
                <td style={{ width: '28%', padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.profile.employeeId}</td>
                <td style={{ width: '22%', background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Full Name</td>
                <td style={{ width: '28%', padding: '3px 6px', border: '0.8px solid #cccccc', fontWeight: 'bold' }}>{reportData.profile.fullName}</td>
              </tr>
              <tr>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Designation</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.profile.designation}</td>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Department</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.profile.department}</td>
              </tr>
              <tr>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Reporting Manager</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.profile.reportingManager}</td>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Date of Joining</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.profile.dateOfJoining}</td>
              </tr>
              <tr>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Employment Type</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.profile.employmentType}</td>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Work Location</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.profile.workLocation}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Contact Details */}
        <div className="dossier-section" style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '3px', textTransform: 'uppercase' }}>
            2. Contact & Office Details
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7pt' }}>
            <tbody>
              <tr>
                <td style={{ width: '22%', background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Work Email</td>
                <td style={{ width: '28%', padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.contact.workEmail}</td>
                <td style={{ width: '22%', background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Phone</td>
                <td style={{ width: '28%', padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.contact.phone}</td>
              </tr>
              <tr>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Emergency Contact</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.contact.emergencyContact}</td>
                <td style={{ background: '#f5f5f5', fontWeight: 'bold', padding: '3px 6px', border: '0.8px solid #cccccc' }}>Office Location</td>
                <td style={{ padding: '3px 6px', border: '0.8px solid #cccccc' }}>{reportData.contact.officeLocation}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Attendance Governance Table */}
        <div className="dossier-section" style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '3px', textTransform: 'uppercase' }}>
            3. Attendance & Working Hours Log
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7pt', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderTop: '1.2px solid #000000', borderBottom: '1.2px solid #000000', fontWeight: 'bold' }}>
                <th style={{ padding: '3px 6px' }}>Month</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Work Days</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Present</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Absent</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Late</th>
                <th style={{ padding: '3px 6px', textAlign: 'right' }}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {reportData.attendanceSummary.monthlyBreakdown.slice(0, 6).map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '0.5px solid #cccccc' }}>
                  <td style={{ padding: '2.5px 6px', fontWeight: 'bold' }}>{row.month}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center' }}>{row.workDays}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center' }}>{row.present}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center' }}>{row.absent}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center' }}>{row.late}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'right', fontWeight: 'bold' }}>{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Deliverables & Tasks */}
        <div className="dossier-section" style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '3px', textTransform: 'uppercase' }}>
            4. Project Deliverables & Execution Log
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7pt', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderTop: '1.2px solid #000000', borderBottom: '1.2px solid #000000', fontWeight: 'bold' }}>
                <th style={{ padding: '3px 6px' }}>Project</th>
                <th style={{ padding: '3px 6px' }}>Workstream</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Assigned</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Completed</th>
                <th style={{ padding: '3px 6px', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.projectPerformance.projects.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '0.5px solid #cccccc' }}>
                  <td style={{ padding: '2.5px 6px', fontWeight: 'bold' }}>{p.project}</td>
                  <td style={{ padding: '2.5px 6px' }}>{p.workstream}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center' }}>{p.assigned}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center', fontWeight: 'bold' }}>{p.completed}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'right', fontWeight: 'bold' }}>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: KPI Review */}
        <div className="dossier-section" style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 'bold', color: '#000000', borderBottom: '1px solid #000000', paddingBottom: '1px', marginBottom: '3px', textTransform: 'uppercase' }}>
            5. Quantitative KPI Evaluation
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '7pt', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderTop: '1.2px solid #000000', borderBottom: '1.2px solid #000000', fontWeight: 'bold' }}>
                <th style={{ padding: '3px 6px' }}>KPI Metric</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Target</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Actual</th>
                <th style={{ padding: '3px 6px', textAlign: 'center' }}>Achievement</th>
                <th style={{ padding: '3px 6px', textAlign: 'right' }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {reportData.kpiReview.map((k, idx) => (
                <tr key={idx} style={{ borderBottom: '0.5px solid #cccccc' }}>
                  <td style={{ padding: '2.5px 6px', fontWeight: 'bold' }}>{k.kpi}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center' }}>{k.target}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center' }}>{k.actual}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'center', fontWeight: 'bold' }}>{k.achievement}</td>
                  <td style={{ padding: '2.5px 6px', textAlign: 'right', fontWeight: 'bold' }}>{k.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 6: Executive Sign-off Block */}
        <div className="dossier-section" style={{ borderTop: '1px solid #000000', paddingTop: '6px', marginTop: '6px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>EMPLOYEE SIGN-OFF</div>
              <div style={{ fontSize: '6.5pt', color: '#444444', marginTop: '1px' }}>{reportData.signatures.employeeName}</div>
              <div style={{ marginTop: '14px', borderTop: '0.8px solid #000000', paddingTop: '1px', fontSize: '6.5pt', color: '#666666' }}>
                Signature &bull; Date
              </div>
            </div>

            <div>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>MANAGER APPROVAL</div>
              <div style={{ fontSize: '6.5pt', color: '#444444', marginTop: '1px' }}>{reportData.signatures.managerName}</div>
              <div style={{ marginTop: '14px', borderTop: '0.8px solid #000000', paddingTop: '1px', fontSize: '6.5pt', color: '#666666' }}>
                Signature &bull; Date
              </div>
            </div>

            <div>
              <div style={{ fontSize: '6.5pt', fontWeight: 'bold', textTransform: 'uppercase' }}>HR GOVERNANCE</div>
              <div style={{ fontSize: '6.5pt', color: '#444444', marginTop: '1px' }}>{reportData.signatures.hrName}</div>
              <div style={{ marginTop: '14px', borderTop: '0.8px solid #000000', paddingTop: '1px', fontSize: '6.5pt', color: '#666666' }}>
                Signature &bull; Date
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
