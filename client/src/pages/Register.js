import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiStar } from 'react-icons/fi';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: params.get('role') || 'user',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created! Welcome to JyotishApp ✨');
      navigate(user.role === 'astrologer' ? '/astrologer/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <FiStar style={{ color: '#f59e0b', fontSize: 28 }} />
          <h1>Create Account</h1>
          <p>Join JyotishApp for astrology guidance</p>
        </div>

        {/* Role toggle */}
        <div className="role-toggle">
          {['user', 'astrologer'].map(r => (
            <button key={r} type="button"
              className={`role-btn ${form.role === r ? 'active' : ''}`}
              onClick={() => setForm({ ...form, role: r })}>
              {r === 'user' ? '🙏 I am a User' : '⭐ I am an Astrologer'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrap">
              <FiUser className="input-icon" />
              <input className="input" type="text" placeholder="Ramesh Kumar"
                value={form.name} onChange={set('name')} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <FiMail className="input-icon" />
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-wrap">
              <FiPhone className="input-icon" />
              <input className="input" type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <FiLock className="input-icon" />
              <input className="input" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={set('password')} required />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
}
