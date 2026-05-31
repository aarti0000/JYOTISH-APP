import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={{
      background: '#efe9dc',
      color: 'var(--text-muted)',
      padding: '50px 0 30px',
      marginTop: 60,
      borderTop: '1px solid var(--border)',
    }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <FiStar style={{ color: 'var(--primary)', fontSize: 22 }} />
              <span style={{ color: 'var(--text)', fontWeight: 700, fontSize: 20, fontFamily: "'Cinzel', serif" }}>
                Astro<span style={{ color: 'var(--primary)' }}>Connect</span>
              </span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Nepal's trusted platform for authentic Vedic astrology consultations. Connect with vetted expert Jyotish professionals online.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text)', marginBottom: 16, fontSize: 14, fontFamily: "'Cinzel', serif" }}>Services</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Kundali Reading', 'Marriage Matching', 'Career Guidance', 'Vastu Consultation'].map(s => (
                <Link key={s} to="/astrologers" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{s}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text)', marginBottom: 16, fontSize: 14, fontFamily: "'Cinzel', serif" }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['Find Astrologers', '/astrologers'], ['Join as Astrologer', '/register'], ['My Kundali', '/kundali']].map(([label, path]) => (
                <Link key={label} to={path} style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--text)', marginBottom: 16, fontSize: 14, fontFamily: "'Cinzel', serif" }}>Contact</h4>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>support@astroconnect.com</p>
            <p style={{ fontSize: 13 }}>061-523412</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} AstroConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

