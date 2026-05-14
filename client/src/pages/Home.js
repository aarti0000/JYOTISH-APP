import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiVideo, FiMessageCircle, FiPhone, FiArrowRight, FiShield, FiAward } from 'react-icons/fi';
import api from '../utils/api';
import AstrologerCard from '../components/astrologer/AstrologerCard';
import './Home.css';

const SPECIALIZATIONS = ['Vedic', 'Numerology', 'Tarot', 'Vastu', 'KP', 'Palmistry', 'Gemology'];

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/astrologers?sort=rating&limit=4')
      .then(res => setFeatured(res.data.astrologers || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="container text-center">
          <div className="hero-badge"><FiStar /> Trusted by 50,000+ users</div>
          <h1 className="hero-title">
            Talk to Nepal's Best<br />
            <span className="gradient-text">Jyotish Astrologers</span>
          </h1>
          <p className="hero-sub">
            Get accurate Vedic astrology guidance via chat, call, or video consultation.
            First consultation free for new users!
          </p>
          <div className="hero-cta">
            <Link to="/astrologers" className="btn btn-primary btn-lg">
              Consult Now <FiArrowRight />
            </Link>
            <Link to="/kundali" className="btn btn-outline btn-lg">
              Free Kundali
            </Link>
          </div>
          <div className="hero-stats">
            {[['50K+', 'Happy Users'], ['500+', 'Astrologers'], ['1M+', 'Consultations'], ['4.8★', 'Rating']].map(([n, l]) => (
              <div key={l} className="stat-item">
                <strong>{n}</strong><span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Types */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">How Would You Like to Connect?</h2>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {[
              { icon: <FiMessageCircle size={28} />, title: 'Chat', desc: 'Text consultation — ask your questions anytime', color: '#7c3aed' },
              { icon: <FiPhone size={28} />, title: 'Call', desc: 'Voice call with your astrologer for personal guidance', color: '#0ea5e9' },
              { icon: <FiVideo size={28} />, title: 'Video', desc: 'Face-to-face video session for in-depth readings', color: '#10b981' },
            ].map(item => (
              <Link to="/astrologers" key={item.title} className="consult-type-card" style={{ '--c': item.color }}>
                <div className="consult-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title text-center">Explore Specializations</h2>
          <div className="spec-grid">
            {SPECIALIZATIONS.map(s => (
              <Link to={`/astrologers?specialization=${s}`} key={s} className="spec-chip">{s}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Astrologers */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex-between mb-2">
              <h2 className="section-title">Top Astrologers</h2>
              <Link to="/astrologers" className="btn btn-secondary">View All <FiArrowRight /></Link>
            </div>
            <div className="grid-4" style={{ marginTop: 24 }}>
              {featured.map(a => <AstrologerCard key={a._id} astrologer={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* Trust signals */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid-3">
            {[
              { icon: <FiShield size={32} />, title: 'Verified Astrologers', desc: 'All astrologers are background-checked and certified' },
              { icon: <FiAward size={32} />, title: 'Expert Guidance', desc: 'Years of experience in Vedic, KP, and other systems' },
              { icon: <FiStar size={32} />, title: 'Satisfaction Guaranteed', desc: 'Get a full refund if not satisfied with your consultation' },
            ].map(item => (
              <div key={item.title} className="trust-card">
                <div className="trust-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
