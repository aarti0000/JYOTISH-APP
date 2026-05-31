import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const ELEMENT_COLORS = {
  Fire:  { bg: '#fff7ed', border: '#fed7aa', color: '#c2410c', icon: '🔥' },
  Earth: { bg: '#f0fdf4', border: '#bbf7d0', color: '#15803d', icon: '🌍' },
  Air:   { bg: '#eff6ff', border: '#bfdbfe', color: '#1d4ed8', icon: '💨' },
  Water: { bg: '#f0f9ff', border: '#bae6fd', color: '#0369a1', icon: '💧' },
};

export default function HoroscopePage() {
  const [horoscopes, setHoroscopes] = useState([]);
  const [selected, setSelected]     = useState(null);
  const [loading, setLoading]       = useState(true);
  const [today, setToday]           = useState('');

  useEffect(() => {
    api.get('/horoscope/daily')
      .then(r => {
        setHoroscopes(r.data.horoscopes);
        setToday(r.data.date);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>🔮</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
            Daily Horoscope
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            {new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
            Click on your zodiac sign to read your full horoscope
          </p>
        </div>

        {/* Zodiac grid */}
        <div className="grid-4" style={{ marginBottom: 36 }}>
          {horoscopes.map((h, i) => {
            const el = ELEMENT_COLORS[h.element];
            const isSelected = selected?.name === h.name;
            return (
              <div key={h.name}
                onClick={() => setSelected(isSelected ? null : h)}
                style={{
                  background: isSelected ? 'var(--primary)' : el.bg,
                  border: '2px solid ' + (isSelected ? 'var(--primary)' : el.border),
                  borderRadius: 14, padding: '20px 16px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  boxShadow: isSelected ? '0 8px 24px rgba(124,58,237,0.3)' : 'var(--shadow)',
                }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{h.emoji}</div>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{h.symbol}</div>
                <div style={{ fontWeight: 700, fontSize: 15,
                  color: isSelected ? '#fff' : 'var(--text)' }}>
                  {h.name}
                </div>
                <div style={{ fontSize: 11, marginTop: 2,
                  color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                  {h.dates}
                </div>
                <div style={{ marginTop: 8, fontSize: 13,
                  color: isSelected ? 'rgba(255,255,255,0.9)' : el.color }}>
                  {h.rating}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed horoscope panel */}
        {selected && (
          <div className="card" style={{
            border: '2px solid var(--primary-light)',
            background: 'linear-gradient(135deg, #faf9ff 0%, #ede9fe 100%)',
            marginBottom: 32,
          }}>
            {/* Sign header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20,
              marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 64 }}>{selected.emoji}</div>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>
                  {selected.symbol} {selected.name}
                </h2>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="badge badge-purple">{selected.dates}</span>
                  <span className="badge badge-purple">
                    {ELEMENT_COLORS[selected.element].icon} {selected.element}
                  </span>
                  <span className="badge badge-purple">Ruling: {selected.ruling}</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{selected.rating}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Today's Rating</div>
              </div>
            </div>

            {/* Main description */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20,
              border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text)' }}>
                {selected.description}
              </p>
            </div>

            {/* 3 columns — love, career, health */}
            <div className="grid-3" style={{ marginBottom: 20 }}>
              {[
                { icon: '❤️', title: 'Love & Relationships', text: selected.love,   bg: '#fff0f3' },
                { icon: '💼', title: 'Career & Finance',      text: selected.career, bg: '#f0f9ff' },
                { icon: '🌿', title: 'Health & Wellness',     text: selected.health, bg: '#f0fdf4' },
              ].map(card => (
                <div key={card.title} style={{ background: card.bg, borderRadius: 12,
                  padding: 16, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{card.icon}</div>
                  <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8,
                    color: 'var(--primary)' }}>{card.title}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)' }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Lucky details */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Lucky Numbers',      value: selected.luckyNumber, icon: '🔢' },
                { label: 'Lucky Color',        value: selected.luckyColor,  icon: '🎨' },
                { label: 'Mood',               value: selected.mood,        icon: '😊' },
                { label: 'Best Compatible',    value: selected.compatibility, icon: '💑' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, minWidth: 140, background: '#fff',
                  borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)',
                  textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Close button */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* All signs quick view */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Quick Overview — All Signs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {horoscopes.map(h => {
              const el = ELEMENT_COLORS[h.element];
              return (
                <div key={h.name}
                  onClick={() => setSelected(h)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                    background: el.bg, border: '1.5px solid ' + el.border,
                    transition: 'transform 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{h.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 4, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 15 }}>{h.symbol} {h.name}</strong>
                      <span style={{ fontSize: 12, color: el.color }}>
                        {el.icon} {h.element}
                      </span>
                      <span style={{ fontSize: 12 }}>{h.rating}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {h.description}
                    </p>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                    🎨 {h.luckyColor}<br />
                    🔢 {h.luckyNumber}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}