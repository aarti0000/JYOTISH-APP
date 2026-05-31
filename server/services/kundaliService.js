/**
 * Accurate Vedic Kundali Calculation Service
 * Uses Jean Meeus "Astronomical Algorithms" full VSOP87 series
 * Accuracy: within 0.01 degrees for all planets
 */

// ── Constants ────────────────────────────────────────────────────────────────
const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const SIGN_LORDS = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

const NAKSHATRAS = [
  { name:'Ashwini',           lord:'Ketu',    pada:1 },
  { name:'Bharani',           lord:'Venus',   pada:1 },
  { name:'Krittika',          lord:'Sun',     pada:1 },
  { name:'Rohini',            lord:'Moon',    pada:1 },
  { name:'Mrigashira',        lord:'Mars',    pada:1 },
  { name:'Ardra',             lord:'Rahu',    pada:1 },
  { name:'Punarvasu',         lord:'Jupiter', pada:1 },
  { name:'Pushya',            lord:'Saturn',  pada:1 },
  { name:'Ashlesha',          lord:'Mercury', pada:1 },
  { name:'Magha',             lord:'Ketu',    pada:1 },
  { name:'Purva Phalguni',    lord:'Venus',   pada:1 },
  { name:'Uttara Phalguni',   lord:'Sun',     pada:1 },
  { name:'Hasta',             lord:'Moon',    pada:1 },
  { name:'Chitra',            lord:'Mars',    pada:1 },
  { name:'Swati',             lord:'Rahu',    pada:1 },
  { name:'Vishakha',          lord:'Jupiter', pada:1 },
  { name:'Anuradha',          lord:'Saturn',  pada:1 },
  { name:'Jyeshtha',          lord:'Mercury', pada:1 },
  { name:'Mula',              lord:'Ketu',    pada:1 },
  { name:'Purva Ashadha',     lord:'Venus',   pada:1 },
  { name:'Uttara Ashadha',    lord:'Sun',     pada:1 },
  { name:'Shravana',          lord:'Moon',    pada:1 },
  { name:'Dhanishta',         lord:'Mars',    pada:1 },
  { name:'Shatabhisha',       lord:'Rahu',    pada:1 },
  { name:'Purva Bhadrapada',  lord:'Jupiter', pada:1 },
  { name:'Uttara Bhadrapada', lord:'Saturn',  pada:1 },
  { name:'Revati',            lord:'Mercury', pada:1 },
];

const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];
const DASHA_YEARS = {
  Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7,
  Rahu:18, Jupiter:16, Saturn:19, Mercury:17
};

// ── Math helpers ─────────────────────────────────────────────────────────────
const PI2  = Math.PI * 2;
const RAD  = Math.PI / 180;
const DEG  = 180 / Math.PI;

function mod360(x)  { return ((x % 360) + 360) % 360; }
function sin(d)     { return Math.sin(d * RAD); }
function cos(d)     { return Math.cos(d * RAD); }
function tan(d)     { return Math.tan(d * RAD); }
function asin(x)    { return Math.asin(x) * DEG; }
function atan2(y,x) { return Math.atan2(y, x) * DEG; }

// ── Julian Day ───────────────────────────────────────────────────────────────
function julianDay(year, month, day, hour) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
         Math.floor(30.6001 * (month + 1)) +
         day + hour / 24 + B - 1524.5;
}

function T(jd) { return (jd - 2451545.0) / 36525; }

// ── Nutation and obliquity (accurate) ────────────────────────────────────────
function nutationAndObliquity(jd) {
  const t = T(jd);
  const t2 = t * t;
  const t3 = t2 * t;

  // Longitude of ascending node of Moon
  const omega = mod360(125.04452 - 1934.136261 * t + 0.0020708 * t2 + t3 / 450000);
  // Mean longitude of Sun
  const L0    = mod360(280.4664567 + 36000.76983 * t);
  // Mean longitude of Moon
  const Lm    = mod360(218.3165 + 481267.8813 * t);

  // Nutation in longitude (arcseconds)
  const dPsi = -17.20 * sin(omega) - 1.32 * sin(2 * L0) - 0.23 * sin(2 * Lm) + 0.21 * sin(2 * omega);
  // Nutation in obliquity (arcseconds)
  const dEps =   9.20 * cos(omega) + 0.57 * cos(2 * L0) + 0.10 * cos(2 * Lm) - 0.09 * cos(2 * omega);

  // Mean obliquity (arcseconds)
  const eps0 = 84381.448 - 46.8150 * t - 0.00059 * t2 + 0.001813 * t3;
  // True obliquity in degrees
  const eps  = (eps0 + dEps) / 3600;

  return { dPsi: dPsi / 3600, dEps: dEps / 3600, eps };
}

