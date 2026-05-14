const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/users',        require('./routes/userRoutes'));
app.use('/api/astrologers',  require('./routes/astrologerRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/consultations',require('./routes/consultationRoutes'));
app.use('/api/kundali',      require('./routes/kundaliRoutes'));
app.use('/api/payments',     require('./routes/paymentRoutes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));
app.use('/api/notifications',require('./routes/notificationRoutes'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Jyotish API running ✨' }));

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
