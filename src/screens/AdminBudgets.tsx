import React, { useState } from 'react';
import { useStore, ExpenseCategory } from '../store/StoreContext';
import { format } from 'date-fns';
import { DollarSign, PieChart, Check, X, Edit2, AlertCircle, Eye, Filter, Settings, List, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminBudgets: React.FC = () => {
  const { 
    events, 
    currentUser, 
    updateEvent,
    globalBudgetSettings, setGlobalBudgetSettings,
    categorySoftCaps, setCategorySoftCaps,
    auditLogs
  } = useStore();
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'planning' | 'audit'>('overview');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showOverBudgetOnly, setShowOverBudgetOnly] = useState(false);

  // Ensure only admins can view
  if (currentUser?.role !== 'admin') {
    return <div style={{ padding: '2rem' }}>אין לך הרשאות לצפות בעמוד זה.</div>;
  }

  // Global calculations for the current year
  const currentYear = new Date().getFullYear();
  const eventsThisYear = events.filter(e => new Date(e.date).getFullYear() === currentYear);
  const globalExpenses = eventsThisYear.reduce((sum, e) => {
    const eventExpenses = e.expenses ? e.expenses.reduce((s, exp) => s + exp.amount, 0) : 0;
    return sum + eventExpenses;
  }, 0);
  const globalRemaining = globalBudgetSettings.annualGlobalBudget - globalExpenses;
  const annualProgress = Math.min(100, Math.round((globalExpenses / globalBudgetSettings.annualGlobalBudget) * 100));

  const handleStartEdit = (id: string, currentBudget: number) => {
    setEditingId(id);
    setEditValue(currentBudget.toString());
  };

  const handleSaveEdit = (id: string) => {
    updateEvent(id, { budget: Number(editValue) });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const filteredEvents = showOverBudgetOnly 
    ? events.filter(e => {
        const expenses = e.expenses ? e.expenses.reduce((s, exp) => s + exp.amount, 0) : 0;
        return e.budget - expenses < 0;
      })
    : events;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <h1 style={{ color: 'var(--color-blue-dark)', margin: 0 }}>ניהול תקציב אסטרטגי (Admin)</h1>
      
      {/* Yearly Overview Widget */}
      <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-blue-pale)', background: 'linear-gradient(to left, #FAFAFA, #FFFFFF)' }}>
        <h2 style={{ margin: 0, marginBottom: '1.5rem', color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={24} /> סקירה שנתית - {currentYear}
        </h2>
        
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--color-blue-dark)' }}>
            <span>ניצול תקציב שנתי: {annualProgress}%</span>
            <span>₪{globalExpenses.toLocaleString()} / ₪{globalBudgetSettings.annualGlobalBudget.toLocaleString()}</span>
          </div>
          <div style={{ width: '100%', height: '24px', background: 'var(--color-blue-pale)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ width: `${annualProgress}%`, height: '100%', background: annualProgress > 90 ? 'var(--color-danger)' : 'var(--color-action-main)', transition: 'width 0.5s ease-in-out' }}></div>
          </div>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>סה"כ הוצאות בפועל</div>
            <div style={{ color: 'var(--color-blue-dark)', fontSize: '1.5rem', fontWeight: 'bold' }}>₪{globalExpenses.toLocaleString()}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>יתרה שנתית זמינה</div>
            <div style={{ color: globalRemaining < 0 ? 'var(--color-danger)' : 'var(--color-success)', fontSize: '1.5rem', fontWeight: 'bold' }}>₪{globalRemaining.toLocaleString()}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>מספר אירועים השנה</div>
            <div style={{ color: 'var(--color-blue-main)', fontSize: '1.5rem', fontWeight: 'bold' }}>{eventsThisYear.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid var(--color-blue-pale)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold',
            color: activeTab === 'overview' ? 'var(--color-blue-dark)' : 'var(--color-text-light)',
            borderBottom: activeTab === 'overview' ? '3px solid var(--color-blue-dark)' : '3px solid transparent',
            marginBottom: '-0.65rem'
          }}
        >
          <List size={18} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}/> אירועים ומעקב
        </button>
        <button 
          onClick={() => setActiveTab('planning')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold',
            color: activeTab === 'planning' ? 'var(--color-blue-dark)' : 'var(--color-text-light)',
            borderBottom: activeTab === 'planning' ? '3px solid var(--color-blue-dark)' : '3px solid transparent',
            marginBottom: '-0.65rem'
          }}
        >
          <Settings size={18} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}/> הגדרות תקציב ויעדים
        </button>
        <button 
          onClick={() => setActiveTab('audit')}
          style={{ 
            background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold',
            color: activeTab === 'audit' ? 'var(--color-blue-dark)' : 'var(--color-text-light)',
            borderBottom: activeTab === 'audit' ? '3px solid var(--color-blue-dark)' : '3px solid transparent',
            marginBottom: '-0.65rem'
          }}
        >
          <Clock size={18} style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}/> יומן מעקב (Audit Log)
        </button>
      </div>

      {/* Tab: Events Overview */}
      {activeTab === 'overview' && (
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-blue-pale)', background: '#FAFAFA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={24} /> פירוט תקציבים לפי אירוע
            </h2>
            <button 
              className={`btn ${showOverBudgetOnly ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowOverBudgetOnly(!showOverBudgetOnly)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                borderColor: showOverBudgetOnly ? 'transparent' : 'var(--color-danger)',
                color: showOverBudgetOnly ? 'white' : 'var(--color-danger)',
                background: showOverBudgetOnly ? 'var(--color-danger)' : 'transparent'
              }}
            >
              <Filter size={16} /> 
              {showOverBudgetOnly ? 'מציג: חריגות בלבד' : 'הצג רק אירועים בחריגה'}
            </button>
          </div>
          
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--color-blue-pale)', color: 'var(--color-blue-dark)' }}>
                <tr style={{ textAlign: 'right' }}>
                  <th style={{ padding: '1.25rem 1rem' }}>שם האירוע</th>
                  <th style={{ padding: '1.25rem 1rem' }}>תאריך</th>
                  <th style={{ padding: '1.25rem 1rem' }}>תקציב מתוכנן</th>
                  <th style={{ padding: '1.25rem 1rem' }}>הוצאות בפועל</th>
                  <th style={{ padding: '1.25rem 1rem' }}>יתרה / חריגה</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((e) => {
                  const expenses = e.expenses ? e.expenses.reduce((s, exp) => s + exp.amount, 0) : 0;
                  const remaining = e.budget - expenses;
                  const isOverBudget = remaining < 0;

                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid #eee', transition: 'background-color 0.2s', background: isOverBudget ? 'rgba(239, 68, 68, 0.02)' : 'transparent' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>
                        <a href={`/manage-guests/${e.id}`} onClick={(ev) => { ev.preventDefault(); navigate(`/manage-guests/${e.id}`); }} style={{ color: 'var(--color-action-main)', textDecoration: 'none' }}>
                          {e.title}
                        </a>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-light)' }}>{format(new Date(e.date), 'dd/MM/yyyy')}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                        {editingId === e.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="number" 
                              value={editValue} 
                              onChange={(ev) => setEditValue(ev.target.value)}
                              style={{ width: '100px', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)' }}
                            />
                            <button onClick={() => handleSaveEdit(e.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-success)', cursor: 'pointer', padding: '0.25rem' }}>
                              <Check size={18} />
                            </button>
                            <button onClick={handleCancelEdit} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-light)', cursor: 'pointer', padding: '0.25rem' }}>
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          `₪${e.budget.toLocaleString()}`
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-main)' }}>₪{expenses.toLocaleString()}</td>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: isOverBudget ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {isOverBudget ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertCircle size={16} /> חריגה: ₪{Math.abs(remaining).toLocaleString()}
                          </span>
                        ) : (
                          `₪${remaining.toLocaleString()}`
                        )}
                      </td>
                      <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => handleStartEdit(e.id, e.budget)}
                          disabled={editingId === e.id}
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          <Edit2 size={14} style={{ marginLeft: '0.25rem' }} /> עריכה
                        </button>
                        <button 
                          className="btn btn-outline" 
                          onClick={() => navigate(`/manage-guests/${e.id}`)}
                          style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--color-blue-main)', color: 'var(--color-blue-main)' }}
                        >
                          <Eye size={14} style={{ marginLeft: '0.25rem' }} /> פירוט
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
                      לא נמצאו אירועים.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Budget Planning */}
      {activeTab === 'planning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ margin: 0, marginBottom: '1.5rem', color: 'var(--color-blue-dark)' }}>תקציב גלובלי (Global Caps)</h3>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>תקציב שנתי כולל (₪)</label>
                <input 
                  type="number" 
                  value={globalBudgetSettings.annualGlobalBudget} 
                  onChange={(e) => setGlobalBudgetSettings({...globalBudgetSettings, annualGlobalBudget: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>יעד הוצאה חודשי (₪)</label>
                <input 
                  type="number" 
                  value={globalBudgetSettings.monthlyTarget} 
                  onChange={(e) => setGlobalBudgetSettings({...globalBudgetSettings, monthlyTarget: Number(e.target.value)})}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
              </div>
            </div>
            
            <h4 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--color-blue-main)' }}>הקצאה לפי מחלקות</h4>
            {Object.entries(globalBudgetSettings.departmentTargets).map(([dept, amount]) => (
              <div key={dept} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, fontWeight: 'bold' }}>{dept}</div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setGlobalBudgetSettings({
                    ...globalBudgetSettings, 
                    departmentTargets: { ...globalBudgetSettings.departmentTargets, [dept]: Number(e.target.value) }
                  })}
                  style={{ width: '200px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} 
                />
                <span style={{ color: 'var(--color-text-light)' }}>₪</span>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginTop: '0.5rem' }}>+ הוסף מחלקה חדשה</button>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ margin: 0, marginBottom: '1.5rem', color: 'var(--color-blue-dark)' }}>תקרות רכות לקטגוריות (Category Soft Caps)</h3>
            <p style={{ color: 'var(--color-text-main)', marginBottom: '1.5rem' }}>
              הגדרת "תקרה רכה" (Soft Cap) מיועדת לספק התראה ויזואלית למארגן האירוע במקרה שהוצאות בקטגוריה מסוימת חורגות מהמומלץ.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-blue-pale)', textAlign: 'right' }}>
                  <th style={{ padding: '1rem' }}>שם קטגוריה</th>
                  <th style={{ padding: '1rem' }}>תקרה רכה (₪)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(categorySoftCaps).map(([category, cap]) => (
                  <tr key={category} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{category}</td>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="number" 
                        value={cap}
                        onChange={(e) => setCategorySoftCaps({ ...categorySoftCaps, [category as ExpenseCategory]: Number(e.target.value) })}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)' }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '2rem', background: '#FAFAFA' }}>
          <h2 style={{ margin: 0, marginBottom: '1.5rem', color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={24} /> יומן מעקב שינויים - Audit Log
          </h2>
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--color-blue-pale)', color: 'var(--color-blue-dark)' }}>
                <tr style={{ textAlign: 'right' }}>
                  <th style={{ padding: '1.25rem 1rem' }}>תאריך ושעה</th>
                  <th style={{ padding: '1.25rem 1rem' }}>משתמש</th>
                  <th style={{ padding: '1.25rem 1rem' }}>פעולה</th>
                  <th style={{ padding: '1.25rem 1rem' }}>ערך קודם</th>
                  <th style={{ padding: '1.25rem 1rem' }}>ערך חדש</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', color: 'var(--color-text-main)' }}>{format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm')}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{log.user}</td>
                    <td style={{ padding: '1rem' }}>{log.action}</td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>{log.previousValue}</td>
                    <td style={{ padding: '1rem', color: 'var(--color-success)', fontWeight: 'bold' }}>{log.newValue}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
                      אין רשומות מעקב.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBudgets;
