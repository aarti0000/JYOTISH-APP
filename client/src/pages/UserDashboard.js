import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiClock, FiVideo, FiMessageCircle, FiPhone, FiStar } from 'react-icons/fi';
import './Dashboard.css';
import './AstrologerList.css';

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-green',
  completed: 'badge-purple', cancelled: 'badge-red',
  ongoing: 'badge-green',
};

const typeIcons = { chat: <FiMessageCircle />, video: <FiVideo />, call: <FiPhone /> };

export default function UserDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    api.get('/appointments').then(r => setAppointments(r.data.appointments || []))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const past = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Welcome, {user?.name?.split(' ')[0]} 🙏</h1>
            <p className="text-muted">Manage your consultations and birth charts</p>
          </div>
          <Link to="/astrologers" className="btn btn-primary">Book Consultation</Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: 'Total Consultations', value: appointments.length, icon: <FiCalendar /> },
            { label: 'Upcoming', value: upcoming.length, icon: <FiClock /> },
            { label: 'Completed', value: past.filter(a => a.status === 'completed').length, icon: <FiStar /> },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div className="stat-icon">{item.icon}</div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
          <Link to="/kundali" className="stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="stat-icon">🔮</div>
            <div className="stat-value">View</div>
            <div className="stat-label">My Kundali</div>
          </Link>
        </div>

        {/* Appointments */}
        <div className="card">
          <div className="tab-bar">
            <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}>
              Upcoming ({upcoming.length})
            </button>
            <button className={`tab ${activeTab === 'past' ? 'active' : ''}`}
              onClick={() => setActiveTab('past')}>
              Past ({past.length})
            </button>
          </div>

          {loading ? <div className="spinner" /> : (
            <div className="appt-list">
              {(activeTab === 'upcoming' ? upcoming : past).length === 0 ? (
                <div className="empty-state">
                  <FiCalendar size={36} />
                  <p>No {activeTab} appointments.</p>
                  <Link to="/astrologers" className="btn btn-primary mt-1">Find Astrologers</Link>
                </div>
              ) : (activeTab === 'upcoming' ? upcoming : past).map(appt => (
                <div key={appt._id} className="appt-item">
                  <div className="appt-avatar">
                    <div className="avatar" style={{ width: 44, height: 44, fontSize: 15 }}>
                      {appt.astrologer?.user?.avatar
                        ? <img src={appt.astrologer.user.avatar} alt="" />
                        : appt.astrologer?.user?.name?.[0]}
                    </div>
                  </div>
                  <div className="appt-info">
                    <strong>{appt.astrologer?.user?.name}</strong>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                      <span><FiCalendar style={{ verticalAlign: 'middle' }} /> {appt.date}</span>
                      <span><FiClock style={{ verticalAlign: 'middle' }} /> {appt.startTime}</span>
                      <span>{typeIcons[appt.type]} {appt.type}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`badge ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
                    <Link to={`/appointments/${appt._id}`} className="btn btn-secondary" style={{ padding: '6px 14px' }}>
                      View
                    </Link>
                    {appt.status === 'confirmed' && (
                      <Link to={`/consultation/${appt.consultation || appt._id}`}
                        className="btn btn-primary" style={{ padding: '6px 14px' }}>
                        Join
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
