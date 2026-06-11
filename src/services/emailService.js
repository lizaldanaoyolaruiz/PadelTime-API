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
