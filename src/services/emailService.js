import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const from = `"PadelTime" <${process.env.SMTP_USER}>`;

export const sendVerificationEmail = async (user, token) => {
  const link = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from,
    to: user.email,
    subject: 'Verificá tu cuenta de PadelTime',
    html: `
      <h2>Bienvenido, ${user.name}!</h2>
      <p>Hacé click en el siguiente link para verificar tu cuenta:</p>
      <a href="${link}">${link}</a>
      <p>El link expira en 24 horas.</p>
    `,
  });
};

export const sendApprovalEmail = async (user) => {
  await transporter.sendMail({
    from,
    to: user.email,
    subject: '¡Tu complejo fue aprobado!',
    html: `
      <h2>¡Felicitaciones, ${user.name}!</h2>
      <p>Tu complejo fue aprobado. Ya está visible en la plataforma.</p>
      <a href="${process.env.CLIENT_URL}/admin">Ir al panel</a>
    `,
  });
};

export const sendRejectionEmail = async (user, reason) => {
  await transporter.sendMail({
    from,
    to: user.email,
    subject: 'Tu complejo fue rechazado',
    html: `
      <h2>Hola, ${user.name}</h2>
      <p>Lamentablemente tu complejo fue rechazado.</p>
      ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
      <p>Si tenés dudas, contactanos.</p>
    `,
  });
};
