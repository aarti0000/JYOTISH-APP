import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiStar, FiVideo, FiMessageCircle, FiPhone,
  FiArrowRight, FiShield, FiAward, FiChevronLeft, FiChevronRight,
  FiCalendar, FiMoon, FiCompass, FiActivity, FiSmile, FiUsers, FiHeart
} from 'react-icons/fi';
import api from '../utils/api';
import AstrologerCard from '../components/astrologer/AstrologerCard';
import './Home.css';

const SPECIALIZATIONS = ['Vedic','Numerology','Tarot','Vastu','KP','Palmistry','Gemology'];
const BS_MONTHS_NP = ['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत्र'];
const BS_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const DAYS_NP = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLORS = {
  public:    { bg:'rgba(239, 68, 68, 0.15)', color:'#ff758f', border: 'rgba(239, 68, 68, 0.25)' },
  religious: { bg:'rgba(255, 158, 0, 0.15)', color:'#ffb703', border: 'rgba(255, 158, 0, 0.25)' },
  festival:  { bg:'rgba(157, 78, 221, 0.15)', color:'#c8b6ff', border: 'rgba(157, 78, 221, 0.25)' },
  other:     { bg:'rgba(56, 176, 0, 0.15)', color:'#70e000', border: 'rgba(56, 176, 0, 0.25)' },
};

