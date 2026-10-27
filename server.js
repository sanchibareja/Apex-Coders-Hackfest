require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB } = require('./config/db');
const { attachUser } = require('./middlewares/auth');
const routes = require('./routes/index');
const app = express();
const PORT = process.env.PORT || 3000;
// 1. DATABASE CONNECTION
connectDB();
// 2. GLOBAL MIDDLEWARES
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Template engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Universal Authentication Context Middleware
app.use(attachUser);

// 3. APPLICATION ROUTES

app.use('/', routes);


// 4. GLOBAL ERROR HANDLERS

app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const msg = err.message || 'An unexpected error occurred.';
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(500).json({ success: false, error: msg });
  }
  res.status(500).render('index', {
    report: null,
    error: msg,
    notice: null,
    activeTab: 'home'
  });
});

// Start Server
app.listen(PORT, () => {
   console.log("SERVER RUNNING");  
  console.log(` URL: http://localhost:${PORT}`);

});