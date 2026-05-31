import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FiUsers, FiUser, FiLock, FiAlertTriangle,
  FiSliders, FiRefreshCw, FiHeart, FiCompass, FiCalendar
} from 'react-icons/fi';

const SCORE_COLOR = (score, max) => {
  const pct = score / max;
  if (pct >= 0.8) return '#70e000';
  if (pct >= 0.6) return '#38b000';
  if (pct >= 0.5) return '#aacc00';
  if (pct >= 0.4) return '#ffb703';
  if (pct >= 0.3) return '#ff9f1c';
  return '#ff4d6d';
};

const STATUS_STYLE = {
  good:    { bg: 'rgba(56, 176, 0, 0.08)', color: '#70e000', border: 'rgba(56, 176, 0, 0.25)' },
  average: { bg: 'rgba(255, 158, 0, 0.08)', color: '#ffb703', border: 'rgba(255, 158, 0, 0.25)' },
  bad:     { bg: 'rgba(255, 77, 109, 0.08)', color: '#ff758f', border: 'rgba(255, 77, 109, 0.25)' },
};

function FormSection({ title, prefix, form, setForm }) {
  const set = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="card" style={{ borderColor: prefix === 'boy' ? 'rgba(14, 165, 233, 0.25)' : 'rgba(236, 72, 153, 0.25)' }}>
      <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 20,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        color: prefix === 'boy' ? '#38bdf8' : '#f472b6', fontFamily: "'Cinzel', serif" }}>
        <FiUser /> {title}
      </h3>

      <div className="form-group">
        <label>Full Name *</label>
        <input className="input" placeholder="Enter full name"
          value={form.name}
          onChange={set('name')} />
      </div>

      <div className="form-group">
        <label>Date of Birth *</label>
        <input className="input" type="date"
          value={form.dateOfBirth}
          onChange={set('dateOfBirth')} />
      </div>

      <div className="form-group">
        <label>Time of Birth</label>
        <input className="input" type="time"
          value={form.timeOfBirth}
          onChange={set('timeOfBirth')} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          More accurate results with exact birth time
        </span>
      </div>

      <div className="form-group">
        <label>Place of Birth</label>
        <input className="input" placeholder="City, Country"
          value={form.placeOfBirth}
          onChange={set('placeOfBirth')} />
      </div>
    </div>
  );
}

