/**
 * Vedic Marriage Matching (Kundali Milan) Service
 * Implements all 8 Ashtakoot Gunas (36 total points)
 * Standard system used by Vedic astrologers in Nepal and India
 */

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const SIGN_NP = [
  'मेष','वृष','मिथुन','कर्कट','सिंह','कन्या',
  'तुला','वृश्चिक','धनु','मकर','कुम्भ','मीन'
];

// All 27 Nakshatras with lord, sign, pada, gana, yoni, nadi
const NAKSHATRAS = [
  { name:'Ashwini',           lord:'Ketu',    sign:'Aries',       gana:'Deva',   yoni:'Horse',    nadi:'Vata',   charan:1 },
  { name:'Bharani',           lord:'Venus',   sign:'Aries',       gana:'Manushya',yoni:'Elephant', nadi:'Pitta',  charan:2 },
  { name:'Krittika',          lord:'Sun',     sign:'Aries',       gana:'Rakshasa',yoni:'Goat',     nadi:'Kapha',  charan:3 },
  { name:'Rohini',            lord:'Moon',    sign:'Taurus',      gana:'Manushya',yoni:'Serpent',  nadi:'Kapha',  charan:4 },
  { name:'Mrigashira',        lord:'Mars',    sign:'Taurus',      gana:'Deva',   yoni:'Serpent',  nadi:'Pitta',  charan:5 },
  { name:'Ardra',             lord:'Rahu',    sign:'Gemini',      gana:'Manushya',yoni:'Dog',      nadi:'Vata',   charan:6 },
  { name:'Punarvasu',         lord:'Jupiter', sign:'Gemini',      gana:'Deva',   yoni:'Cat',      nadi:'Vata',   charan:7 },
  { name:'Pushya',            lord:'Saturn',  sign:'Cancer',      gana:'Deva',   yoni:'Goat',     nadi:'Pitta',  charan:8 },
  { name:'Ashlesha',          lord:'Mercury', sign:'Cancer',      gana:'Rakshasa',yoni:'Cat',      nadi:'Kapha',  charan:9 },
  { name:'Magha',             lord:'Ketu',    sign:'Leo',         gana:'Rakshasa',yoni:'Rat',      nadi:'Kapha',  charan:10},
  { name:'Purva Phalguni',    lord:'Venus',   sign:'Leo',         gana:'Manushya',yoni:'Rat',      nadi:'Pitta',  charan:11},
  { name:'Uttara Phalguni',   lord:'Sun',     sign:'Leo',         gana:'Manushya',yoni:'Cow',      nadi:'Vata',   charan:12},
  { name:'Hasta',             lord:'Moon',    sign:'Virgo',       gana:'Deva',   yoni:'Buffalo',  nadi:'Vata',   charan:13},
  { name:'Chitra',            lord:'Mars',    sign:'Virgo',       gana:'Rakshasa',yoni:'Tiger',    nadi:'Pitta',  charan:14},
  { name:'Swati',             lord:'Rahu',    sign:'Libra',       gana:'Deva',   yoni:'Buffalo',  nadi:'Kapha',  charan:15},
  { name:'Vishakha',          lord:'Jupiter', sign:'Libra',       gana:'Rakshasa',yoni:'Tiger',    nadi:'Kapha',  charan:16},
  { name:'Anuradha',          lord:'Saturn',  sign:'Scorpio',     gana:'Deva',   yoni:'Deer',     nadi:'Pitta',  charan:17},
  { name:'Jyeshtha',          lord:'Mercury', sign:'Scorpio',     gana:'Rakshasa',yoni:'Deer',     nadi:'Vata',   charan:18},
  { name:'Mula',              lord:'Ketu',    sign:'Sagittarius', gana:'Rakshasa',yoni:'Dog',      nadi:'Kapha',  charan:19},
  { name:'Purva Ashadha',     lord:'Venus',   sign:'Sagittarius', gana:'Manushya',yoni:'Monkey',   nadi:'Pitta',  charan:20},
  { name:'Uttara Ashadha',    lord:'Sun',     sign:'Sagittarius', gana:'Manushya',yoni:'Mongoose', nadi:'Vata',   charan:21},
  { name:'Shravana',          lord:'Moon',    sign:'Capricorn',   gana:'Deva',   yoni:'Monkey',   nadi:'Kapha',  charan:22},
  { name:'Dhanishta',         lord:'Mars',    sign:'Capricorn',   gana:'Rakshasa',yoni:'Lion',     nadi:'Pitta',  charan:23},
  { name:'Shatabhisha',       lord:'Rahu',    sign:'Aquarius',    gana:'Rakshasa',yoni:'Horse',    nadi:'Vata',   charan:24},
  { name:'Purva Bhadrapada',  lord:'Jupiter', sign:'Aquarius',    gana:'Manushya',yoni:'Lion',     nadi:'Vata',   charan:25},
  { name:'Uttara Bhadrapada', lord:'Saturn',  sign:'Pisces',      gana:'Manushya',yoni:'Cow',      nadi:'Pitta',  charan:26},
  { name:'Revati',            lord:'Mercury', sign:'Pisces',      gana:'Deva',   yoni:'Elephant', nadi:'Kapha',  charan:27},
];

