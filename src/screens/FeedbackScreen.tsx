import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useStore } from '../store/StoreContext';

const FeedbackScreen: React.FC = () => {
  const { events } = useStore();
  
  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>מרכז משובים (סקרי שביעות רצון)</h1>

      <div className="grid-2">
        {events.slice(0, 2).map((event, index) => (
          <div key={event.id} className="card">
            <h2 style={{ marginBottom: '1rem', color: 'var(--color-blue-main)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
              {event.title}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--color-warning)', lineHeight: '1' }}>
                  {4.2 + (index * 0.5)}
                </div>
                <div style={{ display: 'flex', color: 'var(--color-warning)', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} size={16} fill={star <= 4 ? "currentColor" : "none"} />
                  ))}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>ממוצע משובים</div>
              </div>

              <div>
                <div style={{ marginBottom: '0.5rem' }}><strong>מענה משובים:</strong> 45/80 (56%)</div>
                <div><strong>דירוג קייטרינג:</strong> 4.8/5</div>
                <div><strong>דירוג תוכן/מרצה:</strong> 4.0/5</div>
              </div>
            </div>

            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <MessageSquare size={16} color="var(--color-blue-main)" /> הערות בולטות מהעובדים:
            </h4>
            <div style={{ background: 'var(--color-bg-main)', padding: '1rem', borderRadius: '4px', fontSize: '0.9rem' }}>
              <ul style={{ paddingRight: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>"היה אירוע מעולה, האוכל היה טעים מאוד!"</li>
                <li>"היה קצת חסר מקומות ישיבה בשלב ההתכנסות."</li>
                <li>"הרצאה מרתקת, תודה על הארגון."</li>
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackScreen;
