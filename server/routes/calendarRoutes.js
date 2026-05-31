const express = require('express');
const router  = express.Router();

// ── Calendar Data ─────────────────────────────────────────────────────────────
const BS_MONTH_DAYS = {
  2080: [31,32,31,32,31,30,30,30,29,29,30,30],
  2081: [31,31,32,32,31,30,30,29,30,29,30,30],
  2082: [31,32,31,32,31,30,30,30,29,29,30,31],
  2083: [31,31,32,31,31,31,30,29,30,29,30,30],
  2084: [31,31,32,32,31,30,30,29,30,29,30,30],
  2085: [31,32,31,32,31,30,30,30,29,29,30,30],
};


const BS_MONTHS_NP = ['बैशाख','जेठ','असार','साउन','भदौ','असोज','कार्तिक','मंसिर','पुस','माघ','फागुन','चैत्र'];
const BS_MONTHS_EN = ['Baisakh','Jestha','Ashadh','Shrawan','Bhadra','Ashwin','Kartik','Mangsir','Poush','Magh','Falgun','Chaitra'];
const DAYS_NP      = ['आइत','सोम','मंगल','बुध','बिही','शुक्र','शनि'];
const DAYS_EN      = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const NP_NUMS      = ['०','१','२','३','४','५','६','७','८','९'];

function toNepNum(n) {
  return String(n).split('').map(d => NP_NUMS[+d]).join('');
}

function daysInBSMonth(y, m) {
  return (BS_MONTH_DAYS[y] || BS_MONTH_DAYS[2083])[m - 1] || 30;
}

// ── BS <-> AD conversion ──────────────────────────────────────────────────────
// Reference: BS 2082 Baisakh 1 = AD 2025 April 14
const REF_AD_YEAR  = 2026;
const REF_AD_MONTH = 4;
const REF_AD_DAY   = 14;
const REF_BS_YEAR  = 2083;
const REF_BS_MONTH = 1;
const REF_BS_DAY = 1;

function adToBS(adYear, adMonth, adDay) {
  const adDate  = new Date(adYear, adMonth - 1, adDay);
  const refDate = new Date(REF_AD_YEAR, REF_AD_MONTH - 1, REF_AD_DAY);
  let diffDays  = Math.round((adDate - refDate) / 86400000);

  let by = REF_BS_YEAR, bm = REF_BS_MONTH, bd = REF_BS_DAY;

  if (diffDays >= 0) {
    while (diffDays > 0) {
      const dim = daysInBSMonth(by, bm);
      const rem = dim - bd;
      if (diffDays <= rem) { bd += diffDays; diffDays = 0; }
      else { diffDays -= rem + 1; bd = 1; bm++; if (bm > 12) { bm = 1; by++; } }
    }
  } else {
    diffDays = Math.abs(diffDays);
    while (diffDays > 0) {
      if (diffDays < bd) { bd -= diffDays; diffDays = 0; }
      else { diffDays -= bd; bm--; if (bm < 1) { bm = 12; by--; } bd = daysInBSMonth(by, bm); }
    }
  }
  return { year: by, month: bm, day: bd };
}

function bsToAD(by, bm, bd) {
  const refDate = new Date(REF_AD_YEAR, REF_AD_MONTH - 1, REF_AD_DAY);
  let days = 0;
  let y = REF_BS_YEAR, m = REF_BS_MONTH, d = REF_BS_DAY;

  while (y < by || (y === by && m < bm) || (y === by && m === bm && d < bd)) {
    const dim = daysInBSMonth(y, m);
    if (y === by && m === bm) { days += bd - d; break; }
    days += dim - d + 1; d = 1; m++;
    if (m > 12) { m = 1; y++; }
  }

  const r = new Date(refDate);
  r.setDate(r.getDate() + days);
  return r;
}

// ── Tithi ─────────────────────────────────────────────────────────────────────
const TITHIS = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Amavasya',
];

function getTithi(adDate) {
  const ref   = new Date(2025, 0, 29); // known new moon
  const diff  = (adDate - ref) / 86400000;
  const phase = ((diff % 29.53059) + 29.53059) % 29.53059;
  return TITHIS[Math.floor(phase / (29.53059 / 30)) % 30];
}

function getPaksha(adDate) {
  const ref   = new Date(2025, 0, 29);
  const diff  = (adDate - ref) / 86400000;
  const phase = ((diff % 29.53059) + 29.53059) % 29.53059;
  return phase < 14.765 ? 'Shukla Paksha (शुक्ल पक्ष)' : 'Krishna Paksha (कृष्ण पक्ष)';
}

