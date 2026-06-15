import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';

const ManageGuests: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useStore();
  const event = events.find(e => e.id === eventId);

  if (!event) return <div>אירוע לא נמצא</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-outline" onClick={() => navigate('/')}>חזור</button>
        <h1 style={{ color: 'var(--color-blue-dark)', margin: 0 }}>ניהול מוזמנים: {event.title}</h1>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '4px solid var(--color-blue-main)' }}>
          <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: '50%', color: 'var(--color-blue-main)' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>150</div>
            <div style={{ color: 'var(--color-text-light)' }}>סה"כ הוזמנו</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '4px solid var(--color-success)' }}>
          <div style={{ padding: '1rem', background: '#d1fae5', borderRadius: '50%', color: 'var(--color-success)' }}>
            <CheckCircle size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>85</div>
            <div style={{ color: 'var(--color-text-light)' }}>אישרו הגעה (RSVP)</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '4px solid var(--color-warning)' }}>
          <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '50%', color: 'var(--color-warning)' }}>
            <Clock size={32} />
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>12</div>
            <div style={{ color: 'var(--color-text-light)' }}>ברשימת המתנה</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: 'var(--color-blue-dark)' }}>רשימת מוזמנים (Mock)</h2>
          <input type="text" placeholder="חיפוש עובד..." style={{ padding: '0.5rem', width: '250px' }} />
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'right', background: 'var(--color-bg-main)' }}>
              <th style={{ padding: '0.75rem' }}>שם העובד</th>
              <th style={{ padding: '0.75rem' }}>מחלקה</th>
              <th style={{ padding: '0.75rem' }}>סטטוס הגעה</th>
              <th style={{ padding: '0.75rem' }}>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'דנה כהן', dept: 'מחלקת פיתוח', status: 'אישרה הגעה', color: 'var(--color-success)' },
              { name: 'יוסי לוי', dept: 'מחלקת כספים', status: 'לא יגיע', color: 'var(--color-danger)' },
              { name: 'מיכל ישראלי', dept: 'הנהלה', status: 'רשימת המתנה', color: 'var(--color-warning)' },
              { name: 'אורן ברק', dept: 'מכירות', status: 'טרם השיב', color: 'var(--color-text-light)' },
            ].map((guest, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>{guest.name}</td>
                <td style={{ padding: '0.75rem' }}>{guest.dept}</td>
                <td style={{ padding: '0.75rem', color: guest.color, fontWeight: 'bold' }}>{guest.status}</td>
                <td style={{ padding: '0.75rem' }}>
                  <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>שליחת תזכורת</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageGuests;
