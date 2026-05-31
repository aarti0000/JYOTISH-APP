import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiStar, FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiLayout, FiCompass, FiMoon } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav className="navbar">
      <div className="container flex-between" style={{ height: '100%' }}>

        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <FiStar className="brand-icon" />
          <span>Astro<strong>Connect</strong></span>
        </Link>

        {/* Nav links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/astrologers" onClick={() => setMenuOpen(false)}>
            Find Astrologers
          </Link>
          <Link to="/calendar" onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiCalendar /> Calendar
          </Link>
          <Link to="/horoscope" onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <FiMoon /> Daily Horoscope
          </Link>
          {user && (
            <Link to="/kundali" onClick={() => setMenuOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FiCompass /> Kundali
            </Link>
          )}
          {!user && (
            <Link to="/register?role=astrologer" onClick={() => setMenuOpen(false)}>
              Join as Astrologer
            </Link>
          )}
        </div>

        {/* Right side — user menu or login buttons */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <button className="user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : initials}
                </div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </button>

              {dropdownOpen && (
                <div className="dropdown">
                  <Link
                    to={user.role === 'astrologer' ? '/astrologer/dashboard' : '/dashboard'}
                    onClick={() => setDropdownOpen(false)}>
                    <FiLayout /> Dashboard
                  </Link>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                    <FiUser /> Profile
                  </Link>
                  {user.role === 'user' && (
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}>
                      <FiCalendar /> My Appointments
                    </Link>
                  )}
                  {user.role === 'user' && (
                    <Link to="/kundali" onClick={() => setDropdownOpen(false)}>
                      <FiCompass /> My Kundali
                    </Link>
                  )}
                  <Link to="/horoscope" onClick={() => setDropdownOpen(false)}>
                    <FiMoon /> Daily Horoscope
                  </Link>
                  <button onClick={handleLogout}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline" style={{ padding: '8px 16px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                Sign Up
              </Link>
            </div>
          )}

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>

      </div>
    </nav>
  );
}