import React, { useState } from 'react';
import { useStore } from '../store/StoreContext';
import { UserCircle } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { currentUser, updateUser } = useStore();
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    jobTitle: currentUser?.jobTitle || '',
    profilePicture: currentUser?.profilePicture || '',
  });
  
  const [success, setSuccess] = useState(false);

  if (!currentUser) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>פרופיל אישי</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ position: 'relative' }}>
              {formData.profilePicture ? (
                <img 
                  src={formData.profilePicture} 
                  alt="Profile" 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-blue-pale)' }} 
                />
              ) : (
                <UserCircle size={100} color="var(--color-blue-main)" />
              )}
            </div>
            
            <div className="form-group" style={{ width: '100%', marginBottom: 0 }}>
              <label>העלאת תמונת פרופיל</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const imageUrl = URL.createObjectURL(file);
                    setFormData({ ...formData, profilePicture: imageUrl });
                    setSuccess(false);
                  }
                }}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  width: '100%',
                  background: 'white'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label>שם מלא מוצג</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>תפקיד בחברה</label>
            <input 
              type="text" 
              name="jobTitle" 
              value={formData.jobTitle} 
              onChange={handleChange} 
              placeholder="למשל: מנהל שיווק, מפתחת תוכנה" 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            שמור שינויים
          </button>
          
          {success && (
            <div style={{ color: 'var(--color-success)', fontWeight: 600 }}>
              הפרופיל עודכן בהצלחה!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
