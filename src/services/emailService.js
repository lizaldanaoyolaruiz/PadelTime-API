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

export const enviarBienvenida = async ({ nombre, email, role }) => {
  const rolesLabel = { owner: 'Dueño de Complejo', player: 'Jugador', admin: 'Administrador' };

  await transporter.sendMail({
    from: `"PadelTime" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to: email,
    subject: '¡Bienvenido a PadelTime!',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #c1ff72;">¡Bienvenido, ${nombre}!</h2>
        <p>Tu cuenta fue creada exitosamente como <strong>${rolesLabel[role] || role}</strong>.</p>
        <p>Tu próxima victoria empieza aquí. 🎾</p>
        <hr/>
        <small style="color:#888;">PadelTime — Gestión de Alto Rendimiento</small>
      </div>
    `,
  });
};
