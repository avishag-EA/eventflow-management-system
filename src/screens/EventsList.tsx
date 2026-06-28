import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';

const EventsList: React.FC = () => {
  const { events, currentUser } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  const userEvents = currentUser?.role === 'admin' 
    ? events 
    : events.filter(e => e.organizerId === currentUser?.id);

  const filteredEvents = userEvents.filter(e => {
    const isPast = new Date(e.date) < new Date();
    if (filter === 'upcoming') return !isPast;
    if (filter === 'past') return isPast;
    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'טיוטה': return '#64748b';
      case 'מאושר': return '#0369a1';
      case 'בביצוע': return '#7e22ce';
      case 'הושלם': return '#15803d';
      case 'בוטל': return '#b91c1c';
      default: return 'var(--color-text-main)';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch(status) {
      case 'טיוטה': return '#f1f5f9';
      case 'מאושר': return '#e0f2fe';
      case 'בביצוע': return '#f3e8ff';
      case 'הושלם': return '#dcfce7';
      case 'בוטל': return '#fee2e2';
      default: return '#ffffff';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: 'var(--color-blue-dark)' }}>כל האירועים</h1>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <button 
          className={filter === 'all' ? 'btn btn-primary' : 'btn btn-outline'} 
          onClick={() => setFilter('all')}
        >
          הכל
        </button>
        <button 
          className={filter === 'upcoming' ? 'btn btn-primary' : 'btn btn-outline'} 
          onClick={() => setFilter('upcoming')}
        >
          אירועים קרובים
        </button>
        <button 
          className={filter === 'past' ? 'btn btn-primary' : 'btn btn-outline'} 
          onClick={() => setFilter('past')}
        >
          אירועי עבר
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredEvents.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-light)' }}>
            אין אירועים להצגה
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--color-blue-main)', marginBottom: '0.5rem' }}>{event.title}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CalendarIcon size={14} /> 
                    {event.endDate 
                      ? `${format(new Date(event.date), 'dd/MM/yyyy')} - ${format(new Date(event.endDate), 'dd/MM/yyyy')} | ${format(new Date(event.date), 'HH:mm')}`
                      : format(new Date(event.date), 'dd/MM/yyyy HH:mm')}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={14} /> {event.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={14} /> {event.audienceType === 'open' ? 'פתוח לכולם' : 'מוזמנים מראש'}
                  </span>
                  {(() => {
                    const total = event.estimatedHeadcount || 150;
                    const confirmed = Math.min(85, total);
                    const percentage = Math.round((confirmed / total) * 100);
                    return (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 'bold' }}>
                        <div style={{ 
                          width: '24px', height: '24px', borderRadius: '50%', 
                          background: `conic-gradient(var(--color-success) ${percentage}%, #eee 0)`,
                          position: 'relative'
                        }} title={`${percentage}% אישרו`}>
                          <div style={{ position: 'absolute', inset: '4px', background: 'white', borderRadius: '50%' }}></div>
                        </div>
                        אישרו הגעה: {confirmed} / {total}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ 
                  fontSize: '0.85rem', 
                  padding: '0.2rem 0.8rem', 
                  borderRadius: '1rem', 
                  background: getStatusBgColor(event.status),
                  color: getStatusColor(event.status),
                  border: `1px solid ${getStatusColor(event.status)}`,
                  fontWeight: 'bold'
                }}>
                  {event.status}
                </span>
                <button className="btn btn-outline" onClick={() => navigate(`/manage-guests/${event.id}`)}>
                  פרטים
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventsList;
