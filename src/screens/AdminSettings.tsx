import React from 'react';
import { Settings, Shield, Bell } from 'lucide-react';

const AdminSettings: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>הגדרות מערכת (Admin)</h1>
      
      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>
            <Settings size={24} />
            <h2 style={{ margin: 0 }}>סוגי אירועים</h2>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['הרמת כוסית', 'כנס מקצועי', 'האקתון', 'מסיבת חברה', 'יום גיבוש'].map((type, i) => (
              <li key={i} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>{type}</span>
                <button style={{ color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer' }}>הסר</button>
              </li>
            ))}
          </ul>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <input type="text" placeholder="הוסף סוג אירוע..." style={{ flex: 1 }} />
            <button className="btn btn-primary">הוסף</button>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>
            <Shield size={24} />
            <h2 style={{ margin: 0 }}>ניהול הרשאות ומשתמשים</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'right' }}>
                <th style={{ padding: '0.5rem' }}>שם משתמש</th>
                <th style={{ padding: '0.5rem' }}>תפקיד</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>אבישג</td>
                <td style={{ padding: '0.5rem' }}>
                  <select defaultValue="admin">
                    <option value="admin">מנהל (Admin)</option>
                    <option value="organizer">מארגן אירוע</option>
                  </select>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>ישראל ישראלי</td>
                <td style={{ padding: '0.5rem' }}>
                  <select defaultValue="organizer">
                    <option value="admin">מנהל (Admin)</option>
                    <option value="organizer">מארגן אירוע</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>
            <Bell size={24} />
            <h2 style={{ margin: 0 }}>חוקים והתראות</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" defaultChecked />
              שלח התראה אוטומטית למנהל כאשר תקציב אירוע חורג מ-50,000₪
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" defaultChecked />
              אפשר הרשמה אוטומטית לרשימת המתנה כאשר מכסת המוזמנים מלאה
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" defaultChecked />
              דרוש אישור מנהל עבור כל אירוע הכולל קייטרינג פרימיום
            </label>
          </div>
          <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>שמור הגדרות</button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