const DASHA_ORDER = ['Ketu','Venus','Sun','Moon','Mars','Rahu','Jupiter','Saturn','Mercury'];

// ── Sign properties ───────────────────────────────────────────────────────────
const SIGN_ELEMENT = {
  Aries:'Fire', Taurus:'Earth', Gemini:'Air',   Cancer:'Water',
  Leo:'Fire',   Virgo:'Earth',  Libra:'Air',    Scorpio:'Water',
  Sagittarius:'Fire', Capricorn:'Earth', Aquarius:'Air', Pisces:'Water',
};

const SIGN_LORD = {
  Aries:'Mars',    Taurus:'Venus',   Gemini:'Mercury', Cancer:'Moon',
  Leo:'Sun',       Virgo:'Mercury',  Libra:'Venus',    Scorpio:'Mars',
  Sagittarius:'Jupiter', Capricorn:'Saturn', Aquarius:'Saturn', Pisces:'Jupiter',
};

// Varna (caste) for each sign (for Varna koot)
const SIGN_VARNA = {
  Aries:'Kshatriya',  Taurus:'Vaishya',   Gemini:'Shudra',
  Cancer:'Brahmin',   Leo:'Kshatriya',    Virgo:'Vaishya',
  Libra:'Shudra',     Scorpio:'Brahmin',  Sagittarius:'Kshatriya',
  Capricorn:'Vaishya',Aquarius:'Shudra',  Pisces:'Brahmin',
};

const VARNA_ORDER = ['Brahmin','Kshatriya','Vaishya','Shudra'];

// Vasya (dominance) groups
const VASYA_GROUPS = {
  Aries:    { group:'Quadruped',   dominates:['Leo','Libra'] },
  Taurus:   { group:'Quadruped',   dominates:['Cancer','Aries'] },
  Gemini:   { group:'Human',       dominates:['Virgo','Taurus','Gemini'] },
  Cancer:   { group:'Insect',      dominates:['Scorpio','Sagittarius'] },
  Leo:      { group:'Wild Animal', dominates:['Virgo'] },
  Virgo:    { group:'Human',       dominates:['Pisces','Virgo'] },
  Libra:    { group:'Human',       dominates:['Capricorn','Virgo'] },
  Scorpio:  { group:'Insect',      dominates:['Cancer'] },
  Sagittarius:{group:'Centaur',    dominates:['Pisces'] },
  Capricorn:{ group:'Aquatic',     dominates:['Aquarius','Aries'] },
  Aquarius: { group:'Human',       dominates:['Aquarius'] },
  Pisces:   { group:'Aquatic',     dominates:['Capricorn'] },
};

// Tara (birth star compatibility) — cycle of 9 from boy's nakshatra to girl's
const TARA_NAMES = ['Janma','Sampat','Vipat','Kshema','Pratyari','Sadhaka','Vadha','Mitra','Ati-Mitra'];
const TARA_SCORES = [0, 1, 0, 1, 0, 1, 0, 1, 1]; // 0=bad, 1=good

