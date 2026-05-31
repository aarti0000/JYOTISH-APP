import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiMoon, FiCompass, FiAward, FiSliders } from 'react-icons/fi';

const BS_MONTHS_NP = ['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत्र'];
const BS_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const DAYS_NP      = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];
const DAYS_EN      = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const TYPE_COLORS = {
  public:    { bg: 'rgba(255, 77, 109, 0.08)', color: '#ff758f', border: 'rgba(255, 77, 109, 0.25)', label: 'Public Holiday' },
  religious: { bg: 'rgba(255, 158, 0, 0.08)', color: '#ffb703', border: 'rgba(255, 158, 0, 0.25)', label: 'Religious' },
  festival:  { bg: 'rgba(157, 78, 221, 0.08)', color: '#c8b6ff', border: 'rgba(157, 78, 221, 0.25)', label: 'Festival' },
  other:     { bg: 'rgba(56, 176, 0, 0.08)', color: '#70e000', border: 'rgba(56, 176, 0, 0.25)', label: 'Other' },
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
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <FiCalendar size={56} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 10px var(--primary))', marginBottom: 16 }} />
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: "'Cinzel', serif" }}>
            Nepali Calendar — BS {currentYear}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Bikram Sambat calendar with festivals, tithis and public holidays
          </p>
          {today && (
            <div style={{ display: 'inline-flex', gap: 10, alignItems: 'center', marginTop: 12,
              background: 'var(--primary-light)', border: '1px solid rgba(157, 78, 221, 0.25)', borderRadius: 20, padding: '8px 20px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <FiCalendar style={{ color: 'var(--primary)' }} /> Today: {today.bs.dayNp} {today.bs.monthNp} {today.bs.year} BS
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({today.ad})</span>
            </div>
          )}
        </div>

        {/* ── Today's panchang ────────────────────────────────────── */}
        {today && (
          <div className="card" style={{ marginBottom: 32,
            background: 'var(--card)', color: 'var(--text)' }}>
            <h3 style={{ fontWeight: 800, marginBottom: 16, color: 'var(--text)', fontFamily: "'Cinzel', serif" }}>
              Today's Panchang — आजको पञ्चाङ्ग
            </h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'BS Date',  value: `${today.bs.dayNp} ${today.bs.monthNp} ${today.bs.year}`, icon: <FiCalendar /> },
                { label: 'AD Date',  value: today.ad,    icon: <FiCalendar /> },
                { label: 'Tithi',    value: today.tithi, icon: <FiMoon /> },
                { label: 'Paksha',   value: today.paksha, icon: <FiCompass /> },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, minWidth: 140,
                  background: 'var(--bg)', border: '1px solid rgba(157,78,221,0.1)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 18, marginBottom: 6, color: 'var(--primary)' }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginTop: 4 }}>{item.value}</div>
                </div>
              ))}
            </div>
            {today.festivals.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Today's Events:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {today.festivals.map((f, i) => (
                    <span key={i} style={{ background: 'rgba(123, 44, 191, 0.08)', border: '1px solid var(--border)', borderRadius: 20,
                      padding: '4px 12px', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { key: 'calendar',  label: 'Calendar', icon: <FiCalendar /> },
            { key: 'festivals', label: 'Festivals 2083', icon: <FiAward /> },
          ].map(t => (
            <button key={t.key}
              className={'btn ' + (tab===t.key ? 'btn-primary' : 'btn-secondary')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              onClick={() => setTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB 1 — CALENDAR
        ════════════════════════════════════════════════════════════ */}
        {tab === 'calendar' && (
          <div className="card">

            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <button className="btn btn-secondary" onClick={prevMonth}>
                <FiChevronLeft size={18} />
              </button>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontWeight: 800, fontSize: 24, color: '#fff', margin: 0, fontFamily: "'Cinzel', serif" }}>
                  {BS_MONTHS_NP[currentMonth-1]} {currentYear}
                </h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {BS_MONTHS_EN[currentMonth-1]} {currentYear} BS
                  {calendar && <span> · {calendar.adMonths}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-secondary"
                  style={{ fontSize: 13, padding: '10px 16px' }} onClick={goToToday}>
                  Today
                </button>
                <button className="btn btn-secondary" onClick={nextMonth}>
                  <FiChevronRight size={18} />
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, marginBottom: 8 }}>
                  {DAYS_NP.map((d, i) => (
                    <div key={d} style={{
                      textAlign: 'center',
                      padding: '10px 4px',
                      fontWeight: 700,
                      fontSize: 13,
                      background: 'rgba(123, 44, 191, 0.03)',
                      borderRadius: 8,
                      color: i===6 ? '#ff4d6d' : i===0 ? 'var(--secondary)' : 'var(--text-muted)'
                    }}>  {d}
                      <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7 }}>{DAYS_EN[i]}</div>
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
                  {Array.from({ length: calendar.startDayOfWeek }).map((_, i) => (
                    <div key={'emp'+i} style={{ minHeight: 70, opacity: 0, pointerEvents: 'none' }} />
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
                          borderColor: todayDay ? 'var(--primary)' : selected ? 'var(--secondary)' : 'rgba(157,78,221,0.15)',
                          borderRadius: 10, padding: '8px', cursor: 'pointer',
                          background: todayDay ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                            : selected ? 'rgba(255, 158, 0, 0.1)'
                            : hasFest ? 'rgba(157, 78, 221, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          transition: 'all 0.2s ease',
                          boxShadow: todayDay ? 'var(--glow)' : 'none',
                        }}
                        onMouseEnter={e => {
                          if(!todayDay) e.currentTarget.style.borderColor = selected ? 'var(--secondary)' : 'var(--primary)';
                        }}
                        onMouseLeave={e => {
                          if(!todayDay) e.currentTarget.style.borderColor = selected ? 'var(--secondary)' : 'rgba(157,78,221,0.15)';
                        }}>
                        {/* BS day number */}
                        <div style={{ fontWeight: 800, fontSize: 16,
                          color: todayDay ? '#fff' : day.isHoliday ? '#ff4d6d' : 'var(--text)' }}>
                          {day.bsDayNp}
                        </div>
                        {/* AD day number */}
                        <div style={{ fontSize: 10, marginTop: 2,
                          color: todayDay ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)' }}>
                          {day.adDay}
                        </div>
                        {/* Festival dots */}
                        {hasFest && (
                          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: todayDay ? '#fff' : 'var(--primary)' }} />
                            {day.festivals.length > 1 && (
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: todayDay ? '#fff' : 'var(--secondary)' }} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 20, marginTop: 20,
                  flexWrap: 'wrap', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid rgba(157, 78, 221, 0.1)', paddingTop: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                    Today
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4d6d' }} />
                    Holiday / Saturday
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)' }} />
                    Festival
                  </span>
                  <span style={{ marginLeft: 'auto', fontStyle: 'italic' }}>
                    Click any date for details
                  </span>
                </div>

                {/* Selected day detail */}
                {selectedDay && (
                  <div style={{
                    marginTop: 20, padding: 24,
                    background: 'var(--card)',
                    borderRadius: 12,
                    border: '1.5px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: 18, margin: 0, color: 'var(--text)', fontFamily: "'Cinzel', serif" }}>
                          {selectedDay.bsDayNp} {BS_MONTHS_NP[currentMonth-1]} {currentYear} BS
                        </h4>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                          {selectedDay.adDate} · {selectedDay.dayNameNp} ({selectedDay.dayNameEn})
                        </p>
                      </div>
                      <button onClick={() => setSelectedDay(null)}
                        style={{ background: 'rgba(123, 44, 191, 0.08)', border: 'none', width: 28, height: 28, borderRadius: '50%', fontSize: 14,
                          cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                        ✕
                      </button>
                    </div>

                    {/* Tithi and Paksha */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Tithi',  value: selectedDay.tithi,  icon: <FiMoon /> },
                        { label: 'Paksha', value: selectedDay.paksha, icon: <FiCompass /> },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(123,44,191,0.03)', border: '1px solid var(--border)', borderRadius: 8,
                          padding: '8px 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: 'var(--primary)' }}>{item.icon}</span> <strong>{item.label}:</strong> {item.value}
                        </div>
                      ))}
                    </div>

                    {/* Festivals */}
                    {selectedDay.festivals.length === 0 ? (
                      <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
                        No special events on this day.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {selectedDay.festivals.map((f, i) => {
                          const c = TYPE_COLORS[f.type] || TYPE_COLORS.other;
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                              padding: '12px 16px', borderRadius: 8,
                              background: c.bg, border: '1px solid ' + c.border }}>
                              <FiAward size={20} style={{ color: c.color }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: c.color }}>
                                  {f.name}
                                </div>
                                <div style={{ fontSize: 12, color: c.color, opacity: 0.8 }}>
                                  {f.np}
                                </div>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700,
                                color: c.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontWeight: 800, fontSize: 24, color: '#fff', marginBottom: 6, fontFamily: "'Cinzel', serif" }}>
                Festivals & Holidays — BS {currentYear}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(allFestivals).map(([monthNum, data]) => {
                  const isOpen = openFestMonth === monthNum;
                  return (
                    <div key={monthNum} className="card" style={{ padding: 0, overflow: 'hidden' }}>

                      {/* Month header — clickable */}
                      <button
                        onClick={() => setOpenFestMonth(isOpen ? null : monthNum)}
                        style={{ width: '100%', background: 'none', border: 'none',
                          cursor: 'pointer', padding: '16px 20px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10,
                            background: 'var(--primary-light)', border: '1px solid rgba(157, 78, 221, 0.25)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: 15, color: '#fff' }}>
                            {monthNum}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', fontFamily: "'Cinzel', serif" }}>
                              {data.monthNp} ({data.monthEn})
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                              {data.festivals.length} event{data.festivals.length !== 1 ? 's' : ''}
                              {' · '}
                              {data.festivals.filter(f=>f.type==='public').length > 0 &&
                                <span style={{ color: '#ff758f', fontWeight: 600 }}>
                                  {data.festivals.filter(f=>f.type==='public').length} public holiday{data.festivals.filter(f=>f.type==='public').length!==1?'s':''}
                                </span>
                              }
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 18, color: 'var(--text-muted)',
                            transform: isOpen ? 'rotate(90deg)' : 'none', transition: '0.2s' }}>
                            ›
                          </span>
                        </div>
                      </button>

                      {/* Festival list — shown when open */}
                      {isOpen && (
                        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px',
                          display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {data.festivals.map((f, i) => {
                            const c = TYPE_COLORS[f.type] || TYPE_COLORS.other;
                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                                padding: '12px 16px', borderRadius: 8,
                                background: c.bg, border: '1px solid ' + c.border }}>
                                <FiAward size={20} style={{ color: c.color, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 700, fontSize: 14, color: c.color }}>
                                    {f.name}
                                  </div>
                                  <div style={{ fontSize: 12, color: c.color, opacity: 0.8 }}>
                                    {f.np}
                                  </div>
                                  <div style={{ fontSize: 11, color: c.color, opacity: 0.6, marginTop: 4 }}>
                                    {f.bd} {data.monthNp} {f.by} BS
                                  </div>
                                </div>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                                  color: c.color, opacity: 0.8, flexShrink: 0, letterSpacing: 0.5 }}>
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