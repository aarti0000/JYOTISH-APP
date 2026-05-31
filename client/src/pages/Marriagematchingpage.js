import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SCORE_COLOR = (score, max) => {
  const pct = score / max;
  if (pct >= 0.8) return '#10b981';
  if (pct >= 0.6) return '#22c55e';
  if (pct >= 0.5) return '#84cc16';
  if (pct >= 0.4) return '#f59e0b';
  if (pct >= 0.3) return '#f97316';
  return '#ef4444';
};

const STATUS_STYLE = {
  good:    { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  average: { bg: '#fefce8', color: '#854d0e', border: '#fde047' },
  bad:     { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
};

function FormSection({ title, prefix, form, setForm }) {
  const set = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="card">
      <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16,
        color: prefix === 'boy' ? '#1d4ed8' : '#db2777' }}>
        {prefix === 'boy' ? '👦' : '👧'} {title}
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
        <div className="container" style={{ maxWidth: 560 }}>
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>💑</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--primary)' }}>
              Kundali Marriage Matching
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 24, lineHeight: 1.7 }}>
              Get detailed Ashtakoot Guna Milan analysis based on Vedic astrology.
              Check compatibility before your marriage.
            </p>
            <div style={{ background: 'var(--primary-light)', borderRadius: 14,
              padding: 24, marginBottom: 28, border: '1.5px solid var(--primary)' }}>
              <p style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                🔒 Login Required
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
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 10 }}>💑</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 6 }}>
            Kundali Marriage Matching
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 520, margin: '0 auto' }}>
            Ashtakoot Guna Milan — 8 factors, 36 total points.
            Based on traditional Vedic astrology used in Nepal and India.
          </p>
        </div>

        {/* Input forms */}
        {!result && (
          <>
            <div className="grid-2" style={{ gap: 24, marginBottom: 24 }}>
              <FormSection title="Boy's Details" prefix="boy"  form={boyForm}  setForm={setBoyForm}  />
              <FormSection title="Girl's Details" prefix="girl" form={girlForm} setForm={setGirlForm} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-primary"
                onClick={handleCalculate}
                disabled={loading}
                style={{ padding: '14px 48px', fontSize: 16, borderRadius: 50 }}>
                {loading ? '🔮 Calculating...' : '💑 Calculate Compatibility'}
              </button>
            </div>
          </>
        )}

        {/* ── RESULT ────────────────────────────────────────────────── */}
        {result && (
          <div id="match-result">

            {/* Score banner */}
            <div style={{ borderRadius: 16, padding: '32px 24px', marginBottom: 24,
              textAlign: 'center', color: '#fff',
              background: `linear-gradient(135deg, ${result.color}, ${result.color}99)` }}>
              <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>
                {result.boy.name} 💑 {result.girl.name}
              </div>

              {/* Score circle */}
              <div style={{ position: 'relative', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                width: 140, height: 140, margin: '0 auto 16px' }}>
                <svg width="140" height="140" style={{ position: 'absolute', top: 0, left: 0 }}>
                  <circle cx="70" cy="70" r="60" fill="none"
                    stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                  <circle cx="70" cy="70" r="60" fill="none"
                    stroke="white" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 60 * result.totalScore / result.maxScore} ${2 * Math.PI * 60}`}
                    strokeLinecap="round"
                    transform="rotate(-90 70 70)" />
                </svg>
                <div style={{ zIndex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 38, fontWeight: 900, lineHeight: 1 }}>
                    {result.totalScore}
                  </div>
                  <div style={{ fontSize: 14, opacity: 0.85 }}>/ {result.maxScore}</div>
                </div>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>
                {result.compatibility}
              </h2>
              <p style={{ fontSize: 16, opacity: 0.9, margin: '0 0 4px' }}>
                {result.compatibilityNp}
              </p>
              <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 500, margin: '8px auto 0' }}>
                {result.recommendation}
              </p>
            </div>

            {/* Boy & Girl details side by side */}
            <div className="grid-2" style={{ gap: 16, marginBottom: 24 }}>
              {[
                { label: "Boy's Astro Details",  data: result.boyDetails,  color: '#1d4ed8', icon: '👦' },
                { label: "Girl's Astro Details", data: result.girlDetails, color: '#db2777', icon: '👧' },
              ].map(({ label, data, color, icon }) => (
                <div key={label} className="card" style={{ border: `2px solid ${color}30` }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color, marginBottom: 14 }}>
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
                    <div key={k} style={{ display: 'flex', gap: 10, marginBottom: 7, fontSize: 13 }}>
                      <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>{k}:</span>
                      <strong>{v}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Ashtakoot Guna bars */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, color: 'var(--primary)' }}>
                🔮 Ashtakoot Guna Milan — 8 Factors
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {result.gunas.map((g, i) => {
                  const st = STATUS_STYLE[g.status] || STATUS_STYLE.average;
                  const barColor = SCORE_COLOR(g.scored, g.maxPoints);
                  const barPct   = (g.scored / g.maxPoints) * 100;

                  return (
                    <div key={g.name} style={{ background: st.bg, borderRadius: 12,
                      padding: '14px 16px', border: `1.5px solid ${st.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: 15, color: st.color }}>
                            {i + 1}. {g.name}
                          </span>
                          <span style={{ fontSize: 13, color: st.color, marginLeft: 8, opacity: 0.8 }}>
                            {g.nameNp}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 900, fontSize: 18, color: barColor }}>
                            {g.scored}
                          </span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                            / {g.maxPoints}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 20,
                        height: 8, marginBottom: 8 }}>
                        <div style={{ height: 8, borderRadius: 20, background: barColor,
                          width: barPct + '%', transition: 'width 0.6s ease' }} />
                      </div>

                      <div style={{ fontSize: 12, color: st.color, opacity: 0.8,
                        marginBottom: 4 }}>
                        {g.description}
                      </div>
                      <div style={{ fontSize: 12, color: st.color, opacity: 0.7 }}>
                        {g.detail}
                      </div>

                      {g.isNadiDosha && (
                        <div style={{ marginTop: 8, padding: '6px 10px',
                          background: '#fee2e2', borderRadius: 8, fontSize: 12,
                          color: '#991b1b', fontWeight: 600 }}>
                          ⚠️ Nadi Dosha detected — consult an astrologer for remedies
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total score row */}
              <div style={{ marginTop: 20, padding: '14px 16px',
                background: 'var(--primary)', borderRadius: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>
                  Total Score
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 900, fontSize: 26, color: '#fff' }}>
                    {result.totalScore}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                    / {result.maxScore} ({result.percentage}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Doshas */}
            {result.doshas.length > 0 && (
              <div className="card" style={{ marginBottom: 24,
                border: '2px solid #fca5a5', background: '#fff5f5' }}>
                <h3 style={{ fontWeight: 800, fontSize: 17, marginBottom: 16, color: '#991b1b' }}>
                  ⚠️ Doshas Detected
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.doshas.map((d, i) => (
                    <div key={i} style={{ padding: '12px 16px', background: '#fee2e2',
                      borderRadius: 10, border: '1px solid #fca5a5' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#991b1b', marginBottom: 4 }}>
                        {d.name} ({d.np})
                      </div>
                      <div style={{ fontSize: 13, color: '#7f1d1d' }}>
                        <strong>Remedy:</strong> {d.remedy}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: '#991b1b', marginTop: 12, marginBottom: 0 }}>
                  Please consult an experienced astrologer for detailed dosha analysis and remedies.
                </p>
              </div>
            )}

            {/* Score guide */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
                📊 Score Interpretation Guide
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {[
                  { range: '32–36', label: 'Excellent Match',   color: '#10b981', desc: 'Highly recommended' },
                  { range: '27–31', label: 'Very Good Match',   color: '#22c55e', desc: 'Recommended' },
                  { range: '22–26', label: 'Good Match',        color: '#84cc16', desc: 'Generally acceptable' },
                  { range: '18–21', label: 'Average Match',     color: '#f59e0b', desc: 'Needs consideration' },
                  { range: '13–17', label: 'Below Average',     color: '#f97316', desc: 'Not recommended' },
                  { range: '0–12',  label: 'Poor Match',        color: '#ef4444', desc: 'Avoid if possible' },
                ].map(item => (
                  <div key={item.range} style={{ display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', borderRadius: 8, background: item.color + '15',
                    border: '1px solid ' + item.color + '40' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%',
                      background: item.color, flexShrink: 0 }} />
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
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center',
              flexWrap: 'wrap', marginBottom: 32 }}>
              <button className="btn btn-secondary" onClick={handleReset}>
                🔄 Calculate Again
              </button>
              <Link to="/astrologers" className="btn btn-primary">
                👨‍🔮 Consult an Astrologer
              </Link>
            </div>

            {/* Disclaimer */}
            <div style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px',
              border: '1px solid var(--border)', marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.7 }}>
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