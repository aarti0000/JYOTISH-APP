require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jyotishapp';


const userSchema = new mongoose.Schema({
  name: String,

  username: {
    type: String,
    unique: true
  },

  email: String,
  password: String,
  phone: String,
  role: String,
  avatar: String,

  isActive: {
    type: Boolean,
    default: true
  },

}, { timestamps: true });

const slotSchema = new mongoose.Schema({
  date: String,
  startTime: String,
  endTime: String,
  isBooked: { type: Boolean, default: false },
});

const astrologerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bio: String,
  experience: Number,
  specializations: [String],
  languages: [String],
  pricePerMinute: Number,
  consultationTypes: [String],
  availableSlots: [slotSchema],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Astrologer = mongoose.model('Astrologer', astrologerSchema);

const astrologers = [
  {
    name: 'Pandit Ram Prasad Sharma',
    email: 'ram@jyotish.com',
    phone: '9841000001',
    bio: '20 years of experience in Vedic astrology. Expert in horoscope analysis and Vimshottari Dasha predictions. Guided thousands of Nepali families in life, career, and marriage decisions.',
    experience: 20,
    specializations: ['Vedic', 'KP'],
    languages: ['Nepali', 'Hindi', 'English'],
    pricePerMinute: 15,
    consultationTypes: ['chat', 'call', 'video'],
    rating: 4.8,
    totalReviews: 312,
    totalConsultations: 1450,
    isOnline: true
  },
  {
    name: 'Dr. Sita Devi Adhikari',
    email: 'sita@jyotish.com',
    phone: '9841000002',
    bio: 'PhD in Sanskrit and Astrology. Combines Vedic principles with modern psychological approaches to provide practical guidance. Specialist in marriage matching and career predictions.',
    experience: 12,
    specializations: ['Vedic', 'Numerology'],
    languages: ['Nepali', 'Hindi', 'English'],
    pricePerMinute: 20,
    consultationTypes: ['chat', 'video'],
    rating: 4.9,
    totalReviews: 198,
    totalConsultations: 876,
    isOnline: true
  },
  {
    name: 'Acharya Bishnu Prasad Poudel',
    email: 'bishnu@jyotish.com',
    phone: '9841000003',
    bio: 'Third-generation astrologer from Kathmandu. Specialist in Prashna astrology and Vastu Shastra. Uses traditional Parashari methods for accurate timing predictions.',
    experience: 25,
    specializations: ['Vedic', 'Vastu', 'Prashna'],
    languages: ['Nepali', 'Hindi'],
    pricePerMinute: 25,
    consultationTypes: ['call', 'video'],
    rating: 4.7,
    totalReviews: 445,
    totalConsultations: 2100,
    isOnline: false
  },
  {
    name: 'Kamala Thapa Magar',
    email: 'kamala@jyotish.com',
    phone: '9841000004',
    bio: '8 years of experience in Tarot and Numerology. Combines Tarot reading with Vedic numerology to provide complete life guidance. Known for compassionate and accurate predictions.',
    experience: 8,
    specializations: ['Tarot', 'Numerology'],
    languages: ['Nepali', 'English', 'Hindi'],
    pricePerMinute: 12,
    consultationTypes: ['chat', 'call'],
    rating: 4.6,
    totalReviews: 134,
    totalConsultations: 620,
    isOnline: true
  },
  {
    name: 'Jyotish Acharya Gopal Rijal',
    email: 'gopal@jyotish.com',
    phone: '9841000005',
    bio: 'Expert in KP astrology and Gemology. Uses precise mathematical techniques to predict important life events with remarkable accuracy.',
    experience: 15,
    specializations: ['KP', 'Gemology'],
    languages: ['Nepali', 'Hindi', 'English'],
    pricePerMinute: 18,
    consultationTypes: ['chat', 'call', 'video'],
    rating: 4.5,
    totalReviews: 267,
    totalConsultations: 980,
    isOnline: false
  },
  {
    name: 'Parbati Gurung',
    email: 'parbati@jyotish.com',
    phone: '9841000006',
    bio: 'Palmistry specialist. Combines ancient Nepali palm reading techniques with modern behavioral science for personality and destiny analysis.',
    experience: 10,
    specializations: ['Palmistry', 'Vedic'],
    languages: ['Nepali', 'English', 'Tamang'],
    pricePerMinute: 10,
    consultationTypes: ['video'],
    rating: 4.4,
    totalReviews: 89,
    totalConsultations: 340,
    isOnline: true
  },
  {
    name: 'Pt. Madhav Prasad Bhattarai',
    email: 'madhav@jyotish.com',
    phone: '9841000007',
    bio: 'Vastu Shastra expert specializing in residential and commercial spaces. Also provides Vedic astrology consultations for business timing, property, and financial decisions.',
    experience: 18,
    specializations: ['Vastu', 'Vedic'],
    languages: ['Nepali', 'Hindi', 'Maithili'],
    pricePerMinute: 22,
    consultationTypes: ['call', 'video'],
    rating: 4.7,
    totalReviews: 156,
    totalConsultations: 720,
    isOnline: false
  },
  {
    name: 'Saraswati Devi Koirala',
    email: 'saraswati@jyotish.com',
    phone: '9841000008',
    bio: 'Specialist in relationship astrology and life purpose guidance. Combines Vedic astrology with meditation practices to help people align with their true path.',
    experience: 14,
    specializations: ['Vedic', 'Tarot'],
    languages: ['Nepali', 'Hindi', 'English', 'Newari'],
    pricePerMinute: 14,
    consultationTypes: ['chat', 'call', 'video'],
    rating: 4.8,
    totalReviews: 203,
    totalConsultations: 890,
    isOnline: true
  },
];