// ── Festivals ─────────────────────────────────────────────────────────────────
// Stored as BS dates for accuracy
const FESTIVALS = [
  // BS 2083 Baisakh (Apr-May 2026)
  { by:2083,bm:1,  bd:1,  name:'Nepali New Year 2083',        np:'नेपाली नयाँ वर्ष २०८३',   type:'public',   icon:'🎊' },
  { by:2083,bm:1,  bd:2,  name:'Bisket Jatra (Bhaktapur)',     np:'बिस्केट जात्रा',           type:'festival', icon:'🎭' },
  { by:2083,bm:1,  bd:10, name:'Ram Navami',                   np:'राम नवमी',                 type:'religious',icon:'🪔' },

  // BS 2083 Jestha (May-Jun 2026)
  { by:2083,bm:2,  bd:24, name:'Buddha Purnima',               np:'बुद्ध पूर्णिमा',           type:'public',   icon:'☸️' },

  // BS 2083 Ashadh (Jun-Jul 2026)
  { by:2083,bm:3,  bd:3,  name:'Hari Shayani Ekadashi',        np:'हरिशयनी एकादशी',          type:'religious',icon:'🕉️' },
  { by:2083,bm:3,  bd:22, name:'Guru Purnima',                  np:'गुरु पूर्णिमा',            type:'religious',icon:'🙏' },

  // BS 2083 Shrawan (Jul-Aug 2026)
  { by:2083,bm:4,  bd:4,  name:'Shrawan Sombar 1st',           np:'साउन पहिलो सोमबार',       type:'religious',icon:'🙏' },
  { by:2083,bm:4,  bd:11, name:'Shrawan Sombar 2nd',           np:'साउन दोस्रो सोमबार',      type:'religious',icon:'🙏' },
  { by:2083,bm:4,  bd:13, name:'Nag Panchami',                  np:'नाग पञ्चमी',               type:'public',   icon:'🐍' },
  { by:2083,bm:4,  bd:18, name:'Shrawan Sombar 3rd',           np:'साउन तेस्रो सोमबार',      type:'religious',icon:'🙏' },
  { by:2083,bm:4,  bd:25, name:'Shrawan Sombar 4th',           np:'साउन चौथो सोमबार',        type:'religious',icon:'🙏' },
  { by:2083,bm:4,  bd:26, name:'Janai Purnima / Raksha Bandhan',np:'जनै पूर्णिमा / रक्षाबन्धन',type:'public', icon:'🧵' },

  // BS 2083 Bhadra (Aug-Sep 2026)
  { by:2083,bm:5,  bd:3,  name:'Krishna Janmashtami',          np:'कृष्ण जन्माष्टमी',         type:'public',   icon:'🪈' },
  { by:2083,bm:5,  bd:9,  name:'Teej',                         np:'तीज',                      type:'public',   icon:'💃' },
  { by:2083,bm:5,  bd:29, name:'Indra Jatra begins',           np:'इन्द्र जात्रा',             type:'festival', icon:'🎭' },

  // BS 2083 Ashwin (Sep-Oct 2026)
  { by:2083,bm:6,  bd:17, name:'Ghatasthapana (Dashain begins)',np:'घटस्थापना (दशैं शुरु)',  type:'public',   icon:'🌺' },
  { by:2083,bm:6,  bd:22, name:'Fulpati',                      np:'फूलपाती',                  type:'public',   icon:'🌸' },
  { by:2083,bm:6,  bd:23, name:'Maha Ashtami',                 np:'महाअष्टमी',                type:'public',   icon:'🔱' },
  { by:2083,bm:6,  bd:24, name:'Maha Navami',                  np:'महानवमी',                  type:'public',   icon:'🔱' },
  { by:2083,bm:6,  bd:25, name:'Vijaya Dashami',               np:'विजया दशमी (दशैं)',        type:'public',   icon:'🎊' },
  { by:2083,bm:6,  bd:29, name:'Kojagrat Purnima',             np:'कोजाग्रत पूर्णिमा',        type:'religious',icon:'🌕' },

  // BS 2083 Kartik (Oct-Nov 2026)
  { by:2083,bm:7,  bd:1,  name:'Kaag Tihar',                   np:'काग तिहार',                type:'festival', icon:'🐦‍⬛' },
  { by:2083,bm:7,  bd:2,  name:'Kukur Tihar',                  np:'कुकुर तिहार',              type:'festival', icon:'🐕' },
  { by:2083,bm:7,  bd:3,  name:'Laxmi Puja / Deepawali',       np:'लक्ष्मी पूजा / दीपावली',  type:'public',   icon:'🪔' },
  { by:2083,bm:7,  bd:4,  name:'Goru Tihar / Mha Puja',        np:'गोरु तिहार / म्ह पूजा',   type:'festival', icon:'🐄' },
  { by:2083,bm:7,  bd:5,  name:'Bhai Tika',                    np:'भाइटीका',                  type:'public',   icon:'🌺' },
  { by:2083,bm:7,  bd:9,  name:'Chhath Puja',                  np:'छठ पूजा',                  type:'public',   icon:'🌅' },

  // BS 2083 Mangsir (Nov-Dec 2026)
  { by:2083,bm:8,  bd:8,  name:'Vivah Panchami',               np:'विवाह पञ्चमी',             type:'religious',icon:'💒' },

  // BS 2083 Poush (Dec 2026 - Jan 2027)
  { by:2083,bm:9,  bd:10, name:'Christmas',                    np:'क्रिसमस',                  type:'public',   icon:'🎄' },
  { by:2083,bm:9,  bd:17, name:'New Year 2027',                np:'नयाँ वर्ष २०२७',           type:'public',   icon:'🎆' },

  // BS 2083 Magh (Jan-Feb 2027)
  { by:2083,bm:10, bd:1,  name:'Maghe Sankranti',              np:'माघे सङ्क्रान्ति',         type:'public',   icon:'🌞' },
  { by:2083,bm:10, bd:16, name:'Sonam Losar',                  np:'सोनाम लोसार',              type:'festival', icon:'🎊' },
  { by:2083,bm:10, bd:30, name:'Maha Shivaratri',              np:'महाशिवरात्री',             type:'public',   icon:'🙏' },

  // BS 2083 Falgun (Feb-Mar 2027)
  { by:2083,bm:11, bd:19, name:'Holi (Fagu Purnima)',          np:'होली (फागु पूर्णिमा)',     type:'public',   icon:'🌈' },
  { by:2083,bm:11, bd:23, name:'International Women\'s Day',   np:'महिला दिवस',               type:'public',   icon:'♀️' },

  // BS 2083 Chaitra (Mar-Apr 2027)
  { by:2083,bm:12, bd:14, name:'Ghode Jatra',                  np:'घोडे जात्रा',              type:'festival', icon:'🐎' },
  { by:2083,bm:12, bd:19, name:'Ram Navami',                   np:'राम नवमी',                 type:'religious',icon:'🪔' },
  { by:2083,bm:12, bd:29, name:'Chaite Dashain',               np:'चैते दशैं',                type:'religious',icon:'🌸' },
];

