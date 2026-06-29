import { sendContactEmail } from '../services/emailService.js';

export const sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await sendContactEmail({ name, email, message });

    res.status(200).json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('[Contact] Error al enviar email:', error.message);
    res.status(500).json({ success: false, message: 'Error al enviar el mensaje' });
  }
};
