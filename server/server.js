const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174','https://taskmanagement-production-2601.up.railway.app/'],
  credentials: true
}));

app.use(express.json());

// Static frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/users', require('./routes/UserRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0'
  });
});

// // Catch-all
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
// });

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`TaskFlow server running on port ${PORT}`);
});