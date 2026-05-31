import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const BS_MONTHS_NP = ['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत्र'];
const BS_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const DAYS_NP      = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];
const DAYS_EN      = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLORS = {
  public:    { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5', label:'Public Holiday' },
  religious: { bg:'#fef3c7', color:'#92400e', border:'#fcd34d', label:'Religious' },
  festival:  { bg:'#ede9fe', color:'#5b21b6', border:'#c4b5fd', label:'Festival' },
  other:     { bg:'#f0fdf4', color:'#166534', border:'#86efac', label:'Other' },
};

export default function CalendarPage() {
  const [tab, setTab]                   = useState('calendar');
  const [today, setToday]               = useState(null);
  const [calendar, setCalendar]         = useState(null);
  const [currentYear, setCurrentYear]   = useState(2083);
  const [currentMonth, setCurrentMonth] = useState(1);
  const [selectedDay, setSelectedDay]   = useState(null);
  const [calLoading, setCalLoading]     = useState(true);

  // Festivals tab state
  const [allFestivals, setAllFestivals]         = useState({});
  const [festLoading, setFestLoading]           = useState(false);
  const [openFestMonth, setOpenFestMonth]       = useState(null);

 

  // Load today
  useEffect(() => {
    api.get('/calendar/today').then(r => {
      const t = r.data.today;
      setToday(t);
      setCurrentYear(t.bs.year);
      setCurrentMonth(t.bs.month);
    }).catch(() => {});
  }, []);

  // Load calendar month
  useEffect(() => {
    setCalLoading(true);
    setSelectedDay(null);
    api.get(`/calendar/month?year=${currentYear}&month=${currentMonth}`)
      .then(r => setCalendar(r.data.calendar))
      .catch(() => setCalendar(null))
      .finally(() => setCalLoading(false));
  }, [currentYear, currentMonth]);

  // Load festivals when tab opens
  useEffect(() => {
    if (tab === 'festivals' && Object.keys(allFestivals).length === 0) {
      setFestLoading(true);
      api.get('/calendar/festivals?year=2083')
        .then(r => setAllFestivals(r.data.byMonth || {}))
        .catch(() => {})
        .finally(() => setFestLoading(false));
    }
  }, [tab]);

  const prevMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };
  const goToToday = () => {
    if (today) { setCurrentYear(today.bs.year); setCurrentMonth(today.bs.month); }
  };
  const isToday = (day) => today &&
    today.bs.year === currentYear &&
    today.bs.month === currentMonth &&
    today.bs.day === day.bsDay;

 

  return (
    <div className="page">
      <div className="container">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>📅</div>
          <h1 style={{ fontSize:28, fontWeight:800, color:'var(--primary)', marginBottom:6 }}>
            Nepali Calendar — BS 2083
          </h1>
          <p style={{ color:'var(--text-muted)', fontSize:14 }}>
            Bikram Sambat calendar with festivals, tithis and public holidays
          </p>
          {today && (
            <div style={{ display:'inline-flex', gap:10, alignItems:'center', marginTop:10,
              background:'var(--primary-light)', borderRadius:20, padding:'8px 20px' }}>
              <span style={{ fontWeight:700, color:'var(--primary)' }}>
                📆 Today: {today.bs.dayNp} {today.bs.monthNp} {today.bs.year} BS
              </span>
              <span style={{ color:'var(--text-muted)', fontSize:13 }}>({today.ad})</span>
            </div>
          )}
        </div>

        {/* ── Today's panchang ────────────────────────────────────── */}
        {today && (
          <div className="card" style={{ marginBottom:24,
            background:'linear-gradient(135deg,#1e1b4b,#4c1d95)', color:'#fff' }}>
            <h3 style={{ fontWeight:700, marginBottom:14, color:'#e9d5ff' }}>
              Today's Panchang — आजको पञ्चाङ्ग
            </h3>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {[
                { label:'BS Date',  value:`${today.bs.dayNp} ${today.bs.monthNp} ${today.bs.year}`, icon:'📅' },
                { label:'AD Date',  value:today.ad,    icon:'🗓️' },
                { label:'Tithi',    value:today.tithi, icon:'🌙' },
                { label:'Paksha',   value:today.paksha,icon:'☽'  },
              ].map(item => (
                <div key={item.label} style={{ flex:1, minWidth:140,
                  background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ fontSize:18, marginBottom:4 }}>{item.icon}</div>
                  <div style={{ fontSize:11, color:'#a78bfa' }}>{item.label}</div>
                  <div style={{ fontWeight:700, fontSize:13, color:'#fff', marginTop:2 }}>{item.value}</div>
                </div>
              ))}
            </div>
            {today.festivals.length > 0 && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:12, color:'#a78bfa', marginBottom:6 }}>Today's Events:</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {today.festivals.map((f,i) => (
                    <span key={i} style={{ background:'rgba(255,255,255,0.15)', borderRadius:20,
                      padding:'4px 12px', fontSize:13, color:'#fff' }}>
                      {f.icon} {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
          {[
            { key:'calendar',  label:'📅 Calendar' },
            { key:'festivals', label:'🎉 Festivals 2083' },
           
          ].map(t => (
            <button key={t.key}
              className={'btn ' + (tab===t.key ? 'btn-primary' : 'btn-secondary')}
              onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB 1 — CALENDAR
        ════════════════════════════════════════════════════════════ */}
        {tab === 'calendar' && (
          <div className="card">

            {/* Month nav */}
            <div style={{ display:'flex', alignItems:'center',
              justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
              <button className="btn btn-secondary" onClick={prevMonth}>
                <FiChevronLeft />
              </button>
              <div style={{ textAlign:'center' }}>
                <h2 style={{ fontWeight:800, fontSize:22, color:'var(--primary)', margin:0 }}>
                  {BS_MONTHS_NP[currentMonth-1]} {currentYear}
                </h2>
                <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
                  {BS_MONTHS_EN[currentMonth-1]} {currentYear} BS
                  {calendar && <span> · {calendar.adMonths}</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-secondary"
                  style={{ fontSize:12, padding:'8px 14px' }} onClick={goToToday}>
                  Today
                </button>
                <button className="btn btn-secondary" onClick={nextMonth}>
                  <FiChevronRight />
                </button>
              </div>
            </div>

            {calLoading ? (
              <div className="spinner" />
            ) : !calendar ? (
              <div className="empty-state">
                <p>Could not load calendar. Please try again.</p>
              </div>
            ) : (
              <>
                {/* Day headers */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:6 }}>
                  {DAYS_NP.map((d,i) => (
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
                  {Array.from({ length: calendar.startDayOfWeek }).map((_,i) => (
                    <div key={'emp'+i} style={{ minHeight:70 }} />
                  ))}

                  {calendar.days.map(day => {
                    const todayDay   = isToday(day);
                    const selected   = selectedDay?.bsDay === day.bsDay;
                    const hasFest    = day.festivals.length > 0;
                    return (
                      <div key={day.bsDay}
                        onClick={() => setSelectedDay(selected ? null : day)}
                        style={{
                          minHeight: 70,
                          border: '1.5px solid',
                          borderColor: todayDay ? 'var(--primary)' : selected ? '#f59e0b' : 'var(--border)',
                          borderRadius: 8, padding: '5px 5px', cursor: 'pointer',
                          background: todayDay ? 'var(--primary)' : selected ? '#fffbeb' : hasFest ? '#faf5ff' : '#fff',
                          transition: 'all 0.15s',
                        }}>
                        {/* BS day number */}
                        <div style={{ fontWeight:800, fontSize:15,
                          color: todayDay ? '#fff' : day.isHoliday ? '#ef4444' : 'var(--text)' }}>
                          {day.bsDayNp}
                        </div>
                        {/* AD day number */}
                        <div style={{ fontSize:10,
                          color: todayDay ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                          {day.adDay}
                        </div>
                        {/* Festival icons */}
                        {hasFest && (
                          <div style={{ display:'flex', gap:1, flexWrap:'wrap', marginTop:2 }}>
                            {day.festivals.slice(0,2).map((f,i) => (
                              <span key={i} title={f.name} style={{ fontSize:10 }}>{f.icon}</span>
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
                    <div style={{ width:10, height:10, borderRadius:2, background:'var(--primary)' }} />
                    Today
                  </span>
                  <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ color:'#ef4444', fontWeight:700 }}>●</span>
                    Holiday / Saturday
                  </span>
                  <span>🎉 Festival</span>
                  <span style={{ marginLeft:'auto', fontStyle:'italic' }}>
                    Click any date for details
                  </span>
                </div>

                {/* Selected day detail */}
                {selectedDay && (
                  <div style={{ marginTop:16, padding:16, background:'#fffbeb',
                    borderRadius:12, border:'2px solid #f59e0b' }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <h4 style={{ fontWeight:800, fontSize:16, margin:0 }}>
                          {selectedDay.bsDayNp} {BS_MONTHS_NP[currentMonth-1]} {currentYear} BS
                        </h4>
                        <p style={{ fontSize:13, color:'var(--text-muted)', margin:'4px 0 0' }}>
                          {selectedDay.adDate} · {selectedDay.dayNameNp} ({selectedDay.dayNameEn})
                        </p>
                      </div>
                      <button onClick={() => setSelectedDay(null)}
                        style={{ background:'none', border:'none', fontSize:20,
                          cursor:'pointer', color:'var(--text-muted)', padding:0 }}>
                        ✕
                      </button>
                    </div>

                    {/* Tithi and Paksha */}
                    <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
                      {[
                        { label:'Tithi',  value:selectedDay.tithi,  icon:'🌙' },
                        { label:'Paksha', value:selectedDay.paksha, icon:'☽'  },
                      ].map(item => (
                        <div key={item.label} style={{ background:'#fff', borderRadius:8,
                          padding:'8px 14px', border:'1px solid var(--border)', fontSize:13 }}>
                          {item.icon} <strong>{item.label}:</strong> {item.value}
                        </div>
                      ))}
                    </div>

                    {/* Festivals */}
                    {selectedDay.festivals.length === 0 ? (
                      <p style={{ fontSize:14, color:'var(--text-muted)', margin:0 }}>
                        No special events on this day.
                      </p>
                    ) : (
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {selectedDay.festivals.map((f,i) => {
                          const c = TYPE_COLORS[f.type] || TYPE_COLORS.other;
                          return (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                              padding:'12px 14px', borderRadius:10,
                              background:c.bg, border:'1.5px solid '+c.border }}>
                              <span style={{ fontSize:26 }}>{f.icon}</span>
                              <div style={{ flex:1 }}>
                                <div style={{ fontWeight:700, fontSize:15, color:c.color }}>
                                  {f.name}
                                </div>
                                <div style={{ fontSize:13, color:c.color, opacity:0.8 }}>
                                  {f.np}
                                </div>
                              </div>
                              <span style={{ fontSize:11, fontWeight:700,
                                color:c.color, textTransform:'uppercase', opacity:0.8 }}>
                                {c.label}
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
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB 2 — FESTIVALS
        ════════════════════════════════════════════════════════════ */}
        {tab === 'festivals' && (
          <div>
            <div style={{ marginBottom:20 }}>
              <h2 style={{ fontWeight:800, fontSize:22, color:'var(--primary)', marginBottom:4 }}>
                Festivals & Holidays — BS 2083
              </h2>
              <p style={{ color:'var(--text-muted)', fontSize:14 }}>
                Click any month to see its festivals and events
              </p>
            </div>

            {festLoading ? (
              <div className="spinner" />
            ) : Object.keys(allFestivals).length === 0 ? (
              <div className="empty-state">
                <p>Could not load festivals. Please refresh the page.</p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {Object.entries(allFestivals).map(([monthNum, data]) => {
                  const isOpen = openFestMonth === monthNum;
                  return (
                    <div key={monthNum} className="card" style={{ padding:0, overflow:'hidden' }}>

                      {/* Month header — clickable */}
                      <button
                        onClick={() => setOpenFestMonth(isOpen ? null : monthNum)}
                        style={{ width:'100%', background:'none', border:'none',
                          cursor:'pointer', padding:'16px 20px',
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          textAlign:'left' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:40, height:40, borderRadius:10,
                            background:'var(--primary-light)', display:'flex',
                            alignItems:'center', justifyContent:'center',
                            fontWeight:800, fontSize:15, color:'var(--primary)' }}>
                            {monthNum}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:16, color:'var(--text)' }}>
                              {data.monthNp} ({data.monthEn})
                            </div>
                            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                              {data.festivals.length} event{data.festivals.length !== 1 ? 's' : ''}
                              {' · '}
                              {data.festivals.filter(f=>f.type==='public').length > 0 &&
                                <span style={{ color:'#ef4444' }}>
                                  {data.festivals.filter(f=>f.type==='public').length} public holiday{data.festivals.filter(f=>f.type==='public').length!==1?'s':''}
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          {/* Festival icons preview */}
                          <div style={{ display:'flex', gap:4 }}>
                            {data.festivals.slice(0,4).map((f,i) => (
                              <span key={i} style={{ fontSize:16 }}>{f.icon}</span>
                            ))}
                          </div>
                          <span style={{ fontSize:18, color:'var(--text-muted)',
                            transform: isOpen ? 'rotate(90deg)' : 'none', transition:'0.2s' }}>
                            ›
                          </span>
                        </div>
                      </button>

                      {/* Festival list — shown when open */}
                      {isOpen && (
                        <div style={{ borderTop:'1px solid var(--border)', padding:'12px 20px',
                          display:'flex', flexDirection:'column', gap:8 }}>
                          {data.festivals.map((f, i) => {
                            const c = TYPE_COLORS[f.type] || TYPE_COLORS.other;
                            return (
                              <div key={i} style={{ display:'flex', alignItems:'center', gap:12,
                                padding:'12px 14px', borderRadius:10,
                                background:c.bg, border:'1.5px solid '+c.border }}>
                                <span style={{ fontSize:26, flexShrink:0 }}>{f.icon}</span>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontWeight:700, fontSize:15, color:c.color }}>
                                    {f.name}
                                  </div>
                                  <div style={{ fontSize:13, color:c.color, opacity:0.8 }}>
                                    {f.np}
                                  </div>
                                  <div style={{ fontSize:12, color:c.color, opacity:0.6, marginTop:2 }}>
                                    {f.bd} {data.monthNp} {f.by} BS
                                  </div>
                                </div>
                                <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase',
                                  color:c.color, opacity:0.8, flexShrink:0 }}>
                                  {c.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
              