// Yoni compatibility matrix (male,female) → score
function getYoniScore(yoni1, yoni2) {
  const friendly = {
    Horse:    ['Horse'],
    Elephant: ['Elephant'],
    Goat:     ['Goat'],
    Serpent:  ['Serpent'],
    Dog:      ['Dog'],
    Cat:      ['Cat','Rat'],
    Rat:      ['Cat','Rat'],
    Cow:      ['Cow','Buffalo'],
    Buffalo:  ['Cow','Buffalo'],
    Tiger:    ['Tiger'],
    Deer:     ['Deer'],
    Monkey:   ['Monkey'],
    Mongoose: ['Mongoose'],
    Lion:     ['Lion'],
  };
  const enemy = {
    Dog:     ['Deer'],
    Deer:    ['Dog'],
    Cat:     ['Rat'],
    Rat:     ['Cat'],
    Mongoose:['Serpent'],
    Serpent: ['Mongoose'],
    Tiger:   ['Elephant'],
    Elephant:['Tiger'],
    Lion:    ['Elephant'],
    Horse:   ['Buffalo'],
    Buffalo: ['Horse'],
  };

  if (yoni1 === yoni2) return 4; // same yoni = full points
  if (enemy[yoni1]?.includes(yoni2)) return 0; // enemy = 0
  if (friendly[yoni1]?.includes(yoni2)) return 3; // friendly = 3
  return 2; // neutral = 2
}

// Graha Maitri (planetary friendship) table
const PLANET_FRIENDS = {
  Sun:     { friends:['Moon','Mars','Jupiter'],     enemies:['Venus','Saturn'],    neutral:['Mercury'] },
  Moon:    { friends:['Sun','Mercury'],             enemies:['None'],             neutral:['Mars','Jupiter','Venus','Saturn'] },
  Mars:    { friends:['Sun','Moon','Jupiter'],       enemies:['Mercury'],          neutral:['Venus','Saturn'] },
  Mercury: { friends:['Sun','Venus'],              enemies:['Moon'],             neutral:['Mars','Jupiter','Saturn'] },
  Jupiter: { friends:['Sun','Moon','Mars'],          enemies:['Mercury','Venus'],  neutral:['Saturn'] },
  Venus:   { friends:['Mercury','Saturn'],          enemies:['Sun','Moon'],       neutral:['Mars','Jupiter'] },
  Saturn:  { friends:['Mercury','Venus'],           enemies:['Sun','Moon','Mars'],neutral:['Jupiter'] },
  Rahu:    { friends:['Venus','Saturn'],            enemies:['Sun','Moon'],       neutral:['Mars','Jupiter','Mercury'] },
  Ketu:    { friends:['Mars','Jupiter'],            enemies:['Moon','Sun'],       neutral:['Mercury','Venus','Saturn'] },
};

function getPlanetRelation(p1, p2) {
  if (p1 === p2) return 'same';
  const info = PLANET_FRIENDS[p1];
  if (!info) return 'neutral';
  if (info.friends.includes(p2)) return 'friend';
  if (info.enemies.includes(p2)) return 'enemy';
  return 'neutral';
}

// Gana compatibility
const GANA_SCORE = {
  'Deva-Deva':       6,
  'Manushya-Manushya': 6,
  'Rakshasa-Rakshasa': 6,
  'Deva-Manushya':   5,
  'Manushya-Deva':   5,
  'Deva-Rakshasa':   0,
  'Rakshasa-Deva':   0,
  'Manushya-Rakshasa': 0,
  'Rakshasa-Manushya': 0,
};

// Bhakoot (moon sign compatibility)
// Based on 1-7, 6-8, 5-9, 3-11 positions (dosha) vs friendly
const BHAKOOT_DOSHA = [
  [1,7],[7,1],[6,8],[8,6],[5,9],[9,5],[3,11],[11,3]
];

function getBhakootScore(sign1Index, sign2Index) {
  const diff1 = ((sign2Index - sign1Index + 12) % 12) + 1;
  const diff2 = ((sign1Index - sign2Index + 12) % 12) + 1;
  for (const [a,b] of BHAKOOT_DOSHA) {
    if ((diff1 === a && diff2 === b)) return 0;
  }
  return 7;
}

// Nadi score
function getNadiScore(nadi1, nadi2) {
  return nadi1 === nadi2 ? 0 : 8; // same nadi = 0 (Nadi dosha), different = 8
}

// ── Main calculation ──────────────────────────────────────────────────────────

/**
 * Calculate moon longitude from birth details
 * Simplified but consistent calculation
 */
