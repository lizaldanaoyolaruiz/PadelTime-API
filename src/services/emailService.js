const nodemailer = require('nodemailer');

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

const sendVerificationEmail = async (user, token) => {
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

const sendPendingApprovalEmail = async (user) => {
  await transporter.sendMail({
    from,
    to: user.email,
    subject: 'Tu cuenta está pendiente de aprobación',
    html: `
      <h2>Hola, ${user.name}!</h2>
      <p>Tu solicitud para registrar un complejo fue recibida.</p>
      <p>Nuestro equipo revisará tu cuenta y recibirás una notificación cuando sea aprobada.</p>
    `,
  });
};

const sendApprovalEmail = async (user) => {
  await transporter.sendMail({
    from,
    to: user.email,
    subject: '¡Tu cuenta fue aprobada!',
    html: `
      <h2>¡Felicitaciones, ${user.name}!</h2>
      <p>Tu cuenta de administrador fue aprobada. Ya podés iniciar sesión y configurar tu complejo.</p>
      <a href="${process.env.CLIENT_URL}/login">Iniciar sesión</a>
    `,
  });
};

const sendRejectionEmail = async (user, reason) => {
  await transporter.sendMail({
    from,
    to: user.email,
    subject: 'Tu solicitud fue rechazada',
    html: `
      <h2>Hola, ${user.name}</h2>
      <p>Lamentablemente tu solicitud de administrador fue rechazada.</p>
      ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ''}
      <p>Si tenés dudas, contactanos.</p>
    `,
  });
};

/**
 * Sends a booking confirmation email once MP marks the payment as approved.
 * Expects booking to have court, complex, and player already populated.
 */
const sendBookingConfirmationEmail = async (booking) => {
  const player = booking.player;
  const court = booking.court;
  const complex = booking.complex;

  const dateStr = new Date(booking.date).toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  await transporter.sendMail({
    from,
    to: player.email,
    subject: '¡Tu reserva fue confirmada! - PadelTime',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
        <h2 style="color: #16a34a;">¡Reserva confirmada!</h2>
        <p>Hola <strong>${player.name}</strong>, tu seña fue acreditada y la reserva quedó confirmada.</p>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <tr><td style="padding:6px 0; color:#555;">Complejo</td><td><strong>${complex.name}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#555;">Dirección</td><td>${complex.location || complex.city || '-'}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Cancha</td><td>${court.name} (${court.type})</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Fecha</td><td>${dateStr}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Horario</td><td>${booking.startTime} – ${booking.endTime}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Seña abonada</td><td><strong>$${booking.depositAmount}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#555;">Total</td><td>$${booking.totalAmount}</td></tr>
        </table>
        <p style="margin-top:24px;">¡Nos vemos en la cancha! 🎾</p>
        <p style="color:#888; font-size:13px;">PadelTime</p>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPendingApprovalEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendBookingConfirmationEmail,
};