export default function Home() {
  const [featured, setFeatured]         = useState([]);
  const [calendar, setCalendar]         = useState(null);
  const [todayInfo, setTodayInfo]       = useState(null);
  const [selectedDay, setSelectedDay]   = useState(null);
  const [currentYear, setCurrentYear]   = useState(2083);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [calLoading, setCalLoading]     = useState(true);

  // Load featured astrologers
  useEffect(() => {
    api.get('/astrologers?sort=rating&limit=4')
      .then(r => setFeatured(r.data.astrologers || []))
      .catch(() => {});
  }, []);

  // Load today's info
  useEffect(() => {
    api.get('/calendar/today')
      .then(r => {
        setTodayInfo(r.data.today);
        setCurrentYear(r.data.today.bs.year);
        setCurrentMonth(r.data.today.bs.month);
      })
      .catch(() => {});
  }, []);

  // Load calendar month
  useEffect(() => {
    setCalLoading(true);
    api.get(`/calendar/month?year=${currentYear}&month=${currentMonth}`)
      .then(r => { setCalendar(r.data.calendar); setSelectedDay(null); })
      .catch(() => {})
      .finally(() => setCalLoading(false));
  }, [currentYear, currentMonth]);

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const goToToday = () => {
    if (todayInfo) {
      setCurrentYear(todayInfo.bs.year);
      setCurrentMonth(todayInfo.bs.month);
    }
  };

  const isToday = (day) => {
    if (!todayInfo) return false;
    return todayInfo.bs.year === currentYear &&
           todayInfo.bs.month === currentMonth &&
           todayInfo.bs.day === day.bsDay;
  };

  return (
    <div>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FiStar style={{ color: 'var(--secondary)', fill: 'var(--secondary)' }} />
              Trusted by 50,000+ users
            </div>
            <h1 className="hero-title">
              Talk to Nepal's Best
              <span className="gradient-text">Jyotish Astrologers</span>
            </h1>
            <p className="hero-sub">
              Get accurate Vedic astrology guidance via chat, call, or video consultation.
              First consultation free for new users!
            </p>
            <div className="hero-cta">
              <Link to="/astrologers" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                Consult Now <FiArrowRight />
              </Link>
              <Link to="/horoscope" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                <FiMoon /> Daily Horoscope
              </Link>
            </div>
            <div className="hero-stats">
              {[['50K+','Happy Users'],['500+','Astrologers'],['1M+','Consultations'],['4.8★','Rating']].map(([n,l]) => (
                <div key={l} className="stat-item">
                  <strong>{n}</strong>
                  <span>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <img src="/zodiac_wheel.png" alt="AstroConnect Zodiac Wheel" className="zodiac-wheel-img" />
          </div>
        </div>
      </section>

      {/* ── TODAY'S PANCHANG STRIP ─────────────────────────────────── */}
      {todayInfo && (
        <div style={{ background: '#0e0921', padding: '14px 0', borderBottom: '1px solid rgba(157, 78, 221, 0.15)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FiCalendar /> Today's Panchang:
              </span>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {todayInfo.bs.dayNp} {todayInfo.bs.monthNp} {todayInfo.bs.year} BS
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>({todayInfo.ad})</span>
              <span style={{ color: 'var(--secondary)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FiMoon /> {todayInfo.tithi}
              </span>
              <span style={{ color: '#c8b6ff', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <FiCompass /> {todayInfo.paksha}
              </span>
              {todayInfo.festivals.map((f, i) => (
                <span key={i} style={{ background: 'rgba(157, 78, 221, 0.15)', border: '1px solid rgba(157, 78, 221, 0.25)', borderRadius: 20, padding: '3px 12px', fontSize: 12, color: '#fff' }}>
                  {f.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NEPALI CALENDAR ───────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 className="section-title">Nepali Calendar — BS {currentYear}</h2>
            <p className="section-subtitle">Bikram Sambat calendar with festivals, tithis and public holidays</p>
          </div>

          <div className="calendar-wrapper">
            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <button className="btn btn-secondary" style={{ padding: '10px 16px' }} onClick={prevMonth}>
                <FiChevronLeft size={18} />
              </button>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontWeight: 800, fontSize: 22, color: '#fff', margin: 0 }}>
                  {BS_MONTHS_NP[currentMonth-1]} {currentYear}
                </h3>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {BS_MONTHS_EN[currentMonth-1]} {currentYear} BS
                  {calendar && <span style={{ marginLeft:8 }}>· {calendar.adMonths}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '13px' }} onClick={goToToday}>
                  Today
                </button>
                <button className="btn btn-secondary" style={{ padding: '10px 16px' }} onClick={nextMonth}>
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>

            {calLoading ? <div className="spinner" /> : calendar && (
              <>
                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 8 }}>
                  {DAYS_NP.map((d, i) => (
                    <div key={d} style={{
                      textAlign: 'center',
                      padding: '10px 4px',
                      fontWeight: 700,
                      fontSize: 13,
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: 8,
                      color: i===6 ? '#ff4d6d' : i===0 ? 'var(--secondary)' : 'var(--text-muted)'
                    }}>
                      {d}
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{DAYS_EN[i]}</div>
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
                  {/* Empty cells */}
                  {Array.from({ length: calendar.startDayOfWeek }).map((_, i) => (
                    <div key={'e'+i} className="cal-day-cell empty-day" style={{ opacity: 0, pointerEvents: 'none' }} />
                  ))}

                  {/* Day cells */}
                  {calendar.days.map(day => {
                    const isTodayDay  = isToday(day);
                    const isSelected  = selectedDay?.bsDay === day.bsDay;
                    const hasFestival = day.festivals.length > 0;

                    return (
                      <div key={day.bsDay}
                        onClick={() => setSelectedDay(isSelected ? null : day)}
                        style={{
                          minHeight: 72,
                          border: '1.5px solid',
                          borderColor: isTodayDay ? 'var(--primary)'
                            : isSelected ? 'var(--secondary)' : 'rgba(157, 78, 221, 0.15)',
                          borderRadius: 10,
                          padding: '8px',
                          background: isTodayDay ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                            : isSelected ? 'rgba(255, 158, 0, 0.1)'
                            : hasFestival ? 'rgba(157, 78, 221, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isTodayDay ? 'var(--glow)' : 'none',
                        }}
                        onMouseEnter={e => {
                          if(!isTodayDay) e.currentTarget.style.borderColor = isSelected ? 'var(--secondary)' : 'var(--primary)';
                        }}
                        onMouseLeave={e => {
                          if(!isTodayDay) e.currentTarget.style.borderColor = isSelected ? 'var(--secondary)' : 'rgba(157, 78, 221, 0.15)';
                        }}>
                        {/* BS day */}
                        <div style={{ fontWeight: 800, fontSize: 16,
                          color: isTodayDay ? '#fff'
                            : day.isHoliday ? '#ff4d6d' : 'var(--text)' }}>
                          {day.bsDayNp}
                        </div>
                        {/* AD day */}
                        <div style={{ fontSize: 10, marginTop: 2,
                          color: isTodayDay ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>
                          {day.adDay}
                        </div>
                        {/* Festival dots instead of emojis */}
                        {hasFestival && (
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
                            {day.festivals.length > 1 && (
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--secondary)' }} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid rgba(157, 78, 221, 0.1)', paddingTop: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} /> Today
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d6d' }} /> Holiday / Saturday
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)' }} /> Festival
                  </span>
                  <span style={{ marginLeft: 'auto' }}>
                    <em>Click any date for details</em>
                  </span>
                </div>

                {/* Selected day popup */}
                {selectedDay && (
                  <div style={{
                    marginTop: 20, padding: 24,
                    background: 'rgba(21, 14, 40, 0.9)',
                    borderRadius: 12,
                    border: '1.5px solid var(--secondary)',
                    boxShadow: '0 0 20px rgba(255, 158, 0, 0.15)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: 18, margin: 0, color: '#fff', fontFamily: "'Cinzel', serif" }}>
                          {selectedDay.bsDayNp} {BS_MONTHS_NP[currentMonth-1]} {currentYear}
                        </h4>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                          {selectedDay.adDate} · {selectedDay.dayNameNp} / {selectedDay.dayNameEn}
                        </div>
                      </div>
                      <button onClick={() => setSelectedDay(null)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', width: 28, height: 28, borderRadius: '50%', fontSize: 14,
                          cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>✕</button>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 16px', border: '1px solid rgba(157,78,221,0.15)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <FiMoon style={{ color: 'var(--primary)' }} /> <strong>Tithi:</strong> {selectedDay.tithi}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 16px', border: '1px solid rgba(157,78,221,0.15)', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <FiCompass style={{ color: 'var(--primary)' }} /> <strong>Paksha:</strong> {selectedDay.paksha}
                      </div>
                    </div>

                    {selectedDay.festivals.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                        No special events on this day.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {selectedDay.festivals.map((f, i) => {
                          const c = TYPE_COLORS[f.type] || TYPE_COLORS.other;
                          return (
                            <div key={i} style={{
                              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 8,
                              background: c.bg, border: `1px solid ${c.border}`
                            }}>
                              <FiAward size={20} style={{ color: c.color }} />
                              <div>
                                <div style={{ fontWeight: 700, fontSize: 14, color: c.color }}>
                                  {f.name}
                                </div>
                                <div style={{ fontSize: 12, color: c.color, opacity: 0.8 }}>
                                  {f.np}
                                </div>
                              </div>
                              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                {f.type}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Link to full calendar */}
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link to="/calendar" className="btn btn-secondary">
                View Full Calendar & Festivals 2083 <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSULTATION TYPES ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">How Would You Like to Connect?</h2>
          <p className="section-subtitle">Choose from three premium channels to talk with vetted astrologers</p>
          <div className="grid-3">
            {[
              { icon: <FiMessageCircle size={28}/>, title: 'Chat',  desc: 'Text consultation — ask your questions anytime',           color: '#9d4edd' },
              { icon: <FiPhone size={28}/>,         title: 'Call',  desc: 'Voice call with your astrologer for personal guidance',    color: '#9d4edd' },
              { icon: <FiVideo size={28}/>,         title: 'Video', desc: 'Face-to-face video session for in-depth readings',         color: '#9d4edd' },
            ].map(item => (
              <Link to="/astrologers" key={item.title}
                className="consult-type-card"
                style={{ '--c': item.color }}
                onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.2)'}>
                <div className="consult-icon" style={{ color: item.color, borderColor: item.color + '30' }}>
                  {item.icon}
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIZATIONS ───────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <h2 className="section-title">Explore Specializations</h2>
          <p className="section-subtitle">Vetted experts spanning different systems of astrology and divination</p>
          <div className="spec-grid">
            {SPECIALIZATIONS.map(s => (
              <Link key={s} to={`/astrologers?specialization=${s}`}
                className="spec-chip">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ASTROLOGERS ──────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="flex-between mb-2">
              <h2 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Top Astrologers</h2>
              <Link to="/astrologers" className="btn btn-secondary">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="grid-4" style={{ marginTop: 24 }}>
              {featured.map(a => <AstrologerCard key={a._id} astrologer={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── DAILY HOROSCOPE TEASER ─────────────────────────────────── */}
      <section className="section" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(157, 78, 221, 0.2), transparent 60%), #0e0921',
        borderTop: '1px solid rgba(157, 78, 221, 0.15)',
        borderBottom: '1px solid rgba(157, 78, 221, 0.15)'
      }}>
        <div className="container text-center">
          <FiMoon size={56} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))', marginBottom: 16 }} />
          <h2 className="section-title">Daily Horoscope</h2>
          <p className="section-subtitle" style={{ marginBottom: 24 }}>
            Read your daily horoscope for all 12 zodiac signs — updated every day
          </p>
          <Link to="/horoscope" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '15px' }}>
            Read Today's Horoscope <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* ── TRUST SIGNALS ─────────────────────────────────────────── */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid-3">
            {[
              { icon: <FiShield size={32}/>, title: 'Verified Astrologers', desc: 'All astrologers are background-checked and certified' },
              { icon: <FiAward size={32}/>,  title: 'Expert Guidance',      desc: 'Years of experience in Vedic, KP, and other systems' },
              { icon: <FiStar size={32}/>,   title: 'Satisfaction Guaranteed', desc: 'Get a full refund if not satisfied with your consultation' },
            ].map(item => (
              <div key={item.title} className="trust-card">
                <div className="trust-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}