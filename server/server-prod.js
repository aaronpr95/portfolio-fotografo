const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Demasiados emails enviados. Intenta de nuevo en 15 minutos.'
  }
});

// Nodemailer configuration with OAuth2
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN
  }
});

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize input
const sanitizeInput = (input) => {
  return input.replace(/<[^>]*>?/gm, '').trim();
};

// Email sending endpoint
app.post('/api/send-email', emailLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validations
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son requeridos'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'El mensaje debe tener al menos 10 caracteres'
      });
    }

    // Sanitize data
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedMessage = sanitizeInput(message);

    // Configure email
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.TO_EMAIL || process.env.GMAIL_USER,
      subject: `Nuevo mensaje del portfolio - ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            📧 Nuevo mensaje desde tu Portfolio
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Información del contacto:</h3>
            <p><strong>Nombre:</strong> ${sanitizedName}</p>
            <p><strong>Email:</strong> ${sanitizedEmail}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin-top: 0;">Mensaje:</h3>
            <p style="line-height: 1.6; color: #2c3e50;">${sanitizedMessage.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #ecf0f1; border-radius: 8px;">
            <p style="color: #7f8c8d; margin: 0;">
              📸 Mensaje enviado desde tu Portfolio de Fotografía<br>
              <small>aaron · Fotógrafo</small>
            </p>
          </div>
        </div>
      `,
      text: `
Nuevo mensaje desde tu Portfolio

Nombre: ${sanitizedName}
Email: ${sanitizedEmail}
Fecha: ${new Date().toLocaleString('es-ES')}

Mensaje:
${sanitizedMessage}

---
Mensaje enviado desde tu Portfolio de Fotografía
aaron · Fotógrafo
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente:');
    console.log(`   📧 De: ${sanitizedName} (${sanitizedEmail})`);
    console.log(`   📝 Mensaje: ${sanitizedMessage.substring(0, 50)}...`);
    console.log(`   🆔 Message ID: ${info.messageId}`);

    res.json({
      success: true,
      message: 'Email enviado correctamente'
    });

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    status: '✅ Servidor SMTP funcionando',
    gmail: process.env.GMAIL_USER ? '✅ Gmail configurado' : '❌ Gmail no configurado',
    oauth: process.env.GMAIL_REFRESH_TOKEN ? '✅ OAuth2 configurado' : '❌ OAuth2 no configurado',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Servidor SMTP corriendo en puerto ${PORT}`);
  console.log(`📧 Configurado para Gmail: ${process.env.GMAIL_USER}`);
  console.log(`📨 Emails se enviarán a: ${process.env.TO_EMAIL || process.env.GMAIL_USER}`);
  console.log(`🌐 Test: http://localhost:${PORT}/test`);
});