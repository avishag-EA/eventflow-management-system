import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  id: string;
  name: string;
  role: 'admin' | 'organizer';
  jobTitle?: string;
  profilePicture?: string;
};

export type ExpenseCategory = 'קייטרינג' | 'הגברה ותאורה' | 'מקום' | 'מתנות' | 'אחר';

export type Expense = {
  id: string;
  vendor: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  requirements?: string;
};

export type Event = {
  id: string;
  title: string;
  type: string;
  date: string;
  endDate?: string;
  location: string;
  audience: string;
  audienceType: 'open' | 'invite-only';
  attendanceMandatory: boolean;
  invitedDepartments: string[];
  estimatedHeadcount?: number;
  schedule: string;
  resources: {
    tech: boolean;
    av: boolean;
    catering: string;
    seating: boolean;
    lecture: boolean;
    gifts: boolean;
    transportation?: boolean;
    firstAid?: boolean;
    security?: boolean;
    guide?: boolean;
  };
  budget: number;
  expenses?: Expense[];
  notes?: string;
  vendorNotes?: string;
  status: 'טיוטה' | 'מאושר' | 'בביצוע' | 'הושלם' | 'בוטל' | 'ממתין לאישור מחיקה';
  organizerId: string;
};

export type Vendor = {
  id: string;
  name: string;
  service: string;
  phone: string;
  email: string;
  rating: number; // 1-5
};

export type GlobalBudgetSettings = {
  annualGlobalBudget: number;
  monthlyTarget: number;
  departmentTargets: Record<string, number>;
};

export type CategorySoftCaps = Record<ExpenseCategory, number>;

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  previousValue: string;
  newValue: string;
};

type StoreContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  globalBudgetSettings: GlobalBudgetSettings;
  setGlobalBudgetSettings: React.Dispatch<React.SetStateAction<GlobalBudgetSettings>>;
  
  categorySoftCaps: CategorySoftCaps;
  setCategorySoftCaps: React.Dispatch<React.SetStateAction<CategorySoftCaps>>;
  
  auditLogs: AuditLogEntry[];

  eventTypes: string[];
  setEventTypes: React.Dispatch<React.SetStateAction<string[]>>;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const updateUser = (updates: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };
  
  const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
    return defaultValue;
  };

  const [events, setEvents] = useState<Event[]>(() => loadFromStorage('app_events', []));
  const [vendors, setVendors] = useState<Vendor[]>(() => loadFromStorage('app_vendors', []));
  const [eventTypes, setEventTypes] = useState<string[]>(() => loadFromStorage('app_event_types', []));
  
  const [globalBudgetSettings, setGlobalBudgetSettings] = useState<GlobalBudgetSettings>(() => loadFromStorage('app_global_budget', {
    annualGlobalBudget: 1500000,
    monthlyTarget: 125000,
    departmentTargets: {}
  }));

  const [categorySoftCaps, setCategorySoftCaps] = useState<CategorySoftCaps>(() => loadFromStorage('app_category_caps', {
    'קייטרינג': 25000,
    'הגברה ותאורה': 15000,
    'מקום': 30000,
    'מתנות': 10000,
    'אחר': 5000
  }));

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => loadFromStorage('app_audit_logs', []));

  useEffect(() => { localStorage.setItem('app_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('app_vendors', JSON.stringify(vendors)); }, [vendors]);
  useEffect(() => { localStorage.setItem('app_event_types', JSON.stringify(eventTypes)); }, [eventTypes]);
  useEffect(() => { localStorage.setItem('app_global_budget', JSON.stringify(globalBudgetSettings)); }, [globalBudgetSettings]);
  useEffect(() => { localStorage.setItem('app_category_caps', JSON.stringify(categorySoftCaps)); }, [categorySoftCaps]);
  useEffect(() => { localStorage.setItem('app_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent = { ...eventData, id: Math.random().toString(36).substr(2, 9) };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(prevEvents => {
      return prevEvents.map(e => {
        if (e.id === id) {
          // If budget is being updated and changed, log it.
          if (updates.budget !== undefined && updates.budget !== e.budget) {
            const newLog: AuditLogEntry = {
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date().toISOString(),
              user: currentUser?.name || 'Unknown',
              action: `עדכון תקציב לאירוע "${e.title}"`,
              previousValue: `₪${e.budget.toLocaleString()}`,
              newValue: `₪${updates.budget.toLocaleString()}`
            };
            setAuditLogs(prevLogs => [newLog, ...prevLogs]);
          }
          return { ...e, ...updates };
        }
        return e;
      });
    });
  };

  const deleteEvent = (id: string) => {
    setEvents(prevEvents => prevEvents.filter(e => e.id !== id));
    
    // Optionally log deletion
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      user: currentUser?.name || 'Unknown',
      action: `מחיקת אירוע (ID: ${id})`,
      previousValue: '-',
      newValue: 'נמחק לצמיתות'
    };
    setAuditLogs(prevLogs => [newLog, ...prevLogs]);
  };

  return (
    <StoreContext.Provider value={{ 
      currentUser, setCurrentUser, updateUser, 
      events,      setEvents,
      vendors,
      setVendors,
      addEvent, updateEvent, deleteEvent,
      globalBudgetSettings, setGlobalBudgetSettings,
      categorySoftCaps, setCategorySoftCaps,
      auditLogs,
      eventTypes, setEventTypes
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
