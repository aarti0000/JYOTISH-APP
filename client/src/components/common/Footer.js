import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{
      background: '#06030e',
      color: '#a59fc4',
      padding: '50px 0 30px',
      marginTop: 60,
      borderTop: '1px solid rgba(157, 78, 221, 0.15)',
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <FiStar style={{ color: 'var(--primary)', fontSize: 22, filter: 'drop-shadow(0 0 5px var(--primary))' }} />
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 20, fontFamily: "'Cinzel', serif" }}>
                Astro<span style={{ color: 'var(--primary)' }}>Connect</span>
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Nepal's trusted platform for authentic Vedic astrology consultations. Connect with vetted expert Jyotish professionals online.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: 16, fontSize: 14, fontFamily: "'Cinzel', serif" }}>Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Kundali Reading', 'Marriage Matching', 'Career Guidance', 'Vastu Consultation'].map(s => (
                <Link key={s} to="/astrologers" style={{ fontSize: 13, color: '#a59fc4', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a59fc4'}>{s}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: 16, fontSize: 14, fontFamily: "'Cinzel', serif" }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Find Astrologers', '/astrologers'], ['Join as Astrologer', '/register'], ['My Kundali', '/kundali']].map(([label, path]) => (
                <Link key={label} to={path} style={{ fontSize: 13, color: '#a59fc4', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a59fc4'}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: 16, fontSize: 14, fontFamily: "'Cinzel', serif" }}>Contact</h4>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>support@astroconnect.com</p>
            <p style={{ fontSize: 13 }}>061-523412</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(157, 78, 221, 0.1)', paddingTop: 20, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
          © {new Date().getFullYear()} AstroConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
