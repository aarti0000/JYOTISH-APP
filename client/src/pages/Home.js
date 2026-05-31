import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiStar, FiVideo, FiMessageCircle, FiPhone,
  FiArrowRight, FiShield, FiAward, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import api from '../utils/api';
import AstrologerCard from '../components/astrologer/AstrologerCard';

const SPECIALIZATIONS = ['Vedic','Numerology','Tarot','Vastu','KP','Palmistry','Gemology'];
const BS_MONTHS_NP = ['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत्र'];
const BS_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const DAYS_NP = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];
const DAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLORS = {
  public:    { bg:'#fee2e2', color:'#991b1b' },
  religious: { bg:'#fef3c7', color:'#92400e' },
  festival:  { bg:'#ede9fe', color:'#5b21b6' },
  other:     { bg:'#f0fdf4', color:'#166534' },
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
      <section style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #5b21b6 100%)',
        padding: '80px 0 60px', color: 'white',
      }}>
        <div className="container text-center">
          <div style={{ display:'inline-flex', alignItems:'center', gap:6,
            background:'rgba(255,255,255,0.15)', borderRadius:20,
            padding:'6px 16px', fontSize:13, fontWeight:600,
            marginBottom:20, color:'#fbbf24' }}>
            <FiStar /> Trusted by 50,000+ users
          </div>
          <h1 style={{ fontSize:'clamp(32px,5vw,56px)', fontWeight:800,
            lineHeight:1.15, marginBottom:16 }}>
            Talk to Nepal's Best<br />
            <span style={{ background:'linear-gradient(90deg,#f59e0b,#fbbf24)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Jyotish Astrologers
            </span>
          </h1>
          <p style={{ fontSize:17, color:'#c4b5fd', maxWidth:540, margin:'0 auto 28px' }}>
            Get accurate Vedic astrology guidance via chat, call, or video consultation.
            First consultation free for new users!
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/astrologers" className="btn btn-primary"
              style={{ padding:'14px 28px', fontSize:15 }}>
              Consult Now <FiArrowRight />
            </Link>
            <Link to="/horoscope" className="btn btn-outline"
              style={{ padding:'14px 28px', fontSize:15, borderColor:'#c4b5fd', color:'#c4b5fd' }}>
              🔮 Daily Horoscope
            </Link>
          </div>
          <div style={{ display:'flex', gap:40, justifyContent:'center',
            marginTop:48, flexWrap:'wrap' }}>
            {[['50K+','Happy Users'],['500+','Astrologers'],['1M+','Consultations'],['4.8★','Rating']].map(([n,l]) => (
              <div key={l} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <strong style={{ fontSize:26, fontWeight:800, color:'#fff' }}>{n}</strong>
                <span style={{ fontSize:12, color:'#a78bfa' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TODAY'S PANCHANG STRIP ─────────────────────────────────── */}
      {todayInfo && (
        <div style={{ background:'#1e1b4b', padding:'12px 0', borderBottom:'1px solid #312e81' }}>
          <div className="container">
            <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap',
              justifyContent:'center' }}>
              <span style={{ color:'#a78bfa', fontSize:13, fontWeight:600 }}>
                📅 Today's Panchang:
              </span>
              <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>
                {todayInfo.bs.dayNp} {todayInfo.bs.monthNp} {todayInfo.bs.year} BS
              </span>
              <span style={{ color:'#6b7280', fontSize:13 }}>({todayInfo.ad})</span>
              <span style={{ color:'#fbbf24', fontSize:13 }}>🌙 {todayInfo.tithi}</span>
              <span style={{ color:'#a78bfa', fontSize:13 }}>☽ {todayInfo.paksha}</span>
              {todayInfo.festivals.map((f, i) => (
                <span key={i} style={{ background:'rgba(255,255,255,0.1)', borderRadius:20,
                  padding:'3px 10px', fontSize:12, color:'#fff' }}>
                  {f.icon} {f.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── NEPALI CALENDAR ───────────────────────────────────────── */}
      <section style={{ padding:'48px 0', background:'#f8f6ff' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <h2 style={{ fontSize:26, fontWeight:800, color:'var(--primary)', marginBottom:6 }}>
              📅 Nepali Calendar — BS {currentYear}
            </h2>
            <p style={{ color:'var(--text-muted)', fontSize:14 }}>
              Bikram Sambat calendar with festivals, tithis and public holidays
            </p>
          </div>

          <div className="card">
            {/* Month nav */}
            <div style={{ display:'flex', alignItems:'center',
              justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
              <button className="btn btn-secondary"
                style={{ padding:'8px 14px' }} onClick={prevMonth}>
                <FiChevronLeft />
              </button>
              <div style={{ textAlign:'center' }}>
                <h3 style={{ fontWeight:800, fontSize:20, color:'var(--primary)', margin:0 }}>
                  {BS_MONTHS_NP[currentMonth-1]} {currentYear}
                </h3>
                <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
                  {BS_MONTHS_EN[currentMonth-1]} {currentYear} BS
                  {calendar && <span style={{ marginLeft:6 }}>· {calendar.adMonths}</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-secondary"
                  style={{ padding:'8px 14px', fontSize:12 }} onClick={goToToday}>
                  Today
                </button>
                <button className="btn btn-secondary"
                  style={{ padding:'8px 14px' }} onClick={nextMonth}>
                  <FiChevronRight />
                </button>
              </div>
            </div>

            {calLoading ? <div className="spinner" /> : calendar && (
              <>
                {/* Day headers */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)',
                  gap:2, marginBottom:4 }}>
                  {DAYS_NP.map((d, i) => (
                    <div key={d} style={{ textAlign:'center', padding:'8px 4px',
                      fontWeight:700, fontSize:12,
                      color: i===6 ? '#ef4444' : i===0 ? '#f59e0b' : 'var(--text-muted)' }}>
                      {d}
                      <div style={{ fontSize:10, fontWeight:400 }}>{DAYS_EN[i]}</div>
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
                  {/* Empty cells */}
                  {Array.from({ length: calendar.startDayOfWeek }).map((_, i) => (
                    <div key={'e'+i} style={{ minHeight:64 }} />
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
                          minHeight: 64,
                          border: '1.5px solid',
                          borderColor: isTodayDay ? 'var(--primary)'
                            : isSelected ? '#f59e0b' : 'var(--border)',
                          borderRadius: 8,
                          padding: '5px 5px',
                          background: isTodayDay ? 'var(--primary)'
                            : isSelected ? '#fffbeb'
                            : hasFestival ? '#faf5ff' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}>
                        {/* BS day */}
                        <div style={{ fontWeight:800, fontSize:15,
                          color: isTodayDay ? '#fff'
                            : day.isHoliday ? '#ef4444' : 'var(--text)' }}>
                          {day.bsDayNp}
                        </div>
                        {/* AD day */}
                        <div style={{ fontSize:10,
                          color: isTodayDay ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                          {day.adDay}
                        </div>
                        {/* Festival icons */}
                        {hasFestival && (
                          <div style={{ display:'flex', gap:1, flexWrap:'wrap', marginTop:2 }}>
                            {day.festivals.slice(0,2).map((f,i) => (
                              <span key={i} style={{ fontSize:10 }} title={f.name}>{f.icon}</span>
                            ))}
                            {day.festivals.length > 2 && (
                              <span style={{ fontSize:9, color:'var(--primary)', fontWeight:700 }}>
                                +{day.festivals.length-2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display:'flex', gap:16, marginTop:14,
                  flexWrap:'wrap', fontSize:12, color:'var(--text-muted)' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <div style={{ width:10, height:10, borderRadius:2,
                      background:'var(--primary)' }} /> Today
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ color:'#ef4444', fontWeight:700 }}>●</span> Holiday / Saturday
                  </span>
                  <span><span>🎉</span> Festival</span>
                  <span style={{ marginLeft:'auto' }}>
                    <em>Click any date for details</em>
                  </span>
                </div>

                {/* Selected day popup */}
                {selectedDay && (
                  <div style={{ marginTop:16, padding:16,
                    background:'#fffbeb', borderRadius:12,
                    border:'2px solid #f59e0b' }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <h4 style={{ fontWeight:800, fontSize:16, margin:0 }}>
                          {selectedDay.bsDayNp} {BS_MONTHS_NP[currentMonth-1]} {currentYear}
                        </h4>
                        <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
                          {selectedDay.adDate} · {selectedDay.dayNameNp} / {selectedDay.dayNameEn}
                        </div>
                      </div>
                      <button onClick={() => setSelectedDay(null)}
                        style={{ background:'none', border:'none', fontSize:18,
                          cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
                    </div>

                    <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
                      <div style={{ background:'#fff', borderRadius:8, padding:'8px 14px',
                        border:'1px solid var(--border)', fontSize:13 }}>
                        🌙 <strong>Tithi:</strong> {selectedDay.tithi}
                      </div>
                      <div style={{ background:'#fff', borderRadius:8, padding:'8px 14px',
                        border:'1px solid var(--border)', fontSize:13 }}>
                        ☽ <strong>Paksha:</strong> {selectedDay.paksha}
                      </div>
                    </div>

                    {selectedDay.festivals.length === 0 ? (
                      <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>
                        No special events on this day.
                      </p>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {selectedDay.festivals.map((f, i) => {
                          const c = TYPE_COLORS[f.type] || TYPE_COLORS.other;
                          return (
                            <div key={i} style={{ display:'flex', alignItems:'center',
                              gap:10, padding:'10px 14px', borderRadius:8,
                              background: c.bg }}>
                              <span style={{ fontSize:22 }}>{f.icon}</span>
                              <div>
                                <div style={{ fontWeight:700, fontSize:14, color:c.color }}>
                                  {f.name}
                                </div>
                                <div style={{ fontSize:12, color:c.color, opacity:0.75 }}>
                                  {f.np}
                                </div>
                              </div>
                              <span style={{ marginLeft:'auto', fontSize:11,
                                fontWeight:700, color:c.color, textTransform:'uppercase' }}>
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
            <div style={{ textAlign:'center', marginTop:20 }}>
              <Link to="/calendar" className="btn btn-secondary">
                View Full Calendar & Festivals 2083 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONSULTATION TYPES ────────────────────────────────────── */}
      <section style={{ padding:'60px 0' }}>
        <div className="container">
          <h2 style={{ fontSize:26, fontWeight:800, textAlign:'center',
            marginBottom:32, color:'var(--text)' }}>
            How Would You Like to Connect?
          </h2>
          <div className="grid-3">
            {[
              { icon:<FiMessageCircle size={28}/>, title:'Chat',  desc:'Text consultation — ask your questions anytime',           color:'#7c3aed' },
              { icon:<FiPhone size={28}/>,         title:'Call',  desc:'Voice call with your astrologer for personal guidance',    color:'#0ea5e9' },
              { icon:<FiVideo size={28}/>,         title:'Video', desc:'Face-to-face video session for in-depth readings',         color:'#10b981' },
            ].map(item => (
              <Link to="/astrologers" key={item.title}
                style={{ display:'block', background:'#fff', borderRadius:14,
                  padding:'28px 24px', textDecoration:'none', color:'var(--text)',
                  border:'2px solid transparent', boxShadow:'var(--shadow)',
                  transition:'all 0.25s', '--c': item.color }}
                onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <div style={{ width:56, height:56, borderRadius:14, marginBottom:14,
                  background: item.color + '20', color: item.color,
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>{item.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIZATIONS ───────────────────────────────────────── */}
      <section style={{ padding:'60px 0', background:'#f5f3ff' }}>
        <div className="container">
          <h2 style={{ fontSize:26, fontWeight:800, textAlign:'center', marginBottom:28 }}>
            Explore Specializations
          </h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:12, justifyContent:'center' }}>
            {SPECIALIZATIONS.map(s => (
              <Link key={s} to={`/astrologers?specialization=${s}`}
                style={{ padding:'10px 20px', borderRadius:24, background:'#fff',
                  border:'1.5px solid var(--primary-light)', color:'var(--primary)',
                  fontSize:14, fontWeight:600, textDecoration:'none', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='var(--primary)'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.color='var(--primary)'; }}>
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ASTROLOGERS ──────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding:'60px 0' }}>
          <div className="container">
            <div className="flex-between mb-2">
              <h2 style={{ fontSize:26, fontWeight:800 }}>Top Astrologers</h2>
              <Link to="/astrologers" className="btn btn-secondary">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="grid-4" style={{ marginTop:24 }}>
              {featured.map(a => <AstrologerCard key={a._id} astrologer={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── DAILY HOROSCOPE TEASER ─────────────────────────────────── */}
      <section style={{ padding:'60px 0', background:'linear-gradient(135deg,#1e1b4b,#4c1d95)' }}>
        <div className="container text-center">
          <div style={{ fontSize:52, marginBottom:12 }}>🔮</div>
          <h2 style={{ fontSize:26, fontWeight:800, color:'#fff', marginBottom:8 }}>
            Daily Horoscope
          </h2>
          <p style={{ color:'#c4b5fd', marginBottom:24, fontSize:15 }}>
            Read your daily horoscope for all 12 zodiac signs — updated every day
          </p>
          <Link to="/horoscope" className="btn btn-primary"
            style={{ padding:'14px 32px', fontSize:15 }}>
            Read Today's Horoscope <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* ── TRUST SIGNALS ─────────────────────────────────────────── */}
      <section style={{ padding:'60px 0', background:'#f5f3ff' }}>
        <div className="container">
          <div className="grid-3">
            {[
              { icon:<FiShield size={32}/>, title:'Verified Astrologers', desc:'All astrologers are background-checked and certified' },
              { icon:<FiAward size={32}/>,  title:'Expert Guidance',      desc:'Years of experience in Vedic, KP, and other systems' },
              { icon:<FiStar size={32}/>,   title:'Satisfaction Guaranteed', desc:'Get a full refund if not satisfied with your consultation' },
            ].map(item => (
              <div key={item.title} style={{ background:'#fff', borderRadius:14,
                padding:'28px 24px', boxShadow:'var(--shadow)', textAlign:'center' }}>
                <div style={{ color:'var(--primary)', marginBottom:14,
                  display:'flex', justifyContent:'center' }}>{item.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:8 }}>{item.title}</h3>
                <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}