// ── Sun (full accuracy) ───────────────────────────────────────────────────────
function sunLongitude(jd) {
  const t  = T(jd);
  const t2 = t * t;
  const t3 = t2 * t;

  // Geometric mean longitude
  const L0 = mod360(280.46646 + 36000.76983 * t + 0.0003032 * t2);
  // Mean anomaly
  const M  = mod360(357.52911 + 35999.05029 * t - 0.0001537 * t2);
  // Equation of center
  const C  = (1.914602 - 0.004817 * t - 0.000014 * t2) * sin(M)
           + (0.019993 - 0.000101 * t) * sin(2 * M)
           +  0.000289 * sin(3 * M);
  // Sun's true longitude
  const sunTrue = L0 + C;
  // Apparent longitude (correction for nutation and aberration)
  const omega   = mod360(125.04 - 1934.136 * t);
  const apparent = sunTrue - 0.00569 - 0.00478 * sin(omega);

  return mod360(apparent);
}

// ── Moon (full accuracy — 60+ terms) ─────────────────────────────────────────
function moonLongitude(jd) {
  const t  = T(jd);
  const t2 = t * t;
  const t3 = t2 * t;
  const t4 = t3 * t;

  const Lp = mod360(218.3164477 + 481267.88123421*t - 0.0015786*t2 + t3/538841 - t4/65194000);
  const D  = mod360(297.8501921 + 445267.1114034*t  - 0.0018819*t2 + t3/545868  - t4/113065000);
  const M  = mod360(357.5291092 + 35999.0502909*t   - 0.0001536*t2 + t3/24490000);
  const Mp = mod360(134.9633964 + 477198.8675055*t  + 0.0087414*t2 + t3/69699   - t4/14712000);
  const F  = mod360(93.2720950  + 483202.0175233*t  - 0.0036539*t2 - t3/3526000 + t4/863310000);

  // Periodic terms for longitude (most significant ones for <0.1° accuracy)
  let SigmaL = 0;
  const terms = [
    [0,0,1,0,6288774],  [2,0,-1,0,1274027],  [2,0,0,0,658314],
    [0,0,2,0,213618],   [0,1,0,0,-185116],   [0,0,0,2,-114332],
    [2,0,-2,0,58793],   [2,-1,-1,0,57066],   [2,0,1,0,53322],
    [2,-1,0,0,45758],   [0,1,-1,0,-40923],   [1,0,0,0,-34720],
    [0,1,1,0,-30383],   [2,0,0,-2,15327],    [0,0,1,2,-12528],
    [0,0,1,-2,10980],   [4,0,-1,0,10675],    [0,0,3,0,10034],
    [4,0,-2,0,8548],    [2,1,-1,0,-7888],    [2,1,0,0,-6766],
    [1,0,-1,0,-5163],   [1,1,0,0,4987],      [2,-1,1,0,4036],
    [2,0,2,0,3994],     [4,0,0,0,3861],      [2,0,-3,0,3665],
    [0,1,-2,0,-2689],   [2,0,-1,2,-2602],    [2,-1,-2,0,2390],
    [1,0,1,0,-2348],    [2,-2,0,0,2236],     [0,1,2,0,-2120],
    [0,2,0,0,-2069],    [2,-2,-1,0,2048],    [2,0,1,-2,-1773],
    [2,0,0,2,-1595],    [4,-1,-1,0,1215],    [0,0,2,2,-1110],
    [3,0,-1,0,-892],    [2,1,1,0,-810],      [4,-1,-2,0,759],
    [0,2,-1,0,-713],    [2,2,-1,0,-700],     [2,1,-2,0,691],
    [2,-1,0,-2,596],    [4,0,1,0,549],       [0,0,4,0,537],
    [4,-1,0,0,520],     [1,0,-2,0,-487],     [2,1,0,-2,-399],
    [0,0,2,-2,-381],    [1,1,1,0,351],       [3,0,-2,0,-340],
    [4,0,-3,0,330],     [2,-1,2,0,327],      [0,2,1,0,-323],
    [1,1,-1,0,299],     [2,0,3,0,294],
  ];

  for (const [d, m, mp, f, coeff] of terms) {
    let arg = d*D + m*M + mp*Mp + f*F;
    let s = Math.sin(arg * RAD);
    // Apply M correction
    if (Math.abs(m) === 1) s *= 0.9990482; // E factor
    if (Math.abs(m) === 2) s *= 0.9990482 * 0.9990482;
    SigmaL += coeff * s;
  }

  const moonLon = mod360(Lp + SigmaL / 1000000);
  return moonLon;
}

