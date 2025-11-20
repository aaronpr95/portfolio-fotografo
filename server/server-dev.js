const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 requests por ventana
  message: { success: false, error: 'Demasiados emails enviados. Intenta en 15 minutos.' }
});

app.use(express.json());
app.use('/api/send-email', limiter);

// Simulador de envío de email (para desarrollo)
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validación básica
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    // Simular envío (en desarrollo, solo loggeamos)
    console.log('📧 EMAIL RECIBIDO:');
    console.log('================');
    console.log(`👤 De: ${name} (${email})`);
    console.log(`📝 Mensaje: ${message}`);
    console.log(`🕐 Fecha: ${new Date().toLocaleString('es-ES')}`);
    console.log('================\n');

    // En producción, aquí enviarías el email real
    // Por ahora, solo simulamos éxito
    res.json({
      success: true,
      message: 'Email enviado correctamente (modo desarrollo)'
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Endpoint de prueba
app.get('/test', (req, res) => {
  res.json({
    status: '✅ Servidor funcionando',
    timestamp: new Date().toISOString(),
    mode: 'Desarrollo - Emails se muestran en consola'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📧 Modo: Desarrollo (emails en consola)`);
  console.log(`🌐 Test: http://localhost:${PORT}/test`);
});