export default function MarriageMatchingPage() {
  const { user } = useAuth();

  const [boyForm,  setBoyForm]  = useState({ name:'', dateOfBirth:'', timeOfBirth:'', placeOfBirth:'' });
  const [girlForm, setGirlForm] = useState({ name:'', dateOfBirth:'', timeOfBirth:'', placeOfBirth:'' });
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleCalculate = async () => {
    if (!boyForm.name || !girlForm.name) return toast.error('Please enter names for both');
    if (!boyForm.dateOfBirth || !girlForm.dateOfBirth) return toast.error('Please enter date of birth for both');

    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post('/matching/calculate', {
        boy:  boyForm,
        girl: girlForm,
      });
      setResult(data.result);
      // scroll to result
      setTimeout(() => {
        document.getElementById('match-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setBoyForm({ name:'', dateOfBirth:'', timeOfBirth:'', placeOfBirth:'' });
    setGirlForm({ name:'', dateOfBirth:'', timeOfBirth:'', placeOfBirth:'' });
  };

  // Not logged in
  if (!user) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 580 }}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <FiUsers size={56} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))', marginBottom: 16 }} />
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--text)', fontFamily: "'Cinzel', serif" }}>
              Kundali Marriage Matching
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
              Get detailed Ashtakoot Guna Milan analysis based on Vedic astrology.
              Check compatibility before your marriage.
            </p>
             <div style={{ background: 'var(--primary-light)', borderRadius: 14,
              padding: 24, marginBottom: 28, border: '1.5px solid var(--border)' }}>
              <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiLock /> Login Required
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Please login or create an account to use the marriage matching feature.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-primary" style={{ padding: '12px 28px' }}>
                Login
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ padding: '12px 28px' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <FiUsers size={56} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))', marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: "'Cinzel', serif" }}>
            Kundali Marriage Matching
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Ashtakoot Guna Milan — 8 factors, 36 total points.
            Based on traditional Vedic astrology used in Nepal and India.
          </p>
        </div>

        {/* Input forms */}
        {!result && (
          <>
            <div className="grid-2" style={{ gap: 24, marginBottom: 32 }}>
              <FormSection title="Boy's Details" prefix="boy"  form={boyForm}  setForm={setBoyForm}  />
              <FormSection title="Girl's Details" prefix="girl" form={girlForm} setForm={setGirlForm} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary"
                onClick={handleCalculate}
                disabled={loading}
                style={{ padding: '14px 48px', fontSize: 16 }}>
                {loading ? 'Calculating...' : 'Calculate Compatibility'}
              </button>
            </div>
          </>
        )}

        {/* ── RESULT ────────────────────────────────────────────────── */}
        {result && (
          <div id="match-result">

            {/* Score banner */}
            <div style={{
              borderRadius: 16, padding: '40px 24px', marginBottom: 28,
              textAlign: 'center', color: 'var(--text)',
              background: `linear-gradient(135deg, ${result.color}15, var(--card))`,
              border: `1.5px solid ${result.color}`,
              boxShadow: `0 0 20px ${result.color}15`
            }}>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: 0.5, marginBottom: 12 }}>
                {result.boy.name} & {result.girl.name}
              </div>

              {/* Score circle */}
              <div style={{ position: 'relative', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                width: 140, height: 140, margin: '0 auto 20px' }}>
                <svg width="140" height="140" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <circle cx="70" cy="70" r="60" fill="none"
                    stroke="var(--border)" strokeWidth="10" />
                  <circle cx="70" cy="70" r="60" fill="none"
                    stroke={result.color} strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 60 * result.totalScore / result.maxScore} ${2 * Math.PI * 60}`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)"
                    style={{ filter: `drop-shadow(0 0 4px ${result.color})` }} />
                </svg>
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>
                    {result.totalScore}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>/ {result.maxScore}</div>
                </div>
              </div>

              <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', color: 'var(--text)', fontFamily: "'Cinzel', serif" }}>
                {result.compatibility}
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', margin: '0 0 16px' }}>
                {result.compatibilityNp}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 580, margin: '8px auto 0', lineHeight: 1.7 }}>
                {result.recommendation}
              </p>
            </div>

            {/* Boy & Girl details side by side */}
            <div className="grid-2" style={{ gap: 20, marginBottom: 28 }}>
              {[
                { label: "Boy's Astro Details",  data: result.boyDetails,  color: '#38bdf8', icon: <FiUser /> },
                { label: "Girl's Astro Details", data: result.girlDetails, color: '#f472b6', icon: <FiUser /> },
              ].map(({ label, data, color, icon }) => (
                <div key={label} className="card" style={{ border: `1.5px solid ${color}30` }}>
                  <h3 style={{ fontWeight: 700, fontSize: 16, color, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Cinzel', serif" }}>
                    {icon} {label}
                  </h3>
                  {[
                    ['Moon Sign',   `${data.moonSign} (${data.moonSignNp})`],
                    ['Nakshatra',   data.nakshatra],
                    ['Nak. Lord',   data.nakshatraLord],
                    ['Gana',        data.gana],
                    ['Yoni',        data.yoni],
                    ['Nadi',        data.nadi],
                    ['Sign Lord',   data.signLord],
                    ['Varna',       data.varna],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>{k}:</span>
                      <strong style={{ color: 'var(--text)' }}>{v}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Ashtakoot Guna bars */}
            <div className="card" style={{ marginBottom: 28 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 24, color: 'var(--text)', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Cinzel', serif" }}>
                <FiCompass /> Ashtakoot Guna Milan — 8 Factors
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {result.gunas.map((g, i) => {
                  const st = STATUS_STYLE[g.status] || STATUS_STYLE.average;
                  const barColor = SCORE_COLOR(g.scored, g.maxPoints);
                  const barPct   = (g.scored / g.maxPoints) * 100;

                  return (
                    <div key={g.name} style={{ background: st.bg, borderRadius: 12,
                      padding: '16px 20px', border: `1px solid ${st.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: 10, flexWrap: 'wrap', gap: 6 }}>
                      <div>
                          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>
                            {i + 1}. {g.name}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
                            ({g.nameNp})
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 900, fontSize: 18, color: barColor }}>
                            {g.scored}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            / {g.maxPoints}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ background: 'rgba(123, 44, 191, 0.08)', borderRadius: 20,
                        height: 8, marginBottom: 12 }}>
                        <div style={{ height: 8, borderRadius: 20, background: barColor,
                          width: barPct + '%', transition: 'width 0.6s ease',
                          boxShadow: `0 0 8px ${barColor}` }} />
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--text-muted)',
                        marginBottom: 6, lineHeight: 1.5 }}>
                        {g.description}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.8, fontStyle: 'italic' }}>
                        {g.detail}
                      </div>

                      {g.isNadiDosha && (
                        <div style={{ marginTop: 12, padding: '8px 14px',
                          background: 'rgba(255, 77, 109, 0.08)', border: '1px solid rgba(255, 77, 109, 0.2)', borderRadius: 8, fontSize: 12,
                          color: '#ff4d6d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <FiAlertTriangle /> Nadi Dosha detected — consult an astrologer for remedies
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total score row */}
              <div style={{ marginTop: 24, padding: '16px 20px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)', borderRadius: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: 'var(--glow)' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>
                  Total Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: 26, color: '#fff' }}>
                    {result.totalScore}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                    / {result.maxScore} ({result.percentage}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Doshas */}
            {result.doshas.length > 0 && (
              <div className="card" style={{ marginBottom: 28,
                border: '1px solid var(--danger)', background: 'rgba(255, 77, 109, 0.08)' }}>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16, color: '#ff758f', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'Cinzel', serif" }}>
                  <FiAlertTriangle /> Doshas Detected
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.doshas.map((d, i) => (
                    <div key={i} style={{ padding: '14px', background: 'var(--card)',
                      borderRadius: 10, border: '1px solid rgba(255, 77, 109, 0.15)' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#ff4d6d', marginBottom: 6 }}>
                        {d.name} ({d.np})
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--text)' }}>Remedy:</strong> {d.remedy}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: '#ff758f', marginTop: 16, marginBottom: 0 }}>
                  Please consult an experienced astrologer for detailed dosha analysis and remedies.
                </p>
              </div>
            )}

            {/* Score guide */}
            <div className="card" style={{ marginBottom: 28 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text)', fontFamily: "'Cinzel', serif" }}>
                <FiSliders /> Score Interpretation Guide
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                {[
                  { range: '32–36', label: 'Excellent Match',   color: '#70e000', desc: 'Highly recommended' },
                  { range: '27–31', label: 'Very Good Match',   color: '#38b000', desc: 'Recommended' },
                  { range: '22–26', label: 'Good Match',        color: '#aacc00', desc: 'Generally acceptable' },
                  { range: '18–21', label: 'Average Match',     color: '#ffb703', desc: 'Needs consideration' },
                  { range: '13–17', label: 'Below Average',     color: '#ff9f1c', desc: 'Not recommended' },
                  { range: '0–12',  label: 'Poor Match',        color: '#ff4d6d', desc: 'Avoid if possible' },
                ].map(item => (
                  <div key={item.range} style={{ display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 8, background: item.color + '10',
                    border: '1px solid ' + item.color + '25' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%',
                      background: item.color, flexShrink: 0, boxShadow: `0 0 5px ${item.color}` }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: item.color }}>
                        {item.range} — {item.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center',
              flexWrap: 'wrap', marginBottom: 40 }}>
              <button className="btn btn-secondary" onClick={handleReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiRefreshCw /> Calculate Again
              </button>
              <Link to="/astrologers" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <FiUsers /> Consult an Astrologer
              </Link>
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'var(--card)', borderRadius: 12, padding: '16px 20px',
              border: '1px solid var(--border)', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.8 }}>
                <strong>Disclaimer:</strong> This marriage matching tool is based on traditional
                Vedic astrology principles and is intended for educational and informational
                purposes only. Results should not be the sole basis for marriage decisions.
                We strongly recommend consulting an experienced Jyotish astrologer for a
                comprehensive analysis of both horoscopes.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}