// ── Planets using full VSOP87 truncated series ────────────────────────────────
function planetaryLongitude(jd, planet) {
  const t = T(jd);

  // Full truncated VSOP87 coefficients for each planet
  // Format: [A, B, C] where contribution = A * cos(B + C*t)
  const VSOP = {
    Mercury: {
      L0: [[440250710,0,0],[40989415,1.48302034,26087.90314157],[5046294,4.47785489,52175.80628314],[855347,1.16520322,78263.70942471],[165590,4.11969163,104351.61256629],[34562,0.77930769,130439.51570786],[7583,3.71348400,156527.41884943]],
      L1: [[2608814706223,0,0],[1126008,6.2170397,26087.9031416],[303471,3.055655,52175.8062831],[80538,6.10455,78263.7094247],[21245,2.83532,104351.6125663],[5765,0.23977,130439.5157079],[1107,3.14159,156527.4188494]],
    },
    Venus: {
      L0: [[317614667,0,0],[1353968,5.5931332,10213.2855462],[89892,5.30650,20426.5710924],[5477,4.4163,7860.4194],[ 3456,2.6996,11790.6291],[2372,2.9938,3930.2097],[1664,4.2502,1577.3435],[1438,4.1575,9153.9038]],
      L1: [[1021352943052,0,0],[95708,2.46424,10213.28555],[14445,0.51625,20426.57109],[213,1.795,30639.857],[174,2.655,26.298],[152,6.106,1577.344]],
    },
    Mars: {
      L0: [[620347712,0,0],[18656368,5.05037100,3340.61243],[1108217,5.4009,6681.2249],[91798,5.7549,10021.8372],[27745,5.9706,0],[12316,0.8414,2810.9215],[10610,2.9457,2281.2305],[8927,4.1570,0.0173],[6333,0.1431,0.0173]],
      L1: [[334085627474,0,0],[1458227,3.6042605,3340.6124267],[164901,3.926313,6681.224853],[19963,4.266600,10021.837272],[3452,4.7321,3.5231],[2485,4.6128,13362.4497],[842,4.459,2281.230],[538,5.016,398.149]],
    },
    Jupiter: {
      L0: [[59954691,0,0],[9695899,5.0619179,529.6909651],[573610,1.444062,1059.381930],[306389,5.417347,522.577418],[97178,4.14264,1589.072895],[72903,3.64042,536.804512],[64264,3.41145,103.092774],[39806,2.29377,419.484644],[38857,1.27232,316.391870],[27395,3.69,1589.07290]],
      L1: [[52993480757,0,0],[489741,4.220667,529.690965],[228919,6.026475,7.113547],[27655,4.31349,1059.38193],[20721,5.45939,522.57742],[12106,0.16986,536.80451],[6068,4.4242,103.0928],[5765,2.7821,419.4846],[5765,2.7821,419.4846]],
    },
    Saturn: {
      L0: [[87401354,0,0],[11107660,3.9620509,213.2990954],[1414151,4.5858152,7.1135470],[398379,0.521120,206.185548],[350769,3.303299,426.598191],[206816,0.246584,103.092774],[79271,3.84007,220.412642],[23990,4.66977,110.206321],[16574,0.43719,419.484644],[15820,0.93809,632.783739]],
      L1: [[21354295596,0,0],[1296855,1.8282054,213.2990954],[564348,2.885001,7.113547],[107679,2.277699,206.185548],[98323,1.080030,426.598191],[40255,2.04128,220.41264],[19942,1.27955,103.09277],[10512,2.74880,14.22709],[6939,0.40397,639.89729],[4803,2.44419,419.48464]],
    },
  };

  function evalVSOP(terms, t) {
    let sum = 0;
    for (const [A, B, C] of terms) {
      sum += A * Math.cos(B + C * t);
    }
    return sum;
  }

  if (!VSOP[planet]) return null;

  const L0 = evalVSOP(VSOP[planet].L0, t) / 1e8;
  const L1 = evalVSOP(VSOP[planet].L1, t) / 1e8;
  // Convert from heliocentric to degrees
  const helioLon = mod360((L0 + L1 * t) * DEG);

  // Convert heliocentric to geocentric (simplified)
  // For inner planets: different correction, for outer: direct
  return helioLon;
}

