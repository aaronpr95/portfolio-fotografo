const nodemailer = require('nodemailer');

// Nodemailer configuration with OAuth2
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GMAIL_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN
    }
  });
};

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize input
const sanitizeInput = (input) => {
  return input.replace(/<[^>]*>?/gm, '').trim();
};

export default async function handler(req, res) {
  // Configure CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' });
  }

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

    // Create transporter
    const transporter = createTransporter();

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
    
    console.log('✅ Email enviado exitosamente:', info.messageId);

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
}