function generateSlots() {
  const slots = [];

  const times = [
    { start: '06:00', end: '06:30' },
    { start: '07:00', end: '07:30' },
    { start: '09:00', end: '09:30' },
    { start: '10:00', end: '10:30' },
    { start: '11:00', end: '11:30' },
    { start: '14:00', end: '14:30' },
    { start: '17:00', end: '17:30' },
    { start: '19:00', end: '19:30' },
  ];

  for (let d = 0; d < 7; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);

    const dateStr = date.toISOString().split('T')[0];

    times.forEach(t =>
      slots.push({
        date: dateStr,
        startTime: t.start,
        endTime: t.end,
        isBooked: false
      })
    );
  }

  return slots;
}

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);

    console.log('✅ Connected!\n');

    const emails = astrologers.map(a => a.email);

    const existingUsers = await User.find({
      email: { $in: emails }
    });

    const existingIds = existingUsers.map(u => u._id);

    await Astrologer.deleteMany({
      user: { $in: existingIds }
    });

    await User.deleteMany({
      email: { $in: emails }
    });

    console.log('🗑️ Old data removed\n');

    const password = await bcrypt.hash('password123', 10);

    for (const data of astrologers) {
      const user = await User.create({
        name: data.name,
         username: data.email.split('@')[0],
        email: data.email,
        password,
        phone: data.phone,
        role: 'astrologer',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
        isActive: true,
      });

      await Astrologer.create({
        user: user._id,
        bio: data.bio,
        experience: data.experience,
        specializations: data.specializations,
        languages: data.languages,
        pricePerMinute: data.pricePerMinute,
        consultationTypes: data.consultationTypes,
        availableSlots: generateSlots(),
        rating: data.rating,
        totalReviews: data.totalReviews,
        totalConsultations: data.totalConsultations,
        isOnline: data.isOnline,
        isApproved: true,
      });

      console.log(`✅ Added: ${data.name}`);
    }

    console.log(`\n🎉 Completed! ${astrologers.length} astrologers added.`);
    console.log('\n📋 Login as any astrologer using:');
    console.log('   Password: password123\n');

  } catch (err) {
    console.error('❌ Failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();