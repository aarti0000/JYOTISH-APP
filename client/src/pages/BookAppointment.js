import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

export default function BookAppointment() {
  const { astrologerId } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [astrologer, setAstrologer] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: params.get('type') || 'chat',
    question: '',
    name: user?.name || '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    gender: '',
  });

  useEffect(() => {
    api.get(`/astrologers/${astrologerId}`).then(r => setAstrologer(r.data.astrologer));
  }, [astrologerId]);

  useEffect(() => {
    if (selectedDate) {
      api.get(`/astrologers/${astrologerId}/slots?date=${selectedDate}`)
        .then(r => setSlots(r.data.slots || []));
    }
  }, [selectedDate, astrologerId]);

  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot');
    if (!form.dateOfBirth) return toast.error('Please enter your date of birth');
    setLoading(true);
    try {
      const duration = 30; // default 30 min
      const { data } = await api.post('/appointments', {
        astrologerId,
        date: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        duration,
        type: form.type,
        question: form.question,
        userBirthDetails: {
          name: form.name,
          dateOfBirth: form.dateOfBirth,
          timeOfBirth: form.timeOfBirth,
          placeOfBirth: form.placeOfBirth,
          gender: form.gender,
        },
        amount: astrologer.pricePerMinute * duration,
      });
      toast.success('Appointment created! Proceeding to payment...');
      navigate(`/payment/${data.appointment._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!astrologer) return <div className="spinner" />;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Book Consultation</h1>
        <p className="text-muted mb-2">with {astrologer.user?.name} — Rs. {astrologer.pricePerMinute}/min</p>

        {/* Consultation type */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12, fontWeight: 700 }}>Consultation Type</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            {astrologer.consultationTypes?.map(t => (
              <button key={t}
                className={`btn ${form.type === t ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setForm({ ...form, type: t })}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Slot */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12, fontWeight: 700 }}>
            <FiCalendar style={{ marginRight: 6 }} />Select Date & Time
          </h3>
          <div className="form-group">
            <label>Date</label>
            <input className="input" type="date" min={today}
              value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(null); }} />
          </div>
          {selectedDate && (
            slots.length === 0 ? (
              <p className="text-muted">No available slots on this date.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {slots.map(slot => (
                  <button key={slot._id}
                    className={`btn ${selectedSlot?._id === slot._id ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setSelectedSlot(slot)}>
                    <FiClock /> {slot.startTime} – {slot.endTime}
                  </button>
                ))}
              </div>
            )
          )}
        </div>

        {/* Birth details */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12, fontWeight: 700 }}>
            <FiUser style={{ marginRight: 6 }} />Your Birth Details
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name</label>
              <input className="input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth *</label>
              <input className="input" type="date" value={form.dateOfBirth}
                onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Time of Birth</label>
              <input className="input" type="time" value={form.timeOfBirth}
                onChange={e => setForm({ ...form, timeOfBirth: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Place of Birth</label>
            <input className="input" value={form.placeOfBirth}
              onChange={e => setForm({ ...form, placeOfBirth: e.target.value })} placeholder="City, Country" />
          </div>
          <div className="form-group">
            <label>Your Question / Concern</label>
            <textarea className="input" rows={3} value={form.question}
              onChange={e => setForm({ ...form, question: e.target.value })}
              placeholder="What would you like to discuss?" style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Summary */}
        {selectedSlot && (
          <div className="card" style={{ marginBottom: 20, background: 'var(--primary-light)' }}>
            <div className="flex-between">
              <div>
                <strong>Session Summary</strong>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {selectedSlot.date} at {selectedSlot.startTime} — {form.type} — 30 mins
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ fontSize: 20, color: 'var(--primary)' }}>
                  Rs. {astrologer.pricePerMinute * 30}
                </strong>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</div>
              </div>
            </div>
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }}
          onClick={handleBook} disabled={loading || !selectedSlot}>
          {loading ? 'Booking...' : 'Confirm & Proceed to Payment →'}
        </button>
      </div>
    </div>
  );
}
