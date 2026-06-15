import React from 'react';
import { useStore } from '../store/StoreContext';
import { BarChart2, DollarSign, TrendingUp } from 'lucide-react';

const Reports: React.FC = () => {
  const { events } = useStore();

  const totalBudget = events.reduce((sum, e) => sum + e.budget, 0);
  const avgBudget = events.length ? Math.round(totalBudget / events.length) : 0;
  
  // Categorize
  const eventsByType = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>דוחות ובקרה</h1>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: '50%', color: 'var(--color-blue-main)' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₪{totalBudget.toLocaleString()}</div>
            <div style={{ color: 'var(--color-text-light)' }}>סה"כ תקציב מתוכנן</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: '50%', color: 'var(--color-blue-main)' }}>
            <BarChart2 size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{events.length}</div>
            <div style={{ color: 'var(--color-text-light)' }}>סה"כ אירועים</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: '50%', color: 'var(--color-blue-main)' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₪{avgBudget.toLocaleString()}</div>
            <div style={{ color: 'var(--color-text-light)' }}>תקציב ממוצע לאירוע</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-dark)' }}>התפלגות אירועים לפי סוג</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(eventsByType).map(([type, count]) => {
              const percentage = Math.round((count / events.length) * 100);
              return (
                <div key={type}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>{type}</span>
                    <span style={{ fontWeight: 'bold' }}>{percentage}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-blue-main)' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-dark)' }}>אירועים אחרונים</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'right' }}>
                <th style={{ padding: '0.5rem' }}>שם אירוע</th>
                <th style={{ padding: '0.5rem' }}>תקציב</th>
                <th style={{ padding: '0.5rem' }}>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 5).map(e => (
                <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{e.title}</td>
                  <td style={{ padding: '0.5rem' }}>₪{e.budget.toLocaleString()}</td>
                  <td style={{ padding: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', 
                      background: e.status === 'approved' ? 'var(--color-success)' : 'var(--color-warning)', color: 'white'
                    }}>
                      {e.status === 'approved' ? 'אושר' : 'בתכנון'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
