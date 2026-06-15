import React from 'react';
import { useStore } from '../store/StoreContext';
import { Star, Phone, Mail } from 'lucide-react';

const VendorDirectory: React.FC = () => {
  const { vendors } = useStore();

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: 'var(--color-blue-dark)' }}>ספר ספקים (Vendor Directory)</h1>
      
      <div className="grid-3">
        {vendors.map(vendor => (
          <div key={vendor.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--color-blue-main)' }}>{vendor.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-warning)' }}>
                <Star size={16} fill="currentColor" />
                <span style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>{vendor.rating}</span>
              </div>
            </div>
            
            <div style={{ display: 'inline-block', background: 'var(--color-blue-pale)', color: 'var(--color-blue-main)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', alignSelf: 'flex-start', marginBottom: '1rem' }}>
              {vendor.service}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
              <Phone size={16} />
              {vendor.phone}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-light)' }}>
              <Mail size={16} />
              <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorDirectory;
