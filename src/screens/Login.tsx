import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { Lock, User as UserIcon } from 'lucide-react';

const Login: React.FC = () => {
  const { setCurrentUser } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setCurrentUser({ id: '1', name: 'אבישג', role: 'admin', jobTitle: 'מנהלת מערכת', profilePicture: '' });
    } else if (username === 'user' && password === 'user123') {
      setCurrentUser({ id: '2', name: 'עובד חברה', role: 'organizer', jobTitle: 'מפיק אירועים', profilePicture: '' });
    } else {
      setError('שם משתמש או סיסמא שגויים');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-blue-pale)' }}>
      <div className="card" style={{ width: '400px' }}>
        <h1 style={{ color: 'var(--color-blue-dark)', marginBottom: '2rem', textAlign: 'center' }}>התחברות למערכת</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserIcon size={16}/> שם משתמש</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="admin / user"
              required 
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Lock size={16}/> סיסמא</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="admin123 / user123"
              required 
            />
          </div>
          {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '1rem' }}>
            התחבר
          </button>
        </form>
        
        <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '1rem' }}>או התחברות מהירה (לצורכי בדיקה):</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              className="btn btn-outline" 
              style={{ width: '100%' }}
              onClick={() => setCurrentUser({ id: '1', name: 'אבישג', role: 'admin', jobTitle: 'מנהלת מערכת', profilePicture: '' })}
            >
              כניסה מהירה כמנהל מערכת
            </button>
            <button 
              className="btn btn-outline" 
              style={{ width: '100%' }}
              onClick={() => setCurrentUser({ id: '2', name: 'עובד חברה', role: 'organizer', jobTitle: 'מפיק אירועים', profilePicture: '' })}
            >
              כניסה מהירה כמארגן אירוע
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
