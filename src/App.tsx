import { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { Home, Calendar, PlusCircle, BarChart2, Users, Settings, LogOut, UserCircle, MessageSquare, List, DollarSign, Menu, X } from 'lucide-react'
import { useStore } from './store/StoreContext'

// Screen Imports
import Dashboard from './screens/Dashboard'
import EventWizard from './screens/EventWizard'
import EventsList from './screens/EventsList'
import CalendarScreen from './screens/CalendarScreen'
import Reports from './screens/Reports'
import VendorDirectory from './screens/VendorDirectory'
import GuestPortal from './screens/GuestPortal'
import AdminSettings from './screens/AdminSettings'
import AdminBudgets from './screens/AdminBudgets'
import UserProfile from './screens/UserProfile'
import ManageGuests from './screens/ManageGuests'
import FeedbackScreen from './screens/FeedbackScreen'
import Login from './screens/Login'

function App() {
  const { currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

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
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ניהול אירועים</span>
          <button className="btn mobile-menu-btn" onClick={closeMobileMenu} style={{ padding: 0, color: 'var(--color-white)' }}>
            <X size={24} />
          </button>
        </div>
        <div className="sidebar-nav">
          <NavLink to="/" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Home size={20} />
            ראשי
          </NavLink>
          <NavLink to="/create-event" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <PlusCircle size={20} />
            יצירת אירוע
          </NavLink>
          <NavLink to="/events" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <List size={20} />
            רשימת אירועים
          </NavLink>
          <NavLink to="/calendar" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Calendar size={20} />
            יומן משרדי
          </NavLink>
          <NavLink to="/reports" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <BarChart2 size={20} />
            דוחות וסיכומים
          </NavLink>
          <NavLink to="/vendors" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            ספר ספקים
          </NavLink>
          <NavLink to="/feedback" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={20} />
            משובים
          </NavLink>
          <NavLink to="/profile" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            <UserCircle size={20} />
            פרופיל אישי
          </NavLink>
          {currentUser.role === 'admin' && (
            <>
              <div style={{ padding: '1rem 1.5rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-blue-light)', fontWeight: 'bold' }}>ניהול מערכת</div>
              <NavLink to="/admin-budgets" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <DollarSign size={20} />
                ניהול תקציב (Admin)
              </NavLink>
              <NavLink to="/settings" onClick={closeMobileMenu} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                <Settings size={20} />
                הגדרות מערכת
              </NavLink>
            </>
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

      {/* Mobile Overlay */}
      <div 
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={closeMobileMenu}
      ></div>

      {/* Main Content */}
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="btn mobile-menu-btn" 
              style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', background: 'var(--color-blue-pale)', borderRadius: '4px' }}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} color="var(--color-blue-dark)" />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--color-blue-dark)' }}>
              {currentUser.profilePicture ? (
                <img src={currentUser.profilePicture} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={40} color="var(--color-blue-main)" />
              )}
              <div style={{ display: 'none' }}>{/* Hide on mobile if needed, but flex will handle it. We can keep it or use media queries */}</div>
              <div className="topbar-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ lineHeight: '1.2' }}>שלום, {currentUser.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', fontWeight: 400 }}>{currentUser.jobTitle || (currentUser.role === 'admin' ? 'מנהל' : 'מארגן')}</div>
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
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
            <Route path="/events" element={<EventsList />} />
            <Route path="/calendar" element={<CalendarScreen />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/vendors" element={<VendorDirectory />} />
            <Route path="/feedback" element={<FeedbackScreen />} />
            <Route path="/manage-guests/:eventId" element={<ManageGuests />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/settings" element={<AdminSettings />} />
            <Route path="/admin-budgets" element={<AdminBudgets />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