function getMoonLongitude(dateOfBirth, timeOfBirth, placeOfBirth) {
  // Deterministic seed from birth data for consistent results
  const dateStr = dateOfBirth + (timeOfBirth || '00:00') + (placeOfBirth || '');
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash = hash & hash;
  }

  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const [hour = 12, minute = 0] = (timeOfBirth || '12:00').split(':').map(Number);

  // Julian Day
  let y = year, m = month;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25*(y+4716)) + Math.floor(30.6001*(m+1)) + day + (hour+minute/60)/24 + B - 1524.5;

  const t = (jd - 2451545.0) / 36525;

  // Moon mean longitude (full formula)
  const Lp = (218.3164477 + 481267.88123421*t - 0.0015786*t*t) % 360;

  // Ayanamsa (Lahiri)
  const ayanamsa = 23.85 + 0.013583687*t;

  // Sidereal moon longitude
  let moonLon = ((Lp - ayanamsa) % 360 + 360) % 360;

  return moonLon;
}

function getNakshatraFromLon(lon) {
  const idx = Math.floor((lon / (360/27))) % 27;
  return { ...NAKSHATRAS[idx], index: idx };
}

function getSignFromLon(lon) {
  const idx = Math.floor(lon / 30) % 12;
  return { name: SIGNS[idx], nameNp: SIGN_NP[idx], index: idx };
}

