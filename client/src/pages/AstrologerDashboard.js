import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiToggleLeft, FiToggleRight, FiPlus, FiUsers, FiStar } from 'react-icons/fi';
import './Dashboard.css';
import './AstrologerList.css';

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-green',
  completed: 'badge-purple', cancelled: 'badge-red', ongoing: 'badge-green',
};

export default function AstrologerDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [slotForm, setSlotForm] = useState({ date: '', startTime: '', endTime: '' });
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    api.get('/astrologers/my-profile').then(r => {
      setProfile(r.data.astrologer);
      setIsOnline(r.data.astrologer.isOnline);
    }).catch(() => {});
    api.get('/appointments/astrologer').then(r => setAppointments(r.data.appointments || []));
  }, []);

  const toggleOnline = async () => {
    try {
      const { data } = await api.put('/astrologers/online-status', { isOnline: !isOnline });
      setIsOnline(data.isOnline);
      toast.success(data.isOnline ? 'You are now online' : 'You are now offline');
    } catch { toast.error('Failed to update status'); }
  };

  const addSlot = async () => {
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) return toast.error('Fill all slot fields');
    try {
      await api.post('/astrologers/slots', { slots: [slotForm] });
      toast.success('Slot added!');
      setSlotForm({ date: '', startTime: '', endTime: '' });
    } catch { toast.error('Failed to add slot'); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcoming = appointments.filter(a => ['confirmed', 'pending'].includes(a.status) && a.date >= today);

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Astrologer Dashboard ✨</h1>
            <p className="text-muted">Hello, {user?.name?.split(' ')[0]}</p>
          </div>
          <button className={`btn ${isOnline ? 'btn-primary' : 'btn-outline'}`} onClick={toggleOnline}>
            {isOnline ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { label: "Today's Appointments", value: todayAppts.length, icon: <FiCalendar /> },
            { label: 'Upcoming', value: upcoming.length, icon: <FiUsers /> },
            { label: 'Total Consultations', value: profile?.totalConsultations || 0, icon: <FiStar /> },
            { label: 'Rating', value: profile?.rating?.toFixed(1) || '0.0', icon: '⭐' },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div className="stat-icon">{item.icon}</div>
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Add Slot */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontWeight: 700 }}>
              <FiPlus style={{ marginRight: 6 }} />Add Available Slot
            </h3>
            <div className="form-group">
              <label>Date</label>
              <input className="input" type="date" min={today}
                value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Start Time</label>
                <input className="input" type="time" value={slotForm.startTime}
                  onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input className="input" type="time" value={slotForm.endTime}
                  onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={addSlot}>Add Slot</button>
          </div>

          {/* Profile quick view */}
          {profile && (
            <div className="card">
              <h3 style={{ marginBottom: 16, fontWeight: 700 }}>Profile Overview</h3>
              {[
                ['Specializations', profile.specializations?.join(', ')],
                ['Languages', profile.languages?.join(', ')],
                ['Price/min', `₹${profile.pricePerMinute}`],
                ['Consultation types', profile.consultationTypes?.join(', ')],
                ['Approved', profile.isApproved ? '✅ Yes' : '⏳ Pending'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 130 }}>{k}:</span>
                  <strong>{v || '—'}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments */}
        <div className="card mt-3">
          <div className="tab-bar">
            <button className={`tab ${activeTab === 'today' ? 'active' : ''}`} onClick={() => setActiveTab('today')}>Today ({todayAppts.length})</button>
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Appointments ({appointments.length})</button>
          </div>
          <div className="appt-list">
            {(activeTab === 'today' ? todayAppts : appointments).map(appt => (
              <div key={appt._id} className="appt-item">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
                  {appt.user?.avatar ? <img src={appt.user.avatar} alt="" /> : appt.user?.name?.[0]}
                </div>
                <div className="appt-info">
                  <strong>{appt.user?.name}</strong>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {appt.date} • {appt.startTime} • {appt.type} • ₹{appt.amount}
                  </div>
                </div>
                <span className={`badge ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
