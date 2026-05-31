import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiToggleLeft, FiToggleRight, FiUsers, FiStar, FiClock, FiX } from 'react-icons/fi';

const STATUS_COLORS = {
  pending: 'badge-yellow', confirmed: 'badge-green',
  completed: 'badge-purple', cancelled: 'badge-red', ongoing: 'badge-green',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AstrologerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]       = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isOnline, setIsOnline]     = useState(false);
  const [activeTab, setActiveTab]   = useState('today');
  const [joiningId, setJoiningId]   = useState(null);
  const [activeSection, setActiveSection] = useState('appointments'); // appointments | schedule

  // Working hours form
  const [workingHours, setWorkingHours] = useState({
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 60,
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri by default
  });
  const [savingHours, setSavingHours] = useState(false);

  // Block date
  const [blockDateInput, setBlockDateInput] = useState('');
  const [blockedDates, setBlockedDates]     = useState([]);

  // Preview slots
  const [previewSlots, setPreviewSlots] = useState([]);
  const [previewDate, setPreviewDate]   = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    api.get('/astrologers/my-profile').then(r => {
      const a = r.data.astrologer;
      setProfile(a);
      setIsOnline(a.isOnline);
      setBlockedDates(a.blockedDates || []);
      if (a.workingHours) setWorkingHours(a.workingHours);
    }).catch(() => {});

    api.get('/appointments/astrologer')
      .then(r => setAppointments(r.data.appointments || []))
      .catch(() => {});
  }, []);

  // Load preview slots when date or working hours change
  useEffect(() => {
    if (profile) {
      api.get('/astrologers/' + profile._id + '/slots?date=' + previewDate)
        .then(r => setPreviewSlots(r.data.slots || []))
        .catch(() => {});
    }
  }, [previewDate, profile, workingHours]);

  const toggleOnline = async () => {
    try {
      const { data } = await api.put('/astrologers/online-status', { isOnline: !isOnline });
      setIsOnline(data.isOnline);
      toast.success(data.isOnline ? 'You are now Online' : 'You are now Offline');
    } catch { toast.error('Failed to update status'); }
  };

  const saveWorkingHours = async () => {
    setSavingHours(true);
    try {
      await api.put('/astrologers/working-hours', workingHours);
      toast.success('Working hours saved! Slots auto-generate every day.');
    } catch { toast.error('Failed to save working hours'); }
    finally { setSavingHours(false); }
  };

  const toggleDay = (day) => {
    setWorkingHours(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day].sort(),
    }));
  };

  const addBlockDate = async () => {
    if (!blockDateInput) return;
    try {
      const { data } = await api.post('/astrologers/block-date', { date: blockDateInput });
      setBlockedDates(data.blockedDates);
      setBlockDateInput('');
      toast.success('Date blocked successfully');
    } catch { toast.error('Failed to block date'); }
  };

  const removeBlockDate = async (date) => {
    try {
      const { data } = await api.post('/astrologers/unblock-date', { date });
      setBlockedDates(data.blockedDates);
      toast.success('Date unblocked');
    } catch { toast.error('Failed to unblock date'); }
  };

  const handleJoin = async (appointmentId) => {
    setJoiningId(appointmentId);
    try {
      const { data } = await api.post('/consultations/start/' + appointmentId);
      navigate('/consultation/' + data.consultation._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally { setJoiningId(null); }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today);
  const upcoming   = appointments.filter(a => ['confirmed','pending'].includes(a.status) && a.date >= today);

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:28, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontSize:26, fontWeight:800, color: 'var(--text)', fontFamily: "'Cinzel', serif" }}>Astrologer Dashboard</h1>
            <p className="text-muted">Hello, {user?.name?.split(' ')[0]}</p>
          </div>
          <button className={'btn ' + (isOnline ? 'btn-primary' : 'btn-outline')} onClick={toggleOnline}>
            {isOnline ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:28 }}>
          {[
            { label:"Today's Appointments", value:todayAppts.length,              icon:<FiCalendar /> },
            { label:'Upcoming',             value:upcoming.length,                icon:<FiUsers /> },
            { label:'Total Consultations',  value:profile?.totalConsultations||0, icon:<FiStar /> },
            { label:'Rating',               value:profile?.rating?.toFixed(1)||'0.0', icon:<FiStar /> },
          ].map(item => (
            <div key={item.label} className="card" style={{ textAlign:'center', padding:20 }}>
              <div style={{ fontSize:22, color:'var(--primary)', display:'flex', justifyContent:'center', marginBottom:8 }}>
                {item.icon}
              </div>
              <div style={{ fontSize:28, fontWeight:800 }}>{item.value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        {/* Section tabs */}
        <div style={{ display:'flex', gap:10, marginBottom:24 }}>
          <button
            className={'btn ' + (activeSection==='appointments' ? 'btn-primary' : 'btn-secondary')}
            onClick={() => setActiveSection('appointments')}>
            <FiCalendar /> Appointments
          </button>
          <button
            className={'btn ' + (activeSection==='schedule' ? 'btn-primary' : 'btn-secondary')}
            onClick={() => setActiveSection('schedule')}>
            <FiClock /> Manage Schedule
          </button>
        </div>

        {/* ── APPOINTMENTS SECTION ───────────────────────────────── */}
        {activeSection === 'appointments' && (
          <div className="card">
            <div className="tab-bar">
              <button className={'tab ' + (activeTab==='today'?'active':'')} onClick={()=>setActiveTab('today')}>
                Today ({todayAppts.length})
              </button>
              <button className={'tab ' + (activeTab==='all'?'active':'')} onClick={()=>setActiveTab('all')}>
                All ({appointments.length})
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {(activeTab==='today' ? todayAppts : appointments).length === 0 ? (
                <div className="empty-state">
                  <FiCalendar size={36} />
                  <p>No appointments {activeTab==='today' ? 'today' : 'yet'}.</p>
                </div>
              ) : (
                (activeTab==='today' ? todayAppts : appointments).map(appt => (
                  <div key={appt._id} style={{ display:'flex', alignItems:'center', gap:14,
                    padding:14, background:'var(--bg)', borderRadius:10,
                    border:'1px solid var(--border)', flexWrap:'wrap' }}>
                    <div className="avatar" style={{ width:40, height:40, fontSize:14 }}>
                      {appt.user?.avatar ? <img src={appt.user.avatar} alt="" /> : appt.user?.name?.[0]}
                    </div>
                    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
                      <strong>{appt.user?.name}</strong>
                      <div style={{ fontSize:13, color:'var(--text-muted)' }}>
                        {appt.date} • {appt.startTime}–{appt.endTime} • {appt.type} • Rs. {appt.amount}
                      </div>
                      {appt.question && (
                        <div style={{ fontSize:12, color:'var(--text-muted)', fontStyle:'italic' }}>
                          "{appt.question}"
                        </div>
                      )}
                    </div>
                    <span className={'badge ' + STATUS_COLORS[appt.status]}>{appt.status}</span>
                    {['confirmed','ongoing'].includes(appt.status) && (
                      <button className="btn btn-primary" style={{ padding:'6px 14px' }}
                        disabled={joiningId===appt._id}
                        onClick={() => handleJoin(appt._id)}>
                        {joiningId===appt._id ? 'Joining...' : 'Join'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── SCHEDULE SECTION ───────────────────────────────────── */}
        {activeSection === 'schedule' && (
          <div className="grid-2" style={{ alignItems:'start', gap:24 }}>

            {/* Left — Working hours settings */}
            <div>
              <div className="card" style={{ marginBottom:20 }}>
                <h3 style={{ fontWeight:700, marginBottom:4 }}>
                  <FiClock style={{ marginRight:6, verticalAlign:'middle' }} />
                  Working Hours
                </h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
                  Set once — slots auto-generate every day based on these hours
                </p>

                <div className="grid-2">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input className="input" type="time"
                      value={workingHours.startTime}
                      onChange={e => setWorkingHours({ ...workingHours, startTime: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input className="input" type="time"
                      value={workingHours.endTime}
                      onChange={e => setWorkingHours({ ...workingHours, endTime: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Slot Duration</label>
                  <select className="input" value={workingHours.slotDuration}
                    onChange={e => setWorkingHours({ ...workingHours, slotDuration: Number(e.target.value) })}>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Working Days</label>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
                    {DAYS.map((day, i) => (
                      <button key={day} type="button"
                        onClick={() => toggleDay(i)}
                        style={{
                          padding:'8px 14px', borderRadius:8, border:'1.5px solid',
                          fontWeight:600, fontSize:13, cursor:'pointer',
                          borderColor: workingHours.workingDays.includes(i) ? 'var(--primary)' : 'rgba(157, 78, 221, 0.15)',
                          background: workingHours.workingDays.includes(i) ? 'var(--primary)' : 'rgba(255,255,255,0.03)',
                          color: workingHours.workingDays.includes(i) ? '#fff' : 'var(--text-muted)',
                        }}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" onClick={saveWorkingHours} disabled={savingHours}>
                  {savingHours ? 'Saving...' : 'Save Working Hours'}
                </button>
              </div>

              {/* Block dates */}
              <div className="card">
                <h3 style={{ fontWeight:700, marginBottom:4 }}>Block Dates</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
                  Block specific dates — holidays, days off, etc.
                </p>

                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  <input className="input" type="date" min={today}
                    value={blockDateInput}
                    onChange={e => setBlockDateInput(e.target.value)}
                    style={{ flex:1 }} />
                  <button className="btn btn-danger" onClick={addBlockDate}>
                    Block
                  </button>
                </div>

                {blockedDates.length === 0 ? (
                  <p style={{ fontSize:13, color:'var(--text-muted)' }}>No dates blocked</p>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {blockedDates.sort().map(date => (
                      <div key={date} style={{ display:'flex', alignItems:'center',
                        justifyContent:'space-between', padding:'8px 12px',
                        background:'rgba(255, 77, 109, 0.12)', borderRadius:8, border:'1px solid rgba(255, 77, 109, 0.25)' }}>
                        <span style={{ fontSize:14, fontWeight:600, color:'var(--danger)' }}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}
                        </span>
                        <button onClick={() => removeBlockDate(date)}
                          style={{ background:'none', border:'none', cursor:'pointer',
                            color:'#ff4d6d', fontSize:18, display:'flex', alignItems:'center' }}>
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Slot preview */}
            <div className="card">
              <h3 style={{ fontWeight:700, marginBottom:4 }}>Slot Preview</h3>
              <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>
                See how your slots look on any date
              </p>

              <div className="form-group">
                <label>Select Date to Preview</label>
                <input className="input" type="date" min={today}
                  value={previewDate}
                  onChange={e => setPreviewDate(e.target.value)} />
              </div>

              {previewSlots.length === 0 ? (
                <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text-muted)' }}>
                  <FiCalendar size={32} style={{ color:'var(--primary)', marginBottom:8 }} />
                  <p style={{ fontSize:14 }}>
                    No slots on this date.<br />
                    <span style={{ fontSize:12 }}>
                      Either not a working day or date is blocked.
                    </span>
                  </p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:4 }}>
                    {previewSlots.length} slots available on {previewDate}
                  </p>
                  {previewSlots.map((slot, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'10px 14px', borderRadius:8, border:'1.5px solid',
                      borderColor: slot.isBooked ? 'rgba(255, 77, 109, 0.25)' : 'rgba(56, 176, 0, 0.25)',
                      background: slot.isBooked ? 'rgba(255, 77, 109, 0.08)' : 'rgba(56, 176, 0, 0.08)',
                    }}>
                      <span style={{ fontWeight:600, fontSize:14,
                        color: slot.isBooked ? 'var(--danger)' : 'var(--success)' }}>
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span style={{ fontSize:12, fontWeight:700,
                        color: slot.isBooked ? 'var(--danger)' : 'var(--success)' }}>
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}