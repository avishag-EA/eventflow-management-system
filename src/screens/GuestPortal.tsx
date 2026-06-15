import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { Calendar, MapPin, CheckCircle, XCircle } from 'lucide-react';

const GuestPortal: React.FC = () => {
  const { eventId } = useParams();
  const { events } = useStore();
  const event = events.find(e => e.id === eventId) || events[0]; // fallback for demo
  
  const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'attending' | 'not_attending' | 'waitlist'>('pending');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const maxCapacity = 100;
  const currentRsvps = 98; // Mock value

  const handleRsvp = (status: 'attending' | 'not_attending') => {
    if (status === 'attending' && currentRsvps >= maxCapacity) {
      setRsvpStatus('waitlist');
    } else {
      setRsvpStatus(status);
    }
  };

  if (!event) return <div>אירוע לא נמצא</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="card" style={{ textAlign: 'center', borderTop: '4px solid var(--color-blue-main)' }}>
        <h1 style={{ color: 'var(--color-blue-dark)', marginBottom: '0.5rem' }}>{event.title}</h1>
        <p style={{ color: 'var(--color-text-light)', marginBottom: '2rem' }}>את/ה מוזמן/ת לאירוע חברה!</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--color-bg-main)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem', textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--color-blue-main)" />
            <span><strong>תאריך ושעה:</strong> {new Date(event.date).toLocaleString('he-IL')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} color="var(--color-blue-main)" />
            <span><strong>מיקום:</strong> {event.location}</span>
          </div>
        </div>

        {rsvpStatus === 'pending' && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>האם תגיע/י?</h3>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => handleRsvp('attending')}>
                <CheckCircle size={18} />
                כן, אגיע בשמחה
              </button>
              <button className="btn btn-outline" style={{ color: 'var(--color-text-light)', borderColor: 'var(--color-text-light)' }} onClick={() => handleRsvp('not_attending')}>
                <XCircle size={18} />
                לצערי לא אוכל להגיע
              </button>
            </div>
            {currentRsvps >= maxCapacity && (
              <p style={{ marginTop: '1rem', color: 'var(--color-warning)', fontSize: '0.9rem' }}>
                שימו לב: מכסת המקומות מלאה. נרשמים חדשים יכנסו לרשימת המתנה.
              </p>
            )}
          </div>
        )}

        {rsvpStatus === 'attending' && (
          <div style={{ color: 'var(--color-success)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem' }} />
            <h3>אישור הגעה התקבל! מחכים לראותך.</h3>
          </div>
        )}

        {rsvpStatus === 'waitlist' && (
          <div style={{ color: 'var(--color-warning)' }}>
            <div style={{ fontSize: '3rem', margin: '0 auto 1rem' }}>⏳</div>
            <h3>נכנסת לרשימת ההמתנה.</h3>
            <p style={{ color: 'var(--color-text-main)' }}>נודיע לך ברגע שיתפנה מקום.</p>
          </div>
        )}

        {rsvpStatus === 'not_attending' && (
          <div style={{ color: 'var(--color-text-light)' }}>
            <h3>חבל, נתראה באירוע הבא!</h3>
          </div>
        )}
      </div>

      {/* Demo of Feedback Form after event */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>משוב סיום אירוע (הדגמה)</h3>
        {feedbackSubmitted ? (
          <div style={{ color: 'var(--color-success)', textAlign: 'center', padding: '1rem' }}>תודה רבה על המשוב!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>איך היית מדרג/ת את האירוע? (1-5)</label>
              <select style={{ width: '100%', padding: '0.5rem' }}>
                <option value="5">5 - מצוין</option>
                <option value="4">4 - טוב מאוד</option>
                <option value="3">3 - סביר</option>
                <option value="2">2 - טעון שיפור</option>
                <option value="1">1 - גרוע</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>הערות לשיפור?</label>
              <textarea rows={3} style={{ width: '100%' }}></textarea>
            </div>
            <button className="btn btn-primary" onClick={() => setFeedbackSubmitted(true)}>שלח משוב</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestPortal;
