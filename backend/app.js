require('dotenv').config();
const express = require('express');
const ticketRoutes = require('./src/routes/ticketRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============== MIDDLEWARES ==============

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// CORS (se necessário)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ============== ROTAS ==============

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rotas de tickets
app.use('/api/tickets', ticketRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API Zammad Help Desk',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tickets: '/api/tickets'
    }
  });
});

// ============== TRATAMENTO DE ERROS ==============

// 404 - Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
    method: req.method
  });
});

// Error handler global
app.use((error, req, res, next) => {
  console.error('Erro global:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

// ============== INICIALIZAÇÃO ==============

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor iniciado!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`📝 Base API: http://localhost:${PORT}/api/tickets\n`);
});