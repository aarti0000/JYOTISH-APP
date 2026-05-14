import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './KundaliPage.css';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo',
               'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

const PLANET_COLORS = {
  Sun:'#f59e0b', Moon:'#6366f1', Mars:'#ef4444', Mercury:'#10b981',
  Jupiter:'#f97316', Venus:'#ec4899', Saturn:'#64748b', Rahu:'#8b5cf6', Ketu:'#a16207'
};

function KundaliWheel({ chartData, lagna }) {
  if (!chartData) return null;

  const lagnaIndex = SIGNS.indexOf(lagna);

  // Build 12 houses — each house gets its sign based on lagna
  const houses = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1,
    sign: SIGNS[(lagnaIndex + i) % 12],
    symbol: SIGN_SYMBOLS[(lagnaIndex + i) % 12],
    planets: Object.entries(chartData)
      .filter(([, p]) => p.sign === SIGNS[(lagnaIndex + i) % 12])
      .map(([name]) => name),
  }));

  // North Indian diamond chart positions (row, col) for house 1–12
  const positions = [
    [0,1],[0,2],[1,3],[2,3],[3,2],[3,1],[3,0],[2,0],[1,0],[0,0],[0,1],[1,1]
  ];
  // Corrected grid positions for the 12 houses
  const houseGrid = [
    { house: 1,  row: 0, col: 1 }, { house: 2,  row: 0, col: 2 },
    { house: 3,  row: 1, col: 3 }, { house: 4,  row: 2, col: 3 },
    { house: 5,  row: 3, col: 2 }, { house: 6,  row: 3, col: 1 },
    { house: 7,  row: 3, col: 0 }, { house: 8,  row: 2, col: 0 },
    { house: 9,  row: 1, col: 0 }, { house: 10, row: 0, col: 0 },
    { house: 11, row: 0, col: 2 }, { house: 12, row: 1, col: 1 },
  ];

  return (
    <div className="kundali-wheel">
      <div className="kundali-grid">
        {houses.map((h, i) => (
          <div key={h.house} className="house-cell" style={{
            gridRow: houseGrid[i % houseGrid.length].row + 1,
            gridColumn: houseGrid[i % houseGrid.length].col + 1,
          }}>
            <div className="house-number">{h.house}</div>
            <div className="house-sign">{h.symbol} {h.sign.slice(0,3)}</div>
            <div className="house-planets">
              {h.planets.map(p => (
                <span key={p} style={{ color: PLANET_COLORS[p], fontSize: 11, fontWeight: 700 }}>
                  {p.slice(0,2)}
                </span>
              ))}
            </div>
          </div>
        ))}
        <div className="house-center">
          <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>Lagna</div>
          <div style={{ fontSize: 13 }}>{SIGN_SYMBOLS[lagnaIndex]} {lagna}</div>
        </div>
      </div>
    </div>
  );
}

