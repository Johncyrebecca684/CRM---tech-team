import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { EmployeePerformanceDossier } from '../components/EmployeePerformanceDossier';
import { 
  FileText, 
  Users, 
  Download, 
  Printer, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award,
  CalendarCheck
} from 'lucide-react';

export const PerformanceReportView = () => {
  const { employees, tasks, currentUser, userRole } = useCrm();
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isEmployee = userRole === 'employee';

  // If user is employee, automatically lock to their profile
  const activeEmployeeId = isEmployee ? (currentUser?.id || employees[0]?.id) : selectedEmpId;

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="performance-view-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner - Only when on Directory list */}
      {!activeEmployeeId && !isEmployee && (
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}>
                <FileText size={20} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  Performance Reports
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: '2px 0 0 0' }}>
                  Select an employee from the directory to review their individual performance dashboard and audit document
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Directory Grid View if no employee is currently selected and user is admin */}
      {!activeEmployeeId && !isEmployee && (
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                Employees Directory ({employees.length})
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Generate or download high-fidelity multi-page performance dossiers
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="text"
                  placeholder="Search employee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', fontSize: '0.84rem' }}
                />
              </div>


            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '14px 20px' }}>Employee</th>
                  <th style={{ padding: '14px 20px' }}>Role / Designation</th>
                  <th style={{ padding: '14px 20px' }}>Department</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Tasks Assigned</th>
                  <th style={{ padding: '14px 20px', textAlign: 'center' }}>Completion</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Document Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const empTasks = tasks.filter(t => t.assignedToId === emp.id || (t.assignedToEmail && emp.email && t.assignedToEmail.toLowerCase() === emp.email.toLowerCase()));
                  const completedCount = empTasks.filter(t => t.status === 'Completed').length;
                  const rate = empTasks.length > 0 ? Math.round((completedCount / empTasks.length) * 100) : 0;

                  return (
                    <tr 
                      key={emp.id}
                      onClick={() => setSelectedEmpId(emp.id)}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.88rem'
                          }}>
                            {emp.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.88rem' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {emp.role || 'Staff Specialist'}
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {emp.department || 'Tech & Media'}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center', fontWeight: 700 }}>
                        {empTasks.length}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.78rem', 
                          fontWeight: 700, 
                          color: rate >= 75 ? 'var(--accent-emerald)' : rate >= 40 ? 'var(--accent-primary)' : 'var(--accent-amber)',
                          background: rate >= 75 ? 'rgba(5, 150, 105, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {rate}%
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEmpId(emp.id);
                          }}
                          className="btn btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          <FileText size={14} /> Open Report <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No employees found matching "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Employee Report View */}
      {activeEmployeeId && (
        <EmployeePerformanceDossier 
          initialEmployeeId={activeEmployeeId}
          onBack={!isEmployee ? () => setSelectedEmpId(null) : null}
        />
      )}
    </div>
  );
};
