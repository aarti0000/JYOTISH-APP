import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{
      background: '#1e1b4b', color: '#c4b5fd', padding: '40px 0 20px',
      marginTop: 60,
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FiStar style={{ color: '#f59e0b', fontSize: 20 }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>AstroConnect</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Nepal's trusted platform for authentic Vedic astrology consultations.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: 12, fontSize: 14 }}>Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Kundali Reading', 'Marriage Matching', 'Career Guidance', 'Vastu Consultation'].map(s => (
                <Link key={s} to="/astrologers" style={{ fontSize: 13, color: '#c4b5fd' }}>{s}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: 12, fontSize: 14 }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Find Astrologers', '/astrologers'], ['Join as Astrologer', '/register'], ['My Kundali', '/kundali']].map(([label, path]) => (
                <Link key={label} to={path} style={{ fontSize: 13, color: '#c4b5fd' }}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: 12, fontSize: 14 }}>Contact</h4>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>support@astroconnect.com</p>
            <p style={{ fontSize: 13 }}>061-523412</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #312e81', paddingTop: 16, textAlign: 'center', fontSize: 12 }}>
          © {new Date().getFullYear()} AstroConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
