import React, { createContext, useContext, useState, useEffect } from 'react';

export type User = {
  id: string;
  name: string;
  role: 'admin' | 'organizer';
  jobTitle?: string;
  profilePicture?: string;
};

export type Event = {
  id: string;
  title: string;
  type: string;
  date: string;
  location: string;
  audience: string;
  audienceType: 'open' | 'invite-only';
  attendanceMandatory: boolean;
  invitedDepartments: string[];
  schedule: string;
  resources: {
    tech: boolean;
    av: boolean;
    catering: string;
    seating: boolean;
    lecture: boolean;
    gifts: boolean;
  };
  budget: number;
  status: 'planning' | 'approved' | 'completed';
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

type StoreContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  vendors: Vendor[];
  addEvent: (event: Omit<Event, 'id'>) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const updateUser = (updates: Partial<User>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };
  
  // Mock initial data
  const [events, setEvents] = useState<Event[]>([
    {
      id: 'e1',
      title: 'כנס חדשנות טכנולוגית 2024',
      type: 'כנס',
      date: '2024-11-15T09:00',
      location: 'אולם כנסים מרכזי',
      audience: 'כלל עובדי החברה',
      audienceType: 'open',
      attendanceMandatory: false,
      invitedDepartments: [],
      schedule: '09:00 התכנסות\n10:00 פתיחה\n12:00 הפסקת צהריים\n14:00 סיום',
      resources: { tech: true, av: true, catering: 'premium', seating: true, lecture: true, gifts: true },
      budget: 50000,
      status: 'approved',
      organizerId: '1'
    },
    {
      id: 'e2',
      title: 'הרמת כוסית לראש השנה',
      type: 'חג',
      date: '2024-09-25T16:00',
      location: 'קפיטריה',
      audience: 'מחלקת פיתוח',
      audienceType: 'invite-only',
      attendanceMandatory: true,
      invitedDepartments: ['מחלקת פיתוח'],
      schedule: '16:00 התכנסות\n16:30 ברכות\n17:30 סיום',
      resources: { tech: false, av: true, catering: 'basic', seating: false, lecture: false, gifts: true },
      budget: 5000,
      status: 'planning',
      organizerId: '2'
    }
  ]);

  const [vendors] = useState<Vendor[]>([
    { id: 'v1', name: 'טעים לי קייטרינג', service: 'קייטרינג', phone: '050-1234567', email: 'food@taim.co.il', rating: 4.8 },
    { id: 'v2', name: 'קול אור וצל', service: 'הגברה ותאורה', phone: '052-9876543', email: 'av@kolor.com', rating: 4.5 },
    { id: 'v3', name: 'מתנות לכל עובד', service: 'מתנות', phone: '054-5555555', email: 'gifts@matanot.com', rating: 4.2 }
  ]);

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent = { ...eventData, id: Math.random().toString(36).substr(2, 9) };
    setEvents([...events, newEvent]);
  };

  return (
    <StoreContext.Provider value={{ currentUser, setCurrentUser, updateUser, events, setEvents, vendors, addEvent }}>
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
