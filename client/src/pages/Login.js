import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiStar } from 'react-icons/fi';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'astrologer' ? '/astrologer/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">
          <FiStar style={{ color: 'var(--primary)', fontSize: 28, filter: 'drop-shadow(0 0 5px var(--primary))' }} />
          <h1>Welcome Back</h1>
          <p>Sign in to your AstroConnect account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <FiMail className="input-icon" />
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap">
              <FiLock className="input-icon" />
              <input className="input" type="password" placeholder="Enter your password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
