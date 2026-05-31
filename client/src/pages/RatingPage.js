import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';

export default function RatingPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [rating, setRating]           = useState(0);
  const [hovered, setHovered]         = useState(0);
  const [comment, setComment]         = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/appointments/' + appointmentId),
      api.get('/reviews/check/' + appointmentId),
    ])
      .then(([apptRes, reviewRes]) => {
        setAppointment(apptRes.data.appointment);
        if (reviewRes.data.reviewed) setAlreadyReviewed(true);
      })
      .catch(() => toast.error('Could not load appointment'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        astrologerId:  appointment.astrologer._id,
        appointmentId: appointmentId,
        rating,
        comment,
      });
      toast.success('Thank you for your review! 🙏');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const skipReview = () => navigate('/dashboard');

  if (loading) return <div className="spinner" />;

  const astrologer = appointment?.astrologer;

  const LABELS = { 1:'Poor', 2:'Fair', 3:'Good', 4:'Very Good', 5:'Excellent' };
  const COLORS  = { 1:'#ef4444', 2:'#f97316', 3:'#eab308', 4:'#84cc16', 5:'#10b981' };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'linear-gradient(135deg, #f8f6ff 0%, #ede9fe 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: 500, width: '100%' }}>

        {alreadyReviewed ? (
          /* Already reviewed */
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
              Already Reviewed
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
              You have already submitted a review for this consultation.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          /* Rating form */
          <div className="card" style={{ padding: 36 }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>🙏</div>
              <h2 style={{ fontWeight: 800, fontSize: 22, marginBottom: 6 }}>
                How was your consultation?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Your feedback helps others choose the right astrologer
              </p>
            </div>

            {/* Astrologer info */}
            {astrologer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 16px', background: 'var(--bg)',
                borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, flexShrink: 0 }}>
                  {astrologer.user?.avatar
                    ? <img src={astrologer.user.avatar} alt="" />
                    : astrologer.user?.name?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>
                    {astrologer.user?.name}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {appointment.type?.toUpperCase()} · {appointment.date} · {appointment.startTime}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {astrologer.specializations?.slice(0,2).map(s => (
                      <span key={s} className="badge badge-purple">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Star rating */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 14, fontWeight: 600,
                display: 'block', marginBottom: 12, color: 'var(--text)' }}>
                Rate your experience
              </label>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center',
                marginBottom: 10 }}>
                {[1,2,3,4,5].map(star => (
                  <button key={star} type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 44, padding: '4px 6px',
                      transition: 'transform 0.1s',
                      transform: (hovered || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                      color: (hovered || rating) >= star ? '#f59e0b' : '#d1d5db',
                    }}>
                    ★
                  </button>
                ))}
              </div>

              {/* Rating label */}
              {(hovered > 0 || rating > 0) && (
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 15, fontWeight: 700,
                    color: COLORS[hovered || rating],
                    background: COLORS[hovered || rating] + '20',
                    padding: '4px 16px', borderRadius: 20,
                  }}>
                    {LABELS[hovered || rating]}
                  </span>
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label>Share your experience (optional)</label>
              <textarea className="input" rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="How was the consultation? Was the astrologer helpful? Would you recommend them?"
                style={{ resize: 'vertical' }}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)',
                marginTop: 4, textAlign: 'right' }}>
                {comment.length}/500
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={skipReview}
                style={{ flex: 1, justifyContent: 'center', padding: 12 }}>
                Skip
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}
                disabled={submitting || rating === 0}
                style={{ flex: 2, justifyContent: 'center', padding: 12, fontSize: 15 }}>
                {submitting ? 'Submitting...' : '⭐ Submit Review'}
              </button>
            </div>

            {rating === 0 && (
              <p style={{ textAlign: 'center', fontSize: 12,
                color: 'var(--text-muted)', marginTop: 10 }}>
                Please select at least 1 star to submit
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}