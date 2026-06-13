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

module.exports = {
  sendVerificationEmail,
  sendPendingApprovalEmail,
  sendApprovalEmail,
  sendRejectionEmail,
};

export const enviarConfirmacionReserva = async (jugador, reserva) => {
  const nombre = `${jugador.nombre || ''} ${jugador.apellido || ''}`.trim() || 'jugador';
  console.log(
    `[email simulado] Reserva confirmada → ${jugador.email} | Hola ${nombre}, tu reserva en "${reserva.cancha?.nombre}" el ${reserva.fecha?.toLocaleDateString('es-AR')} de ${reserva.horaInicio} a ${reserva.horaFin} fue CONFIRMADA.`
  );
};

export const enviarRechazoReserva = async (jugador, reserva) => {
  const nombre = `${jugador.nombre || ''} ${jugador.apellido || ''}`.trim() || 'jugador';
  const nota = reserva.notaOwner ? ` Motivo: ${reserva.notaOwner}` : '';
  console.log(
    `[email simulado] Reserva rechazada → ${jugador.email} | Hola ${nombre}, tu reserva en "${reserva.cancha?.nombre}" el ${reserva.fecha?.toLocaleDateString('es-AR')} de ${reserva.horaInicio} a ${reserva.horaFin} fue RECHAZADA.${nota}`
  );
};

export const enviarCancelacionReserva = async (jugador, reserva) => {
  const nombre = `${jugador.nombre || ''} ${jugador.apellido || ''}`.trim() || 'jugador';
  console.log(
    `[email simulado] Reserva cancelada → ${jugador.email} | Hola ${nombre}, tu reserva en "${reserva.cancha?.nombre}" el ${reserva.fecha?.toLocaleDateString('es-AR')} de ${reserva.horaInicio} a ${reserva.horaFin} fue CANCELADA.`
  );
};
