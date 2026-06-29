/**
 * Backend Node.js MVP Server
 * Configured specifically for deployment on Render.
 * Connects safely to Supabase and manages standard CORS configurations.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\x1b[31m%s\x1b[0m', 'CRITICAL MISCONFIGURATION: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are missing!');
}

// Instantiate Supabase Client
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');

// ==========================================
// Robust CORS Security System
// ==========================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(url => url.trim())
  : [];

// Include basic local server testing URLs by default
const whitelist = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://localhost:3000',
  'http://localhost:5173',
  ...allowedOrigins
];

const corsOptions = {
  origin: function (origin, callback) {
    // Standard developer bypass rules (Allow direct execution tools/server requests with no origin specified)
    if (!origin) return callback(null, true);
    
    // Check if domain matches standard Netlify system dynamic formats or manual setup whitelist
    const isLocalhost = origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
    const isNetlifyDomain = origin.endsWith('.netlify.app');
    
    if (isLocalhost || isNetlifyDomain || whitelist.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      console.warn(`[CORS WARN]: Blocked Request attempting access from unapproved domain: ${origin}`);
      return callback(new Error(`CORS policy violation: Target domain ${origin} not registered in allowed server arrays.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

app.use(cors(corsOptions));
app.use(express.json());

// Log incoming API Requests for clear terminal debugging on Render dashboard
app.use((req, res, next) => {
  console.log(`[API LOG] INCOMING REQUEST: [${req.method}] to path ${req.path} from Origin [${req.get('origin') || 'Internal API/System'}]`);
  next();
});

// ==========================================
// API REST Routes
// ==========================================

// Global Health Ping Check Endpoint (Excellent for Render's active monitoring rules)
app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'Backend Service Operational. Cors Rules Ready.'
  });
});

// Secure Registration Endpoint
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Mandatory field email and password values missing.' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('[Supabase Signup Error]:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Secure database signup pool registration success completed.',
      data: data
    });

  } catch (error) {
    console.error('[Internal server error during signup]:', error);
    return res.status(500).json({ success: false, error: 'Internal runtime server operations crash.' });
  }
});

// Secure Login Handshake Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Mandatory field authentication fields missing.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Supabase Login Error]:', error.message);
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: 'Security validation accepted.',
      session: data.session,
      user: data.user
    });

  } catch (error) {
    console.error('[Internal server error during authentication]:', error);
    return res.status(500).json({ success: false, error: 'Internal runtime backend login breakdown.' });
  }
});

// Profile / Token Authorization verification Route (Verify the User's JWT Token against Supabase)
app.get('/api/profile', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No authorization credentials received on request payload.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Ask Supabase Auth system to identify and approve details associated to JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      console.error('[Supabase JWT Verification Error]:', error.message);
      return res.status(401).json({ success: false, error: 'Provided JWT validation failed. Access expired.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Authorization granted.',
      user
    });

  } catch (error) {
    console.error('[Internal processing error on profile validation]:', error);
    return res.status(500).json({ success: false, error: 'Server authentication system evaluation error.' });
  }
});

// Catch-all route handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Requested path does not exist on target host.' });
});

// Port Execution Listener
app.listen(PORT, () => {
  console.log('==================================================');
  console.log(` SERVER RUNNING SUCCESSFULLY ON PORT: ${PORT}`);
  console.log(` Whitelisted Origins: ${whitelist.join(', ')}`);
  console.log('==================================================');
});
