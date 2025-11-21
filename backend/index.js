require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const publicRoutes = require('./routes/publicRoutes');
const path = require('path');
const utilityRoutes = require('./routes/utilityRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middlewares
// Configure helmet but relax COOP/COEP so Google Sign-In popups/postMessage keep working
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploads
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure CORS with allowlist from env (comma-separated). If not set, allow all origins.
const allowed = (process.env.ALLOWED_ORIGINS || '*').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // allow non-browser requests like curl, mobile apps
    if (allowed.includes('*') || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS_NOT_ALLOWED_BY_SERVER'));
  },
  credentials: true
}));


// Rate limiter for auth endpoints
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/public', publicRoutes);
app.use('/api', utilityRoutes);

app.get('/', (req, res) => res.send('Universal Resume Builder API'));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
