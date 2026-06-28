import React from 'react';
import { useStore } from '../store/StoreContext';
import { BarChart2, DollarSign, Star } from 'lucide-react';

const Reports: React.FC = () => {
  const { events, vendors } = useStore();

  const totalBudget = events.reduce((sum, e) => sum + e.budget, 0);
  // Mock actual expenses - say 10% more than budget
  const actualExpenses = totalBudget * 1.1; 
  
  // Categorize
  const eventsByType = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>דוחות ובקרה</h1>

      <div className="grid-2">
        {/* Budget Report */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={24} /> דוחות תקציב (Budget Report)
          </h2>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₪{totalBudget.toLocaleString()}</div>
              <div style={{ color: 'var(--color-text-light)' }}>תקציב מתוכנן</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-danger)' }}>₪{actualExpenses.toLocaleString()}</div>
              <div style={{ color: 'var(--color-text-light)' }}>הוצאות בפועל</div>
            </div>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#eee', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '45%', height: '100%', background: 'var(--color-blue-main)' }}></div>
            <div style={{ width: '55%', height: '100%', background: 'var(--color-danger)' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
            <span>מתוכנן (45%)</span>
            <span>בפועל (55%) - חריגה</span>
          </div>
        </div>

        {/* Vendor Report */}
        <div className="card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={24} /> דוחות ספקים (Vendor Report)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {vendors.slice(0, 3).map(vendor => (
              <div key={vendor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{vendor.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{vendor.service}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Star size={16} fill="var(--color-warning)" color="var(--color-warning)" />
                  <span style={{ fontWeight: 'bold' }}>{vendor.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Event Volume Report */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={24} /> דוח נפח אירועים (Event Volume Report)
          </h2>
          <p style={{ color: 'var(--color-text-light)', marginBottom: '1.5rem' }}>
            מספר האירועים החודש לפי סוג: <strong>{events.length} אירועים סך הכל</strong>
          </p>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {Object.entries(eventsByType).map(([type, count]) => {
              const height = (count / events.length) * 150;
              return (
                <div key={type} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '40px', height: `${height}px`, background: 'var(--color-action-main)', borderRadius: '4px 4px 0 0' }}></div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{count}</div>
                  <div style={{ fontSize: '0.85rem', textAlign: 'center', color: 'var(--color-text-light)' }}>{type}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
