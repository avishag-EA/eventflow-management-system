import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore, Event, ExpenseCategory } from '../store/StoreContext';
import { format } from 'date-fns';
import { CheckCircle, MapPin, Coffee, ArrowRight, Settings, Users, Gift, Mic, Tv, Edit2, Save, X, DollarSign, PlusCircle, Activity, AlertCircle, ChevronDown, Trash2 } from 'lucide-react';

const locationOptions = ['אולם כנסים מרכזי', 'חדר ישיבות הנהלה', 'מתנ"ס קהילתי', 'פארק עירוני', 'אחר'];

const ManageGuests: React.FC = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, currentUser, updateEvent, deleteEvent, categorySoftCaps, eventTypes, vendors, addPendingVendor } = useStore();
  const event = events.find(e => e.id === eventId);

  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<Partial<Event>>({});
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [locationSelect, setLocationSelect] = useState('');
  const [customLocation, setCustomLocation] = useState('');

  const [isMultiDay, setIsMultiDay] = useState(false);
  const [endDateError, setEndDateError] = useState(false);
  const [requestVendorAddition, setRequestVendorAddition] = useState(false);

  const [newExpense, setNewExpense] = useState({ vendor: '', description: '', amount: '', category: 'אחר' as ExpenseCategory, requirements: '' });

  // Handle click outside for status dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!event) return <div style={{ padding: '2rem' }}>אירוע לא נמצא</div>;

  const totalInvited = event.estimatedHeadcount || 150;
  const confirmed = 85;
  const waitlist = 12;
  const percentage = Math.round((confirmed / totalInvited) * 100);

  const canEdit = currentUser?.id === event.organizerId || currentUser?.role === 'admin';

  const handleEditClick = () => {
    const initialLocationIsCustom = !locationOptions.includes(event.location);
    setLocationSelect(initialLocationIsCustom ? 'אחר' : event.location);
    setCustomLocation(initialLocationIsCustom ? event.location : '');
    setIsMultiDay(!!event.endDate);
    setEndDateError(false);

    setEditedEvent({
      location: event.location,
      budget: event.budget,
      resources: { ...event.resources },
      notes: event.notes,
      date: event.date,
      endDate: event.endDate,
      title: event.title,
      type: event.type
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEvent({});
  };

  const handleSave = () => {
    if (eventId) {
      if (isMultiDay && endDateError) {
        alert("תאריך הסיום אינו יכול להיות מוקדם מתאריך ההתחלה");
        return;
      }
      
      const finalEvent = { ...editedEvent };
      if (!isMultiDay) {
        finalEvent.endDate = undefined;
      }
      
      const isCustomVendor = finalEvent.resources?.vendorId === 'other';
      const finalCustomVendorName = isCustomVendor ? finalEvent.resources?.customVendorName || '' : undefined;

      if (isCustomVendor && requestVendorAddition && finalCustomVendorName && currentUser) {
        addPendingVendor({
          name: finalCustomVendorName,
          service: finalEvent.resources?.catering || 'כללי',
          submittedBy: currentUser.name
        });
      }

      finalEvent.resources = {
        ...finalEvent.resources!,
        customVendorName: finalCustomVendorName
      };

      updateEvent(eventId, finalEvent);
      setIsEditing(false);
      navigate(`/manage-guests/${eventId}`, { replace: true });
    } else {
      navigate('/');
    }
  };

  const handleDelete = () => {
    if (eventId && window.confirm("האם אתה בטוח שברצונך למחוק אירוע זה לצמיתות? (Are you sure you want to permanently delete this event?)")) {
      deleteEvent(eventId);
      navigate('/', { replace: true });
    }
  };

  const handleRequestDeletion = () => {
    if (eventId && window.confirm("האם אתה בטוח שברצונך לבקש מחיקה של אירוע זה? (Are you sure you want to request deletion?)")) {
      updateEvent(eventId, { status: 'ממתין לאישור מחיקה' });
      navigate('/', { replace: true });
    }
  };

  const updateResource = (key: keyof Event['resources'], value: boolean | string) => {
    setEditedEvent(prev => ({
      ...prev,
      resources: {
        ...(prev.resources || event.resources),
        [key]: value
      }
    }));
  };

  const handleTripCateringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentCatering = (editedEvent.resources || event.resources).catering || '';
    const selected = currentCatering === 'none' ? [] : currentCatering.split(',').filter(Boolean);
    
    let newSelected;
    if (e.target.checked) {
      newSelected = [...selected, value];
    } else {
      newSelected = selected.filter(v => v !== value);
    }
    
    updateResource('catering', newSelected.length > 0 ? newSelected.join(',') : 'none');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateVal = e.target.value;
    const timePart = editedEvent.date?.includes('T') ? editedEvent.date.split('T')[1] : '12:00';
    setEditedEvent({ ...editedEvent, date: `${newDateVal}T${timePart}` });
    
    if (isMultiDay && editedEvent.endDate && editedEvent.endDate < newDateVal) {
      setEndDateError(true);
    } else {
      setEndDateError(false);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = e.target.value;
    setEditedEvent({ ...editedEvent, endDate: newEndDate });
    
    if (editedEvent.date && newEndDate) {
      const startDate = editedEvent.date.split('T')[0];
      setEndDateError(newEndDate < startDate);
    } else {
      setEndDateError(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTimeVal = e.target.value;
    const datePart = editedEvent.date?.includes('T') ? editedEvent.date.split('T')[0] : new Date().toISOString().split('T')[0];
    setEditedEvent({ ...editedEvent, date: `${datePart}T${newTimeVal}` });
  };

  const handleAddExpense = () => {
    if (!newExpense.vendor || !newExpense.description || !newExpense.amount) return;
    
    const expense = {
      id: Math.random().toString(36).substr(2, 9),
      vendor: newExpense.vendor,
      description: newExpense.description,
      amount: Number(newExpense.amount),
      category: newExpense.category,
      requirements: newExpense.requirements
    };

    const currentExpenses = event.expenses || [];
    updateEvent(event.id, { expenses: [...currentExpenses, expense] });
    setNewExpense({ vendor: '', description: '', amount: '', category: 'אחר', requirements: '' });
  };

  const handleStatusSelect = (newStatus: string) => {
    if (eventId && canEdit) {
      if (newStatus === 'בוטל') {
        if (window.confirm('האם אתה בטוח שברצונך לבטל אירוע זה? (Are you sure you want to cancel this event?)')) {
          updateEvent(eventId, { status: newStatus as any });
        }
      } else {
        updateEvent(eventId, { status: newStatus as any });
      }
    }
    setIsStatusDropdownOpen(false);
  };

  const currentResources = isEditing ? (editedEvent.resources || event.resources) : event.resources;
  const currentLocation = isEditing ? (editedEvent.location !== undefined ? editedEvent.location : event.location) : event.location;
  const currentBudget = isEditing ? (editedEvent.budget !== undefined ? editedEvent.budget : event.budget) : event.budget;
  const currentNotes = isEditing ? (editedEvent.notes !== undefined ? editedEvent.notes : event.notes) : event.notes;
  const currentDate = isEditing ? (editedEvent.date !== undefined ? editedEvent.date : event.date) : event.date;
  const currentEndDate = isEditing ? (editedEvent.endDate !== undefined ? editedEvent.endDate : event.endDate) : event.endDate;
  const currentTitle = isEditing ? (editedEvent.title !== undefined ? editedEvent.title : event.title) : event.title;
  const currentType = isEditing ? (editedEvent.type !== undefined ? editedEvent.type : event.type) : event.type;

  const isMultiCatering = currentType === 'טיול' || locationSelect === 'אחר';

  useEffect(() => {
    if (!isMultiCatering && isEditing) {
      if (currentResources.catering.includes('sandwiches') || currentResources.catering.includes('bbq')) {
        setEditedEvent(prev => ({
          ...prev,
          resources: { ...currentResources, catering: 'none' }
        }));
      }
    }
  }, [isMultiCatering, isEditing, currentResources.catering]);

  const cateringLabel = currentResources.catering === 'none' ? 'ללא קייטרינג' 
    : currentResources.catering === 'basic' ? 'קייטרינג בסיסי'
    : currentResources.catering === 'premium' ? 'קייטרינג פרמיום'
    : currentResources.catering === 'special' ? 'מנות מיוחדות'
    : 'קייטרינג בהתאמה אישית (טיול/חוץ)';

  let vendorDisplay = '';
  if (event.resources.vendorId) {
    if (event.resources.vendorId === 'other') {
      vendorDisplay = event.resources.customVendorName || 'ספק אחר';
    } else {
      const v = vendors.find(ven => ven.id === event.resources.vendorId);
      vendorDisplay = v ? v.name : '';
    }
  }

  const expensesList = event.expenses || [];
  const totalSpent = expensesList.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBudget = currentBudget - totalSpent;
  const isOverBudget = remainingBudget < 0;

  // Check Soft Caps
  const expensesByCategory = expensesList.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const exceededCategories = (Object.keys(expensesByCategory) as ExpenseCategory[]).filter(
    cat => expensesByCategory[cat] > categorySoftCaps[cat]
  );

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'טיוטה': return { bg: '#E0E0E0', text: '#424242' }; // Grey
      case 'מאושר': return { bg: '#B3E5FC', text: '#01579B' }; // Light Blue
      case 'בביצוע': return { bg: '#E1BEE7', text: '#4A148C' }; // Soft Lilac
      case 'הושלם': return { bg: '#C8E6C9', text: '#1B5E20' }; // Light Green
      case 'בוטל': return { bg: '#FFCDD2', text: '#B71C1C' }; // Soft Red
      case 'ממתין לאישור מחיקה': return { bg: '#FFE0B2', text: '#E65100' }; // Warning Orange
      default: return { bg: '#E0E0E0', text: '#424242' };
    }
  };

  const statusOptions = ['טיוטה', 'מאושר', 'בביצוע', 'הושלם', 'בוטל'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Banner */}
      <div style={{ 
        background: 'var(--color-blue-pale)', 
        borderRadius: 'var(--border-radius-md)', 
        padding: '3rem 2rem', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate(-1)} 
            style={{ borderColor: 'var(--color-blue-main)', color: 'var(--color-blue-main)' }}
          >
            <ArrowRight size={16} /> חזור
          </button>
        </div>

        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', display: 'flex', gap: '0.5rem' }}>
          {currentUser?.role === 'admin' && !isEditing && (
            <button className="btn btn-outline" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={handleDelete}>
              <Trash2 size={16} style={{ marginLeft: '0.5rem' }} /> מחיקת אירוע
            </button>
          )}
          {currentUser?.role !== 'admin' && canEdit && !isEditing && event.status !== 'ממתין לאישור מחיקה' && (
            <button className="btn btn-outline" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }} onClick={handleRequestDeletion}>
              <Trash2 size={16} style={{ marginLeft: '0.5rem' }} /> בקש מחיקת אירוע
            </button>
          )}
          {canEdit && !isEditing && (
            <button className="btn" style={{ background: 'var(--color-action-main)', color: 'white' }} onClick={handleEditClick}>
              <Edit2 size={16} style={{ marginLeft: '0.5rem' }} /> עריכת פרטי אירוע
            </button>
          )}
          {isEditing && (
            <>
              <button className="btn" style={{ background: 'var(--color-action-main)', color: 'white' }} onClick={handleSave}>
                <Save size={16} style={{ marginLeft: '0.5rem' }} /> שמור שינויים
              </button>
              <button className="btn" style={{ background: '#e2e8f0', color: '#475569' }} onClick={handleCancel}>
                <X size={16} style={{ marginLeft: '0.5rem' }} /> ביטול
              </button>
            </>
          )}
        </div>
        
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              value={currentTitle} 
              onChange={e => setEditedEvent({...editedEvent, title: e.target.value})} 
              style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-blue-main)', color: 'var(--color-blue-dark)' }}
            />
            <select 
              value={currentType} 
              onChange={e => setEditedEvent({...editedEvent, type: e.target.value})}
              style={{ fontSize: '1rem', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--color-blue-main)', textAlign: 'center' }}
            >
              {eventTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <h1 style={{ color: 'var(--color-blue-dark)', fontSize: '2.5rem', margin: 0, marginBottom: '0.2rem' }}>{event.title}</h1>
            <div style={{ color: 'var(--color-text-main)', fontSize: '1.2rem', marginBottom: '0.8rem', opacity: 0.8 }}>{event.type}</div>
          </>
        )}
        
        {/* Elegant Status Badge */}
        <div style={{ position: 'relative', marginBottom: '1rem' }} ref={dropdownRef}>
          <div 
            onClick={() => canEdit && setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            style={{
              background: getStatusStyle(event.status).bg,
              color: getStatusStyle(event.status).text,
              padding: '0.4rem 1rem',
              borderRadius: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: canEdit ? 'pointer' : 'default',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'all 0.2s ease',
              userSelect: 'none'
            }}
          >
            <Activity size={16} />
            {event.status}
            {canEdit && <ChevronDown size={14} style={{ opacity: 0.7 }} />}
          </div>

          {/* Custom Dropdown Menu */}
          {isStatusDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '0.5rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid #eee',
              padding: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              minWidth: '160px',
              zIndex: 20
            }}>
              {statusOptions.map(option => (
                <div 
                  key={option}
                  onClick={() => handleStatusSelect(option)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    background: event.status === option ? getStatusStyle(option).bg : 'transparent',
                    color: event.status === option ? getStatusStyle(option).text : 'var(--color-text-main)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (event.status !== option) {
                      e.currentTarget.style.background = '#f8fafc';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (event.status !== option) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ fontSize: '1.25rem', color: 'var(--color-text-light)' }}>
          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <input 
                  type="date" 
                  value={currentDate?.split('T')[0] || ''}
                  onChange={handleDateChange}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)', fontSize: '1rem', fontFamily: 'inherit' }}
                />
                <input 
                  type="time" 
                  value={currentDate?.split('T')[1]?.substring(0,5) || ''}
                  onChange={handleTimeChange}
                  dir="ltr"
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)', fontSize: '1rem', fontFamily: 'inherit', textAlign: 'right' }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={isMultiDay} onChange={(e) => setIsMultiDay(e.target.checked)} />
                אירוע רב-יומי
              </label>
              {isMultiDay && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <input 
                    type="date" 
                    value={currentEndDate || ''}
                    onChange={handleEndDateChange}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: endDateError ? '1px solid var(--color-danger)' : '1px solid var(--color-blue-main)', fontSize: '1rem', fontFamily: 'inherit' }}
                  />
                  {endDateError && <span style={{ color: 'var(--color-danger)', fontSize: '0.85rem', marginTop: '0.25rem' }}>הסיום לא יכול להיות מוקדם מההתחלה</span>}
                </div>
              )}
            </div>
          ) : (
            currentEndDate 
              ? `${format(new Date(event.date), 'dd/MM/yyyy')} - ${format(new Date(currentEndDate), 'dd/MM/yyyy')} | ${format(new Date(event.date), 'HH:mm')}`
              : format(new Date(event.date), 'dd/MM/yyyy | HH:mm')
          )}
        </div>
      </div>

      {/* Main Info Row (Side-by-Side Cards) */}
      <div className="grid-3" style={{ position: 'relative', zIndex: 1 }}>
        {/* Card A: Location */}
        <div className="card" style={{ padding: '2rem', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--color-blue-pale)' }}>
          <div style={{ background: 'var(--color-blue-pale)', color: 'var(--color-blue-main)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <MapPin size={32} />
          </div>
          <h3 style={{ margin: 0, color: 'var(--color-blue-dark)' }}>מיקום האירוע</h3>
          {isEditing ? (
            <div style={{ width: '100%' }}>
              <select 
                value={locationSelect}
                onChange={e => {
                  setLocationSelect(e.target.value);
                  setEditedEvent({ ...editedEvent, location: e.target.value === 'אחר' ? customLocation : e.target.value });
                }}
                style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)', width: '100%', textAlign: 'center' }}
              >
                {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {locationSelect === 'אחר' && (
                <input 
                  type="text" 
                  value={customLocation}
                  onChange={e => {
                    setCustomLocation(e.target.value);
                    setEditedEvent({ ...editedEvent, location: e.target.value });
                  }}
                  placeholder="הזן מיקום ספציפי"
                  style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)', width: '100%', textAlign: 'center' }}
                  required
                />
              )}
            </div>
          ) : (
            <p style={{ marginTop: '0.5rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>{currentLocation}</p>
          )}
        </div>

        {/* Card B: Catering Type */}
        <div className="card" style={{ padding: '2rem', marginBottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--color-blue-pale)' }}>
          <div style={{ background: 'var(--color-blue-pale)', color: 'var(--color-blue-main)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <Coffee size={32} />
          </div>
          <h3 style={{ margin: 0, color: 'var(--color-blue-dark)' }}>סוג כיבוד</h3>
          {isEditing ? (
            isMultiCatering ? (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'right', background: 'white', padding: '1rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)', width: '100%' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    value="sandwiches"
                    checked={(currentResources.catering || '').includes('sandwiches')}
                    onChange={handleTripCateringChange}
                  />
                  סנדוויצ'ים וארוחות ארוזות
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    value="bbq"
                    checked={(currentResources.catering || '').includes('bbq')}
                    onChange={handleTripCateringChange}
                  />
                  על האש / מנגל - בשרים וציוד
                </label>
              </div>
            ) : (
              <select 
                value={currentResources.catering}
                onChange={e => updateResource('catering', e.target.value)}
                style={{ marginTop: '0.5rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)', width: '100%', textAlign: 'center' }}
              >
                <option value="none">ללא קייטרינג</option>
                <option value="basic">קייטרינג בסיסי</option>
                <option value="premium">קייטרינג פרמיום</option>
                <option value="special">מנות מיוחדות (טבעוני, צמחוני, ללא גלוטן)</option>
              </select>
            )
          ) : (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <p style={{ color: 'var(--color-text-main)', fontSize: '1.1rem', margin: 0 }}>{cateringLabel}</p>
              {vendorDisplay && <p style={{ color: 'var(--color-blue-main)', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>ספק: {vendorDisplay}</p>}
            </div>
          )}

          {/* Vendor Selection (Edit Mode) */}
          {isEditing && currentResources.catering && currentResources.catering !== 'none' && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-bg-main)', borderRadius: '4px', border: '1px solid #eee', width: '100%', textAlign: 'right' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-blue-dark)' }}>ספק (מתוך ספר הספקים)</label>
              <select 
                value={currentResources.vendorId || ''} 
                onChange={e => updateResource('vendorId', e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">-- בחר ספק --</option>
                {vendors.filter(v => v.cateringTypes?.some(type => currentResources.catering.includes(type))).map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.rating} כוכבים)</option>
                ))}
                <option value="other">אחר (הזנה ידנית)</option>
              </select>
              
              {currentResources.vendorId === 'other' && (
                <div style={{ marginTop: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={currentResources.customVendorName || ''}
                    onChange={e => updateResource('customVendorName', e.target.value)}
                    placeholder="שם הספק המבוקש..."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    required
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={requestVendorAddition} 
                      onChange={(e) => setRequestVendorAddition(e.target.checked)} 
                    />
                    בקש הוספה לספר הספקים
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card C: RSVP Tracker */}
        <div className="card" style={{ padding: '2rem', marginBottom: 0, border: '2px solid var(--color-blue-main)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckCircle size={20} /> מעקב אישורי הגעה
          </h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
              <span style={{ fontWeight: 'bold' }}>אישרו: {confirmed}</span>
              <span style={{ color: 'var(--color-text-light)' }}>מתוך: {totalInvited}</span>
            </div>
            <div style={{ width: '100%', height: '16px', background: 'var(--color-blue-pale)', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-success)' }}></div>
            </div>
            <div style={{ textAlign: 'center', color: 'var(--color-warning)', fontWeight: 'bold' }}>
              רשימת המתנה: {waitlist} עובדים
            </div>
          </div>
        </div>
      </div>

      {/* Mid Section (Logistics & Additional Details) */}
      <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-blue-pale)', background: '#FAFAFA', position: 'relative', zIndex: 1 }}>
        <h2 style={{ margin: 0, marginBottom: '1.5rem', color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={24} /> לוגיסטיקה והערות כלליות
        </h2>
        
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={currentResources.tech} onChange={e => updateResource('tech', e.target.checked)} />
                ציוד טכנולוגי
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={currentResources.av} onChange={e => updateResource('av', e.target.checked)} />
                הגברה ותאורה
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={currentResources.lecture} onChange={e => updateResource('lecture', e.target.checked)} />
                הרצאה / מופע
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={currentResources.gifts} onChange={e => updateResource('gifts', e.target.checked)} />
                מתנות לעובדים
              </label>
            </div>

            {(event.type === 'טיול' || event.type === 'אירוע רווחה/גיבוש') && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--color-blue-dark)' }}>לוגיסטיקה מיוחדת (טיולים וגיבוש):</label>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={currentResources.transportation || false} onChange={e => updateResource('transportation', e.target.checked)} />
                    הסעות / אוטובוסים
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={currentResources.firstAid || false} onChange={e => updateResource('firstAid', e.target.checked)} />
                    ערכת עזרה ראשונה
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={currentResources.security || false} onChange={e => updateResource('security', e.target.checked)} />
                    אבטחה / מאבטחים
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={currentResources.guide || false} onChange={e => updateResource('guide', e.target.checked)} />
                    מלווה / מדריך
                  </label>
                </div>
              </div>
            )}
            
            <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--color-blue-dark)' }}>הערות כלליות / הנחיות מיוחדות לאירוע:</label>
              <textarea 
                rows={4} 
                value={currentNotes || ''} 
                onChange={e => setEditedEvent({...editedEvent, notes: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)' }}
                placeholder="כתוב כאן הערות נוספות, דרישות צוות, משימות מיוחדות..."
              />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {currentResources.tech && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-blue-pale)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'var(--color-blue-dark)', fontWeight: 600 }}>
                  <Tv size={18} /> ציוד טכנולוגי
                </div>
              )}
              {currentResources.av && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-blue-pale)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'var(--color-blue-dark)', fontWeight: 600 }}>
                  <Mic size={18} /> הגברה ותאורה
                </div>
              )}
              {currentResources.lecture && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-blue-pale)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'var(--color-blue-dark)', fontWeight: 600 }}>
                  <Users size={18} /> הרצאה / מופע
                </div>
              )}
              {currentResources.gifts && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-blue-pale)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'var(--color-blue-dark)', fontWeight: 600 }}>
                  <Gift size={18} /> מתנות לעובדים
                </div>
              )}
              {(event.type === 'טיול' || event.type === 'אירוע רווחה/גיבוש') && (
                <>
                  {currentResources.transportation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-action-main)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'white', fontWeight: 600 }}>
                      <MapPin size={18} /> הסעות / אוטובוסים
                    </div>
                  )}
                  {currentResources.firstAid && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-action-main)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'white', fontWeight: 600 }}>
                      <Activity size={18} /> ערכת עזרה ראשונה
                    </div>
                  )}
                  {currentResources.security && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-action-main)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'white', fontWeight: 600 }}>
                      <Settings size={18} /> אבטחה / מאבטחים
                    </div>
                  )}
                  {currentResources.guide && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-action-main)', padding: '0.75rem 1.5rem', borderRadius: '20px', color: 'white', fontWeight: 600 }}>
                      <Users size={18} /> מלווה / מדריך
                    </div>
                  )}
                </>
              )}
              {!currentResources.tech && !currentResources.av && !currentResources.lecture && !currentResources.gifts && !currentResources.transportation && !currentResources.firstAid && !currentResources.security && !currentResources.guide && (
                <div style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>לא סומנו דרישות לוגיסטיקה נוספות לאירוע זה.</div>
              )}
            </div>

            {currentNotes && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: 'var(--color-blue-dark)' }}>הערות והנחיות:</h4>
                <p style={{ margin: 0, color: 'var(--color-text-main)', whiteSpace: 'pre-line' }}>{currentNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Budget & Expenses Section */}
      <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-blue-pale)', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={24} /> תקציב והוצאות אירוע
          </h2>
          <div style={{ textAlign: 'left', background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--color-blue-pale)', minWidth: '300px' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-blue-dark)', marginBottom: '0.5rem' }}>
              תקציב מתוכנן (Planned Budget): ₪{currentBudget.toLocaleString()}
            </div>
            <div style={{ color: 'var(--color-text-main)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span>סה"כ הוצאות בפועל: ₪{totalSpent.toLocaleString()}</span>
              {isOverBudget ? (
                <span style={{ color: 'var(--color-danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={16} /> חריגה: ₪{Math.abs(remainingBudget).toLocaleString()}
                </span>
              ) : (
                <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
                  יתרה: ₪{remainingBudget.toLocaleString()}
                </span>
              )}
            </div>
            
            {isEditing && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-blue-main)', fontWeight: 'bold' }}>עריכת תקציב כולל לאירוע (₪):</label>
                <input 
                  type="number" 
                  value={currentBudget}
                  onChange={e => setEditedEvent({ ...editedEvent, budget: Number(e.target.value) })}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-blue-main)', width: '100%', fontSize: '1.1rem' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Expenses Table */}
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--color-blue-pale)', color: 'var(--color-blue-dark)' }}>
              <tr style={{ textAlign: 'right' }}>
                <th style={{ padding: '1rem' }}>ספק / גורם מטפל</th>
                <th style={{ padding: '1rem' }}>קטגוריה</th>
                <th style={{ padding: '1rem' }}>תיאור ההוצאה</th>
                <th style={{ padding: '1rem' }}>סכום (₪)</th>
              </tr>
            </thead>
            <tbody>
              {expensesList.map((exp, i) => (
                <React.Fragment key={i}>
                  <tr style={{ borderBottom: exp.requirements ? 'none' : '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{exp.vendor}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem' }}>{exp.category}</span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-main)' }}>{exp.description}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>₪{exp.amount.toLocaleString()}</td>
                  </tr>
                  {exp.requirements && (
                    <tr style={{ borderBottom: '1px solid #eee', background: '#fcfcfc' }}>
                      <td colSpan={4} style={{ padding: '0.5rem 1rem 1rem 1rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                        <div style={{ background: 'var(--color-blue-pale)', padding: '0.75rem', borderRadius: '4px', borderLeft: '3px solid var(--color-blue-main)' }}>
                          <strong>דרישות מיוחדות מהספק:</strong><br />
                          {exp.requirements}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {expensesList.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-light)' }}>
                    לא הוזנו הוצאות לאירוע זה.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Soft Cap Warnings */}
          {exceededCategories.length > 0 && (
            <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #eee' }}>
              {exceededCategories.map(cat => (
                <div key={cat} style={{ color: 'var(--color-danger)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <AlertCircle size={14} />
                  הערה: הוצאות בקטגוריית <strong>{cat}</strong> חורגות מתקרת התקציב המומלצת (Soft Cap) שהוגדרה על ידי ההנהלה.
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Expense Form */}
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'white', border: '1px dashed var(--color-blue-main)', borderRadius: '8px' }}>
          <h4 style={{ margin: 0, marginBottom: '1rem', color: 'var(--color-blue-main)' }}>הוספת הוצאה / ספק חדש</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>שם ספק / גורם</label>
                <input type="text" value={newExpense.vendor} onChange={e => setNewExpense({...newExpense, vendor: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="לדוגמה: טעים לי קייטרינג" />
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>קטגוריה</label>
                <select value={newExpense.category} onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                  <option value="קייטרינג">קייטרינג</option>
                  <option value="הגברה ותאורה">הגברה ותאורה</option>
                  <option value="מקום">מקום</option>
                  <option value="מתנות">מתנות</option>
                  <option value="אחר">אחר</option>
                </select>
              </div>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>תיאור ההוצאה</label>
                <input type="text" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="לדוגמה: תשלום מקדמה 20%" />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>סכום (₪)</label>
                <input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="0" />
              </div>
            </div>
            
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--color-text-light)' }}>דרישות מיוחדות מהספק (Special Requirements)</label>
              <textarea 
                rows={2}
                value={newExpense.requirements} 
                onChange={e => setNewExpense({...newExpense, requirements: e.target.value})} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }} 
                placeholder="כתוב כאן דרישות מיוחדות. למשל: 10 מנות טבעוניות ללא גלוטן..." 
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleAddExpense} style={{ height: '42px', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={18} /> שמור ספק והוצאה
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card (Guest List) */}
      <div className="card" style={{ padding: '2rem', border: '1px solid var(--color-blue-pale)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--color-blue-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} /> רשימת מוזמנים
          </h2>
          <input type="text" placeholder="חיפוש לפי שם..." style={{ padding: '0.5rem 1rem', width: '300px', borderRadius: '20px', border: '1px solid var(--color-blue-main)' }} />
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-blue-pale)', textAlign: 'right', color: 'var(--color-text-light)' }}>
                <th style={{ padding: '1rem' }}>שם העובד</th>
                <th style={{ padding: '1rem' }}>מחלקה</th>
                <th style={{ padding: '1rem' }}>סטטוס הגעה</th>
                <th style={{ padding: '1rem' }}>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'דנה כהן', dept: 'מחלקת פיתוח', status: 'אישרה הגעה', color: 'var(--color-success)' },
                { name: 'יוסי לוי', dept: 'מחלקת כספים', status: 'לא יגיע', color: 'var(--color-danger)' },
                { name: 'מיכל ישראלי', dept: 'הנהלה', status: 'רשימת המתנה', color: 'var(--color-warning)' },
                { name: 'אורן ברק', dept: 'מכירות', status: 'טרם השיב', color: 'var(--color-text-light)' },
              ].map((guest, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{guest.name}</td>
                  <td style={{ padding: '1rem' }}>{guest.dept}</td>
                  <td style={{ padding: '1rem', color: guest.color, fontWeight: 'bold' }}>{guest.status}</td>
                  <td style={{ padding: '1rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}>שליחת תזכורת</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ManageGuests;
