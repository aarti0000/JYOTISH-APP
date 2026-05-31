require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jyotishapp';

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: String,
  role: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const astrologerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bio: String,
  experience: Number,
  specializations: [String],
  languages: [String],
  pricePerMinute: Number,
  consultationTypes: [String],

  // New working hours system
  workingHours: {
    startTime:    { type: String, default: '09:00' },
    endTime:      { type: String, default: '17:00' },
    slotDuration: { type: Number, default: 60 },
    workingDays:  { type: [Number], default: [0,1,2,3,4,5,6] },
  },
  blockedDates: [{ type: String }],

  rating:             { type: Number, default: 0 },
  totalReviews:       { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },
  isOnline:           { type: Boolean, default: false },
  isApproved:         { type: Boolean, default: true },
}, { timestamps: true });

const User       = mongoose.model('User', userSchema);
const Astrologer = mongoose.model('Astrologer', astrologerSchema);

// Each astrologer has different working hours
const astrologers = [
  {
    name: 'Pandit Ram Prasad Sharma',
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTJ8VBTjt6CUEGNz_5kQjoidsoS4AkVzuVNQ&s",
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
    isOnline: true,
    workingHours: {
      startTime: '06:00',
      endTime: '14:00',
      slotDuration: 60,
      workingDays: [0, 1, 2, 3, 4, 5, 6], // all days
    },
  },
  {
    name: 'Dr. Sita Devi Adhikari',
    avatar: "https://sohinisastri.com/wp-content/uploads/2025/01/DrSohiniSastri.webp",
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
    isOnline: true,
    workingHours: {
      startTime: '10:00',
      endTime: '18:00',
      slotDuration: 60,
      workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    },
  },
  {
    name: 'Acharya Bishnu Prasad Poudel',
   avatar: "https://i0.wp.com/sumitacharya.in/wp-content/uploads/2025/05/Shri-Sumitacharya-Ji-Maharaj.png?resize=1024%2C1024&ssl=1",
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
    isOnline: false,
    workingHours: {
      startTime: '07:00',
      endTime: '12:00',
      slotDuration: 60,
      workingDays: [0, 1, 2, 3, 4, 5, 6], // all days
    },
  },
  {
    name: 'Kamala Thapa Magar',
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCqe28QpBVRzS1_H7rvU0rpFPhdxtXejyUhQ&s",
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
    isOnline: true,
    workingHours: {
      startTime: '14:00',
      endTime: '22:00',
      slotDuration: 60,
      workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    },
  },
  {
    name: 'Jyotish Acharya Gopal Rijal',
    avatar: "https://media.istockphoto.com/id/2206461676/photo/old-priest-with-rudraksha-posing-on-white-background.jpg?s=612x612&w=0&k=20&c=lLbDM3wcqLf1ORlEDjYVlx1vmuns5kIDN9e11yIurug=",
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
    isOnline: false,
    workingHours: {
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 60,
      workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    },
  },
  {
    name: 'Parbati Gurung',
    avatar: "https://www.blessingsastrology.com/static/media/blesssing-home-mobile-banner.0948f7893b65b63daefc.webp",
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
    isOnline: true,
    workingHours: {
      startTime: '08:00',
      endTime: '16:00',
      slotDuration: 60,
      workingDays: [0, 2, 4, 6], // Sun, Tue, Thu, Sat
    },
  },
  {
    name: 'Pt. Madhav Prasad Bhattarai',
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQJklPpcdgqQIkBqufz7APHuy0kjk3yvKSNA&s",
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
    isOnline: false,
    workingHours: {
      startTime: '10:00',
      endTime: '20:00',
      slotDuration: 60,
      workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    },
  },
  {
    name: 'Saraswati Devi Koirala',
    avatar: "https://hindustanbytes.com/uploads/images/2025/04/image_750x_68061ab27be99.jpg",
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
    isOnline: true,
    workingHours: {
      startTime: '05:00',
      endTime: '12:00',
      slotDuration: 60,
      workingDays: [0, 1, 2, 3, 4, 5, 6], // all days
    },
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!\n');

    // Remove old data
    const emails = astrologers.map(a => a.email);
    const existingUsers = await User.find({ email: { $in: emails } });
    const existingIds = existingUsers.map(u => u._id);
    await Astrologer.deleteMany({ user: { $in: existingIds } });
    await User.deleteMany({ email: { $in: emails } });
    console.log('Old data removed\n');

    const password = await bcrypt.hash('password123', 10);

    for (const data of astrologers) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password,
        phone: data.phone,
        role: 'astrologer',
        avatar: data.avatar,
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
        workingHours: data.workingHours,
        blockedDates: [],
        rating: data.rating,
        totalReviews: data.totalReviews,
        totalConsultations: data.totalConsultations,
        isOnline: data.isOnline,
        isApproved: true,
      });

      console.log('Added: ' + data.name + ' — Working hours: ' + data.workingHours.startTime + ' to ' + data.workingHours.endTime);
    }

    console.log('\nDone! ' + astrologers.length + ' astrologers added.');
    console.log('\nEach astrologer has different working hours:');
    astrologers.forEach(a => {
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const workDays = a.workingHours.workingDays.map(d => days[d]).join(', ');
      console.log('  ' + a.name + ': ' + a.workingHours.startTime + '-' + a.workingHours.endTime + ' (' + workDays + ')');
    });
    console.log('\nPassword for all: password123');

  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();