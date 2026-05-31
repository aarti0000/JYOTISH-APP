import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  FiMoon, FiZap, FiGlobe, FiWind, FiDroplet,
  FiHeart, FiBriefcase, FiActivity, FiHash, FiSmile, FiUsers
} from 'react-icons/fi';
import {
  TbZodiacAries,
  TbZodiacTaurus,
  TbZodiacGemini,
  TbZodiacCancer,
  TbZodiacLeo,
  TbZodiacVirgo,
  TbZodiacLibra,
  TbZodiacScorpio,
  TbZodiacSagittarius,
  TbZodiacCapricorn,
  TbZodiacAquarius,
  TbZodiacPisces
} from 'react-icons/tb';

const ZODIAC_ICONS = {
  Aries: TbZodiacAries,
  Taurus: TbZodiacTaurus,
  Gemini: TbZodiacGemini,
  Cancer: TbZodiacCancer,
  Leo: TbZodiacLeo,
  Virgo: TbZodiacVirgo,
  Libra: TbZodiacLibra,
  Scorpio: TbZodiacScorpio,
  Sagittarius: TbZodiacSagittarius,
  Capricorn: TbZodiacCapricorn,
  Aquarius: TbZodiacAquarius,
  Pisces: TbZodiacPisces,
};

const ELEMENT_COLORS = {
  Fire:  { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', color: '#ff758f' },
  Earth: { bg: 'rgba(255, 158, 0, 0.1)', border: 'rgba(255, 158, 0, 0.25)', color: '#ffb703' },
  Air:   { bg: 'rgba(157, 78, 221, 0.1)', border: 'rgba(157, 78, 221, 0.25)', color: '#c8b6ff' },
  Water: { bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.25)', color: '#22d3ee' },
};

const ELEMENT_ICONS = {
  Fire: <FiZap />,
  Earth: <FiGlobe />,
  Air: <FiWind />,
  Water: <FiDroplet />
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <FiMoon size={56} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))', marginBottom: 16 }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#fff', marginBottom: 8, fontFamily: "'Cinzel', serif" }}>
            Daily Horoscope
          </h1>
          {today && (
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              {new Date(today + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 6 }}>
            Select your zodiac sign to read your full horoscope
          </p>
        </div>

        {/* Zodiac grid */}
        <div className="grid-4 zodiac-grid" style={{ marginBottom: 40 }}>
          {horoscopes.map((h) => {
            const el = ELEMENT_COLORS[h.element];
            const isSelected = selected?.name === h.name;
            return (
              <div key={h.name}
                onClick={() => setSelected(isSelected ? null : h)}
                style={{
                  background: isSelected ? 'var(--primary)' : el.bg,
                  border: '1.5px solid ' + (isSelected ? 'var(--primary)' : el.border),
                  borderRadius: 14, padding: '24px 16px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.25s ease',
                  transform: isSelected ? 'translateY(-6px)' : 'none',
                  boxShadow: isSelected ? 'var(--glow)' : 'var(--shadow)',
                }}
                onMouseEnter={e => {
                  if(!isSelected) e.currentTarget.style.borderColor = 'var(--primary)';
                }}
                onMouseLeave={e => {
                  if(!isSelected) e.currentTarget.style.borderColor = el.border;
                }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  {(() => {
                    const Icon = ZODIAC_ICONS[h.name];
                    return Icon ? <Icon size={44} style={{ color: isSelected ? '#fff' : el.color }} /> : null;
                  })()}
                </div>
                <div style={{ fontSize: 18, marginBottom: 4, fontWeight: 600, color: isSelected ? '#fff' : '#c8b6ff' }}>{h.symbol}</div>
                <div style={{ fontWeight: 800, fontSize: 16,
                  color: isSelected ? '#fff' : 'var(--text)', fontFamily: "'Cinzel', serif" }}>
                  {h.name}
                </div>
                <div style={{ fontSize: 11, marginTop: 4,
                  color: isSelected ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>
                  {h.dates}
                </div>
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700,
                  color: isSelected ? 'rgba(255,255,255,0.95)' : el.color }}>
                  Rating: {h.rating}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed horoscope panel */}
        {selected && (
          <div className="card" style={{
            border: '1.5px solid var(--primary)',
            background: 'rgba(21, 14, 40, 0.85)',
            marginBottom: 40,
            boxShadow: 'var(--glow)',
          }}>
            {/* Sign header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24,
              marginBottom: 24, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(157, 78, 221, 0.15)', border: '1px solid rgba(157, 78, 221, 0.25)', borderRadius: 16, width: 72, height: 72, color: 'var(--primary)' }}>
                {(() => {
                  const Icon = ZODIAC_ICONS[selected.name];
                  return Icon ? <Icon size={48} /> : null;
                })()}
              </div>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6, fontFamily: "'Cinzel', serif" }}>
                  {selected.symbol} {selected.name}
                </h2>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span className="badge badge-purple">{selected.dates}</span>
                  <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {ELEMENT_ICONS[selected.element]} {selected.element}
                  </span>
                  <span className="badge badge-purple">Ruling: {selected.ruling}</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'center', background: 'rgba(157, 78, 221, 0.15)', padding: '10px 18px', borderRadius: 12, border: '1px solid rgba(157, 78, 221, 0.25)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--secondary)' }}>{selected.rating}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily Rating</div>
              </div>
            </div>

            {/* Main description */}
            <div style={{ background: 'rgba(9, 5, 20, 0.5)', borderRadius: 12, padding: 24, marginBottom: 24,
              border: '1px solid rgba(157, 78, 221, 0.15)' }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text)' }}>
                {selected.description}
              </p>
            </div>

            {/* 3 columns — love, career, health */}
            <div className="grid-3" style={{ marginBottom: 24 }}>
              {[
                { icon: <FiHeart />, title: 'Love & Relationships', text: selected.love,   bg: 'rgba(255, 77, 109, 0.08)', border: 'rgba(255, 77, 109, 0.2)', color: '#ff758f' },
                { icon: <FiBriefcase />, title: 'Career & Finance',      text: selected.career, bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' },
                { icon: <FiActivity />, title: 'Health & Wellness',     text: selected.health, bg: 'rgba(56, 176, 0, 0.08)', border: 'rgba(56, 176, 0, 0.2)', color: '#70e000' },
              ].map(card => (
                <div key={card.title} style={{ background: card.bg, borderRadius: 12,
                  padding: 20, border: '1px solid ' + card.border }}>
                  <div style={{ fontSize: 24, marginBottom: 12, color: card.color }}>{card.icon}</div>
                  <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10,
                    color: '#fff', fontFamily: "'Outfit', sans-serif" }}>{card.title}</h4>
                  <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-muted)' }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Lucky details */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Lucky Numbers',      value: selected.luckyNumber, icon: <FiHash /> },
                { label: 'Lucky Color',        value: selected.luckyColor,  icon: <FiDroplet /> },
                { label: 'Mood',               value: selected.mood,        icon: <FiSmile /> },
                { label: 'Best Compatible',    value: selected.compatibility, icon: <FiUsers /> },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, minWidth: 140, background: 'rgba(9, 5, 20, 0.5)',
                  borderRadius: 10, padding: '16px', border: '1px solid rgba(157, 78, 221, 0.15)',
                  textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 8, color: 'var(--primary)' }}>{item.icon}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {item.label}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Close button */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* All signs quick view */}
        <div className="card">
          <h3 style={{ fontWeight: 800, marginBottom: 20, color: '#fff', fontFamily: "'Cinzel', serif" }}>Today's Quick Overview — All Signs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {horoscopes.map(h => {
              const el = ELEMENT_COLORS[h.element];
              return (
                <div key={h.name}
                  onClick={() => setSelected(h)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 16,
                    padding: '16px', borderRadius: 12, cursor: 'pointer',
                    background: el.bg, border: '1px solid ' + el.border,
                    transition: 'transform 0.2s ease' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = el.border;
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid ' + el.border, borderRadius: 12, width: 48, height: 48, flexShrink: 0, color: el.color }}>
                    {(() => {
                      const Icon = ZODIAC_ICONS[h.name];
                      return Icon ? <Icon size={28} /> : null;
                    })()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10,
                      marginBottom: 6, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 16, color: '#fff', fontFamily: "'Cinzel', serif" }}>{h.symbol} {h.name}</strong>
                      <span style={{ fontSize: 12, color: el.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {ELEMENT_ICONS[h.element]} {h.element}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 700 }}>Rating: {h.rating}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                      {h.description}
                    </p>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right', lineHeight: 1.7 }}>
                    Color: <span style={{ color: '#fff', fontWeight: 600 }}>{h.luckyColor}</span><br />
                    No: <span style={{ color: '#fff', fontWeight: 600 }}>{h.luckyNumber}</span>
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