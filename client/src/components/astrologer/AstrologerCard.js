import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMessageCircle, FiVideo, FiPhone } from 'react-icons/fi';
import './AstrologerCard.css';

const typeIcons = { chat: <FiMessageCircle />, video: <FiVideo />, call: <FiPhone /> };

export default function AstrologerCard({ astrologer }) {
  const { _id, user, bio, experience, specializations, pricePerMinute,
          rating, totalReviews, isOnline, consultationTypes } = astrologer;

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : '';


  return (
    <div className="astro-card">
      {isOnline && <span className="online-dot" title="Online now" />}
      <div className="astro-card-top">
        <div className="avatar" style={{ width: 64, height: 64, fontSize: 22, margin: '0 auto 10px' }}>
          {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
        </div>
        <h3 className="astro-name">{user?.name}</h3>
        <div className="astro-specs">
          {(specializations || []).slice(0, 2).map(s => (
            <span key={s} className="badge badge-purple">{s}</span>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {experience} yrs experience
        </div>
      </div>
      {bio && <p className="astro-bio">{bio.slice(0, 80)}{bio.length > 80 ? '...' : ''}</p>}
      <div className="astro-card-footer">
        <div className="astro-rating">
          <FiStar style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <strong>{rating?.toFixed(1) || '0.0'}</strong>
          <span className="text-muted">({totalReviews})</span>
        </div>
        <div className="astro-price">
          Rs. {pricePerMinute}<small>/min</small>
        </div>
      </div>
      <div className="astro-types">
        {(consultationTypes || []).map(t => (
          <span key={t} title={t} className="type-icon">{typeIcons[t]}</span>
        ))}
      </div>
      <Link to={`/astrologers/${_id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
        View Profile
      </Link>
    </div>
  );
}
