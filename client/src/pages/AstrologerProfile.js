import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiAward, FiMessageCircle, FiVideo, FiPhone, FiClock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const typeIcons = { chat: <FiMessageCircle />, video: <FiVideo />, call: <FiPhone /> };
const typeLabels = { chat: 'Chat', video: 'Video Call', call: 'Voice Call' };

export default function AstrologerProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [astrologer, setAstrologer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/astrologers/${id}`),
      api.get(`/reviews/astrologer/${id}?limit=5`),
    ]).then(([a, r]) => {
      setAstrologer(a.data.astrologer);
      setReviews(r.data.reviews || []);
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!astrologer) return <div className="page container"><p>Astrologer not found.</p></div>;

  const { user: aUser, bio, experience, specializations, languages,
    pricePerMinute, rating, totalReviews, consultationTypes, isOnline } = astrologer;

  const initials = aUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page">
      <div className="container">
        <div className="grid-2" style={{ gap: 32, alignItems: 'start' }}>
          {/* Left — profile info */}
          <div>
            <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div className="avatar" style={{ width: 100, height: 100, fontSize: 32, margin: '0 auto 12px' }}>
                  {aUser?.avatar ? <img src={aUser.avatar} alt={aUser.name} /> : initials}
                </div>
                {isOnline && (
                  <span style={{
                    position: 'absolute', bottom: 16, right: 0,
                    width: 14, height: 14, borderRadius: '50%',
                    background: 'var(--success)', border: '2px solid #fff'
                  }} />
                )}
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>{aUser?.name}</h1>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap', margin: '8px 0' }}>
                {specializations?.map(s => <span key={s} className="badge badge-purple">{s}</span>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 20, margin: '16px 0' }}>
                <div>
                  <strong style={{ fontSize: 20 }}>{rating?.toFixed(1)}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rating</div>
                </div>
                <div>
                  <strong style={{ fontSize: 20 }}>{experience}yr</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Exp</div>
                </div>
                <div>
                  <strong style={{ fontSize: 20 }}>{totalReviews}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reviews</div>
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
                ₹{pricePerMinute}<small style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/min</small>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12, fontWeight: 700 }}>About</h3>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>{bio || 'No bio provided yet.'}</p>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Details</h3>
              {[
                ['Languages', languages?.join(', ') || 'Hindi, English'],
                ['Specializations', specializations?.join(', ')],
                ['Experience', `${experience} years`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 120 }}>{label}:</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Right — book & reviews */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Book Consultation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {consultationTypes?.map(type => (
                  user ? (
                    <Link key={type} to={`/book/${id}?type=${type}`}
                      className="btn btn-primary" style={{ justifyContent: 'center' }}>
                      {typeIcons[type]} Book {typeLabels[type]} — ₹{pricePerMinute}/min
                    </Link>
                  ) : (
                    <Link key={type} to="/login"
                      className="btn btn-primary" style={{ justifyContent: 'center' }}>
                      {typeIcons[type]} {typeLabels[type]} — Login to Book
                    </Link>
                  )
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>
                Reviews ({totalReviews})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet.</p>
              ) : reviews.map(r => (
                <div key={r._id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <strong style={{ fontSize: 14 }}>{r.user?.name}</strong>
                    <span className="stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
