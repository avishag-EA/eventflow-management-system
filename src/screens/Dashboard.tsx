import React from 'react';
import { useStore } from '../store/StoreContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Bell, CheckCircle, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { events, currentUser } = useStore();
  const navigate = useNavigate();

  // Filter events based on role
  const userEvents = currentUser?.role === 'admin' 
    ? events 
    : events.filter(e => e.organizerId === currentUser?.id);

  const pendingDeletionEvents = currentUser?.role === 'admin'
    ? events.filter(e => e.status === 'ממתין לאישור מחיקה')
    : [];

  const upcomingEvents = [...userEvents]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Aggregate budget across all active events for the current user
  const activeEvents = userEvents.filter(e => e.status !== 'הושלם');
  const totalBudget = activeEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
  const currentExpenses = activeEvents.reduce((sum, e) => {
    const eventExpenses = e.expenses ? e.expenses.reduce((s, exp) => s + exp.amount, 0) : 0;
    return sum + eventExpenses;
  }, 0);
  const budgetPercentage = totalBudget > 0 ? Math.round((currentExpenses / totalBudget) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Top Row: Constructive Reminders Banner */}
      <div style={{ 
        background: 'var(--color-blue-dark)', 
        borderRadius: 'var(--border-radius-md)', 
        padding: '1.5rem 2rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        boxShadow: '0 4px 12px rgba(140, 117, 161, 0.3)'
      }}>
        <Bell size={24} style={{ color: '#fff', marginTop: '0.2rem' }} />
        <div>
          <h3 style={{ margin: 0, color: '#fff', marginBottom: '0.5rem', fontWeight: 'bold' }}>הכי חשוב לדאוג ל...</h3>
          <ul style={{ margin: 0, paddingRight: '1.5rem', color: 'rgba(255, 255, 255, 0.9)' }}>
            {pendingDeletionEvents.length > 0 && pendingDeletionEvents.map(e => (
              <li key={e.id} style={{ marginBottom: '0.25rem', color: '#ffb7b2', fontWeight: 'bold' }}>
                דחוף (Admin): יש לאשר מחיקת אירוע "{e.title}".
              </li>
            ))}
            <li style={{ marginBottom: '0.25rem' }}>אישור תקציב סופי עבור האירוע "כנס חדשנות טכנולוגית 2024" (מתקרב בעוד 5 ימים).</li>
            <li>חתימה על חוזה מול הספק "טעים לי קייטרינג".</li>
          </ul>
        </div>
      </div>

      {/* 2. Second Row: Personal Alerts & Reminders */}
      <div className="card" style={{ padding: '2rem', borderRight: '4px solid var(--color-blue-main)', background: '#FAFAFA', marginBottom: 0 }}>
        <h3 style={{ margin: 0, color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bell size={20} /> התראות ותזכורות אישיות
        </h3>
        <ul style={{ paddingRight: '1.5rem', margin: 0, color: 'var(--color-text-main)', lineHeight: '1.6' }}>
          <li style={{ marginBottom: '0.5rem' }}>תזכורת: עליך לאשר את התפריט הסופי מול קייטרינג "טעים לי" עבור "כנס חדשנות טכנולוגית".</li>
          <li>שימו לב: מכסת המוזמנים לאירוע "הרמת כוסית" כמעט מלאה.</li>
        </ul>
      </div>

      {/* 3. Third Row: Two-Column Grid */}
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        
        {/* Left Column: Upcoming Events */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--color-blue-dark)' }}>האירועים הקרובים שלי</h2>
          
          {upcomingEvents.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
              אין אירועים מתוכננים קרובים
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingEvents.slice(0, 4).map(event => {
                const totalInvited = event.estimatedHeadcount || 150;
                const confirmed = Math.min(85, totalInvited);
                const rsvpPercentage = Math.round((confirmed / totalInvited) * 100);

                return (
                  <div key={event.id} className="card" style={{ padding: '1.5rem', border: '1px solid var(--color-blue-pale)', marginBottom: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, color: 'var(--color-blue-main)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{event.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                          <CalendarIcon size={16} />
                          {event.endDate 
                            ? `${format(new Date(event.date), 'dd/MM/yyyy')} - ${format(new Date(event.endDate), 'dd/MM/yyyy')} | ${format(new Date(event.date), 'HH:mm')}`
                            : format(new Date(event.date), 'dd/MM/yyyy • HH:mm')}
                        </div>
                      </div>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }} 
                        onClick={() => navigate(`/manage-guests/${event.id}`)}
                      >
                        ניהול
                      </button>
                    </div>
                    
                    {/* Mini-RSVP Progress Bar */}
                    <div style={{ background: '#FAFAFA', padding: '1rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                          <CheckCircle size={14} /> אישרו הגעה: {confirmed}
                        </span>
                        <span style={{ color: 'var(--color-text-light)' }}>סה"כ מוזמנים: {totalInvited}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${rsvpPercentage}%`, height: '100%', background: 'var(--color-success)' }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <button 
                onClick={() => navigate('/events')}
                className="btn btn-outline"
                style={{ width: '100%', padding: '1rem', marginTop: '0.5rem', borderColor: 'var(--color-blue-main)', color: 'var(--color-blue-main)' }}
              >
                צפייה בכל האירועים (View All Events)
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Stats & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Budget Health Card */}
          <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-blue-pale)' }}>
            <h3 style={{ margin: 0, color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <PieChart size={20} /> מצב תקציב חודשי
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {/* Circular Chart */}
              <div style={{ 
                position: 'relative', 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: `conic-gradient(var(--color-action-main) ${budgetPercentage}%, var(--color-blue-pale) 0)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <div style={{ position: 'absolute', inset: '10px', background: 'white', borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-blue-dark)' }}>{budgetPercentage}%</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>נוצלו</span>
                </div>
              </div>

              {/* Stats Breakdown */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>הוצאות עד כה</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>₪{currentExpenses.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>תקציב כולל (חודשי)</div>
                  <div style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>₪{totalBudget.toLocaleString()}</div>
                </div>
                <div style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid #eee', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                  נותרו: <strong style={{ color: 'var(--color-success)' }}>₪{(totalBudget - currentExpenses).toLocaleString()}</strong>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
