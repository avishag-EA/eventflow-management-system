import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Event } from '../store/StoreContext';

const EventWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const { addEvent, currentUser } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    type: 'הדרכת עובדים',
    date: '',
    location: '',
    audience: 'כלל החברה',
    audienceType: 'open',
    attendanceMandatory: false,
    invitedDepartments: [],
    schedule: '',
    resources: {
      tech: false,
      av: false,
      catering: 'none',
      seating: false,
      lecture: false,
      gifts: false
    },
    budget: 0,
    status: 'planning',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked, type, value } = e.target;
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources!,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleSubmit = () => {
    if (currentUser) {
      addEvent({
        ...formData as Omit<Event, 'id'>,
        organizerId: currentUser.id
      });
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>יצירת אירוע חדש</h1>
      
      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: 'var(--color-blue-pale)', zIndex: 0 }}></div>
        {['פרטי בסיס', 'משאבים ותוספות', 'תקציב', 'סיכום'].map((label, idx) => (
          <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: step > idx ? 'var(--color-blue-main)' : 'var(--color-white)',
              border: `2px solid ${step > idx ? 'var(--color-blue-main)' : '#ccc'}`,
              color: step > idx ? 'white' : '#ccc',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {idx + 1}
            </div>
            <span style={{ fontSize: '0.85rem', color: step > idx ? 'var(--color-blue-main)' : 'var(--color-text-light)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>1. פרטי בסיס (חובה)</h2>
            <div className="form-group">
              <label>שם האירוע</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>סוג אירוע</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="הדרכת עובדים">הדרכת עובדים</option>
                  <option value="כנס מקצועי">כנס מקצועי</option>
                  <option value="הרמת כוסית">הרמת כוסית</option>
                  <option value="ישיבת הנהלה">ישיבת הנהלה</option>
                </select>
              </div>
              <div className="form-group">
                <label>תאריך ושעה</label>
                <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>מיקום</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-blue-main)' }}>הזמנת קהל יעד</label>
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', background: '#fff', padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="audienceType" value="open" checked={formData.audienceType === 'open'} onChange={handleChange} />
                    פתוח לכולם
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="audienceType" value="invite-only" checked={formData.audienceType === 'invite-only'} onChange={handleChange} />
                    מוזמנים מראש (לפי מחלקות)
                  </label>
                </div>
                
                {formData.audienceType === 'invite-only' && (
                  <div style={{ background: 'var(--color-bg-main)', padding: '1rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>בחר מחלקות להזמנה מתוך מערכת משאבי אנוש:</label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {['מחלקת כספים', 'מחלקת פיתוח', 'הנהלה', 'משאבי אנוש', 'מכירות'].map(dept => (
                        <label key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>
                          <input type="checkbox" checked={formData.invitedDepartments?.includes(dept)} onChange={(e) => {
                            const newDepts = e.target.checked 
                              ? [...(formData.invitedDepartments || []), dept]
                              : (formData.invitedDepartments || []).filter(d => d !== dept);
                            setFormData({...formData, invitedDepartments: newDepts, audience: newDepts.length > 0 ? newDepts.join(', ') : ''});
                          }} />
                          {dept}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  <input type="checkbox" checked={formData.attendanceMandatory} onChange={(e) => setFormData({...formData, attendanceMandatory: e.target.checked})} />
                  הגעה חובה לאירוע זה (Mandatory)
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>לו"ז מתוכנן</label>
              <textarea name="schedule" rows={4} value={formData.schedule} onChange={handleChange}></textarea>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>2. משאבים ותוספות</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>קייטרינג</label>
              <select name="catering" value={formData.resources?.catering} onChange={handleResourceChange as any} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="none">ללא קייטרינג</option>
                <option value="basic">בסיסי (כיבוד קל ושתייה)</option>
                <option value="premium">פרמיום (ארוחה מלאה)</option>
                <option value="special">מנות מיוחדות (טבעוני, ללא גלוטן)</option>
              </select>
            </div>

            <div className="grid-2">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="tech" checked={formData.resources?.tech} onChange={handleResourceChange} />
                ציוד טכנולוגי (מסכים, מחשבים)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="av" checked={formData.resources?.av} onChange={handleResourceChange} />
                הגברה ותאורה
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="seating" checked={formData.resources?.seating} onChange={handleResourceChange} />
                מקומות ישיבה / כיסאות
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="lecture" checked={formData.resources?.lecture} onChange={handleResourceChange} />
                הרצאה / מרצה אורח
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" name="gifts" checked={formData.resources?.gifts} onChange={handleResourceChange} />
                מתנות לעובדים
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>3. תקציב וספקים</h2>
            <div className="form-group">
              <label>תקציב משוער (₪)</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} />
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: 'var(--border-radius-sm)' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>התקשרות עם ספקים (תצוגה בלבד)</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                מערכת זו אינה מנהלת חתימת חוזים. אנא ודא שהסכמי התקשרות נחתמו מול מחלקת רכש.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>4. סיכום ויצירה</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--color-bg-main)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
              <div><strong>שם האירוע:</strong> {formData.title}</div>
              <div><strong>סוג:</strong> {formData.type}</div>
              <div><strong>תאריך:</strong> {formData.date}</div>
              <div><strong>מיקום:</strong> {formData.location}</div>
              <div><strong>תקציב משוער:</strong> ₪{formData.budget}</div>
              <div><strong>קייטרינג:</strong> {formData.resources?.catering !== 'none' ? 'יש' : 'אין'}</div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input type="checkbox" required />
                אני מאשר שהפרטים נכונים ושביצעתי את כל התיאומים הנדרשים.
              </label>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1}
          >
            חזור
          </button>
          
          {step < 4 ? (
            <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
              המשך
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit}>
              סיום ושמירת אירוע
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventWizard;
