import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiClock, FiVideo, FiMessageCircle, FiPhone, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [joiningId, setJoiningId] = useState(null);

  useEffect(() => {
    api.get('/appointments')
      .then(r => setAppointments(r.data.appointments || []))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (appointmentId) => {
    setJoiningId(appointmentId);
    try {
      const { data } = await api.post('/consultations/start/' + appointmentId);
      navigate('/consultation/' + data.consultation._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join consultation');
    } finally {
      setJoiningId(null);
    }
  };

  const upcoming = appointments.filter(a =>
    ['pending', 'confirmed', 'ongoing'].includes(a.status)
  );
  const past = appointments.filter(a =>
    ['completed', 'cancelled'].includes(a.status)
  );

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', fontFamily: "'Cinzel', serif" }}>
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted">Manage your consultations and birth charts</p>
          </div>
          <Link to="/astrologers" className="btn btn-primary">Book Consultation</Link>
        </div>

        {/* Stats row */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          <div className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 22, color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <FiCalendar />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{appointments.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Total Consultations</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 22, color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <FiClock />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{upcoming.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Upcoming</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 22, color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <FiStar />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {past.filter(a => a.status === 'completed').length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Completed</div>
          </div>

          <Link to="/kundali" className="card" style={{ textAlign: 'center', padding: 20, textDecoration: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <FiCompass size={28} style={{ color: 'var(--primary)', marginBottom: 8 }} />
            <div style={{ fontSize: 28, fontWeight: 800 }}>View</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>My Kundali</div>
          </Link>
        </div>

        {/* Appointments list */}
        <div className="card">
          <div className="tab-bar">
            <button
              className={'tab ' + (activeTab === 'upcoming' ? 'active' : '')}
              onClick={() => setActiveTab('upcoming')}>
              Upcoming ({upcoming.length})
            </button>
            <button
              className={'tab ' + (activeTab === 'past' ? 'active' : '')}
              onClick={() => setActiveTab('past')}>
              Past ({past.length})
            </button>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {(activeTab === 'upcoming' ? upcoming : past).length === 0 ? (
                <div className="empty-state">
                  <FiCalendar size={36} />
                  <p>No {activeTab} appointments.</p>
                  <Link to="/astrologers" className="btn btn-primary mt-1">
                    Find Astrologers
                  </Link>
                </div>
              ) : (

                (activeTab === 'upcoming' ? upcoming : past).map(appt => (
                  <div key={appt._id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: 14, background: 'var(--bg)',
                    borderRadius: 10, border: '1px solid var(--border)',
                    flexWrap: 'wrap',
                  }}>

                    {/* Astrologer avatar */}
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                      {appt.astrologer?.user?.avatar
                        ? <img src={appt.astrologer.user.avatar} alt="" />
                        : appt.astrologer?.user?.name?.[0]}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <strong>{appt.astrologer?.user?.name}</strong>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span><FiCalendar style={{ verticalAlign: 'middle' }} /> {appt.date}</span>
                        <span><FiClock style={{ verticalAlign: 'middle' }} /> {appt.startTime}</span>
                        <span>{typeIcons[appt.type]} {appt.type}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className={'badge ' + STATUS_COLORS[appt.status]}>
                        {appt.status}
                      </span>

                      <Link to={'/appointments/' + appt._id}
                        className="btn btn-secondary"
                        style={{ padding: '6px 14px' }}>
                        View
                      </Link>

                      {/* JOIN button — only for confirmed or ongoing */}
                      {['confirmed', 'ongoing'].includes(appt.status) && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 14px' }}
                          disabled={joiningId === appt._id}
                          onClick={() => handleJoin(appt._id)}>
                          {joiningId === appt._id ? 'Joining...' : 'Join'}
                        </button>
                      )}

                      {/* PAY button — if not paid yet */}
                      {appt.paymentStatus === 'unpaid' && appt.status !== 'cancelled' && (
                        <Link to={'/payment/' + appt._id}
                          className="btn btn-primary"
                          style={{ padding: '6px 14px' }}>
                          Pay
                        </Link>
                      )}
                    </div>

                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}