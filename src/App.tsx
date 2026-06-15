import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, PlusCircle, BarChart2, Users, Settings, LogOut, CheckCircle, UserCircle, MessageSquare } from 'lucide-react'
import { useStore } from './store/StoreContext'

// Screen Imports
import Dashboard from './screens/Dashboard'
import EventWizard from './screens/EventWizard'
import CalendarScreen from './screens/CalendarScreen'
import Reports from './screens/Reports'
import VendorDirectory from './screens/VendorDirectory'
import GuestPortal from './screens/GuestPortal'
import AdminSettings from './screens/AdminSettings'
import UserProfile from './screens/UserProfile'
import ManageGuests from './screens/ManageGuests'
import FeedbackScreen from './screens/FeedbackScreen'
import Login from './screens/Login'

function App() {
  const { currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();

  // Simple login screen if no user
  if (!currentUser) {
    return <Login />;
  }

  // Guest portal doesn't have the standard sidebar
  const isGuestMode = window.location.pathname.startsWith('/guest');

  if (isGuestMode) {
    return (
      <div className="app-container">
        <div className="main-content">
          <Routes>
            <Route path="/guest/:eventId" element={<GuestPortal />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          ניהול אירועים
        </div>
        <div className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={20} />
            ראשי
          </NavLink>
          <NavLink to="/create-event" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            יצירת אירוע
          </NavLink>
          <NavLink to="/calendar" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            לוח שנה
          </NavLink>
          <NavLink to="/reports" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart2 size={20} />
            דוחות
          </NavLink>
          <NavLink to="/vendors" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            ספר ספקים
          </NavLink>
          <NavLink to="/feedback" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} />
            משובים
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserCircle size={20} />
            פרופיל אישי
          </NavLink>
          {currentUser.role === 'admin' && (
            <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Settings size={20} />
              הגדרות
            </NavLink>
          )}
        </div>
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
            מחובר כ: <br/><strong>{currentUser.name}</strong> ({currentUser.role === 'admin' ? 'מנהל' : 'מארגן'})
          </div>
          <button 
            className="btn" 
            style={{ color: 'var(--color-blue-light)', padding: 0 }}
            onClick={() => setCurrentUser(null)}
          >
            <LogOut size={16} style={{ marginLeft: '0.5rem' }} />
            התנתק
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 600, color: 'var(--color-blue-dark)' }}>
            {currentUser.profilePicture ? (
              <img src={currentUser.profilePicture} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <UserCircle size={40} color="var(--color-blue-main)" />
            )}
            <div>
              <div style={{ lineHeight: '1.2' }}>שלום, {currentUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 400 }}>{currentUser.jobTitle || (currentUser.role === 'admin' ? 'מנהל' : 'מארגן')}</div>
            </div>
          </div>
          <div>
            <button className="btn btn-primary" onClick={() => navigate('/create-event')}>
              <PlusCircle size={16} style={{ marginLeft: '0.5rem' }}/>
              אירוע חדש
            </button>
          </div>
        </div>
        
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-event" element={<EventWizard />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/vendors" element={<VendorDirectory />} />
            <Route path="/feedback" element={<FeedbackScreen />} />
            <Route path="/manage-guests/:eventId" element={<ManageGuests />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
