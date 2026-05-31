const express = require('express');
const router = express.Router();

// 12 zodiac signs with date ranges and symbols
const SIGNS = [
  { name: 'Aries',       symbol: '♈', emoji: '🐏', dates: 'Mar 21 - Apr 19', element: 'Fire',  ruling: 'Mars' },
  { name: 'Taurus',      symbol: '♉', emoji: '🐂', dates: 'Apr 20 - May 20', element: 'Earth', ruling: 'Venus' },
  { name: 'Gemini',      symbol: '♊', emoji: '👫', dates: 'May 21 - Jun 20', element: 'Air',   ruling: 'Mercury' },
  { name: 'Cancer',      symbol: '♋', emoji: '🦀', dates: 'Jun 21 - Jul 22', element: 'Water', ruling: 'Moon' },
  { name: 'Leo',         symbol: '♌', emoji: '🦁', dates: 'Jul 23 - Aug 22', element: 'Fire',  ruling: 'Sun' },
  { name: 'Virgo',       symbol: '♍', emoji: '👧', dates: 'Aug 23 - Sep 22', element: 'Earth', ruling: 'Mercury' },
  { name: 'Libra',       symbol: '♎', emoji: '⚖️', dates: 'Sep 23 - Oct 22', element: 'Air',   ruling: 'Venus' },
  { name: 'Scorpio',     symbol: '♏', emoji: '🦂', dates: 'Oct 23 - Nov 21', element: 'Water', ruling: 'Mars' },
  { name: 'Sagittarius', symbol: '♐', emoji: '🏹', dates: 'Nov 22 - Dec 21', element: 'Fire',  ruling: 'Jupiter' },
  { name: 'Capricorn',   symbol: '♑', emoji: '🐐', dates: 'Dec 22 - Jan 19', element: 'Earth', ruling: 'Saturn' },
  { name: 'Aquarius',    symbol: '♒', emoji: '🏺', dates: 'Jan 20 - Feb 18', element: 'Air',   ruling: 'Saturn' },
  { name: 'Pisces',      symbol: '♓', emoji: '🐟', dates: 'Feb 19 - Mar 20', element: 'Water', ruling: 'Jupiter' },
];

const LOVE = [
  'Romance is in the air today. Express your feelings openly.',
  'A meaningful connection deepens. Spend quality time with loved ones.',
  'Single? Keep your eyes open — a special meeting may happen.',
  'Small gestures of love go a long way today.',
  'Communication is key in your relationships today.',
  'Trust your heart — it knows what you truly need.',
  'An old flame may reconnect. Approach with an open mind.',
  'Your charm is at its peak. Social gatherings bring joy.',
  'Patience in love will be rewarded soon.',
  'A deep emotional conversation strengthens your bond.',
];

const CAREER = [
  'A new opportunity at work deserves serious consideration.',
  'Your hard work is being noticed. Recognition is coming.',
  'Teamwork leads to great results today.',
  'Focus on one task at a time for maximum productivity.',
  'A creative idea could solve a long-standing problem.',
  'Financial gains are possible through a side venture.',
  'Stay calm under pressure — your composure impresses others.',
  'Networking opens unexpected doors today.',
  'A challenge at work is actually a hidden opportunity.',
  'Your leadership skills are needed — step up with confidence.',
];

const HEALTH = [
  'Your energy levels are high. Make the most of it.',
  'Rest is just as important as activity. Listen to your body.',
  'A short walk in nature will refresh your mind.',
  'Stay hydrated and avoid processed foods today.',
  'Mental peace comes from decluttering your environment.',
  'Exercise in the morning brings positivity throughout the day.',
  'Pay attention to your sleep schedule this week.',
  'Meditation or deep breathing helps reduce stress today.',
  'Your vitality is strong — engage in physical activity.',
  'Avoid overworking. Take regular breaks.',
];

const GENERAL = [
  'The stars align in your favor today. Trust your instincts.',
  'A moment of reflection brings clarity to a confusing situation.',
  'Unexpected news brings positive change.',
  'Stay grounded — your patience will be tested but rewarded.',
  'Today is ideal for starting something new.',
  'Look for opportunities in unexpected places.',
  'Your intuition is your greatest guide today.',
  'A conversation with a mentor brings valuable insight.',
  'Generosity comes back to you in unexpected ways.',
  'Focus on what truly matters and let go of the rest.',
  'The universe supports your boldest dreams today.',
  'Small steps taken consistently lead to great results.',
  'A lucky encounter changes your perspective.',
  'Your positive attitude attracts wonderful opportunities.',
  'Take a moment to appreciate how far you have come.',
];

const LUCKY_COLORS = ['Red', 'Blue', 'Green', 'Gold', 'Purple', 'Orange', 'White', 'Pink', 'Yellow', 'Silver', 'Teal', 'Maroon'];
const LUCKY_NUMBERS = () => {
  const nums = [];
  while (nums.length < 3) {
    const n = Math.floor(Math.random() * 99) + 1;
    if (!nums.includes(n)) nums.push(n);
  }
  return nums.sort((a, b) => a - b);
};

const MOODS = ['Happy', 'Energetic', 'Calm', 'Focused', 'Creative', 'Romantic', 'Ambitious', 'Reflective', 'Confident', 'Peaceful'];
const RATINGS = ['⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

// Seeded random — same result for same sign + date
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick(arr, rand) {
  return arr[Math.floor(rand() * arr.length)];
}

function generateHoroscope(signIndex, dateStr) {
  // Seed = sign index + date so it changes daily but stays same all day
  const dateParts = dateStr.split('-');
  const seed = signIndex * 1000 + parseInt(dateParts[0]) + parseInt(dateParts[1]) * 30 + parseInt(dateParts[2]);
  const rand = seededRandom(seed);

  const sign = SIGNS[signIndex];
  const luckyNums = [
    Math.floor(rand() * 99) + 1,
    Math.floor(rand() * 99) + 1,
    Math.floor(rand() * 99) + 1,
  ].sort((a, b) => a - b);

  return {
    ...sign,
    date: dateStr,
    description:  pick(GENERAL, rand),
    love:         pick(LOVE, rand),
    career:       pick(CAREER, rand),
    health:       pick(HEALTH, rand),
    luckyNumber:  luckyNums.join(', '),
    luckyColor:   pick(LUCKY_COLORS, rand),
    mood:         pick(MOODS, rand),
    rating:       pick(RATINGS, rand),
    compatibility: pick(SIGNS, rand).name,
  };
}

// @GET /api/horoscope/daily  — all 12 signs for today
router.get('/daily', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const horoscopes = SIGNS.map((_, i) => generateHoroscope(i, today));
  res.json({ success: true, date: today, horoscopes });
});

// @GET /api/horoscope/daily/:sign  — single sign
router.get('/daily/:sign', (req, res) => {
  const signName = req.params.sign.charAt(0).toUpperCase() + req.params.sign.slice(1).toLowerCase();
  const signIndex = SIGNS.findIndex(s => s.name === signName);
  if (signIndex === -1) {
    return res.status(404).json({ success: false, message: 'Sign not found' });
  }
  const today = new Date().toISOString().split('T')[0];
  const horoscope = generateHoroscope(signIndex, today);
  res.json({ success: true, horoscope });
});

module.exports = router;