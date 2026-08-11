import React from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { AuthView } from './views/AuthView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { EmployeeModal } from './components/EmployeeModal';

import { AdminDashboard } from './views/AdminDashboard';
import { EmployeeView } from './views/EmployeeView';
import { KanbanView } from './views/KanbanView';
import { TaskTableView } from './views/TaskTableView';
import { TeamView } from './views/TeamView';
import { ReportsView } from './views/ReportsView';

const MainContent = () => {
  const { currentUser, currentTab, userRole, hasPermission } = useCrm();

  if (!currentUser) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (currentTab) {
      case 'admin-dashboard':
        return hasPermission('admin') ? <AdminDashboard /> : <EmployeeView />;
      case 'employee-page':
        return <EmployeeView />;
      case 'kanban-tasks':
        return <KanbanView />;
      case 'list-tasks':
        return <TaskTableView />;
      case 'team-control':
        return hasPermission('admin') ? <TeamView /> : <EmployeeView />;
      case 'monthly-reports':
        return <ReportsView />;
      default:
        if (userRole === 'admin') return <AdminDashboard />;
        return <EmployeeView />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        {currentTab !== 'admin-dashboard' && <Navbar />}
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