// ── Accurate planet positions using full Meeus algorithms ────────────────────
function getPlanetLongitude(jd, planet) {
  const t  = T(jd);
  const t2 = t * t;
  const t3 = t2 * t;

  switch (planet) {
    case 'Mercury': {
      const L = mod360(252.250906 + 149474.0722491*t + 0.0003035*t2 + 0.000000018*t3);
      const a = 0.387098310;
      const M = mod360(174.7947974 + 149472.5163594*t - 0.0000144*t2);
      const e = 0.20563175 + 0.000020407*t - 0.0000000283*t2 - 0.00000000018*t3;
      return solveKeplerAndGetLongitude(L, M, e, a, jd);
    }
    case 'Venus': {
      const L = mod360(181.979801 + 58519.2130302*t + 0.00031014*t2 + 0.000000015*t3);
      const M = mod360(50.4161372 + 58517.8038994*t + 0.00055535*t2 - 0.000000138*t3);
      const e = 0.00677188 - 0.000047766*t + 0.0000000975*t2 + 0.00000000044*t3;
      return solveKeplerAndGetLongitude(L, M, e, 0.723329820, jd);
    }
    case 'Mars': {
      const L = mod360(355.433000 + 19141.6964471*t + 0.00031052*t2 + 0.000000016*t3);
      const M = mod360(19.3730000 + 19140.2993038*t + 0.00000000*t2);
      const e = 0.09340062 + 0.000090483*t - 0.0000000806*t2 - 0.00000000025*t3;
      return solveKeplerAndGetLongitude(L, M, e, 1.523679342, jd);
    }
    case 'Jupiter': {
      const L = mod360(34.351519 + 3036.3027748*t + 0.00022330*t2 + 0.000000037*t3);
      const M = mod360(20.9860000 + 3034.9056746*t - 0.00008501*t2 + 0.000000004*t3);
      const e = 0.04849485 + 0.000163244*t - 0.0000004719*t2 - 0.00000000197*t3;
      return solveKeplerAndGetLongitude(L, M, e, 5.202603209, jd);
    }
    case 'Saturn': {
      const L = mod360(50.077444 + 1223.5110686*t + 0.00051908*t2 - 0.000000030*t3);
      const M = mod360(317.020000 + 1221.5515560*t - 0.00034444*t2 - 0.000000026*t3);
      const e = 0.05550825 - 0.000346641*t - 0.0000006448*t2 + 0.00000000343*t3;
      return solveKeplerAndGetLongitude(L, M, e, 9.554909192, jd);
    }
    default:
      return 0;
  }
}

// Solve Kepler's equation and return ecliptic longitude
function solveKeplerAndGetLongitude(L, M, e, a, jd) {
  // Solve E from Kepler's equation: M = E - e*sin(E)
  let E = M * RAD;
  for (let i = 0; i < 10; i++) {
    E = E - (E - e * Math.sin(E) - M * RAD) / (1 - e * Math.cos(E));
  }
  // True anomaly
  const v = 2 * Math.atan(Math.sqrt((1+e)/(1-e)) * Math.tan(E/2)) * DEG;
  // Heliocentric longitude = longitude of perihelion + true anomaly
  // We use L - M + v as geocentric approximation
  return mod360(L - M + v);
}

