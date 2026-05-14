import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiCamera, FiSave } from 'react-icons/fi';
import './AstrologerList.css';

const SPECIALIZATIONS = ['Vedic','Numerology','Tarot','Vastu','KP','Palmistry','Gemology','Prashna'];
const LANGUAGES = ['Hindi','English','Telugu','Tamil','Kannada','Malayalam','Marathi','Bengali','Gujarati'];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [personalForm, setPersonalForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    timeOfBirth: user?.timeOfBirth || '',
    placeOfBirth: user?.placeOfBirth || '',
    gender: user?.gender || '',
  });

  const [astroForm, setAstroForm] = useState({
    bio: '', experience: '', specializations: [],
    languages: [], pricePerMinute: 20, consultationTypes: [],
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  useEffect(() => {
    if (user?.role === 'astrologer') {
      api.get('/astrologers/my-profile').then(r => {
        const a = r.data.astrologer;
        setAstroForm({
          bio: a.bio || '',
          experience: a.experience || '',
          specializations: a.specializations || [],
          languages: a.languages || [],
          pricePerMinute: a.pricePerMinute || 20,
          consultationTypes: a.consultationTypes || [],
        });
      }).catch(() => {});
    }
  }, [user]);

  const savePersonal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', personalForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const saveAstro = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/astrologers/my-profile', astroForm);
      toast.success('Astrologer profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    setAvatarLoading(true);
    try {
      const { data } = await api.put('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to update avatar'); }
    finally { setAvatarLoading(false); }
  };

  const toggleArray = (arr, val, setFn, key) => {
    setFn(prev => ({
      ...prev,
      [key]: prev[key].includes(val)
        ? prev[key].filter(x => x !== val)
        : [...prev[key], val]
    }));
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 700 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>My Profile</h1>

        {/* Avatar */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <div className="avatar" style={{ width: 80, height: 80, fontSize: 26 }}>
                {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initials}
              </div>
              <label style={{
                position: 'absolute', bottom: 0, right: 0,
                background: 'var(--primary)', color: '#fff',
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #fff',
              }}>
                <FiCamera size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div>
              <h2 style={{ fontWeight: 700 }}>{user?.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</p>
              <span className="badge badge-purple" style={{ marginTop: 6, textTransform: 'capitalize' }}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar card" style={{ padding: '0 4px', marginBottom: 20 }}>
          {[
            ['personal', 'Personal Info'],
            ...(user?.role === 'astrologer' ? [['astrologer', 'Astrologer Profile']] : []),
            ['password', 'Password'],
          ].map(([key, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>

        {/* Personal Tab */}
        {tab === 'personal' && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>
              <FiUser style={{ marginRight: 6, verticalAlign: 'middle' }} />Personal Information
            </h3>
            <form onSubmit={savePersonal}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="input" value={personalForm.name}
                    onChange={e => setPersonalForm({ ...personalForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="input" value={personalForm.phone}
                    onChange={e => setPersonalForm({ ...personalForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input className="input" type="date" value={personalForm.dateOfBirth}
                    onChange={e => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Time of Birth</label>
                  <input className="input" type="time" value={personalForm.timeOfBirth}
                    onChange={e => setPersonalForm({ ...personalForm, timeOfBirth: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Place of Birth</label>
                <input className="input" value={personalForm.placeOfBirth}
                  onChange={e => setPersonalForm({ ...personalForm, placeOfBirth: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select className="input" value={personalForm.gender}
                  onChange={e => setPersonalForm({ ...personalForm, gender: e.target.value })}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Astrologer Tab */}
        {tab === 'astrologer' && user?.role === 'astrologer' && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Astrologer Profile</h3>
            <form onSubmit={saveAstro}>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="input" rows={4} value={astroForm.bio}
                  onChange={e => setAstroForm({ ...astroForm, bio: e.target.value })}
                  placeholder="Tell clients about yourself..."
                  style={{ resize: 'vertical' }} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Experience (years)</label>
                  <input className="input" type="number" value={astroForm.experience}
                    onChange={e => setAstroForm({ ...astroForm, experience: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Price per Minute (₹)</label>
                  <input className="input" type="number" value={astroForm.pricePerMinute}
                    onChange={e => setAstroForm({ ...astroForm, pricePerMinute: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label>Specializations</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {SPECIALIZATIONS.map(s => (
                    <button type="button" key={s}
                      className={`spec-btn ${astroForm.specializations.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleArray(astroForm, s, setAstroForm, 'specializations')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {LANGUAGES.map(l => (
                    <button type="button" key={l}
                      className={`spec-btn ${astroForm.languages.includes(l) ? 'active' : ''}`}
                      onClick={() => toggleArray(astroForm, l, setAstroForm, 'languages')}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Consultation Types</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {['chat', 'call', 'video'].map(t => (
                    <button type="button" key={t}
                      className={`spec-btn ${astroForm.consultationTypes.includes(t) ? 'active' : ''}`}
                      onClick={() => toggleArray(astroForm, t, setAstroForm, 'consultationTypes')}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                <FiSave /> {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
            <form onSubmit={changePassword}>
              {[
                ['currentPassword', 'Current Password'],
                ['newPassword', 'New Password'],
                ['confirmPassword', 'Confirm New Password'],
              ].map(([key, label]) => (
                <div className="form-group" key={key}>
                  <label>{label}</label>
                  <input className="input" type="password" value={passwordForm[key]}
                    onChange={e => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                    placeholder="••••••••" />
                </div>
              ))}
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
