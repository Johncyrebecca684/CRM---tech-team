import React from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { AuthView } from './views/AuthView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { EmployeeModal } from './components/EmployeeModal';

import { AdminDashboard } from './views/AdminDashboard';
import { EmployeeView } from './views/EmployeeView';
import { TaskTableView } from './views/TaskTableView';
import { ReportsView } from './views/ReportsView';
import { AttendanceView } from './views/AttendanceView';
import { SocialMediaCalendarView } from './views/SocialMediaCalendarView';
import { ProfileView } from './views/ProfileView';
import { PerformanceReportView } from './views/PerformanceReportView';

const MainContent = () => {
  const { currentUser, currentTab, userRole, hasPermission, isSidebarCollapsed } = useCrm();

  if (!currentUser || (currentUser.role === 'employee' && currentUser.mustChangePassword === true)) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (currentTab) {
      case 'admin-dashboard':
        return hasPermission('admin') ? <AdminDashboard /> : <EmployeeView />;
      case 'employee-page':
        return <EmployeeView />;
      case 'attendance':
        return <AttendanceView />;
      case 'profile-page':
        return <ProfileView />;
      case 'social-media-calendar':
        return <SocialMediaCalendarView initialMode="social" />;
      case 'task-calendar':
        return <SocialMediaCalendarView initialMode="tasks" />;
      case 'list-tasks':
        return <TaskTableView />;
      case 'monthly-reports':
        return hasPermission('admin') ? <ReportsView /> : <EmployeeView />;
      case 'performance-report':
        return <PerformanceReportView />;
      default:
        if (userRole === 'admin') return <AdminDashboard />;
        return <EmployeeView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div 
        className="main-wrapper"
        style={{
          marginLeft: isSidebarCollapsed ? '72px' : '260px',
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <Navbar />
        <main className="content-body animate-fade-in">
          {renderView()}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal />
      <EmployeeModal />
    </div>
  );
};

export default function App() {
  return (
    <CrmProvider>
      <MainContent />
    </CrmProvider>
  );
}
