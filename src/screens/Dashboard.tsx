import React from 'react';
import { useStore } from '../store/StoreContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users, Activity, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { events, currentUser } = useStore();
  const navigate = useNavigate();

  // Filter events based on role
  const userEvents = currentUser?.role === 'admin' 
    ? events 
    : events.filter(e => e.organizerId === currentUser?.id);

  const upcomingEvents = [...userEvents]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>תמונת מצב (Dashboard)</h1>
      
      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: '50%', color: 'var(--color-blue-main)' }}>
            <CalendarIcon size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{upcomingEvents.length}</div>
            <div style={{ color: 'var(--color-text-light)' }}>אירועים קרובים</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: '50%', color: 'var(--color-blue-main)' }}>
            <Activity size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {userEvents.filter(e => e.status === 'planning').length}
            </div>
            <div style={{ color: 'var(--color-text-light)' }}>בתכנון</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: '50%', color: 'var(--color-blue-main)' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>420</div>
            <div style={{ color: 'var(--color-text-light)' }}>סה"כ מוזמנים (חודש נוכחי)</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem', borderRight: '4px solid var(--color-warning)' }}>
        <h3 style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Bell size={20} /> התראות ותזכורות אישיות
        </h3>
        <ul style={{ paddingRight: '1.5rem', margin: 0, color: 'var(--color-text-main)' }}>
          <li>תזכורת: עליך לאשר את התפריט הסופי מול קייטרינג "טעים לי" עבור "כנס חדשנות טכנולוגית".</li>
          <li>שימו לב: מכסת המוזמנים לאירוע "הרמת כוסית" כמעט מלאה, וישנם נרשמים שמחכים לאישור.</li>
        </ul>
      </div>

      <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-dark)' }}>האירועים הבאים שלי</h2>
      {upcomingEvents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
          אין אירועים מתוכננים קרובים
        </div>
      ) : (
        <div className="grid-2">
          {upcomingEvents.slice(0, 4).map(event => (
            <div key={event.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, color: 'var(--color-blue-main)' }}>{event.title}</h3>
                <span style={{ 
                  fontSize: '0.8rem', 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '1rem', 
                  background: event.status === 'approved' ? 'var(--color-success)' : 'var(--color-warning)',
                  color: 'white'
                }}>
                  {event.status === 'approved' ? 'אושר' : 'בתכנון'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)', marginTop: '0.5rem' }}>
                <CalendarIcon size={16} />
                {format(new Date(event.date), 'dd/MM/yyyy HH:mm')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
                <MapPin size={16} />
                {event.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
                <Users size={16} />
                קהל יעד: {event.audienceType === 'open' ? 'פתוח לכולם' : 'מוזמנים מראש'}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                 <button className="btn btn-outline" style={{ flex: 1, padding: '0.25rem', fontSize: '0.85rem' }} onClick={() => navigate(`/manage-guests/${event.id}`)}>
                   ניהול אורחים
                 </button>
                 {event.status !== 'completed' && (
                   <button className="btn btn-primary" style={{ flex: 1, padding: '0.25rem', fontSize: '0.85rem', background: 'var(--color-success)', borderColor: 'var(--color-success)' }} onClick={() => alert('אירוע סומן כהסתיים!')}>
                     סיום אירוע
                   </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