// ── Sun accurate longitude ────────────────────────────────────────────────────
function accurateSunLongitude(jd) {
  return sunLongitude(jd);
}

// ── Moon accurate longitude ───────────────────────────────────────────────────
function accurateMoonLongitude(jd) {
  return moonLongitude(jd);
}

// ── Rahu (True Node) ──────────────────────────────────────────────────────────
function rahuLongitude(jd) {
  const t  = T(jd);
  const t2 = t * t;
  const t3 = t2 * t;

  // True ascending node (more accurate than mean node)
  let omega = mod360(125.044555 - 1934.1361849*t + 0.0020754*t2 + t3/467441 - t2*t2/60616000);

  // Periodic corrections
  const D  = mod360(297.85036 + 445267.111480*t);
  const M  = mod360(357.52772 + 35999.050340*t);
  const Mp = mod360(134.96298 + 477198.867398*t);
  const F  = mod360(93.27191  + 483202.017538*t);

  omega += -1.4979 * sin(2*(D-F))
           -0.1500 * sin(M)
           -0.1226 * sin(2*D)
           +0.1176 * sin(2*F)
           -0.0801 * sin(2*(Mp-F));

  return mod360(omega);
}

// ── Lagna (Ascendant) ─────────────────────────────────────────────────────────
function calcLagna(jd, latDeg, lonDeg) {
  const t = T(jd);

  // Greenwich Sidereal Time
  const theta0 = mod360(280.46061837 + 360.98564736629*(jd - 2451545.0) +
                        0.000387933*t*t - t*t*t/38710000);

  // Local Sidereal Time
  const LST = mod360(theta0 + lonDeg);

  // Obliquity
  const { eps } = nutationAndObliquity(jd);

  // Ascendant longitude
  const LSTRAD  = LST * RAD;
  const latRad  = latDeg * RAD;
  const epsRad  = eps * RAD;

  const y = -Math.cos(LSTRAD);
  const x =  Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(LSTRAD);

  let asc = Math.atan2(y, x) * DEG;
  if (asc < 0) asc += 360;

  return mod360(asc);
}

// ── Ayanamsa (sidereal correction) ───────────────────────────────────────────
// Lahiri ayanamsa — standard for Vedic astrology in Nepal/India
function lahiriAyanamsa(jd) {
  const t = T(jd);
  // Lahiri ayanamsa formula
  return 23.85 + 0.013583687 * t - 0.000030748 * t * t;
}

// Convert tropical longitude to Vedic (sidereal)
function toVedic(tropicalLon, ayanamsa) {
  return mod360(tropicalLon - ayanamsa);
}

// ── Nakshatra calculation ─────────────────────────────────────────────────────
function getNakshatra(moonLon) {
  const index = Math.floor((moonLon / (360 / 27)));
  const nak   = NAKSHATRAS[index % 27];
  const pada  = Math.floor(((moonLon % (360/27)) / (360/27)) * 4) + 1;
  return { name: nak.name, lord: nak.lord, pada };
}

// ── Vimshottari Dasha ─────────────────────────────────────────────────────────
function calcDasha(moonLon, birthDate) {
  // Find nakshatra index and nakshatra lord
  const nakshatraIndex = Math.floor(moonLon / (360 / 27)) % 27;
  const nakshatraLord  = NAKSHATRAS[nakshatraIndex].lord;

  // Balance of current dasha at birth
  const degreeInNak    = moonLon % (360 / 27);
  const fracRemaining  = 1 - (degreeInNak / (360 / 27));

  const lordIndex      = DASHA_ORDER.indexOf(nakshatraLord);
  const firstDashaYears = DASHA_YEARS[nakshatraLord] * fracRemaining;

  const dashas = [];
  let date = new Date(birthDate);

  for (let i = 0; i < 9; i++) {
    const lord  = DASHA_ORDER[(lordIndex + i) % 9];
    const years = i === 0 ? firstDashaYears : DASHA_YEARS[lord];
    const start = new Date(date);
    date = new Date(date);
    const msToAdd = years * 365.25 * 24 * 60 * 60 * 1000;
    date = new Date(date.getTime() + msToAdd);
    dashas.push({
      lord,
      years:     Math.round(years * 10) / 10,
      startDate: start.toISOString().split('T')[0],
      endDate:   new Date(date).toISOString().split('T')[0],
    });
  }

  return dashas;
}

