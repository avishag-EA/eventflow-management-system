import React from 'react';
import { useStore } from '../store/StoreContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';

const CalendarScreen: React.FC = () => {
  const { events } = useStore();
  const currentDate = new Date();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = getDay(monthStart);

  // Pad the start of the calendar to match the weekday (RTL - Sunday to Saturday)
  const blanks = Array.from({ length: startDay }).map((_, i) => (
    <div key={`blank-${i}`} style={{ background: 'var(--color-bg-main)', minHeight: '100px', border: '1px solid #eee' }} />
  ));

  const days = daysInMonth.map((day, i) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = events.filter(e => e.date.startsWith(dateStr));
    
    return (
      <div key={`day-${i}`} style={{ 
        minHeight: '100px', 
        border: '1px solid #eee', 
        padding: '0.5rem',
        background: isToday(day) ? 'var(--color-blue-pale)' : 'var(--color-white)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{format(day, 'd')}</div>
        {dayEvents.map(e => (
          <div key={e.id} style={{ 
            fontSize: '0.75rem', 
            background: 'var(--color-blue-main)', 
            color: 'white', 
            padding: '0.25rem', 
            borderRadius: '4px',
            marginBottom: '0.25rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {format(new Date(e.date), 'HH:mm')} - {e.title}
          </div>
        ))}
      </div>
    );
  });

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>לוח אירועים ארגוני</h1>
      <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-main)' }}>{format(currentDate, 'MMMM yyyy')}</h2>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          background: 'var(--color-blue-dark)', 
          color: 'white',
          textAlign: 'center',
          padding: '0.5rem 0'
        }}>
          <div>ראשון</div>
          <div>שני</div>
          <div>שלישי</div>
          <div>רביעי</div>
          <div>חמישי</div>
          <div>שישי</div>
          <div>שבת</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {blanks}
          {days}
        </div>
      </div>
    </div>
  );
};

export default CalendarScreen;
