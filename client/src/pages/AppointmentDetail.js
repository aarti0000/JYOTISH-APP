import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser, FiMessageCircle, FiVideo, FiPhone, FiStar } from 'react-icons/fi';

const STATUS_COLORS = {
  pending: 'badge-yellow',
  confirmed: 'badge-green',
  completed: 'badge-purple',
  cancelled: 'badge-red',
  ongoing: 'badge-green',
};

const typeIcons = {
  chat: <FiMessageCircle />,
  video: <FiVideo />,
  call: <FiPhone />,
};

export default function AppointmentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/appointments/' + id)
      .then(r => setAppt(r.data.appointment))
      .catch(() => toast.error('Appointment not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const { data } = await api.post('/consultations/start/' + id);
      navigate('/consultation/' + data.consultation._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start consultation');
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put('/appointments/' + id + '/cancel', { reason: 'Cancelled by user' });
      toast.success('Appointment cancelled');
      setAppt(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        astrologerId: appt.astrologer._id,
        appointmentId: id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      toast.success('Review submitted! Thank you 🙏');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (!appt) return <div className="page container"><p>Appointment not found.</p></div>;

  const isUser = user?.role === 'user';
  const astrologer = appt.astrologer;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Appointment Details</h1>
        </div>

        {/* Status + action buttons */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span className={'badge ' + STATUS_COLORS[appt.status]} style={{ fontSize: 13, padding: '6px 14px' }}>
              {appt.status.toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>

              {/* Join button — shows for confirmed or ongoing */}
              {['confirmed', 'ongoing'].includes(appt.status) && (
                <button
                  className="btn btn-primary"
                  onClick={handleJoin}
                  disabled={joining}>
                  {typeIcons[appt.type]} {joining ? 'Joining...' : 'Join Consultation'}
                </button>
              )}

              {/* Cancel button */}
              {appt.status === 'pending' && isUser && (
                <button className="btn btn-danger" onClick={handleCancel}>
                  Cancel
                </button>
              )}

              {/* Pay button */}
              {appt.paymentStatus === 'unpaid' && appt.status !== 'cancelled' && (
                <Link to={'/payment/' + id} className="btn btn-primary">
                  Pay Now
                </Link>
              )}

            </div>
          </div>
        </div>

        {/* Astrologer card */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
              {astrologer?.user?.avatar
                ? <img src={astrologer.user.avatar} alt="" />
                : astrologer?.user?.name?.[0]}
            </div>
            <div>
              <h3 style={{ fontWeight: 700 }}>{astrologer?.user?.name}</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {astrologer?.specializations?.map(s => (
                  <span key={s} className="badge badge-purple">{s}</span>
                ))}
              </div>
            </div>
            <Link
              to={'/astrologers/' + astrologer?._id}
              className="btn btn-secondary"
              style={{ marginLeft: 'auto' }}>
              View Profile
            </Link>
          </div>
        </div>

        {/* Appointment info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Appointment Info</h3>
          {[
            ['Date',     appt.date,                        <FiCalendar />],
            ['Time',     appt.startTime,                   <FiClock />],
            ['Duration', appt.duration + ' minutes',       null],
            ['Type',     appt.type?.toUpperCase(),         typeIcons[appt.type]],
            ['Amount',   'Rs. ' + appt.amount,             null],
            ['Payment',  appt.paymentStatus,               null],
          ].map(([label, value, icon]) => (
            <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--text-muted)', minWidth: 100, display: 'flex', alignItems: 'center', gap: 4 }}>
                {icon}{label}:
              </span>
              <strong style={{ textTransform: 'capitalize' }}>{value}</strong>
            </div>
          ))}
        </div>

        {/* Birth details */}
        {appt.userBirthDetails && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>
              <FiUser style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Birth Details
            </h3>
            {Object.entries(appt.userBirthDetails).map(([k, v]) => v && (
              <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 14 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 120, textTransform: 'capitalize' }}>
                  {k.replace(/([A-Z])/g, ' $1')}:
                </span>
                <strong>{v}</strong>
              </div>
            ))}
            {appt.question && (
              <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Question:</p>
                <p style={{ fontSize: 14 }}>{appt.question}</p>
              </div>
            )}
          </div>
        )}

        {/* Review form — only after completed consultation */}
        {appt.status === 'completed' && isUser && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 14 }}>
              <FiStar style={{ marginRight: 6, verticalAlign: 'middle', color: '#f59e0b' }} />
              Leave a Review
            </h3>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      style={{
                        fontSize: 28,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: n <= reviewForm.rating ? '#f59e0b' : '#d1d5db',
                      }}
                      onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  className="input"
                  rows={3}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience..."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}