// Get festivals for a specific BS date
function getFestivalsForBS(by, bm, bd) {
  return FESTIVALS.filter(f => f.by === by && f.bm === bm && f.bd === bd);
}

// Get all festivals grouped by BS month
function getFestivalsByMonth(by, bm) {
  return FESTIVALS
    .filter(f => f.by === by && f.bm === bm)
    .sort((a, b) => a.bd - b.bd);
}

// Generate full calendar for a BS month
function generateMonthCalendar(by, bm) {
  const dim       = daysInBSMonth(by, bm);
  const firstAD   = bsToAD(by, bm, 1);
  const startDow  = firstAD.getDay();

  // AD month label
  const lastAD    = bsToAD(by, bm, dim);
  const AD_MON    = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const adLabel   = firstAD.getMonth() === lastAD.getMonth()
    ? `${AD_MON[firstAD.getMonth()]} ${firstAD.getFullYear()}`
    : `${AD_MON[firstAD.getMonth()]} - ${AD_MON[lastAD.getMonth()]} ${lastAD.getFullYear()}`;

  const days = [];
  for (let d = 1; d <= dim; d++) {
    const adDate   = bsToAD(by, bm, d);
    const dow      = adDate.getDay();
    const festivals = getFestivalsForBS(by, bm, d);
    days.push({
      bsDay:     d,
      bsDayNp:   toNepNum(d),
      adDay:     adDate.getDate(),
      adMonth:   adDate.getMonth() + 1,
      adYear:    adDate.getFullYear(),
      adDate:    adDate.toISOString().split('T')[0],
      dayOfWeek: dow,
      dayNameNp: DAYS_NP[dow],
      dayNameEn: DAYS_EN[dow],
      isHoliday: dow === 6 || festivals.some(f => f.type === 'public'),
      festivals,
      tithi:     getTithi(adDate),
      paksha:    getPaksha(adDate),
    });
  }

  return {
    bsYear:      by,
    bsMonth:     bm,
    bsMonthNp:   BS_MONTHS_NP[bm - 1],
    bsMonthEn:   BS_MONTHS_EN[bm - 1],
    daysInMonth: dim,
    startDayOfWeek: startDow,
    adMonths:    adLabel,
    days,
  };
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/calendar/today
router.get('/today', (req, res) => {
  const now   = new Date();
  const bs    = adToBS(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const adStr = now.toISOString().split('T')[0];
  res.json({
    success: true,
    today: {
      bs: {
        year:    bs.year, month: bs.month, day: bs.day,
        dayNp:   toNepNum(bs.day),
        monthNp: BS_MONTHS_NP[bs.month - 1],
        monthEn: BS_MONTHS_EN[bs.month - 1],
      },
      ad:       adStr,
      tithi:    getTithi(now),
      paksha:   getPaksha(now),
      festivals: getFestivalsForBS(bs.year, bs.month, bs.day),
    },
  });
});

// GET /api/calendar/month?year=2083&month=1
router.get('/month', (req, res) => {
  const year  = parseInt(req.query.year)  || 2083;
  const month = parseInt(req.query.month) || 1;
  if (month < 1 || month > 12) {
    return res.status(400).json({ success: false, message: 'Month must be 1-12' });
  }
  const calendar = generateMonthCalendar(year, month);
  res.json({ success: true, calendar });
});

// GET /api/calendar/festivals?year=2083&month=1
// month is optional — if omitted returns all festivals for the year
router.get('/festivals', (req, res) => {
  const year  = parseInt(req.query.year)  || 2083;
  const month = req.query.month ? parseInt(req.query.month) : null;

  if (month) {
    const festivals = getFestivalsByMonth(year, month);
    res.json({ success: true, festivals, month, year });
  } else {
    // Group all festivals by month
    const byMonth = {};
    for (let m = 1; m <= 12; m++) {
      const fests = getFestivalsByMonth(year, m);
      if (fests.length > 0) {
        byMonth[m] = {
          monthNp: BS_MONTHS_NP[m - 1],
          monthEn: BS_MONTHS_EN[m - 1],
          festivals: fests,
        };
      }
    }
    res.json({ success: true, byMonth, year });
  }
});

// GET /api/calendar/upcoming?days=30
router.get('/upcoming', (req, res) => {
  const days  = parseInt(req.query.days) || 30;
  const now   = new Date();
  const result = [];

  for (let i = 0; i <= days; i++) {
    const d   = new Date(now);
    d.setDate(d.getDate() + i);
    const bs  = adToBS(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const fests = getFestivalsForBS(bs.year, bs.month, bs.day);
    if (fests.length > 0) {
      result.push({
        daysAway:  i,
        adDate:    d.toISOString().split('T')[0],
        bs,
        bsLabel:   `${toNepNum(bs.day)} ${BS_MONTHS_NP[bs.month-1]} ${toNepNum(bs.year)}`,
        festivals: fests,
      });
    }
  }
  res.json({ success: true, upcoming: result });
});

// GET /api/calendar/convert?ad=2026-04-14
// GET /api/calendar/convert?bsYear=2083&bsMonth=1&bsDay=1
router.get('/convert', (req, res) => {
  const { ad, bsYear, bsMonth, bsDay } = req.query;

  if (ad) {
    const parts = ad.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return res.status(400).json({ success: false, message: 'Invalid AD date format. Use YYYY-MM-DD' });
    }
    const bs = adToBS(parts[0], parts[1], parts[2]);
    return res.json({
      success: true,
      ad,
      bs: { ...bs, monthNp: BS_MONTHS_NP[bs.month-1], monthEn: BS_MONTHS_EN[bs.month-1] },
    });
  }

  if (bsYear && bsMonth && bsDay) {
    const y = parseInt(bsYear), m = parseInt(bsMonth), d = parseInt(bsDay);
    if (isNaN(y) || isNaN(m) || isNaN(d) || m < 1 || m > 12 || d < 1 || d > 32) {
      return res.status(400).json({ success: false, message: 'Invalid BS date' });
    }
    const adDate = bsToAD(y, m, d);
    return res.json({
      success: true,
      bs: { year: y, month: m, day: d, monthNp: BS_MONTHS_NP[m-1], monthEn: BS_MONTHS_EN[m-1] },
      ad: adDate.toISOString().split('T')[0],
    });
  }

  res.status(400).json({ success: false, message: 'Provide ad=YYYY-MM-DD or bsYear+bsMonth+bsDay' });
});

module.exports = router;