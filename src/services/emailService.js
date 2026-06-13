// import nodemailer from 'nodemailer';

/*
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
*/

export const enviarBienvenida = async ({ nombre, email, role }) => {
  console.log(`[email simulado] Bienvenida → ${email} | Nombre: ${nombre} | Rol: ${role}`);
};

export const sendApprovalEmail = async (complejo) => {
  const ownerEmail = complejo.owner?.email;
  const ownerNombre = complejo.owner?.nombre || 'owner';
  console.log(
    `[email simulado] Aprobación → ${ownerEmail} | Hola ${ownerNombre}, tu complejo "${complejo.name}" fue aprobado.`
  );
};

export const sendRejectionEmail = async (complejo, reason) => {
  const ownerEmail = complejo.owner?.email;
  const ownerNombre = complejo.owner?.nombre || 'owner';
  console.log(
    `[email simulado] Rechazo → ${ownerEmail} | Hola ${ownerNombre}, tu complejo "${complejo.name}" fue rechazado. Motivo: ${reason}`
  );
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