// ── ASHTAKOOT CALCULATION ─────────────────────────────────────────────────────
function calculateAshtakoot(boy, girl) {

  const boyNak  = getNakshatraFromLon(boy.moonLon);
  const girlNak = getNakshatraFromLon(girl.moonLon);
  const boySign = getSignFromLon(boy.moonLon);
  const girlSign = getSignFromLon(girl.moonLon);

  const results = [];
  let totalScore = 0;
  const maxScore  = 36;

  // ── 1. VARNA (1 point) ───────────────────────────────────────────────────
  const boyVarna  = SIGN_VARNA[boySign.name];
  const girlVarna = SIGN_VARNA[girlSign.name];
  const boyVarnaOrder  = VARNA_ORDER.indexOf(boyVarna);
  const girlVarnaOrder = VARNA_ORDER.indexOf(girlVarna);
  const varnaScore = boyVarnaOrder >= girlVarnaOrder ? 1 : 0;
  totalScore += varnaScore;
  results.push({
    name:      'Varna',
    nameNp:    'वर्ण',
    maxPoints: 1,
    scored:    varnaScore,
    description: 'Spiritual compatibility and ego levels',
    detail:    `Boy: ${boyVarna} | Girl: ${girlVarna}`,
    status:    varnaScore === 1 ? 'good' : 'bad',
  });

  // ── 2. VASYA (2 points) ──────────────────────────────────────────────────
  let vasyaScore = 0;
  const boyVasya  = VASYA_GROUPS[boySign.name];
  const girlVasya = VASYA_GROUPS[girlSign.name];
  if (boySign.name === girlSign.name) {
    vasyaScore = 2;
  } else if (boyVasya?.dominates?.includes(girlSign.name)) {
    vasyaScore = 2;
  } else if (girlVasya?.dominates?.includes(boySign.name)) {
    vasyaScore = 1;
  } else if (boyVasya?.group === girlVasya?.group) {
    vasyaScore = 1;
  }
  totalScore += vasyaScore;
  results.push({
    name:      'Vasya',
    nameNp:    'वश्य',
    maxPoints: 2,
    scored:    vasyaScore,
    description: 'Mutual attraction and control between partners',
    detail:    `Boy: ${boyVasya?.group} | Girl: ${girlVasya?.group}`,
    status:    vasyaScore >= 1 ? 'good' : 'bad',
  });

  // ── 3. TARA (3 points) ───────────────────────────────────────────────────
  const taraDiff = ((girlNak.index - boyNak.index + 27) % 27);
  const taraPos  = (taraDiff % 9);
  const taraName = TARA_NAMES[taraPos];
  const taraGood = TARA_SCORES[taraPos];
  const taraScore = taraGood ? 3 : 0;
  totalScore += taraScore;
  results.push({
    name:      'Tara',
    nameNp:    'तारा',
    maxPoints: 3,
    scored:    taraScore,
    description: 'Birth star compatibility and health/fortune',
    detail:    `Position: ${taraName} (${taraPos+1}th from Boy's star)`,
    status:    taraScore > 0 ? 'good' : 'bad',
  });

  // ── 4. YONI (4 points) ───────────────────────────────────────────────────
  const yoniScore = getYoniScore(boyNak.yoni, girlNak.yoni);
  totalScore += yoniScore;
  results.push({
    name:      'Yoni',
    nameNp:    'योनि',
    maxPoints: 4,
    scored:    yoniScore,
    description: 'Physical and sexual compatibility',
    detail:    `Boy: ${boyNak.yoni} | Girl: ${girlNak.yoni}`,
    status:    yoniScore >= 3 ? 'good' : yoniScore >= 2 ? 'average' : 'bad',
  });

  // ── 5. GRAHA MAITRI (5 points) ──────────────────────────────────────────
  const boySignLord  = SIGN_LORD[boySign.name];
  const girlSignLord = SIGN_LORD[girlSign.name];
  const rel1 = getPlanetRelation(boySignLord, girlSignLord);
  const rel2 = getPlanetRelation(girlSignLord, boySignLord);
  let grahaMaitriScore = 0;
  if (rel1 === 'friend'  && rel2 === 'friend')  grahaMaitriScore = 5;
  else if (rel1 === 'friend'  && rel2 === 'neutral') grahaMaitriScore = 4;
  else if (rel1 === 'neutral' && rel2 === 'friend')  grahaMaitriScore = 4;
  else if (rel1 === 'neutral' && rel2 === 'neutral') grahaMaitriScore = 3;
  else if (rel1 === 'friend'  && rel2 === 'enemy')   grahaMaitriScore = 1;
  else if (rel1 === 'enemy'   && rel2 === 'friend')  grahaMaitriScore = 1;
  else if (rel1 === 'same')                          grahaMaitriScore = 4;
  else grahaMaitriScore = 0;
  totalScore += grahaMaitriScore;
  results.push({
    name:      'Graha Maitri',
    nameNp:    'ग्रह मैत्री',
    maxPoints: 5,
    scored:    grahaMaitriScore,
    description: 'Mental compatibility and friendship between partners',
    detail:    `Boy's lord: ${boySignLord} | Girl's lord: ${girlSignLord} | Relation: ${rel1}/${rel2}`,
    status:    grahaMaitriScore >= 4 ? 'good' : grahaMaitriScore >= 2 ? 'average' : 'bad',
  });

  // ── 6. GANA (6 points) ───────────────────────────────────────────────────
  const boyGana  = boyNak.gana;
  const girlGana = girlNak.gana;
  const ganaKey  = `${boyGana}-${girlGana}`;
  const ganaScore = GANA_SCORE[ganaKey] !== undefined ? GANA_SCORE[ganaKey] : 5;
  totalScore += ganaScore;
  results.push({
    name:      'Gana',
    nameNp:    'गण',
    maxPoints: 6,
    scored:    ganaScore,
    description: 'Temperament and behaviour compatibility',
    detail:    `Boy: ${boyGana} | Girl: ${girlGana}`,
    status:    ganaScore === 6 ? 'good' : ganaScore >= 5 ? 'average' : 'bad',
  });

  // ── 7. BHAKOOT (7 points) ────────────────────────────────────────────────
  const bhakootScore = getBhakootScore(boySign.index, girlSign.index);
  totalScore += bhakootScore;
  const diff1 = ((girlSign.index - boySign.index + 12) % 12) + 1;
  const diff2 = ((boySign.index - girlSign.index + 12) % 12) + 1;
  results.push({
    name:      'Bhakoot',
    nameNp:    'भकूट',
    maxPoints: 7,
    scored:    bhakootScore,
    description: 'Love, health and family prosperity after marriage',
    detail:    `Boy's Moon: ${boySign.name} | Girl's Moon: ${girlSign.name} | Position: ${diff1}/${diff2}`,
    status:    bhakootScore === 7 ? 'good' : 'bad',
  });

  // ── 8. NADI (8 points) ───────────────────────────────────────────────────
  const boyNadi  = boyNak.nadi;
  const girlNadi = girlNak.nadi;
  const nadiScore = getNadiScore(boyNadi, girlNadi);
  totalScore += nadiScore;
  results.push({
    name:      'Nadi',
    nameNp:    'नाडी',
    maxPoints: 8,
    scored:    nadiScore,
    description: 'Health of children and overall wellbeing (most important)',
    detail:    `Boy: ${boyNadi} Nadi | Girl: ${girlNadi} Nadi`,
    status:    nadiScore === 8 ? 'good' : 'bad',
    isNadiDosha: nadiScore === 0,
  });

  // ── Overall assessment ────────────────────────────────────────────────────
  const percentage = Math.round((totalScore / maxScore) * 100);
  let compatibility, compatibilityNp, recommendation, color;

  if (totalScore >= 32) {
    compatibility = 'Excellent Match'; compatibilityNp = 'उत्कृष्ट मिलान';
    recommendation = 'Highly auspicious match. This couple is destined for a happy, prosperous and long-lasting marriage. All major gunas are compatible.';
    color = '#10b981';
  } else if (totalScore >= 27) {
    compatibility = 'Very Good Match'; compatibilityNp = 'धेरै राम्रो मिलान';
    recommendation = 'Very good compatibility. The couple will enjoy a happy married life with minor adjustments. Marriage is highly recommended.';
    color = '#22c55e';
  } else if (totalScore >= 22) {
    compatibility = 'Good Match'; compatibilityNp = 'राम्रो मिलान';
    recommendation = 'Good compatibility. The marriage can be successful with mutual understanding and effort. Consult an astrologer for any dosha remedies.';
    color = '#84cc16';
  } else if (totalScore >= 18) {
    compatibility = 'Average Match'; compatibilityNp = 'साधारण मिलान';
    recommendation = 'Average compatibility. Marriage may face some challenges. Proper remedies and blessings from elders are advised before proceeding.';
    color = '#f59e0b';
  } else if (totalScore >= 13) {
    compatibility = 'Below Average'; compatibilityNp = 'कमजोर मिलान';
    recommendation = 'Low compatibility score. Detailed analysis by an experienced Jyotish is strongly recommended before making a decision.';
    color = '#f97316';
  } else {
    compatibility = 'Poor Match'; compatibilityNp = 'खराब मिलान';
    recommendation = 'Very low compatibility. This combination is generally not recommended. Please consult an experienced astrologer for detailed guidance and possible remedies.';
    color = '#ef4444';
  }

  // Check for major doshas
  const doshas = [];
  if (nadiScore === 0) doshas.push({ name:'Nadi Dosha', np:'नाडी दोष', severity:'high', remedy:'Perform Mahamrityunjaya Japa and consult astrologer for specific remedies' });
  if (bhakootScore === 0) doshas.push({ name:'Bhakoot Dosha', np:'भकूट दोष', severity:'medium', remedy:'Perform Graha Shanti puja for Moon. Seek blessings from elders.' });
  if (ganaScore === 0) doshas.push({ name:'Gana Dosha', np:'गण दोष', severity:'medium', remedy:'Perform Mangal Shanti and Kundali Shuddhi before marriage.' });

  return {
    totalScore,
    maxScore,
    percentage,
    compatibility,
    compatibilityNp,
    recommendation,
    color,
    gunas:  results,
    doshas,
    boyDetails: {
      moonLon:    Math.round(boy.moonLon * 100) / 100,
      moonSign:   boySign.name,
      moonSignNp: boySign.nameNp,
      nakshatra:  boyNak.name,
      nakshatraLord: boyNak.lord,
      gana:       boyNak.gana,
      yoni:       boyNak.yoni,
      nadi:       boyNak.nadi,
      signLord:   boySignLord,
      varna:      boyVarna,
    },
    girlDetails: {
      moonLon:    Math.round(girl.moonLon * 100) / 100,
      moonSign:   girlSign.name,
      moonSignNp: girlSign.nameNp,
      nakshatra:  girlNak.name,
      nakshatraLord: girlNak.lord,
      gana:       girlNak.gana,
      yoni:       girlNak.yoni,
      nadi:       girlNak.nadi,
      signLord:   girlSignLord,
      varna:      girlVarna,
    },
  };
}

/**
 * Main function — calculate marriage compatibility
 */
function calculateMarriageCompatibility(boyData, girlData) {
  const boyMoonLon  = getMoonLongitude(boyData.dateOfBirth, boyData.timeOfBirth, boyData.placeOfBirth);
  const girlMoonLon = getMoonLongitude(girlData.dateOfBirth, girlData.timeOfBirth, girlData.placeOfBirth);

  return calculateAshtakoot(
    { ...boyData,  moonLon: boyMoonLon },
    { ...girlData, moonLon: girlMoonLon }
  );
}

module.exports = { calculateMarriageCompatibility };