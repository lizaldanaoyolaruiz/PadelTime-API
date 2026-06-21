import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
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

export const sendContactEmail = async ({ name, email, message }) => {
  await transporter.sendMail({
    from,
    to: process.env.CONTACT_RECEIVER_EMAIL,
    subject: 'Nuevo mensaje desde PadelTime',
    text: `Nombre: ${name}\n\nEmail: ${email}\n\nMensaje:\n${message}`,
export const sendBookingConfirmedByOwnerEmail = async (booking) => {
  const destinatario = booking.player?.email || booking.jugadorExterno?.email;
  const nombre = booking.player?.name ||
    (booking.jugadorExterno ? `${booking.jugadorExterno.nombre} ${booking.jugadorExterno.apellido}` : 'Jugador');

  if (!destinatario) return;

  const court   = booking.court;
  const complex = booking.complex;

  await transporter.sendMail({
    from,
    to: destinatario,
    subject: '¡Tu reserva fue confirmada! - PadelTime',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
        <h2 style="color: #16a34a;">¡Reserva confirmada!</h2>
        <p>Hola <strong>${nombre}</strong>, el complejo confirmó tu reserva.</p>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <tr><td style="padding:6px 0; color:#555;">Complejo</td><td><strong>${complex?.name || '-'}</strong></td></tr>
          <tr><td style="padding:6px 0; color:#555;">Cancha</td><td>${court?.name || '-'}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Fecha</td><td>${booking.date}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Horario</td><td>${booking.startTime} – ${booking.endTime}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Total</td><td>$${booking.totalAmount}</td></tr>
        </table>
        <p style="margin-top:24px;">¡Nos vemos en la cancha!</p>
        <p style="color:#888; font-size:13px;">PadelTime</p>
      </div>
    `,
  });
};

export const sendBookingRejectedEmail = async (booking, motivo) => {
  const destinatario = booking.player?.email || booking.jugadorExterno?.email;
  const nombre = booking.player?.name ||
    (booking.jugadorExterno ? `${booking.jugadorExterno.nombre} ${booking.jugadorExterno.apellido}` : 'Jugador');

  if (!destinatario) return;

  await transporter.sendMail({
    from,
    to: destinatario,
    subject: 'Tu reserva fue rechazada - PadelTime',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
        <h2 style="color: #dc2626;">Reserva rechazada</h2>
        <p>Hola <strong>${nombre}</strong>, lamentablemente tu reserva fue rechazada.</p>
        <table style="width:100%; border-collapse:collapse; margin-top:16px;">
          <tr><td style="padding:6px 0; color:#555;">Cancha</td><td>${booking.court?.name || '-'}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Fecha</td><td>${booking.date}</td></tr>
          <tr><td style="padding:6px 0; color:#555;">Horario</td><td>${booking.startTime} – ${booking.endTime}</td></tr>
          ${motivo ? `<tr><td style="padding:6px 0; color:#555;">Motivo</td><td>${motivo}</td></tr>` : ''}
        </table>
        <p style="margin-top:16px;">Si tenés dudas, contactá al complejo directamente.</p>
        <p style="color:#888; font-size:13px;">PadelTime</p>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = async (booking) => {
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
