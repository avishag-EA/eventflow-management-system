import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Event } from '../store/StoreContext';

const locationOptions = ['אולם כנסים מרכזי', 'חדר ישיבות הנהלה', 'מתנ"ס קהילתי', 'פארק עירוני', 'אחר'];

const EventWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showConfirmError, setShowConfirmError] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  
  const [locationSelect, setLocationSelect] = useState(locationOptions[0]);
  const [customLocation, setCustomLocation] = useState('');
  const { addEvent, currentUser, eventTypes } = useStore();
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
    estimatedHeadcount: 0,
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
    status: 'טיוטה',
  });

  const isMultiCatering = formData.type === 'טיול' || locationSelect === 'אחר';

  useEffect(() => {
    if (!isMultiCatering) {
      if (formData.resources?.catering.includes('sandwiches') || formData.resources?.catering.includes('bbq')) {
        setFormData(prev => ({
          ...prev,
          resources: { ...prev.resources!, catering: 'none' }
        }));
      }
    }
  }, [isMultiCatering, formData.resources?.catering]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateVal = e.target.value;
    const timePart = formData.date?.includes('T') ? formData.date.split('T')[1] : '12:00';
    setFormData({ ...formData, date: `${newDateVal}T${timePart}` });
    
    if (isMultiDay && formData.endDate && formData.endDate < newDateVal) {
      setEndDateError(true);
    } else {
      setEndDateError(false);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setFormData({ ...formData, endDate: newEndDate });
    
    if (formData.date && newEndDate) {
      const startDate = formData.date.split('T')[0];
      setEndDateError(newEndDate < startDate);
    } else {
      setEndDateError(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeVal = e.target.value;
    const datePart = formData.date?.includes('T') ? formData.date.split('T')[0] : new Date().toISOString().split('T')[0];
    setFormData({ ...formData, date: `${datePart}T${newTimeVal}` });
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const type = e.target.type;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources!,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleTripCateringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentCatering = formData.resources?.catering || '';
    const selected = currentCatering === 'none' ? [] : currentCatering.split(',').filter(Boolean);
    
    let newSelected;
    if (e.target.checked) {
      newSelected = [...selected, value];
    } else {
      newSelected = selected.filter(v => v !== value);
    }
    
    setFormData(prev => ({
      ...prev,
      resources: {
        ...prev.resources!,
        catering: newSelected.length > 0 ? newSelected.join(',') : 'none'
      }
    }));
  };

  const handleSubmit = () => {
    if (isMultiDay && endDateError) {
      alert("תאריך הסיום אינו יכול להיות מוקדם מתאריך ההתחלה");
      return;
    }
    
    if (currentUser) {
      const finalLocation = locationSelect === 'אחר' ? customLocation : locationSelect;
      addEvent({
        ...formData as Omit<Event, 'id'>,
        location: finalLocation,
        endDate: isMultiDay ? formData.endDate : undefined,
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
        {['יסודות האירוע', 'הקהל והמוזמנים', 'לוגיסטיקה ותוכן', 'תקציב וסיכום'].map((label, idx) => (
          <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: step > idx ? 'var(--color-action-main)' : 'var(--color-white)',
              border: `2px solid ${step > idx ? 'var(--color-action-main)' : '#ccc'}`,
              color: step > idx ? 'white' : '#ccc',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
            }}>
              {idx + 1}
            </div>
            <span style={{ fontSize: '0.85rem', color: step > idx ? 'var(--color-blue-dark)' : 'var(--color-text-light)', fontWeight: step > idx ? 'bold' : 'normal' }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>1. יסודות האירוע</h2>
            <div className="form-group">
              <label>שם האירוע</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>סוג אירוע</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column' }}>
                <label>תאריך התחלה</label>
                <input type="date" value={formData.date?.split('T')[0] || ''} onChange={handleDateChange} required />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={isMultiDay} onChange={(e) => setIsMultiDay(e.target.checked)} />
                  אירוע רב-יומי
                </label>
              </div>
              <div className="form-group">
                <label>שעת האירוע</label>
                <input 
                  type="time" 
                  value={formData.date?.split('T')[1]?.substring(0,5) || ''} 
                  onChange={handleTimeChange} 
                  required 
                  dir="ltr"
                  style={{ textAlign: 'right' }}
                />
              </div>
            </div>
            {isMultiDay && (
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>תאריך סיום</label>
                <input 
                  type="date" 
                  value={formData.endDate || ''} 
                  onChange={handleEndDateChange} 
                  required 
                  style={{ borderColor: endDateError ? 'var(--color-danger)' : '' }}
                />
                {endDateError && <div style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>תאריך הסיום אינו יכול להיות מוקדם מתאריך ההתחלה</div>}
              </div>
            )}
            <div className="form-group">
              <label>מיקום</label>
              <select value={locationSelect} onChange={e => setLocationSelect(e.target.value)} required>
                {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            {locationSelect === 'אחר' && (
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label>הזן מיקום ספציפי</label>
                <input type="text" value={customLocation} onChange={e => setCustomLocation(e.target.value)} required placeholder="הזן מיקום..." />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>2. הקהל והמוזמנים</h2>
            
            <div className="form-group">
              <label style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-blue-main)' }}>הגדרת קהל יעד</label>
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
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>כמות משתתפים משוערת</label>
                <input type="number" name="estimatedHeadcount" value={formData.estimatedHeadcount || ''} onChange={handleChange} placeholder="לדוגמה: 50" />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input type="checkbox" checked={formData.attendanceMandatory} onChange={(e) => setFormData({...formData, attendanceMandatory: e.target.checked})} />
                הגעה חובה לאירוע זה (Mandatory)
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>3. לוגיסטיקה ותוכן</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>ספקים - קייטרינג</label>
              {isMultiCatering ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      value="sandwiches"
                      checked={(formData.resources?.catering || '').includes('sandwiches')}
                      onChange={handleTripCateringChange}
                    />
                    סנדוויצ'ים וארוחות ארוזות
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      value="bbq"
                      checked={(formData.resources?.catering || '').includes('bbq')}
                      onChange={handleTripCateringChange}
                    />
                    על האש / מנגל - בשרים וציוד
                  </label>
                </div>
              ) : (
                <select name="catering" value={formData.resources?.catering} onChange={handleResourceChange as any} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="none">ללא קייטרינג</option>
                  <option value="basic">בסיסי (כיבוד קל ושתייה)</option>
                  <option value="premium">פרמיום (ארוחה מלאה)</option>
                  <option value="special">מנות מיוחדות (טבעוני, צמחוני, ללא גלוטן)</option>
                </select>
              )}
            </div>

            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>תוספי לוגיסטיקה (סימון V)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="tech" checked={formData.resources?.tech} onChange={handleResourceChange} />
                    ציוד טכנולוגי (מסכים, חדרי ישיבות)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="av" checked={formData.resources?.av} onChange={handleResourceChange} />
                    חברת הגברה ותאורה
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="seating" checked={formData.resources?.seating} onChange={handleResourceChange} />
                    מקומות ישיבה מותאמים
                  </label>
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>תוכן מיוחד</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="lecture" checked={formData.resources?.lecture} onChange={handleResourceChange} />
                    הופעת אורח / הרצאה
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="gifts" checked={formData.resources?.gifts} onChange={handleResourceChange} />
                    מתנות למשתתפים
                  </label>
                </div>
              </div>
            </div>
            
            {(formData.type === 'טיול' || formData.type === 'אירוע רווחה/גיבוש') && (
              <div style={{ marginBottom: '1.5rem', background: 'var(--color-bg-main)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-blue-dark)' }}>
                  ציוד וצוות מיוחד (Logistics & Additional Details)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="transportation" checked={formData.resources?.transportation || false} onChange={handleResourceChange} />
                    הסעות / אוטובוסים
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="firstAid" checked={formData.resources?.firstAid || false} onChange={handleResourceChange} />
                    ערכת עזרה ראשונה
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="security" checked={formData.resources?.security || false} onChange={handleResourceChange} />
                    אבטחה / מאבטחים
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" name="guide" checked={formData.resources?.guide || false} onChange={handleResourceChange} />
                    מלווה / מדריך
                  </label>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>לו"ז אירוע (סדר יום)</label>
              <textarea name="schedule" rows={4} value={formData.schedule} onChange={handleChange} placeholder="למשל: 09:00 התכנסות, 10:00 הרצאה..."></textarea>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-blue-main)' }}>4. תקציב וסיכום</h2>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>תקציב כולל מתוכנן (Total Planned Budget) - ₪</label>
              <input type="number" name="budget" value={formData.budget} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>הערות כלליות / הנחיות מיוחדות (General Notes)</label>
              <textarea name="notes" rows={4} value={formData.notes || ''} onChange={handleChange} placeholder="הכנס הערות נוספות, בקשות חריגות או הנחיות מיוחדות כאן..."></textarea>
            </div>
            
            <div style={{ padding: '1rem', background: 'var(--color-blue-pale)', borderRadius: 'var(--border-radius-sm)', marginBottom: '1.5rem' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>תנאי התקשרות מול ספקים (תצוגה בלבד)</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                מערכת זו אינה מנהלת חתימת חוזים. כל ספק כפוף לתנאי הביטול ושעות העבודה שסוכמו מול מחלקת רכש.
              </p>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--color-blue-dark)' }}>סיכום פרטי האירוע</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--color-bg-main)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
              <div><strong>שם האירוע:</strong> {formData.title}</div>
              <div><strong>סוג:</strong> {formData.type}</div>
              <div><strong>תאריך:</strong> {formData.date}</div>
              <div><strong>מיקום:</strong> {formData.location}</div>
              <div><strong>משתתפים (משוער):</strong> {formData.estimatedHeadcount}</div>
              <div><strong>קייטרינג:</strong> {formData.resources?.catering !== 'none' ? 'יש' : 'אין'}</div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input 
                  type="checkbox" 
                  checked={isConfirmed}
                  onChange={(e) => { setIsConfirmed(e.target.checked); setShowConfirmError(false); }}
                  required 
                />
                אני מאשר שהפרטים נכונים ושביצעתי את כל התיאומים הנדרשים.
              </label>
              {showConfirmError && (
                <div style={{ color: 'var(--color-danger)', marginTop: '0.5rem', fontWeight: 'bold' }}>
                  יש לאשר את הפרטים כדי להמשיך
                </div>
              )}
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
            <button 
              className="btn btn-primary" 
              style={{ 
                opacity: isConfirmed ? 1 : 0.5, 
                cursor: isConfirmed ? 'pointer' : 'not-allowed' 
              }}
              onClick={(e) => {
                if (!isConfirmed) {
                  e.preventDefault();
                  setShowConfirmError(true);
                  return;
                }
                handleSubmit();
              }}
            >
              סיום ושמירת אירוע
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventWizard;