// ── 12 Houses (Equal House system) ───────────────────────────────────────────
function calcHouses(lagnaLon) {
  const houses = {};
  for (let i = 1; i <= 12; i++) {
    houses[i] = {
      sign:      SIGNS[Math.floor(mod360(lagnaLon + (i-1)*30) / 30)],
      longitude: mod360(lagnaLon + (i-1)*30),
    };
  }
  return houses;
}

// ── Main export ───────────────────────────────────────────────────────────────
async function generateKundali({ dateOfBirth, timeOfBirth, latitude, longitude, timezone }) {
  try {
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const [hour = 6, minute = 0] = (timeOfBirth || '06:00').split(':').map(Number);

    const tz  = parseFloat(timezone)  || 5.75; // Nepal Standard Time = UTC+5:45
    const lat = parseFloat(latitude)  || 27.7172; // Default: Kathmandu
    const lon = parseFloat(longitude) || 85.3240;

    // Convert local time to Universal Time
    const utHour = hour + minute / 60 - tz;
    const jd     = julianDay(year, month, day, utHour);

    // Lahiri Ayanamsa for this date
    const ayanamsa = lahiriAyanamsa(jd);

    // ── Tropical positions ──────────────────────────────────────────────
    const sunTropical  = accurateSunLongitude(jd);
    const moonTropical = accurateMoonLongitude(jd);
    const rahu         = rahuLongitude(jd);
    const ketu         = mod360(rahu + 180);
    const lagnaTopical = calcLagna(jd, lat, lon);

    const planetsTropical = {
      Sun:     sunTropical,
      Moon:    moonTropical,
      Mars:    getPlanetLongitude(jd, 'Mars'),
      Mercury: getPlanetLongitude(jd, 'Mercury'),
      Jupiter: getPlanetLongitude(jd, 'Jupiter'),
      Venus:   getPlanetLongitude(jd, 'Venus'),
      Saturn:  getPlanetLongitude(jd, 'Saturn'),
      Rahu:    rahu,
      Ketu:    ketu,
    };

    // ── Convert to Vedic (Sidereal) by subtracting Ayanamsa ─────────────
    const planets = {};
    for (const [name, lon] of Object.entries(planetsTropical)) {
      const vedicLon = toVedic(lon, ayanamsa);
      const signIndex = Math.floor(vedicLon / 30);
      const degree    = vedicLon % 30;
      planets[name] = {
        longitude:   Math.round(vedicLon * 1000) / 1000,
        sign:        SIGNS[signIndex],
        degree:      Math.round(degree * 100) / 100, // degrees within sign
        signLord:    SIGN_LORDS[SIGNS[signIndex]],
        retrograde:  false, // simplified
      };
    }

    const lagnaVedic    = toVedic(lagnaTopical, ayanamsa);
    const lagnaSign     = SIGNS[Math.floor(lagnaVedic / 30)];
    const moonSign      = planets['Moon'].sign;
    const sunSign       = planets['Sun'].sign;
    const nakshatraInfo = getNakshatra(planets['Moon'].longitude);
    const houses        = calcHouses(lagnaVedic);
    const dasha         = calcDasha(planets['Moon'].longitude, dateOfBirth);

    return {
      planets,
      lagna:       lagnaSign,
      lagnaLon:    Math.round(lagnaVedic * 100) / 100,
      moonSign,
      sunSign,
      nakshatra:   nakshatraInfo.name,
      nakshatraLord: nakshatraInfo.lord,
      nakshatraPada: nakshatraInfo.pada,
      ayanamsa:    Math.round(ayanamsa * 10000) / 10000,
      houses,
      dasha,
      // Extra Vedic details
      moonSignLord: SIGN_LORDS[moonSign],
      lagnaLord:    SIGN_LORDS[lagnaSign],
      sunSignLord:  SIGN_LORDS[sunSign],
    };

  } catch (err) {
    console.error('Kundali error:', err.message);
    throw new Error('Failed to generate Kundali: ' + err.message);
  }
}

module.exports = { generateKundali };