export default function KundaliPage() {
  const { user } = useAuth();
  const [kundalis, setKundalis] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    timeOfBirth: user?.timeOfBirth || '',
    placeOfBirth: user?.placeOfBirth || '',
    latitude: '',
    longitude: '',
    timezone: '5.5',
  });

  useEffect(() => {
    setLoading(true);
    api.get('/kundali/my-charts')
      .then(r => {
        setKundalis(r.data.kundalis || []);
        if (r.data.kundalis?.length > 0) setSelected(r.data.kundalis[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.dateOfBirth) return toast.error('Date of birth is required');
    setGenerating(true);
    try {
      const { data } = await api.post('/kundali/generate', {
        ...form,
        latitude: parseFloat(form.latitude) || 28.6,
        longitude: parseFloat(form.longitude) || 77.2,
        timezone: parseFloat(form.timezone) || 5.5,
      });
      setKundalis(prev => [data.kundali, ...prev]);
      setSelected(data.kundali);
      toast.success('Kundali generated! 🔮');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>🔮 Kundali Chart</h1>
        <p className="text-muted mb-3">Generate and view your Vedic birth chart</p>

        <div className="grid-2" style={{ alignItems: 'start', gap: 28 }}>
          {/* Left — generator form */}
          <div>
            <div className="card">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Generate New Kundali</h3>
              <form onSubmit={handleGenerate}>
                <div className="form-group">
                  <label>Name</label>
                  <input className="input" value={form.name} onChange={set('name')} placeholder="Full name" required />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input className="input" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} required />
                </div>
                <div className="form-group">
                  <label>Time of Birth</label>
                  <input className="input" type="time" value={form.timeOfBirth} onChange={set('timeOfBirth')} />
                </div>
                <div className="form-group">
                  <label>Place of Birth</label>
                  <input className="input" value={form.placeOfBirth} onChange={set('placeOfBirth')} placeholder="City, Country" />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Latitude</label>
                    <input className="input" type="number" step="0.001" value={form.latitude} onChange={set('latitude')} placeholder="28.614" />
                  </div>
                  <div className="form-group">
                    <label>Longitude</label>
                    <input className="input" type="number" step="0.001" value={form.longitude} onChange={set('longitude')} placeholder="77.209" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Timezone (offset, e.g. 5.5 for IST)</label>
                  <input className="input" type="number" step="0.5" value={form.timezone} onChange={set('timezone')} />
                </div>
                <button className="btn btn-primary" type="submit" disabled={generating}
                  style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
                  {generating ? 'Generating...' : '🔮 Generate Kundali'}
                </button>
              </form>
            </div>

            {/* Saved charts list */}
            {kundalis.length > 0 && (
              <div className="card mt-2">
                <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Saved Charts</h3>
                {kundalis.map(k => (
                  <div key={k._id}
                    className={`saved-chart-item ${selected?._id === k._id ? 'active' : ''}`}
                    onClick={() => setSelected(k)}>
                    <strong>{k.name}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {k.dateOfBirth} • {k.placeOfBirth}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — chart display */}
          <div>
            {loading ? <div className="spinner" /> : selected ? (
              <>
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="kundali-header">
                    <h2 style={{ fontWeight: 800 }}>{selected.name}</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {selected.dateOfBirth} • {selected.placeOfBirth}
                    </p>
                  </div>

                  <KundaliWheel chartData={selected.chartData} lagna={selected.lagna} />

                  {/* Key details */}
                  <div className="kundali-details">
                    {[
                      ['Lagna (Ascendant)', selected.lagna],
                      ['Moon Sign (Rashi)', selected.moonSign],
                      ['Sun Sign', selected.sunSign],
                      ['Nakshatra', selected.nakshatra],
                    ].map(([label, value]) => (
                      <div key={label} className="detail-item">
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Planetary positions */}
                <div className="card" style={{ marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Planetary Positions</h3>
                  <div className="planet-grid">
                    {selected.chartData && Object.entries(selected.chartData).map(([planet, data]) => (
                      <div key={planet} className="planet-item">
                        <div className="planet-dot" style={{ background: PLANET_COLORS[planet] }} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{planet}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.sign}</div>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {data.longitude?.toFixed(2)}°
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vimshottari Dasha */}
                {selected.dashaData && (
                  <div className="card">
                    <h3 style={{ fontWeight: 700, marginBottom: 14 }}>Vimshottari Dasha</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selected.dashaData.map((d, i) => {
                        const now = new Date();
                        const start = new Date(d.startDate);
                        const end = new Date(d.endDate);
                        const isCurrent = now >= start && now <= end;
                        return (
                          <div key={i} className={`dasha-item ${isCurrent ? 'current' : ''}`}>
                            <strong style={{ minWidth: 70 }}>{d.lord}</strong>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {d.startDate} → {d.endDate}
                            </span>
                            <span style={{ fontSize: 11 }}>{d.years} yrs</span>
                            {isCurrent && <span className="badge badge-green">Current</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card flex-center" style={{ flexDirection: 'column', gap: 12, padding: 60, textAlign: 'center' }}>
                <div style={{ fontSize: 48 }}>🔮</div>
                <h3>No Kundali yet</h3>
                <p className="text-muted">Fill in the form to generate your Vedic birth chart</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
